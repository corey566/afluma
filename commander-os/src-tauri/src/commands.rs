use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::fs;
use std::io::Write;
use std::net::{SocketAddr, TcpStream};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::time::Duration;
use tauri::AppHandle;
use tauri_plugin_autostart::ManagerExt;

#[derive(Debug, Serialize)]
pub struct ActionResult {
    pub ok: bool,
    pub action: String,
    pub target: String,
    pub message: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct CommandAssessment {
    pub risk_level: u8,
    pub label: String,
    pub allowed: bool,
    pub requires_approval: bool,
    pub reason: String,
}

#[derive(Debug, Serialize)]
pub struct TerminalResult {
    pub command: String,
    pub cwd: String,
    pub exit_code: Option<i32>,
    pub stdout: String,
    pub stderr: String,
    pub assessment: CommandAssessment,
}

#[derive(Debug, Serialize)]
pub struct ProjectInspection {
    pub path: String,
    pub exists: bool,
    pub is_git_repo: bool,
    pub git_root: Option<String>,
    pub branch: Option<String>,
    pub changed_count: usize,
    pub changed_files: Vec<String>,
    pub last_commit: Option<String>,
    pub origin: Option<String>,
    pub package_manager: Option<String>,
    pub package_scripts: Vec<String>,
    pub compose_files: Vec<String>,
}

#[derive(Debug, Serialize)]
pub struct ServiceStatus {
    pub id: String,
    pub label: String,
    pub state: String,
    pub detail: String,
}

#[derive(Debug, Serialize)]
pub struct EnvironmentInspection {
    pub path: String,
    pub package_manager: Option<String>,
    pub dev_command: Option<String>,
    pub docker_available: bool,
    pub docker_detail: String,
    pub compose_files: Vec<String>,
    pub services: Vec<ServiceStatus>,
}

#[derive(Debug, Deserialize)]
pub struct BrokerRequest {
    pub tool: String,
    pub target: Option<String>,
    pub command: Option<String>,
    pub approved: Option<bool>,
}

#[derive(Debug, Serialize)]
pub struct BrokerResult {
    pub ok: bool,
    pub tool: String,
    pub risk_level: u8,
    pub status: String,
    pub message: String,
    pub output: Option<String>,
}

fn normalized(command: &str) -> String {
    command.trim().to_ascii_lowercase()
}

fn dangerous_tokens() -> &'static [&'static str] {
    &[
        "remove-item",
        " del ",
        "erase ",
        "format ",
        "diskpart",
        "clear-disk",
        "initialize-disk",
        "shutdown",
        "stop-computer",
        "restart-computer",
        "reg delete",
        "set-executionpolicy",
        "invoke-expression",
        "iex ",
        "net user",
        "net localgroup",
        "cipher /w",
        "bcdedit",
    ]
}

fn safe_exact_or_prefix(command: &str) -> bool {
    const SAFE: &[&str] = &[
        "pwd",
        "get-location",
        "git status",
        "git branch --show-current",
        "git log -1",
        "git diff --stat",
        "git diff --name-only",
        "git rev-parse",
        "docker ps",
        "docker compose ps",
        "docker info",
        "node --version",
        "npm --version",
        "pnpm --version",
        "rustc --version",
        "cargo --version",
        "where.exe ",
        "get-childitem",
        "dir",
    ];

    SAFE.iter().any(|candidate| {
        command == *candidate
            || command.starts_with(&format!("{} ", candidate))
            || (candidate.ends_with(' ') && command.starts_with(candidate))
    })
}

fn bounded_dev_command(command: &str) -> bool {
    const DEV: &[&str] = &[
        "npm test",
        "npm run test",
        "pnpm test",
        "pnpm run test",
        "npm run build",
        "pnpm build",
        "pnpm run build",
        "cargo test",
        "cargo check",
    ];

    DEV.iter().any(|candidate| command == *candidate || command.starts_with(&format!("{} ", candidate)))
}

fn assess(command: &str) -> CommandAssessment {
    let normalized = normalized(command);

    if normalized.is_empty() {
        return CommandAssessment {
            risk_level: 3,
            label: "INVALID".into(),
            allowed: false,
            requires_approval: false,
            reason: "Command is empty.".into(),
        };
    }

    if dangerous_tokens().iter().any(|token| normalized.contains(token)) {
        return CommandAssessment {
            risk_level: 3,
            label: "HIGH IMPACT".into(),
            allowed: false,
            requires_approval: true,
            reason: "Potentially destructive or system-level command. Commander OS will not execute it through the broker.".into(),
        };
    }

    if safe_exact_or_prefix(&normalized) {
        return CommandAssessment {
            risk_level: 0,
            label: "OBSERVE".into(),
            allowed: true,
            requires_approval: false,
            reason: "Read-only diagnostic command.".into(),
        };
    }

    if bounded_dev_command(&normalized) {
        return CommandAssessment {
            risk_level: 1,
            label: "SAFE DEV ACTION".into(),
            allowed: true,
            requires_approval: false,
            reason: "Bounded build/test command. It may execute project code but does not receive elevated privileges.".into(),
        };
    }

    CommandAssessment {
        risk_level: 2,
        label: "CHANGE / UNKNOWN".into(),
        allowed: false,
        requires_approval: true,
        reason: "This command is outside Commander's bounded allowlist. Use a dedicated broker tool instead of arbitrary shell execution.".into(),
    }
}

fn spawn_detached(program: &str, args: &[&str]) -> Result<(), String> {
    Command::new(program)
        .args(args)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .map(|_| ())
        .map_err(|error| error.to_string())
}

fn powershell_output(script: &str) -> Result<String, String> {
    let output = Command::new("powershell.exe")
        .args(["-NoLogo", "-NoProfile", "-NonInteractive", "-Command", script])
        .output()
        .map_err(|error| error.to_string())?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        return Err(if stderr.is_empty() {
            format!("PowerShell exited with {:?}", output.status.code())
        } else {
            stderr
        });
    }

    Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
}

fn git_output(path: &Path, args: &[&str]) -> Result<String, String> {
    let output = Command::new("git")
        .args(args)
        .current_dir(path)
        .output()
        .map_err(|error| error.to_string())?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        return Err(if stderr.is_empty() {
            format!("git {:?} failed", args)
        } else {
            stderr
        });
    }

    Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
}

fn write_clipboard(text: &str) -> Result<(), String> {
    let mut child = Command::new("clip.exe")
        .stdin(Stdio::piped())
        .stdout(Stdio::null())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|error| error.to_string())?;

    if let Some(stdin) = child.stdin.as_mut() {
        stdin
            .write_all(text.as_bytes())
            .map_err(|error| error.to_string())?;
    }

    let output = child.wait_with_output().map_err(|error| error.to_string())?;
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).trim().to_string());
    }
    Ok(())
}

fn chatgpt_summon_script() -> &'static str {
    r#"
$ErrorActionPreference = 'Stop'
$app = Get-StartApps | Where-Object { $_.Name -like '*ChatGPT*' } | Select-Object -First 1
if ($null -ne $app) {
  Start-Process explorer.exe -ArgumentList ('shell:AppsFolder\' + $app.AppID)
  Start-Sleep -Milliseconds 900
  $shell = New-Object -ComObject WScript.Shell
  [void]$shell.AppActivate('ChatGPT')
  Start-Sleep -Milliseconds 250
  $shell.SendKeys('% ')
  Write-Output 'desktop'
} else {
  Start-Process 'https://chatgpt.com'
  Write-Output 'web'
}
"#
}

fn package_manager(path: &Path) -> Option<String> {
    if path.join("pnpm-lock.yaml").exists() {
        Some("pnpm".into())
    } else if path.join("yarn.lock").exists() {
        Some("yarn".into())
    } else if path.join("package-lock.json").exists() {
        Some("npm".into())
    } else if path.join("bun.lockb").exists() || path.join("bun.lock").exists() {
        Some("bun".into())
    } else {
        None
    }
}

fn package_scripts(path: &Path) -> Vec<String> {
    let package_path = path.join("package.json");
    let Ok(content) = fs::read_to_string(package_path) else {
        return Vec::new();
    };
    let Ok(json) = serde_json::from_str::<Value>(&content) else {
        return Vec::new();
    };
    let Some(scripts) = json.get("scripts").and_then(Value::as_object) else {
        return Vec::new();
    };
    let mut names: Vec<String> = scripts.keys().cloned().collect();
    names.sort();
    names
}

fn compose_files(path: &Path) -> Vec<String> {
    ["compose.yml", "compose.yaml", "docker-compose.yml", "docker-compose.yaml"]
        .iter()
        .filter_map(|name| {
            let candidate = path.join(name);
            if candidate.exists() {
                Some(candidate.to_string_lossy().to_string())
            } else {
                None
            }
        })
        .collect()
}

fn port_open(port: u16) -> bool {
    let address = SocketAddr::from(([127, 0, 0, 1], port));
    TcpStream::connect_timeout(&address, Duration::from_millis(180)).is_ok()
}

fn service(port: u16, label: &str) -> ServiceStatus {
    let online = port_open(port);
    ServiceStatus {
        id: format!("port-{port}"),
        label: label.into(),
        state: if online { "online".into() } else { "offline".into() },
        detail: format!("127.0.0.1:{port}"),
    }
}

fn resolved_project_root(path: &Path) -> PathBuf {
    git_output(path, &["rev-parse", "--show-toplevel"])
        .ok()
        .filter(|value| !value.is_empty())
        .map(PathBuf::from)
        .unwrap_or_else(|| path.to_path_buf())
}

fn dev_command(path: &Path) -> Option<String> {
    let scripts = package_scripts(path);
    if !scripts.iter().any(|script| script == "dev") {
        return None;
    }
    match package_manager(path).as_deref() {
        Some("pnpm") => Some("pnpm dev".into()),
        Some("yarn") => Some("yarn dev".into()),
        Some("bun") => Some("bun run dev".into()),
        _ => Some("npm run dev".into()),
    }
}

#[tauri::command]
pub fn assess_terminal_command(command: String) -> CommandAssessment {
    assess(&command)
}

#[tauri::command]
pub fn launch_target(target: String) -> Result<ActionResult, String> {
    let key = target.trim().to_ascii_lowercase();

    match key.as_str() {
        "gmail" => spawn_detached("cmd", &["/C", "start", "", "https://mail.google.com"] )?,
        "chatgpt" => {
            powershell_output(chatgpt_summon_script())?;
        }
        "powershell" => spawn_detached("powershell.exe", &["-NoLogo"] )?,
        "vscode" => spawn_detached("cmd", &["/C", "start", "", "code"] )?,
        _ => return Err(format!("Unknown Commander target: {target}")),
    }

    Ok(ActionResult {
        ok: true,
        action: "launch".into(),
        target: key.clone(),
        message: format!("Launch request sent for {key}."),
    })
}

#[tauri::command]
pub fn summon_chatgpt() -> Result<ActionResult, String> {
    let transport = powershell_output(chatgpt_summon_script())?;
    Ok(ActionResult {
        ok: true,
        action: "assistant.summon".into(),
        target: "chatgpt".into(),
        message: if transport.contains("desktop") {
            "Summoned the ChatGPT Windows companion.".into()
        } else {
            "ChatGPT Windows app was not found; opened chatgpt.com instead.".into()
        },
    })
}

#[tauri::command]
pub fn send_text_to_chatgpt(text: String, submit: bool) -> Result<ActionResult, String> {
    if text.trim().is_empty() {
        return Err("Nothing to send to ChatGPT.".into());
    }
    write_clipboard(&text)?;
    powershell_output(chatgpt_summon_script())?;
    let submit_line = if submit { "$shell.SendKeys('{ENTER}')" } else { "" };
    let script = format!(
        r#"Start-Sleep -Milliseconds 650
$shell = New-Object -ComObject WScript.Shell
[void]$shell.AppActivate('ChatGPT')
Start-Sleep -Milliseconds 200
$shell.SendKeys('^v')
Start-Sleep -Milliseconds 120
{submit_line}
"#
    );
    powershell_output(&script)?;
    Ok(ActionResult {
        ok: true,
        action: "assistant.send".into(),
        target: "chatgpt".into(),
        message: if submit {
            "Commander sent the context to ChatGPT and submitted it.".into()
        } else {
            "Commander pasted the context into ChatGPT without submitting.".into()
        },
    })
}

#[tauri::command]
pub fn copy_text_to_clipboard(text: String) -> Result<ActionResult, String> {
    if text.trim().is_empty() {
        return Err("Nothing to copy.".into());
    }
    write_clipboard(&text)?;
    Ok(ActionResult {
        ok: true,
        action: "assistant.context.copy".into(),
        target: "windows-clipboard".into(),
        message: "Commander context copied to the Windows clipboard.".into(),
    })
}

#[tauri::command]
pub fn inspect_project(path: String) -> Result<ProjectInspection, String> {
    let trimmed = path.trim().to_string();
    let requested_path = Path::new(&trimmed);

    if !requested_path.exists() {
        return Ok(ProjectInspection {
            path: trimmed,
            exists: false,
            is_git_repo: false,
            git_root: None,
            branch: None,
            changed_count: 0,
            changed_files: Vec::new(),
            last_commit: None,
            origin: None,
            package_manager: None,
            package_scripts: Vec::new(),
            compose_files: Vec::new(),
        });
    }

    if !requested_path.is_dir() {
        return Err(format!("Project path is not a directory: {trimmed}"));
    }

    let root = resolved_project_root(requested_path);
    let is_git_repo = git_output(&root, &["rev-parse", "--is-inside-work-tree"])
        .map(|value| value == "true")
        .unwrap_or(false);

    let branch = if is_git_repo {
        git_output(&root, &["branch", "--show-current"]).ok().filter(|value| !value.is_empty())
    } else {
        None
    };
    let status = if is_git_repo {
        git_output(&root, &["status", "--porcelain"]).unwrap_or_default()
    } else {
        String::new()
    };
    let changed_files: Vec<String> = status
        .lines()
        .filter_map(|line| {
            let value = line.get(3..).unwrap_or(line).trim();
            if value.is_empty() { None } else { Some(value.to_string()) }
        })
        .collect();
    let last_commit = if is_git_repo {
        git_output(&root, &["log", "-1", "--pretty=format:%h  %s  (%cr)"]).ok().filter(|value| !value.is_empty())
    } else {
        None
    };
    let origin = if is_git_repo {
        git_output(&root, &["remote", "get-url", "origin"]).ok().filter(|value| !value.is_empty())
    } else {
        None
    };

    Ok(ProjectInspection {
        path: trimmed,
        exists: true,
        is_git_repo,
        git_root: if is_git_repo { Some(root.to_string_lossy().to_string()) } else { None },
        branch,
        changed_count: changed_files.len(),
        changed_files,
        last_commit,
        origin,
        package_manager: package_manager(&root),
        package_scripts: package_scripts(&root),
        compose_files: compose_files(&root),
    })
}

#[tauri::command]
pub fn discover_projects(base_path: String) -> Result<Vec<String>, String> {
    let base = Path::new(base_path.trim());
    if !base.exists() || !base.is_dir() {
        return Err(format!("Discovery path does not exist: {}", base.display()));
    }

    let mut projects = Vec::new();
    if base.join(".git").exists() {
        projects.push(base.to_string_lossy().to_string());
    }
    for entry in fs::read_dir(base).map_err(|error| error.to_string())? {
        let entry = entry.map_err(|error| error.to_string())?;
        let path = entry.path();
        if path.is_dir() && path.join(".git").exists() {
            projects.push(path.to_string_lossy().to_string());
        }
    }
    projects.sort();
    Ok(projects)
}

#[tauri::command]
pub fn inspect_environment(path: String) -> Result<EnvironmentInspection, String> {
    let requested_path = Path::new(path.trim());
    if !requested_path.exists() || !requested_path.is_dir() {
        return Err(format!("Project path does not exist: {}", requested_path.display()));
    }
    let root = resolved_project_root(requested_path);
    let docker = Command::new("docker").args(["info", "--format", "{{.ServerVersion}}"] ).output();
    let (docker_available, docker_detail) = match docker {
        Ok(output) if output.status.success() => (
            true,
            format!("Docker Engine {}", String::from_utf8_lossy(&output.stdout).trim()),
        ),
        Ok(output) => (
            false,
            String::from_utf8_lossy(&output.stderr).trim().to_string(),
        ),
        Err(error) => (false, error.to_string()),
    };

    let mut services = vec![
        service(5432, "PostgreSQL :5432"),
        service(5433, "PostgreSQL :5433"),
        service(6379, "Redis"),
        service(3000, "Web :3000"),
        service(3001, "Web :3001"),
        service(3100, "Afluma :3100"),
        service(3101, "Afluma Control"),
        service(3102, "Afluma Storefront"),
    ];

    if docker_available {
        let containers = Command::new("docker")
            .args(["ps", "--format", "{{.Names}}|{{.Status}}|{{.Ports}}"])
            .output()
            .ok()
            .filter(|output| output.status.success())
            .map(|output| String::from_utf8_lossy(&output.stdout).to_string())
            .unwrap_or_default();
        for line in containers.lines().filter(|line| !line.trim().is_empty()) {
            let mut parts = line.splitn(3, '|');
            let name = parts.next().unwrap_or("container");
            let status = parts.next().unwrap_or("running");
            let ports = parts.next().unwrap_or("");
            services.push(ServiceStatus {
                id: format!("docker-{name}"),
                label: name.to_string(),
                state: "online".into(),
                detail: if ports.is_empty() { status.to_string() } else { format!("{status} // {ports}") },
            });
        }
    }

    Ok(EnvironmentInspection {
        path: root.to_string_lossy().to_string(),
        package_manager: package_manager(&root),
        dev_command: dev_command(&root),
        docker_available,
        docker_detail,
        compose_files: compose_files(&root),
        services,
    })
}

#[tauri::command]
pub fn open_project(path: String) -> Result<ActionResult, String> {
    let trimmed = path.trim().to_string();
    let project_path = Path::new(&trimmed);
    if !project_path.exists() || !project_path.is_dir() {
        return Err(format!("Project path does not exist: {trimmed}"));
    }
    let root = resolved_project_root(project_path);

    Command::new("cmd")
        .args(["/C", "start", "", "code", "."])
        .current_dir(&root)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|error| error.to_string())?;

    Ok(ActionResult {
        ok: true,
        action: "open_project".into(),
        target: root.to_string_lossy().to_string(),
        message: format!("Opened project workspace: {}", root.display()),
    })
}

#[tauri::command]
pub fn start_development(path: String) -> Result<ActionResult, String> {
    let requested_path = Path::new(path.trim());
    if !requested_path.exists() || !requested_path.is_dir() {
        return Err(format!("Project path does not exist: {}", requested_path.display()));
    }
    let root = resolved_project_root(requested_path);
    let mut steps = Vec::new();

    let compose = compose_files(&root);
    if !compose.is_empty() {
        let output = Command::new("docker")
            .args(["compose", "up", "-d"])
            .current_dir(&root)
            .output();
        match output {
            Ok(output) if output.status.success() => steps.push("Docker Compose started".to_string()),
            Ok(output) => steps.push(format!("Docker Compose not started: {}", String::from_utf8_lossy(&output.stderr).trim())),
            Err(error) => steps.push(format!("Docker unavailable: {error}")),
        }
    }

    Command::new("cmd")
        .args(["/C", "start", "", "code", "."])
        .current_dir(&root)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|error| error.to_string())?;
    steps.push("VS Code opened".into());

    if let Some(command) = dev_command(&root) {
        let escaped_root = root.to_string_lossy().replace('"', "\"");
        let script = format!("Set-Location -LiteralPath \"{escaped_root}\"; {command}");
        Command::new("powershell.exe")
            .args(["-NoExit", "-NoLogo", "-Command", &script])
            .spawn()
            .map_err(|error| error.to_string())?;
        steps.push(format!("Development command launched: {command}"));
    } else {
        steps.push("No package.json dev script detected".into());
    }

    Ok(ActionResult {
        ok: true,
        action: "development.start".into(),
        target: root.to_string_lossy().to_string(),
        message: steps.join(" // "),
    })
}

#[tauri::command]
pub fn run_terminal_command(command: String, cwd: Option<String>) -> Result<TerminalResult, String> {
    let assessment = assess(&command);
    if !assessment.allowed {
        return Err(format!("{}: {}", assessment.label, assessment.reason));
    }

    let working_directory = cwd
        .filter(|value| !value.trim().is_empty())
        .unwrap_or_else(|| ".".to_string());

    if !Path::new(&working_directory).exists() {
        return Err(format!("Working directory does not exist: {working_directory}"));
    }

    let output = Command::new("powershell.exe")
        .args(["-NoLogo", "-NoProfile", "-NonInteractive", "-Command", &command])
        .current_dir(&working_directory)
        .output()
        .map_err(|error| error.to_string())?;

    Ok(TerminalResult {
        command,
        cwd: working_directory,
        exit_code: output.status.code(),
        stdout: String::from_utf8_lossy(&output.stdout).trim_end().to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).trim_end().to_string(),
        assessment,
    })
}

#[tauri::command]
pub fn execute_broker_action(request: BrokerRequest) -> Result<BrokerResult, String> {
    let tool = request.tool.trim().to_ascii_lowercase();
    match tool.as_str() {
        "open_app" => {
            let target = request.target.ok_or("open_app requires target")?;
            let result = launch_target(target.clone())?;
            Ok(BrokerResult { ok: true, tool, risk_level: 1, status: "executed".into(), message: result.message, output: None })
        }
        "open_project" => {
            let target = request.target.ok_or("open_project requires target")?;
            let result = open_project(target)?;
            Ok(BrokerResult { ok: true, tool, risk_level: 1, status: "executed".into(), message: result.message, output: None })
        }
        "start_development" => {
            let target = request.target.ok_or("start_development requires target")?;
            if request.approved != Some(true) {
                return Ok(BrokerResult { ok: false, tool, risk_level: 1, status: "approval_required".into(), message: "Starting development can launch processes and containers. Commander approval is required for assistant-originated requests.".into(), output: None });
            }
            let result = start_development(target)?;
            Ok(BrokerResult { ok: true, tool, risk_level: 1, status: "executed".into(), message: result.message, output: None })
        }
        "run_terminal" => {
            let command = request.command.ok_or("run_terminal requires command")?;
            let assessment = assess(&command);
            if !assessment.allowed {
                return Ok(BrokerResult { ok: false, tool, risk_level: assessment.risk_level, status: "blocked".into(), message: assessment.reason, output: None });
            }
            let result = run_terminal_command(command, request.target)?;
            let output = [result.stdout, result.stderr].into_iter().filter(|value| !value.is_empty()).collect::<Vec<_>>().join("\n");
            Ok(BrokerResult { ok: result.exit_code == Some(0), tool, risk_level: result.assessment.risk_level, status: "executed".into(), message: format!("Terminal command exited {:?}", result.exit_code), output: Some(output) })
        }
        _ => Ok(BrokerResult { ok: false, tool, risk_level: 3, status: "blocked".into(), message: "Unknown Commander broker tool.".into(), output: None }),
    }
}

#[tauri::command]
pub fn get_autostart(app: AppHandle) -> Result<bool, String> {
    app.autolaunch().is_enabled().map_err(|error| error.to_string())
}

#[tauri::command]
pub fn set_autostart(app: AppHandle, enabled: bool) -> Result<ActionResult, String> {
    let manager = app.autolaunch();
    if enabled {
        manager.enable().map_err(|error| error.to_string())?;
    } else {
        manager.disable().map_err(|error| error.to_string())?;
    }
    Ok(ActionResult {
        ok: true,
        action: "system.autostart".into(),
        target: "commander-os".into(),
        message: if enabled { "Commander OS will start with Windows.".into() } else { "Commander OS autostart disabled.".into() },
    })
}
