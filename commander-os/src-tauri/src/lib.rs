use tauri_plugin_sql::{Migration, MigrationKind};

const DATABASE_URL: &str = "sqlite:commander.db";

fn migrations() -> Vec<Migration> {
    vec![Migration {
        version: 1,
        description: "commander_foundation",
        sql: r#"
            PRAGMA foreign_keys = ON;
            CREATE TABLE IF NOT EXISTS workstreams (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, daily_target_minutes INTEGER NOT NULL DEFAULT 540, sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
            CREATE TABLE IF NOT EXISTS missions (id INTEGER PRIMARY KEY AUTOINCREMENT, workstream_id TEXT NOT NULL, title TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'todo' CHECK(status IN ('todo', 'in_progress', 'blocked', 'done')), priority INTEGER NOT NULL DEFAULT 3, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, completed_at TEXT, FOREIGN KEY(workstream_id) REFERENCES workstreams(id) ON DELETE CASCADE);
            CREATE TABLE IF NOT EXISTS work_sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, workstream_id TEXT NOT NULL, mission_id INTEGER, started_at TEXT NOT NULL, ended_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(workstream_id) REFERENCES workstreams(id) ON DELETE CASCADE, FOREIGN KEY(mission_id) REFERENCES missions(id) ON DELETE SET NULL);
            CREATE UNIQUE INDEX IF NOT EXISTS one_open_work_session ON work_sessions((1)) WHERE ended_at IS NULL;
            CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
            INSERT OR IGNORE INTO workstreams (id, name, slug, daily_target_minutes, sort_order) VALUES ('commerce', 'Afluma Commerce', 'afluma-commerce', 540, 10), ('company', 'Afluma Company', 'afluma-company', 540, 20);
            INSERT OR IGNORE INTO settings (key, value) VALUES ('display_name', 'Commander');
            INSERT INTO missions (workstream_id, title, status, priority) SELECT 'commerce', 'Restore the Afluma Commerce local development environment', 'todo', 1 WHERE NOT EXISTS (SELECT 1 FROM missions WHERE workstream_id = 'commerce');
            INSERT INTO missions (workstream_id, title, status, priority) SELECT 'company', 'Build Commander OS foundation', 'in_progress', 1 WHERE NOT EXISTS (SELECT 1 FROM missions WHERE workstream_id = 'company');
        "#,
        kind: MigrationKind::Up,
    }]
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().add_migrations(DATABASE_URL, migrations()).build())
        .run(tauri::generate_context!())
        .expect("failed to run Afluma Commander OS");
}
