mod commands;

use tauri::{
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};
use tauri_plugin_sql::{Migration, MigrationKind};

const DATABASE_URL: &str = "sqlite:commander.db";

fn migrations() -> Vec<Migration> {
    vec![
        Migration {
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
        },
        Migration {
            version: 2,
            description: "commander_local_actions",
            sql: r#"
                CREATE TABLE IF NOT EXISTS audit_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    actor TEXT NOT NULL DEFAULT 'commander',
                    action TEXT NOT NULL,
                    target TEXT,
                    risk_level INTEGER NOT NULL DEFAULT 0,
                    status TEXT NOT NULL,
                    detail TEXT,
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                );
                CREATE INDEX IF NOT EXISTS audit_events_created_at ON audit_events(created_at DESC);
            "#,
            kind: MigrationKind::Up,
        },
    ]
}

fn show_main(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(DATABASE_URL, migrations())
                .build(),
        )
        .setup(|app| {
            #[cfg(desktop)]
            {
                app.handle().plugin(tauri_plugin_autostart::init(
                    tauri_plugin_autostart::MacosLauncher::LaunchAgent,
                    None,
                ))?;

                app.handle().plugin(
                    tauri_plugin_global_shortcut::Builder::new()
                        .with_handler(|app, _shortcut, event| {
                            if event.state() == ShortcutState::Pressed {
                                show_main(app);
                            }
                        })
                        .build(),
                )?;
                app.global_shortcut().register("Ctrl+Alt+C")?;

                let mut tray = TrayIconBuilder::with_id("commander-tray")
                    .tooltip("Afluma Commander OS")
                    .on_tray_icon_event(|tray, event| {
                        if let TrayIconEvent::Click {
                            button: MouseButton::Left,
                            button_state: MouseButtonState::Up,
                            ..
                        } = event
                        {
                            show_main(tray.app_handle());
                        }
                    });
                if let Some(icon) = app.default_window_icon() {
                    tray = tray.icon(icon.clone());
                }
                tray.build(app)?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::assess_terminal_command,
            commands::launch_target,
            commands::summon_chatgpt,
            commands::send_text_to_chatgpt,
            commands::copy_text_to_clipboard,
            commands::inspect_project,
            commands::discover_projects,
            commands::inspect_environment,
            commands::open_project,
            commands::start_development,
            commands::run_terminal_command,
            commands::execute_broker_action,
            commands::get_autostart,
            commands::set_autostart,
        ])
        .run(tauri::generate_context!())
        .expect("failed to run Afluma Commander OS");
}
