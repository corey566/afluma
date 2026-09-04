import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { addMission, loadDashboard, setMissionStatus, startWorkstream, stopActiveSession } from "./lib/db";
import type { DashboardSnapshot, Mission, Workstream } from "./lib/models";

const EMPTY: DashboardSnapshot = { workstreams: [], missions: [], sessions: [] };

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

  useEffect(() => {
    void refresh();
    const clock = window.setInterval(() => setNow(new Date()), 30_000);
    const poll = window.setInterval(() => void refresh(), 60_000);
    return () => {
      window.clearInterval(clock);
      window.clearInterval(poll);
    };
  }, [refresh]);

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
            <div className="ring" style={{ "--progress": `${progress(totalWorked, totalTarget) * 3.6}deg` } as React.CSSProperties}><span>{progress(totalWorked, totalTarget)}%</span></div>
          </div>
          <div className="progress-track"><div style={{ width: `${progress(totalWorked, totalTarget)}%` }} /></div>
        </div>

        <div className="hero-card status-card">
          <p className="eyebrow">ACTIVE SHIFT</p>
          {activeSession ? <><h2>{snapshot.workstreams.find((item) => item.id === activeSession.workstream_id)?.name}</h2><span>{formatDuration(minutesBetween(activeSession.started_at, null, now))} in this session</span><button className="danger-button" onClick={() => void stop()}>End shift</button></> : <><h2>Standby</h2><span>No work session is currently running.</span></>}
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

      <footer><span>LOCAL DATA</span><span>SQLite // commander.db</span><span>MCP boundary reserved</span></footer>
    </main>
  );
}

export default App;
