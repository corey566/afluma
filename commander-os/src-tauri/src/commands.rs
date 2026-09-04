use serde::Serialize;
use std::io::Write;
use std::path::Path;
use std::process::{Command, Stdio};
use tauri::{webview::WebviewWindowBuilder, AppHandle, Manager, WebviewUrl};

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
    pub branch: Option<String>,
    pub changed_count: usize,
    pub changed_files: Vec<String>,
    pub last_commit: Option<String>,
    pub origin: Option<String>,
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
        "docker ps",
        "docker compose ps",
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
            reason: "Potentially destructive or system-level command. Commander OS will not execute it through the foundation bridge.".into(),
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
        reason: "This command is not in the foundation allowlist. A later approval workflow can authorize scoped change commands.".into(),
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

#[tauri::command]
pub fn assess_terminal_command(command: String) -> CommandAssessment {
    assess(&command)
}

#[tauri::command]
pub fn launch_target(target: String) -> Result<ActionResult, String> {
    let key = target.trim().to_ascii_lowercase();

    match key.as_str() {
        "gmail" => spawn_detached("cmd", &["/C", "start", "", "https://mail.google.com"] )?,
        "chatgpt" => spawn_detached("cmd", &["/C", "start", "", "https://chatgpt.com"] )?,
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
pub fn open_chatgpt_dock(app: AppHandle) -> Result<ActionResult, String> {
    if let Some(window) = app.get_webview_window("chatgpt-dock") {
        window.show().map_err(|error| error.to_string())?;
        window.set_focus().map_err(|error| error.to_string())?;
        return Ok(ActionResult {
            ok: true,
            action: "assistant.focus".into(),
            target: "chatgpt-dock".into(),
            message: "Focused the existing Commander ChatGPT dock.".into(),
        });
    }

    let url = "https://chatgpt.com"
        .parse()
        .map_err(|error| format!("Invalid ChatGPT URL: {error}"))?;

    WebviewWindowBuilder::new(&app, "chatgpt-dock", WebviewUrl::External(url))
        .title("Commander // ChatGPT")
        .inner_size(620.0, 860.0)
        .min_inner_size(440.0, 620.0)
        .resizable(true)
        .build()
        .map_err(|error| error.to_string())?;

    Ok(ActionResult {
        ok: true,
        action: "assistant.open".into(),
        target: "chatgpt-dock".into(),
        message: "Opened ChatGPT inside a Commander-managed dock window.".into(),
    })
}

#[tauri::command]
pub fn copy_text_to_clipboard(text: String) -> Result<ActionResult, String> {
    if text.trim().is_empty() {
        return Err("Nothing to copy.".into());
    }

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
    let project_path = Path::new(&trimmed);

    if !project_path.exists() {
        return Ok(ProjectInspection {
            path: trimmed,
            exists: false,
            is_git_repo: false,
            branch: None,
            changed_count: 0,
            changed_files: Vec::new(),
            last_commit: None,
            origin: None,
        });
    }

    if !project_path.is_dir() {
        return Err(format!("Project path is not a directory: {trimmed}"));
    }

    let is_git_repo = git_output(project_path, &["rev-parse", "--is-inside-work-tree"])
        .map(|value| value == "true")
        .unwrap_or(false);

    if !is_git_repo {
        return Ok(ProjectInspection {
            path: trimmed,
            exists: true,
            is_git_repo: false,
            branch: None,
            changed_count: 0,
            changed_files: Vec::new(),
            last_commit: None,
            origin: None,
        });
    }

    let branch = git_output(project_path, &["branch", "--show-current"])
        .ok()
        .filter(|value| !value.is_empty());
    let status = git_output(project_path, &["status", "--porcelain"]).unwrap_or_default();
    let changed_files: Vec<String> = status
        .lines()
        .filter_map(|line| {
            let value = line.get(3..).unwrap_or(line).trim();
            if value.is_empty() { None } else { Some(value.to_string()) }
        })
        .collect();
    let last_commit = git_output(project_path, &["log", "-1", "--pretty=format:%h  %s  (%cr)"])
        .ok()
        .filter(|value| !value.is_empty());
    let origin = git_output(project_path, &["remote", "get-url", "origin"])
        .ok()
        .filter(|value| !value.is_empty());

    Ok(ProjectInspection {
        path: trimmed,
        exists: true,
        is_git_repo: true,
        branch,
        changed_count: changed_files.len(),
        changed_files,
        last_commit,
        origin,
    })
}

#[tauri::command]
pub fn open_project(path: String) -> Result<ActionResult, String> {
    let trimmed = path.trim().to_string();
    let project_path = Path::new(&trimmed);
    if !project_path.exists() || !project_path.is_dir() {
        return Err(format!("Project path does not exist: {trimmed}"));
    }

    Command::new("cmd")
        .args(["/C", "start", "", "code", "."])
        .current_dir(project_path)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|error| error.to_string())?;

    Ok(ActionResult {
        ok: true,
        action: "open_project".into(),
        target: trimmed.clone(),
        message: format!("Opened project workspace: {trimmed}"),
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
