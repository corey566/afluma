import { FormEvent, type CSSProperties, useCallback, useEffect, useMemo, useState } from "react";
import { buildAssistantContext, extractCommanderAction } from "./lib/assistant";
import {
  assessTerminalCommand,
  discoverProjects,
  executeBrokerAction,
  getAutostart,
  inspectEnvironment,
  inspectProject,
  launchTarget,
  openProject,
  runTerminalCommand,
  sendTextToChatgpt,
  setAutostart,
  startDevelopment,
  summonChatgpt,
  type BrokerRequest,
  type CommandAssessment,
  type CommanderTarget,
  type EnvironmentInspection,
  type ProjectInspection,
  type TerminalResult,
} from "./lib/commander";
import {
  addMission,
  getSetting,
  loadDashboard,
  recordAuditEvent,
  setMissionStatus,
  setSetting,
  startWorkstream,
  stopActiveSession,
} from "./lib/db";
import type { DashboardSnapshot, Mission, Workstream } from "./lib/models";

const EMPTY: DashboardSnapshot = { workstreams: [], missions: [], sessions: [], auditEvents: [] };
const DEFAULT_DEV_PATH = "C:\\www\\afluma-commerce";
const PROJECT_SETTING = "commerce_project_path";

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

  const [projectPath, setProjectPath] = useState(DEFAULT_DEV_PATH);
  const [project, setProject] = useState<ProjectInspection | null>(null);
  const [projectMessage, setProjectMessage] = useState("Inspecting Afluma Commerce…");
  const [projectBusy, setProjectBusy] = useState(false);
  const [discoveredProjects, setDiscoveredProjects] = useState<string[]>([]);

  const [environment, setEnvironment] = useState<EnvironmentInspection | null>(null);
  const [environmentMessage, setEnvironmentMessage] = useState("Environment inspection pending.");
  const [environmentBusy, setEnvironmentBusy] = useState(false);
  const [developmentBusy, setDevelopmentBusy] = useState(false);

  const [command, setCommand] = useState("git status");
  const [cwd, setCwd] = useState(DEFAULT_DEV_PATH);
  const [terminalResult, setTerminalResult] = useState<TerminalResult | null>(null);
  const [terminalMessage, setTerminalMessage] = useState("Commander terminal bridge ready.");
  const [assessment, setAssessment] = useState<CommandAssessment | null>(null);
  const [commandBusy, setCommandBusy] = useState(false);

  const [assistantRequest, setAssistantRequest] = useState("Let's continue development from the current Commander OS state.");
  const [assistantMessage, setAssistantMessage] = useState("Assistant Gateway ready. Current transport uses the ChatGPT Windows app; no OpenAI API is configured.");
  const [assistantBusy, setAssistantBusy] = useState(false);
  const [assistantReply, setAssistantReply] = useState("");
  const [pendingAction, setPendingAction] = useState<BrokerRequest | null>(null);
  const [brokerMessage, setBrokerMessage] = useState("No assistant action is waiting.");

  const [autostartEnabled, setAutostartEnabled] = useState(false);
  const [presenceMessage, setPresenceMessage] = useState("Ctrl+Alt+C summons Commander OS from anywhere in Windows.");

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

  const refreshProject = useCallback(async (path = projectPath) => {
    if (!path.trim()) return;
    setProjectBusy(true);
    try {
      const inspection = await inspectProject(path);
      setProject(inspection);
      const resolved = inspection.git_root ?? inspection.path;
      setCwd(resolved);
      if (!inspection.exists) setProjectMessage("Configured Commerce path was not found on this PC.");
      else if (!inspection.is_git_repo) setProjectMessage("Path exists, but no Git worktree was detected. Use Discover projects or choose the correct folder.");
      else setProjectMessage(`Repository ready at ${resolved}.`);
    } catch (err) {
      setProjectMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setProjectBusy(false);
    }
  }, [projectPath]);

  const refreshEnvironment = useCallback(async (path = projectPath) => {
    if (!path.trim()) return;
    setEnvironmentBusy(true);
    try {
      const result = await inspectEnvironment(path);
      setEnvironment(result);
      setEnvironmentMessage("Local development environment inspected.");
    } catch (err) {
      setEnvironment(null);
      setEnvironmentMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setEnvironmentBusy(false);
    }
  }, [projectPath]);

  useEffect(() => {
    void refresh();
    void (async () => {
      const storedPath = await getSetting(PROJECT_SETTING, DEFAULT_DEV_PATH);
      setProjectPath(storedPath);
      setCwd(storedPath);
      try {
        setAutostartEnabled(await getAutostart());
      } catch {
        setPresenceMessage("Commander global shortcut is active. Autostart state could not be read yet.");
      }
    })();

    const clock = window.setInterval(() => setNow(new Date()), 30_000);
    const dashboardPoll = window.setInterval(() => void refresh(), 60_000);
    return () => {
      window.clearInterval(clock);
      window.clearInterval(dashboardPoll);
    };
  }, [refresh]);

  useEffect(() => {
    if (!projectPath.trim()) return;
    void refreshProject(projectPath);
    void refreshEnvironment(projectPath);
    const poll = window.setInterval(() => {
      void refreshProject(projectPath);
      void refreshEnvironment(projectPath);
    }, 45_000);
    return () => window.clearInterval(poll);
  }, [projectPath, refreshEnvironment, refreshProject]);

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
  const resolvedProjectPath = project?.git_root ?? projectPath;

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

  async function saveProjectPath() {
    const trimmed = projectPath.trim();
    if (!trimmed) return;
    await setSetting(PROJECT_SETTING, trimmed);
    setCwd(trimmed);
    await recordAuditEvent("project.path", trimmed, 1, "success", "Commerce project path saved locally.");
    await Promise.all([refreshProject(trimmed), refreshEnvironment(trimmed), refresh()]);
  }

  async function discoverLocalProjects() {
    setProjectBusy(true);
    try {
      const projects = await discoverProjects("C:\\www");
      setDiscoveredProjects(projects);
      setProjectMessage(projects.length ? `Found ${projects.length} Git project(s) under C:\\www.` : "No Git repositories were found one level below C:\\www.");
    } catch (err) {
      setProjectMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setProjectBusy(false);
    }
  }

  async function chooseProject(path: string) {
    setProjectPath(path);
    setCwd(path);
    await setSetting(PROJECT_SETTING, path);
    setDiscoveredProjects([]);
  }

  async function openCommerceWorkspace() {
    try {
      const result = await openProject(resolvedProjectPath);
      setProjectMessage(result.message);
      setCwd(resolvedProjectPath);
      await recordAuditEvent("project.open", resolvedProjectPath, 1, "success", result.message);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setProjectMessage(message);
      await recordAuditEvent("project.open", resolvedProjectPath, 1, "failed", message);
    }
    await refresh();
  }

  async function startCommerceDevelopment() {
    setDevelopmentBusy(true);
    try {
      const commerce = snapshot.workstreams.find((item) => item.id === "commerce");
      if (commerce && activeSession?.workstream_id !== "commerce") {
        await startWorkstream("commerce");
      }
      const result = await startDevelopment(resolvedProjectPath);
      setEnvironmentMessage(result.message);
      await recordAuditEvent("development.start", resolvedProjectPath, 1, "success", result.message);
      await Promise.all([refresh(), refreshProject(resolvedProjectPath), refreshEnvironment(resolvedProjectPath)]);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setEnvironmentMessage(message);
      await recordAuditEvent("development.start", resolvedProjectPath, 1, "failed", message);
    } finally {
      setDevelopmentBusy(false);
    }
  }

  async function summonAssistant() {
    setAssistantBusy(true);
    try {
      const result = await summonChatgpt();
      setAssistantMessage(result.message);
      await recordAuditEvent("assistant.summon", "chatgpt", 0, "success", result.message);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setAssistantMessage(message);
      await recordAuditEvent("assistant.summon", "chatgpt", 0, "failed", message);
    } finally {
      setAssistantBusy(false);
      await refresh();
    }
  }

  async function sendAssistantContext() {
    setAssistantBusy(true);
    try {
      const packet = buildAssistantContext({
        request: assistantRequest,
        snapshot,
        project,
        environment,
        terminal: terminalResult,
        cwd,
      });
      const result = await sendTextToChatgpt(packet, true);
      setAssistantMessage(result.message);
      await recordAuditEvent("assistant.context.send", "chatgpt", 0, "success", `Context packet ${packet.length} chars`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setAssistantMessage(message);
      await recordAuditEvent("assistant.context.send", "chatgpt", 0, "failed", message);
    } finally {
      setAssistantBusy(false);
      await refresh();
    }
  }

  async function processAssistantReply() {
    const action = extractCommanderAction(assistantReply);
    if (!action) {
      setBrokerMessage("No valid COMMANDER_ACTION block was found in the pasted ChatGPT response.");
      return;
    }
    setPendingAction(action);
    try {
      const result = await executeBrokerAction({ ...action, approved: false });
      setBrokerMessage(`${result.status.toUpperCase()} // ${result.message}${result.output ? `\n${result.output}` : ""}`);
      await recordAuditEvent("assistant.action", action.tool, result.risk_level, result.status, result.message);
      if (result.status !== "approval_required") setPendingAction(null);
      await Promise.all([refresh(), refreshProject(), refreshEnvironment()]);
    } catch (err) {
      setBrokerMessage(err instanceof Error ? err.message : String(err));
    }
  }

  async function approvePendingAction() {
    if (!pendingAction) return;
    try {
      const result = await executeBrokerAction({ ...pendingAction, approved: true });
      setBrokerMessage(`${result.status.toUpperCase()} // ${result.message}${result.output ? `\n${result.output}` : ""}`);
      await recordAuditEvent("assistant.action.approved", pendingAction.tool, result.risk_level, result.status, result.message);
      setPendingAction(null);
      await Promise.all([refresh(), refreshProject(), refreshEnvironment()]);
    } catch (err) {
      setBrokerMessage(err instanceof Error ? err.message : String(err));
    }
  }

  async function toggleAutostart() {
    const next = !autostartEnabled;
    try {
      const result = await setAutostart(next);
      setAutostartEnabled(next);
      setPresenceMessage(result.message);
      await recordAuditEvent("system.autostart", "commander-os", 1, "success", result.message);
    } catch (err) {
      setPresenceMessage(err instanceof Error ? err.message : String(err));
    }
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
      await Promise.all([refreshProject(), refreshEnvironment()]);
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

      <section className="presence-bar">
        <div><span className="presence-dot" /><strong>COMMANDER PRESENT</strong><span>Ctrl+Alt+C global summon</span></div>
        <div><span>{presenceMessage}</span><button onClick={() => void toggleAutostart()}>{autostartEnabled ? "Disable autostart" : "Start with Windows"}</button></div>
      </section>

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

      <section className="assistant-gateway">
        <div className="control-head">
          <div><p className="eyebrow">ASSISTANT GATEWAY // WINDOWS TRANSPORT</p><h2>ChatGPT reasoning, Commander execution.</h2></div>
          <span className="assistant-badge">NO OPENAI API</span>
        </div>
        <div className="assistant-grid">
          <div className="assistant-compose">
            <label><span>COMMANDER REQUEST</span><textarea value={assistantRequest} onChange={(event) => setAssistantRequest(event.target.value)} rows={5} /></label>
            <div className="assistant-actions">
              <button onClick={() => void summonAssistant()} disabled={assistantBusy}>Summon ChatGPT</button>
              <button className="primary-action" onClick={() => void sendAssistantContext()} disabled={assistantBusy}>{assistantBusy ? "Sending…" : "Send live context"}</button>
            </div>
            <p className="assistant-note">Commander opens the installed ChatGPT Windows companion, pastes the live context packet, and submits it. Direct ChatGPT→Commander tool calls remain transport-gated until full MCP is available for this account.</p>
          </div>
          <div className="assistant-status">
            <div><span>TRANSPORT</span><strong>ChatGPT Windows companion / fallback web</strong></div>
            <div><span>CONTEXT</span><strong>Shift + project + services + terminal + audit</strong></div>
            <div><span>ACTIONS</span><strong>Commander Action Broker // bounded</strong></div>
            <div><span>PRESENCE</span><strong>Tray + Ctrl+Alt+C</strong></div>
            <p>{assistantMessage}</p>
          </div>
        </div>
        <div className="action-inbox">
          <div><p className="eyebrow">ASSISTANT ACTION INBOX</p><h3>Return a requested action to Commander.</h3></div>
          <textarea value={assistantReply} onChange={(event) => setAssistantReply(event.target.value)} rows={5} placeholder="Paste a ChatGPT response containing COMMANDER_ACTION … END_COMMANDER_ACTION" />
          <div className="action-inbox-footer">
            <pre>{brokerMessage}</pre>
            <div>
              <button onClick={() => void processAssistantReply()}>Process action</button>
              {pendingAction ? <button className="approval-button" onClick={() => void approvePendingAction()}>Approve {pendingAction.tool}</button> : null}
            </div>
          </div>
        </div>
      </section>

      <section className="project-card">
        <div className="control-head">
          <div><p className="eyebrow">PROJECT REGISTRY // LOCAL</p><h2>Afluma Commerce</h2></div>
          <div className="project-actions">
            <button onClick={() => void discoverLocalProjects()} disabled={projectBusy}>Discover C:\\www</button>
            <button onClick={() => void refreshProject()} disabled={projectBusy}>{projectBusy ? "Inspecting…" : "Refresh"}</button>
            <button className="primary-action" onClick={() => void openCommerceWorkspace()} disabled={!project?.exists}>Open workspace</button>
          </div>
        </div>
        <div className="project-path-editor"><input value={projectPath} onChange={(event) => setProjectPath(event.target.value)} spellCheck={false} /><button onClick={() => void saveProjectPath()}>Save path</button></div>
        {discoveredProjects.length ? <div className="project-discovery">{discoveredProjects.map((path) => <button key={path} onClick={() => void chooseProject(path)}>{path}</button>)}</div> : null}
        <p className="project-message">{projectMessage}</p>
        <div className="project-metrics">
          <div><span>PATH</span><strong>{project?.exists ? "ONLINE" : "MISSING"}</strong></div>
          <div><span>GIT</span><strong>{project?.is_git_repo ? "READY" : "UNAVAILABLE"}</strong></div>
          <div><span>BRANCH</span><strong>{project?.branch ?? "—"}</strong></div>
          <div><span>CHANGES</span><strong>{project?.changed_count ?? 0}</strong></div>
        </div>
        <div className="project-detail-grid">
          <div><span>RESOLVED ROOT</span><p>{project?.git_root ?? projectPath}</p></div>
          <div><span>LAST COMMIT</span><p>{project?.last_commit ?? "No commit information yet."}</p></div>
          <div><span>ORIGIN</span><p>{project?.origin ?? "No origin detected."}</p></div>
          <div><span>TOOLING</span><p>{project?.package_manager ?? "Unknown"} // scripts: {project?.package_scripts.join(", ") || "none"}</p></div>
        </div>
        {project?.changed_files.length ? <div className="changed-files"><span>MODIFIED / UNTRACKED</span>{project.changed_files.slice(0, 8).map((file) => <code key={file}>{file}</code>)}{project.changed_files.length > 8 ? <small>+{project.changed_files.length - 8} more</small> : null}</div> : null}
      </section>

      <section className="environment-card">
        <div className="control-head">
          <div><p className="eyebrow">DEVELOPMENT ENVIRONMENT</p><h2>Commerce runtime awareness</h2></div>
          <div className="project-actions">
            <button onClick={() => void refreshEnvironment()} disabled={environmentBusy}>{environmentBusy ? "Checking…" : "Refresh services"}</button>
            <button className="primary-action" onClick={() => void startCommerceDevelopment()} disabled={developmentBusy || !project?.exists}>{developmentBusy ? "Starting…" : "Start Commerce development"}</button>
          </div>
        </div>
        <p className="project-message">{environmentMessage}</p>
        <div className="environment-summary">
          <div><span>DOCKER</span><strong>{environment?.docker_available ? "ONLINE" : "OFFLINE"}</strong><small>{environment?.docker_detail ?? "Not inspected"}</small></div>
          <div><span>PACKAGE MANAGER</span><strong>{environment?.package_manager ?? "—"}</strong><small>{environment?.dev_command ?? "No dev command detected"}</small></div>
          <div><span>COMPOSE</span><strong>{environment?.compose_files.length ?? 0}</strong><small>compose file(s)</small></div>
        </div>
        <div className="service-grid">
          {environment?.services.map((service) => <div className={`service-tile ${service.state === "online" ? "online" : "offline"}`} key={service.id}><span>{service.label}</span><strong>{service.state.toUpperCase()}</strong><small>{service.detail}</small></div>) ?? <p className="empty-copy">No service inspection yet.</p>}
        </div>
      </section>

      <section className="control-deck">
        <div className="control-head">
          <div><p className="eyebrow">LOCAL CONTROL DECK</p><h2>Inspect and execute through policy.</h2></div>
          <span className="guard-badge">GUARDED EXECUTION</span>
        </div>
        <div className="quick-actions">
          <button onClick={() => void launch("gmail")}><strong>Gmail</strong><span>Open inbox</span></button>
          <button onClick={() => void summonAssistant()}><strong>ChatGPT</strong><span>Summon companion</span></button>
          <button onClick={() => void launch("powershell")}><strong>PowerShell</strong><span>Open terminal</span></button>
          <button onClick={() => void launch("vscode")}><strong>VS Code</strong><span>Open editor</span></button>
        </div>
        <div className="terminal-layout">
          <form className="terminal-form" onSubmit={(event) => void executeCommand(event)}>
            <label><span>WORKING DIRECTORY</span><input value={cwd} onChange={(event) => setCwd(event.target.value)} spellCheck={false} /></label>
            <label><span>POWERSHELL COMMAND</span><div className="command-input-row"><input value={command} onChange={(event) => setCommand(event.target.value)} spellCheck={false} /><button disabled={commandBusy} type="submit">{commandBusy ? "Running…" : "Run"}</button></div></label>
            <div className="safe-command-row">{["git status", "git branch --show-current", "docker ps", "node --version"].map((item) => <button type="button" key={item} onClick={() => setCommand(item)}>{item}</button>)}</div>
          </form>
          <div className="terminal-output">
            <div className="terminal-title"><span>COMMANDER TERMINAL BRIDGE</span>{assessment ? <span className={`risk risk-${assessment.risk_level}`}>L{assessment.risk_level} // {assessment.label}</span> : null}</div>
            <pre>{terminalResult ? [`PS ${terminalResult.cwd}> ${terminalResult.command}`, terminalResult.stdout, terminalResult.stderr ? `STDERR\n${terminalResult.stderr}` : "", `EXIT ${terminalResult.exit_code ?? "UNKNOWN"}`].filter(Boolean).join("\n\n") : terminalMessage}</pre>
          </div>
        </div>
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
          {snapshot.auditEvents.length ? snapshot.auditEvents.map((event) => <div className="audit-row" key={event.id}><span className={`risk risk-${event.risk_level}`}>L{event.risk_level}</span><strong>{event.action}</strong><span>{event.target ?? "—"}</span><span>{event.status}</span><time>{event.created_at}</time></div>) : <p className="empty-copy">No local actions recorded yet.</p>}
        </div>
      </section>

      <footer><span>LOCAL DATA</span><span>SQLite // commander.db</span><span>Tray + Ctrl+Alt+C</span><span>Assistant Gateway</span><span>Action Broker</span><span>MCP-ready boundary</span></footer>
    </main>
  );
}

export default App;
