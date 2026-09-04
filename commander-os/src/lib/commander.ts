import { invoke } from "@tauri-apps/api/core";

export type CommanderTarget = "gmail" | "chatgpt" | "powershell" | "vscode";

export type ActionResult = {
  ok: boolean;
  action: string;
  target: string;
  message: string;
};

export type CommandAssessment = {
  risk_level: number;
  label: string;
  allowed: boolean;
  requires_approval: boolean;
  reason: string;
};

export type TerminalResult = {
  command: string;
  cwd: string;
  exit_code: number | null;
  stdout: string;
  stderr: string;
  assessment: CommandAssessment;
};

export type ProjectInspection = {
  path: string;
  exists: boolean;
  is_git_repo: boolean;
  git_root: string | null;
  branch: string | null;
  changed_count: number;
  changed_files: string[];
  last_commit: string | null;
  origin: string | null;
  package_manager: string | null;
  package_scripts: string[];
  compose_files: string[];
};

export type ServiceStatus = {
  id: string;
  label: string;
  state: "online" | "offline" | string;
  detail: string;
};

export type EnvironmentInspection = {
  path: string;
  package_manager: string | null;
  dev_command: string | null;
  docker_available: boolean;
  docker_detail: string;
  compose_files: string[];
  services: ServiceStatus[];
};

export type BrokerRequest = {
  tool: "open_app" | "open_project" | "start_development" | "run_terminal" | string;
  target?: string | null;
  command?: string | null;
  approved?: boolean;
};

export type BrokerResult = {
  ok: boolean;
  tool: string;
  risk_level: number;
  status: "executed" | "approval_required" | "blocked" | string;
  message: string;
  output: string | null;
};

export function launchTarget(target: CommanderTarget) {
  return invoke<ActionResult>("launch_target", { target });
}

export function summonChatgpt() {
  return invoke<ActionResult>("summon_chatgpt");
}

export function sendTextToChatgpt(text: string, submit = false) {
  return invoke<ActionResult>("send_text_to_chatgpt", { text, submit });
}

export function copyTextToClipboard(text: string) {
  return invoke<ActionResult>("copy_text_to_clipboard", { text });
}

export function inspectProject(path: string) {
  return invoke<ProjectInspection>("inspect_project", { path });
}

export function discoverProjects(basePath: string) {
  return invoke<string[]>("discover_projects", { basePath });
}

export function inspectEnvironment(path: string) {
  return invoke<EnvironmentInspection>("inspect_environment", { path });
}

export function openProject(path: string) {
  return invoke<ActionResult>("open_project", { path });
}

export function startDevelopment(path: string) {
  return invoke<ActionResult>("start_development", { path });
}

export function assessTerminalCommand(command: string) {
  return invoke<CommandAssessment>("assess_terminal_command", { command });
}

export function runTerminalCommand(command: string, cwd?: string) {
  return invoke<TerminalResult>("run_terminal_command", {
    command,
    cwd: cwd?.trim() || null,
  });
}

export function executeBrokerAction(request: BrokerRequest) {
  return invoke<BrokerResult>("execute_broker_action", { request });
}

export function getAutostart() {
  return invoke<boolean>("get_autostart");
}

export function setAutostart(enabled: boolean) {
  return invoke<ActionResult>("set_autostart", { enabled });
}
