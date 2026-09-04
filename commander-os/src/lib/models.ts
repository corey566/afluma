export type Workstream = {
  id: string;
  name: string;
  slug: string;
  daily_target_minutes: number;
};

export type Mission = {
  id: number;
  workstream_id: string;
  title: string;
  status: "todo" | "in_progress" | "blocked" | "done";
  priority: number;
};

export type WorkSession = {
  id: number;
  workstream_id: string;
  mission_id: number | null;
  started_at: string;
  ended_at: string | null;
};

export type AuditEvent = {
  id: number;
  actor: string;
  action: string;
  target: string | null;
  risk_level: number;
  status: string;
  detail: string | null;
  created_at: string;
};

export type DashboardSnapshot = {
  workstreams: Workstream[];
  missions: Mission[];
  sessions: WorkSession[];
  auditEvents: AuditEvent[];
};
