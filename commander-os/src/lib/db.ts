import Database from "@tauri-apps/plugin-sql";
import type { DashboardSnapshot, Mission, WorkSession, Workstream } from "./models";

let dbPromise: Promise<Database> | null = null;

function db() {
  if (!dbPromise) dbPromise = Database.load("sqlite:commander.db");
  return dbPromise;
}

export async function loadDashboard(): Promise<DashboardSnapshot> {
  const connection = await db();
  const [workstreams, missions, sessions] = await Promise.all([
    connection.select<Workstream[]>("SELECT id, name, slug, daily_target_minutes FROM workstreams ORDER BY sort_order ASC"),
    connection.select<Mission[]>("SELECT id, workstream_id, title, status, priority FROM missions WHERE status != 'done' ORDER BY priority ASC, id ASC"),
    connection.select<WorkSession[]>("SELECT id, workstream_id, mission_id, started_at, ended_at FROM work_sessions WHERE date(started_at, 'localtime') = date('now', 'localtime') ORDER BY started_at ASC"),
  ]);
  return { workstreams, missions, sessions };
}

export async function startWorkstream(workstreamId: string) {
  const connection = await db();
  await connection.execute("UPDATE work_sessions SET ended_at = datetime('now') WHERE ended_at IS NULL");
  await connection.execute("INSERT INTO work_sessions (workstream_id, started_at) VALUES ($1, datetime('now'))", [workstreamId]);
}

export async function stopActiveSession() {
  const connection = await db();
  await connection.execute("UPDATE work_sessions SET ended_at = datetime('now') WHERE ended_at IS NULL");
}

export async function addMission(workstreamId: string, title: string) {
  const trimmed = title.trim();
  if (!trimmed) return;
  const connection = await db();
  await connection.execute("INSERT INTO missions (workstream_id, title, status, priority) VALUES ($1, $2, 'todo', 3)", [workstreamId, trimmed]);
}

export async function setMissionStatus(missionId: number, status: Mission["status"]) {
  const connection = await db();
  await connection.execute("UPDATE missions SET status = $1, completed_at = CASE WHEN $1 = 'done' THEN datetime('now') ELSE NULL END WHERE id = $2", [status, missionId]);
}
