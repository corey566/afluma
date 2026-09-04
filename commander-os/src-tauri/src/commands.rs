use serde::Serialize;
use std::path::Path;
use std::process::{Command, Stdio};

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
