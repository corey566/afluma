import Database from "@tauri-apps/plugin-sql";
import type { AuditEvent, DashboardSnapshot, Mission, WorkSession, Workstream } from "./models";

let dbPromise: Promise<Database> | null = null;

function db() {
  if (!dbPromise) dbPromise = Database.load("sqlite:commander.db");
  return dbPromise;
}

export async function loadDashboard(): Promise<DashboardSnapshot> {
  const connection = await db();
  const [workstreams, missions, sessions, auditEvents] = await Promise.all([
    connection.select<Workstream[]>("SELECT id, name, slug, daily_target_minutes FROM workstreams ORDER BY sort_order ASC"),
    connection.select<Mission[]>("SELECT id, workstream_id, title, status, priority FROM missions WHERE status != 'done' ORDER BY priority ASC, id ASC"),
    connection.select<WorkSession[]>("SELECT id, workstream_id, mission_id, started_at, ended_at FROM work_sessions WHERE date(started_at, 'localtime') = date('now', 'localtime') ORDER BY started_at ASC"),
    connection.select<AuditEvent[]>("SELECT id, actor, action, target, risk_level, status, detail, created_at FROM audit_events ORDER BY id DESC LIMIT 20"),
  ]);
  return { workstreams, missions, sessions, auditEvents };
}

export async function getSetting(key: string, fallback = "") {
  const connection = await db();
  const rows = await connection.select<Array<{ value: string }>>("SELECT value FROM settings WHERE key = $1 LIMIT 1", [key]);
  return rows[0]?.value ?? fallback;
}

export async function setSetting(key: string, value: string) {
  const connection = await db();
  await connection.execute(
    "INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    [key, value],
  );
}

export async function startWorkstream(workstreamId: string) {
  const connection = await db();
  await connection.execute("UPDATE work_sessions SET ended_at = datetime('now') WHERE ended_at IS NULL");
  await connection.execute("INSERT INTO work_sessions (workstream_id, started_at) VALUES ($1, datetime('now'))", [workstreamId]);
  await recordAuditEvent("shift.start", workstreamId, 0, "success", "Workstream session started.");
}

export async function stopActiveSession() {
  const connection = await db();
  await connection.execute("UPDATE work_sessions SET ended_at = datetime('now') WHERE ended_at IS NULL");
  await recordAuditEvent("shift.stop", "active-session", 0, "success", "Active work session stopped.");
}

export async function addMission(workstreamId: string, title: string) {
  const trimmed = title.trim();
  if (!trimmed) return;
  const connection = await db();
  await connection.execute("INSERT INTO missions (workstream_id, title, status, priority) VALUES ($1, $2, 'todo', 3)", [workstreamId, trimmed]);
  await recordAuditEvent("mission.create", workstreamId, 1, "success", trimmed);
}

export async function setMissionStatus(missionId: number, status: Mission["status"]) {
  const connection = await db();
  await connection.execute("UPDATE missions SET status = $1, completed_at = CASE WHEN $1 = 'done' THEN datetime('now') ELSE NULL END WHERE id = $2", [status, missionId]);
  await recordAuditEvent("mission.status", String(missionId), 1, "success", status);
}

export async function recordAuditEvent(
  action: string,
  target: string | null,
  riskLevel: number,
  status: string,
  detail?: string | null,
) {
  const connection = await db();
  await connection.execute(
    "INSERT INTO audit_events (actor, action, target, risk_level, status, detail) VALUES ('commander', $1, $2, $3, $4, $5)",
    [action, target, riskLevel, status, detail ?? null],
  );
}
