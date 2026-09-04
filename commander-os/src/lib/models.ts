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

export type DashboardSnapshot = {
  workstreams: Workstream[];
  missions: Mission[];
  sessions: WorkSession[];
};
