# Afluma Commander OS

Local-first desktop command plane for running Afluma workstreams from a Windows PC.

## Foundation status

Phase 0 foundation is intentionally narrow:

- Tauri 2 desktop shell
- React + TypeScript + Vite UI
- local SQLite database (`commander.db`)
- two real workstreams: Afluma Commerce and Afluma Company
- 9-hour daily target per workstream
- start/stop work-session tracking
- mission creation and completion
- no OpenAI API dependency
- MCP integration boundary reserved, not yet exposed

GitHub stores source code. Runtime operational data stays local on the PC.

## Windows prerequisites

Install:

1. Node.js 22 LTS or newer supported version
2. Rust stable via rustup
3. Microsoft C++ Build Tools / Visual Studio Build Tools with Desktop development with C++
4. WebView2 Runtime (normally already present on Windows 11)

## Run locally

From this folder:

```powershell
npm install
npm run desktop:dev
```

The first run compiles the Rust desktop shell and creates the SQLite database under the application's local data directory.

## Production desktop build

```powershell
npm run desktop:build
```

Tauri will produce Windows installer/bundle artifacts under `src-tauri\\target\\release\\bundle`.

## Data ownership

Do not commit the live database to Git. Commander data must stay outside the source tree and be accessed through the desktop application or future controlled interfaces.

## Planned gates

### Gate 1 — Local dashboard

- verify Windows build
- verify SQLite migration
- verify start/stop session persistence
- verify mission persistence
- add reset/recovery handling

### Gate 2 — Local project registry

- register local repository paths
- Git branch/status/commit visibility
- development-service health checks
- explicit project launch actions

### Gate 3 — Activity engine

- opt-in Git/build/test events
- idle detection based on approved signals
- daily timeline
- no screen-content surveillance

### Gate 4 — Controlled MCP gateway

- read-only tools first
- explicit scopes
- audit log
- write actions only after approval policy is implemented

No AI provider is required for Commander OS to function.
