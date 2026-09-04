import type { DashboardSnapshot } from "./models";
import type { ProjectInspection, TerminalResult } from "./commander";

export type AssistantContextInput = {
  request: string;
  snapshot: DashboardSnapshot;
  project: ProjectInspection | null;
  terminal: TerminalResult | null;
  cwd: string;
};

export function buildAssistantContext({ request, snapshot, project, terminal, cwd }: AssistantContextInput) {
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
    .slice(0, 8)
    .map((event) => `- ${event.created_at} L${event.risk_level} ${event.action} ${event.target ?? ""} -> ${event.status}`)
    .join("\n");

  const projectBlock = project
    ? [
        `Path: ${project.path}`,
        `Exists: ${project.exists}`,
        `Git repo: ${project.is_git_repo}`,
        `Branch: ${project.branch ?? "unknown"}`,
        `Changed files: ${project.changed_count}`,
        `Last commit: ${project.last_commit ?? "unknown"}`,
        `Origin: ${project.origin ?? "unknown"}`,
        project.changed_files.length ? `Changed file list:\n${project.changed_files.map((file) => `- ${file}`).join("\n")}` : "Changed file list: clean/unknown",
      ].join("\n")
    : "Project inspection not available yet.";

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
    "TERMINAL",
    terminalBlock,
    "",
    "RECENT COMMANDER AUDIT",
    recentAudit || "No recent audit events.",
    "",
    "CONTROL POLICY",
    "Do not assume direct machine access. Request actions through Commander OS. Read-only diagnostics may be auto-approved; changes must pass Commander risk/approval policy.",
  ].join("\n");
}
