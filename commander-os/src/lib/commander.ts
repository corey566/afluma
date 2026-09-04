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

export function launchTarget(target: CommanderTarget) {
  return invoke<ActionResult>("launch_target", { target });
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
