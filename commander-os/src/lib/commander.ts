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
  branch: string | null;
  changed_count: number;
  changed_files: string[];
  last_commit: string | null;
  origin: string | null;
};

export function launchTarget(target: CommanderTarget) {
  return invoke<ActionResult>("launch_target", { target });
}

export function openChatgptDock() {
  return invoke<ActionResult>("open_chatgpt_dock");
}

export function copyTextToClipboard(text: string) {
  return invoke<ActionResult>("copy_text_to_clipboard", { text });
}

export function inspectProject(path: string) {
  return invoke<ProjectInspection>("inspect_project", { path });
}

export function openProject(path: string) {
  return invoke<ActionResult>("open_project", { path });
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
