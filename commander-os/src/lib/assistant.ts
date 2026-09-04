import type { DashboardSnapshot } from "./models";
import type { BrokerRequest, EnvironmentInspection, ProjectInspection, TerminalResult } from "./commander";

export type AssistantContextInput = {
  request: string;
  snapshot: DashboardSnapshot;
  project: ProjectInspection | null;
  environment: EnvironmentInspection | null;
  terminal: TerminalResult | null;
  cwd: string;
};

export function buildAssistantContext({ request, snapshot, project, environment, terminal, cwd }: AssistantContextInput) {
  const activeSession = snapshot.sessions.find((session) => session.ended_at === null) ?? null;
  const activeWorkstream = activeSession
    ? snapshot.workstreams.find((workstream) => workstream.id === activeSession.workstream_id) ?? null
    : null;
  const missions = snapshot.missions
    .map((mission) => {
      const workstream = snapshot.workstreams.find((item) => item.id === mission.workstream_id);
      return `- [${mission.status}] ${workstream?.name ?? mission.workstream_id}: ${mission.title}`;
    })
    .join("\n");
  const recentAudit = snapshot.auditEvents
    .slice(0, 10)
    .map((event) => `- ${event.created_at} L${event.risk_level} ${event.action} ${event.target ?? ""} -> ${event.status}`)
    .join("\n");

  const projectBlock = project
    ? [
        `Configured path: ${project.path}`,
        `Exists: ${project.exists}`,
        `Git repo: ${project.is_git_repo}`,
        `Resolved Git root: ${project.git_root ?? "unknown"}`,
        `Branch: ${project.branch ?? "unknown"}`,
        `Changed files: ${project.changed_count}`,
        `Last commit: ${project.last_commit ?? "unknown"}`,
        `Origin: ${project.origin ?? "unknown"}`,
        `Package manager: ${project.package_manager ?? "unknown"}`,
        `Scripts: ${project.package_scripts.join(", ") || "none detected"}`,
        `Compose: ${project.compose_files.join(", ") || "none detected"}`,
        project.changed_files.length ? `Changed file list:\n${project.changed_files.map((file) => `- ${file}`).join("\n")}` : "Changed file list: clean/unknown",
      ].join("\n")
    : "Project inspection not available yet.";

  const environmentBlock = environment
    ? [
        `Docker: ${environment.docker_available ? "available" : "unavailable"} // ${environment.docker_detail}`,
        `Dev command: ${environment.dev_command ?? "not detected"}`,
        ...environment.services.map((service) => `- ${service.label}: ${service.state} // ${service.detail}`),
      ].join("\n")
    : "Environment inspection not available yet.";

  const terminalBlock = terminal
    ? [
        `Working directory: ${terminal.cwd}`,
        `Last command: ${terminal.command}`,
        `Exit code: ${terminal.exit_code ?? "unknown"}`,
        terminal.stdout ? `STDOUT:\n${terminal.stdout}` : "STDOUT: empty",
        terminal.stderr ? `STDERR:\n${terminal.stderr}` : "STDERR: empty",
      ].join("\n")
    : `No captured terminal result yet. Current Commander working directory: ${cwd}`;

  return [
    "COMMANDER OS CONTEXT PACKET",
    "Generated locally by Afluma Commander OS. Treat this as machine context supplied by the user.",
    "",
    "USER REQUEST",
    request.trim() || "Continue the current Commander OS session using the supplied context.",
    "",
    "CURRENT SHIFT",
    activeWorkstream ? `${activeWorkstream.name} // started ${activeSession?.started_at}` : "Standby // no active shift",
    "",
    "OPEN MISSIONS",
    missions || "No open missions.",
    "",
    "PROJECT",
    projectBlock,
    "",
    "ENVIRONMENT",
    environmentBlock,
    "",
    "TERMINAL",
    terminalBlock,
    "",
    "RECENT COMMANDER AUDIT",
    recentAudit || "No recent audit events.",
    "",
    "COMMANDER CONTROL CONTRACT",
    "Commander OS owns machine execution. Never assume unrestricted shell access.",
    "Read-only diagnostics and bounded development actions can be requested through the Commander Action Broker.",
    "Do not request destructive/system-level shell commands.",
    "When a machine action is required, optionally end the response with exactly one action block in this form:",
    "COMMANDER_ACTION",
    '{"tool":"run_terminal","target":"C:\\\\www\\\\project","command":"git status"}',
    "END_COMMANDER_ACTION",
    "Supported tools: open_app, open_project, start_development, run_terminal.",
    "start_development always requires Commander approval when assistant-originated.",
  ].join("\n");
}

export function extractCommanderAction(text: string): BrokerRequest | null {
  const marker = text.match(/COMMANDER_ACTION\s*([\s\S]*?)\s*END_COMMANDER_ACTION/i);
  if (!marker) return null;
  const payload = marker[1].replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    const parsed = JSON.parse(payload) as BrokerRequest;
    if (!parsed || typeof parsed.tool !== "string" || !parsed.tool.trim()) return null;
    return parsed;
  } catch {
    return null;
  }
}
