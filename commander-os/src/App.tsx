import { FormEvent, type CSSProperties, useCallback, useEffect, useMemo, useState } from "react";
import {
  assessTerminalCommand,
  inspectProject,
  launchTarget,
  openProject,
  runTerminalCommand,
  type CommandAssessment,
  type CommanderTarget,
  type ProjectInspection,
  type TerminalResult,
} from "./lib/commander";
import { addMission, loadDashboard, recordAuditEvent, setMissionStatus, startWorkstream, stopActiveSession } from "./lib/db";
import type { DashboardSnapshot, Mission, Workstream } from "./lib/models";

const EMPTY: DashboardSnapshot = { workstreams: [], missions: [], sessions: [], auditEvents: [] };
const DEFAULT_DEV_PATH = "C:\\www\\afluma-commerce";

function minutesBetween(start: string, end: string | null, now: Date) {
  const startMs = new Date(`${start}Z`).getTime();
  const endMs = end ? new Date(`${end}Z`).getTime() : now.getTime();
  return Math.max(0, Math.floor((endMs - startMs) / 60000));
}

function formatDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

function progress(total: number, target: number) {
  if (!target) return 0;
  return Math.min(100, Math.round((total / target) * 100));
}

function App() {
  const [snapshot, setSnapshot] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());
  const [newMission, setNewMission] = useState<Record<string, string>>({});
  const [command, setCommand] = useState("git status");
  const [cwd, setCwd] = useState(DEFAULT_DEV_PATH);
  const [terminalResult, setTerminalResult] = useState<TerminalResult | null>(null);
  const [terminalMessage, setTerminalMessage] = useState("Commander terminal bridge ready.");
  const [assessment, setAssessment] = useState<CommandAssessment | null>(null);
  const [commandBusy, setCommandBusy] = useState(false);
  const [project, setProject] = useState<ProjectInspection | null>(null);
  const [projectMessage, setProjectMessage] = useState("Inspecting Afluma Commerce…");
  const [projectBusy, setProjectBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      setSnapshot(await loadDashboard());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshProject = useCallback(async () => {
    setProjectBusy(true);
    try {
      const inspection = await inspectProject(DEFAULT_DEV_PATH);
      setProject(inspection);
      if (!inspection.exists) setProjectMessage("Commerce project path was not found on this PC.");
      else if (!inspection.is_git_repo) setProjectMessage("Project exists, but it is not a Git worktree.");
      else setProjectMessage("Local repository inspected successfully.");
    } catch (err) {
      setProjectMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setProjectBusy(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    void refreshProject();
    const clock = window.setInterval(() => setNow(new Date()), 30_000);
    const poll = window.setInterval(() => void refresh(), 60_000);
    const projectPoll = window.setInterval(() => void refreshProject(), 45_000);
    return () => {
      window.clearInterval(clock);
      window.clearInterval(poll);
      window.clearInterval(projectPoll);
    };
  }, [refresh, refreshProject]);

  const activeSession = useMemo(
    () => snapshot.sessions.find((session) => session.ended_at === null) ?? null,
    [snapshot.sessions],
  );

  const totals = useMemo(() => snapshot.sessions.reduce<Record<string, number>>((acc, session) => {
    acc[session.workstream_id] = (acc[session.workstream_id] ?? 0) + minutesBetween(session.started_at, session.ended_at, now);
    return acc;
  }, {}), [snapshot.sessions, now]);

  const totalTarget = snapshot.workstreams.reduce((sum, workstream) => sum + workstream.daily_target_minutes, 0);
  const totalWorked = Object.values(totals).reduce((sum, minutes) => sum + minutes, 0);

  async function begin(workstream: Workstream) {
    await startWorkstream(workstream.id);
    await refresh();
  }

  async function stop() {
    await stopActiveSession();
    await refresh();
  }

  async function createMission(event: FormEvent, workstreamId: string) {
    event.preventDefault();
    await addMission(workstreamId, newMission[workstreamId] ?? "");
    setNewMission((current) => ({ ...current, [workstreamId]: "" }));
    await refresh();
  }

  async function completeMission(mission: Mission) {
    await setMissionStatus(mission.id, "done");
    await refresh();
  }

  async function launch(target: CommanderTarget) {
    try {
      const result = await launchTarget(target);
      setTerminalMessage(result.message);
      await recordAuditEvent("system.launch", target, 1, "success", result.message);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setTerminalMessage(message);
      await recordAuditEvent("system.launch", target, 1, "failed", message);
    }
    await refresh();
  }

  async function openCommerceWorkspace() {
    try {
      const result = await openProject(DEFAULT_DEV_PATH);
      setProjectMessage(result.message);
      setCwd(DEFAULT_DEV_PATH);
      await recordAuditEvent("project.open", DEFAULT_DEV_PATH, 1, "success", result.message);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setProjectMessage(message);
      await recordAuditEvent("project.open", DEFAULT_DEV_PATH, 1, "failed", message);
    }
    await refresh();
  }

  async function executeCommand(event: FormEvent) {
    event.preventDefault();
    if (!command.trim()) return;

    setCommandBusy(true);
    setTerminalResult(null);
    try {
      const commandAssessment = await assessTerminalCommand(command);
      setAssessment(commandAssessment);

      if (!commandAssessment.allowed) {
        const message = `BLOCKED // ${commandAssessment.label}\n${commandAssessment.reason}`;
        setTerminalMessage(message);
        await recordAuditEvent("terminal.blocked", command, commandAssessment.risk_level, "blocked", commandAssessment.reason);
        return;
      }

      const result = await runTerminalCommand(command, cwd);
      setTerminalResult(result);
      setTerminalMessage(result.exit_code === 0 ? "Command completed." : `Command exited with code ${result.exit_code ?? "unknown"}.`);
      await recordAuditEvent(
        "terminal.run",
        command,
        result.assessment.risk_level,
        result.exit_code === 0 ? "success" : "failed",
        `${result.cwd} // exit ${result.exit_code ?? "unknown"}`,
      );
      await refreshProject();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setTerminalMessage(message);
      await recordAuditEvent("terminal.error", command, assessment?.risk_level ?? 2, "failed", message);
    } finally {
      setCommandBusy(false);
      await refresh();
    }
  }

  if (loading) return <main className="boot-screen">COMMANDER OS // INITIALIZING</main>;

  return (
    <main className="shell">
      <header className="topbar">
        <div><p className="eyebrow">AFLUMA // LOCAL COMMAND PLANE</p><h1>Commander OS</h1></div>
        <div className="clock-block">
          <strong>{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong>
          <span>{now.toLocaleDateString([], { weekday: "long", day: "2-digit", month: "long" })}</span>
        </div>
      </header>

      {error ? <section className="error-card"><strong>Local database unavailable.</strong><span>{error}</span></section> : null}

      <section className="hero-grid">
        <div className="hero-card primary-card">
          <p className="eyebrow">TODAY'S OPERATION</p>
          <div className="operation-row">
            <div><h2>{formatDuration(totalWorked)}</h2><span>tracked of {formatDuration(totalTarget)} target</span></div>
            <div className="ring" style={{ "--progress": `${progress(totalWorked, totalTarget) * 3.6}deg` } as CSSProperties}><span>{progress(totalWorked, totalTarget)}%</span></div>
          </div>
          <div className="progress-track"><div style={{ width: `${progress(totalWorked, totalTarget)}%` }} /></div>
        </div>

        <div className="hero-card status-card">
          <p className="eyebrow">ACTIVE SHIFT</p>
          {activeSession ? <><h2>{snapshot.workstreams.find((item) => item.id === activeSession.workstream_id)?.name}</h2><span>{formatDuration(minutesBetween(activeSession.started_at, null, now))} in this session</span><button className="danger-button" onClick={() => void stop()}>End shift</button></> : <><h2>Standby</h2><span>No work session is currently running.</span></>}
        </div>
      </section>

      <section className="control-deck">
        <div className="control-head">
          <div><p className="eyebrow">LOCAL CONTROL DECK // SKELETON 0.1</p><h2>Call, inspect, execute.</h2></div>
          <span className="guard-badge">GUARDED EXECUTION</span>
        </div>

        <div className="quick-actions">
          <button onClick={() => void launch("gmail")}><strong>Gmail</strong><span>Open inbox</span></button>
          <button onClick={() => void launch("chatgpt")}><strong>ChatGPT</strong><span>Call assistant</span></button>
          <button onClick={() => void launch("powershell")}><strong>PowerShell</strong><span>Open terminal</span></button>
          <button onClick={() => void launch("vscode")}><strong>VS Code</strong><span>Open editor</span></button>
        </div>

        <div className="terminal-layout">
          <form className="terminal-form" onSubmit={(event) => void executeCommand(event)}>
            <label>
              <span>WORKING DIRECTORY</span>
              <input value={cwd} onChange={(event) => setCwd(event.target.value)} spellCheck={false} />
            </label>
            <label>
              <span>POWERSHELL COMMAND</span>
              <div className="command-input-row">
                <input value={command} onChange={(event) => setCommand(event.target.value)} spellCheck={false} />
                <button disabled={commandBusy} type="submit">{commandBusy ? "Running…" : "Run"}</button>
              </div>
            </label>
            <div className="safe-command-row">
              {["git status", "git branch --show-current", "docker ps", "node --version"].map((item) => <button type="button" key={item} onClick={() => setCommand(item)}>{item}</button>)}
            </div>
          </form>

          <div className="terminal-output">
            <div className="terminal-title">
              <span>COMMANDER TERMINAL BRIDGE</span>
              {assessment ? <span className={`risk risk-${assessment.risk_level}`}>L{assessment.risk_level} // {assessment.label}</span> : null}
            </div>
            <pre>{terminalResult ? [
              `PS ${terminalResult.cwd}> ${terminalResult.command}`,
              terminalResult.stdout,
              terminalResult.stderr ? `STDERR\n${terminalResult.stderr}` : "",
              `EXIT ${terminalResult.exit_code ?? "UNKNOWN"}`,
            ].filter(Boolean).join("\n\n") : terminalMessage}</pre>
          </div>
        </div>
      </section>

      <section className="project-card">
        <div className="control-head">
          <div><p className="eyebrow">PROJECT REGISTRY // 0.1</p><h2>Afluma Commerce</h2></div>
          <div className="project-actions">
            <button onClick={() => void refreshProject()} disabled={projectBusy}>{projectBusy ? "Inspecting…" : "Refresh"}</button>
            <button className="primary-action" onClick={() => void openCommerceWorkspace()} disabled={!project?.exists}>Open workspace</button>
          </div>
        </div>
        <p className="project-path">{DEFAULT_DEV_PATH}</p>
        <p className="project-message">{projectMessage}</p>
        <div className="project-metrics">
          <div><span>PATH</span><strong>{project?.exists ? "ONLINE" : "MISSING"}</strong></div>
          <div><span>GIT</span><strong>{project?.is_git_repo ? "READY" : "UNAVAILABLE"}</strong></div>
          <div><span>BRANCH</span><strong>{project?.branch ?? "—"}</strong></div>
          <div><span>CHANGES</span><strong>{project?.changed_count ?? 0}</strong></div>
        </div>
        <div className="project-detail-grid">
          <div><span>LAST COMMIT</span><p>{project?.last_commit ?? "No commit information yet."}</p></div>
          <div><span>ORIGIN</span><p>{project?.origin ?? "No origin detected."}</p></div>
        </div>
        {project?.changed_files.length ? <div className="changed-files"><span>MODIFIED / UNTRACKED</span>{project.changed_files.slice(0, 8).map((file) => <code key={file}>{file}</code>)}{project.changed_files.length > 8 ? <small>+{project.changed_files.length - 8} more</small> : null}</div> : null}
      </section>

      <section className="workstream-grid">
        {snapshot.workstreams.map((workstream) => {
          const worked = totals[workstream.id] ?? 0;
          const isActive = activeSession?.workstream_id === workstream.id;
          const missions = snapshot.missions.filter((mission) => mission.workstream_id === workstream.id);
          return (
            <article className={`workstream-card ${isActive ? "active" : ""}`} key={workstream.id}>
              <div className="workstream-head"><div><p className="eyebrow">WORKSTREAM</p><h3>{workstream.name}</h3></div><span className={`status-dot ${isActive ? "online" : ""}`}>{isActive ? "ACTIVE" : "READY"}</span></div>
              <div className="metric-line"><strong>{formatDuration(worked)}</strong><span>/ {formatDuration(workstream.daily_target_minutes)}</span></div>
              <div className="progress-track small"><div style={{ width: `${progress(worked, workstream.daily_target_minutes)}%` }} /></div>
              <div className="mission-list"><div className="section-label">MISSIONS</div>{missions.length ? missions.map((mission) => <button className="mission-row" key={mission.id} onClick={() => void completeMission(mission)}><span className="mission-check" /><span>{mission.title}</span></button>) : <p className="empty-copy">No open missions.</p>}</div>
              <form className="mission-form" onSubmit={(event) => void createMission(event, workstream.id)}><input value={newMission[workstream.id] ?? ""} onChange={(event) => setNewMission((current) => ({ ...current, [workstream.id]: event.target.value }))} placeholder="Add mission…" aria-label={`Add mission to ${workstream.name}`} /><button type="submit">Add</button></form>
              <button className="shift-button" disabled={isActive} onClick={() => void begin(workstream)}>{isActive ? "Shift running" : `Start ${workstream.name} shift`}</button>
            </article>
          );
        })}
      </section>

      <section className="audit-card">
        <div className="control-head"><div><p className="eyebrow">LOCAL AUDIT</p><h2>Recent Commander actions</h2></div><span>{snapshot.auditEvents.length} shown</span></div>
        <div className="audit-list">
          {snapshot.auditEvents.length ? snapshot.auditEvents.map((event) => (
            <div className="audit-row" key={event.id}>
              <span className={`risk risk-${event.risk_level}`}>L{event.risk_level}</span>
              <strong>{event.action}</strong>
              <span>{event.target ?? "—"}</span>
              <span>{event.status}</span>
              <time>{event.created_at}</time>
            </div>
          )) : <p className="empty-copy">No local actions recorded yet.</p>}
        </div>
      </section>

      <footer><span>LOCAL DATA</span><span>SQLite // commander.db</span><span>Project inspector live</span><span>Terminal bridge guarded</span><span>MCP boundary reserved</span></footer>
    </main>
  );
}

export default App;
