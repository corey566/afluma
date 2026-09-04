# Afluma Commander OS

Local-first desktop command plane for running Afluma workstreams and approved PC actions from a Windows machine.

## Current foundation — Skeleton 0.1

Commander OS is deliberately being built as deterministic local software first. AI is an optional reasoning layer, not a requirement for basic PC control.

Implemented on `commander-os-foundation`:

- Tauri 2 desktop shell
- React + TypeScript + Vite UI
- local SQLite database (`commander.db`)
- Afluma Commerce and Afluma Company workstreams
- 9-hour daily target per workstream
- start/stop work-session tracking
- mission creation and completion
- Local Control Deck
- quick launch: Gmail, ChatGPT, PowerShell and VS Code
- bounded PowerShell bridge with stdout, stderr and exit-code capture
- command risk classification before execution
- destructive/system-level command blocking in the foundation bridge
- persistent local audit events
- no OpenAI API dependency
- MCP integration boundary reserved, not yet exposed

GitHub stores source code. Runtime operational data stays local on the PC.

## Execution policy in Skeleton 0.1

Commander classifies local terminal actions before execution.

- Level 0 — Observe: read-only diagnostics such as `git status`, `docker ps` and version checks.
- Level 1 — Safe dev action: bounded project build/test commands.
- Level 2 — Change / unknown: blocked until a later explicit approval workflow exists.
- Level 3 — High impact: destructive or system-level commands are blocked by the foundation bridge.

The allowlist is intentionally small while the local runtime is being validated.

## Windows prerequisites

Install:

1. Node.js 22 LTS or newer supported version
2. Rust stable via rustup
3. Microsoft C++ Build Tools / Visual Studio Build Tools with Desktop development with C++
4. WebView2 Runtime (normally already present on Windows 11)

## Run locally

```powershell
cd C:\www\afluma
git fetch origin
git checkout commander-os-foundation
git pull origin commander-os-foundation
cd commander-os
npm install
npm run desktop:dev
```

The first run compiles the Rust desktop shell and creates/migrates the SQLite database under the application's local data directory.

## First runtime checks

1. Commander OS desktop window opens.
2. Workstreams and missions load from SQLite.
3. Start a shift, restart Commander OS, and confirm the session persists.
4. Press `Gmail` and confirm the default browser opens Gmail.
5. Press `ChatGPT` and confirm ChatGPT opens.
6. Run `git status` from an existing repository path and confirm stdout is shown in the Control Deck.
7. Try an unknown/change command and confirm Commander blocks it.
8. Confirm the action appears in Recent Commander actions.

## Production desktop build

```powershell
npm run desktop:build
```

Tauri will produce Windows installer/bundle artifacts under `src-tauri\\target\\release\\bundle`.

## Data ownership

Do not commit the live database to Git. Commander data must stay outside the source tree and be accessed through Commander OS or future controlled interfaces.

## Planned gates

### Gate 1 — Local runtime

- verify Windows build
- verify SQLite migrations 1 and 2
- verify session persistence
- verify mission persistence
- verify quick launch actions
- verify terminal allowlist and blocking behavior
- verify local audit persistence

### Gate 2 — Local project registry

- register local repository paths
- Git branch/status/commit visibility
- development-service health checks
- explicit workspace launch actions

### Gate 3 — Presence layer

- Windows tray service
- global keyboard summon shortcut
- start-on-login option
- local wake-word listener
- floating Commander overlay

### Gate 4 — Activity engine

- opt-in Git/build/test events
- idle detection based on approved signals
- daily timeline
- no screen-content surveillance by default

### Gate 5 — Controlled ChatGPT/MCP gateway

- read-only tools first
- explicit scopes
- audit log
- scoped approval policy before writes
- no direct OpenAI API dependency in Commander OS

No AI provider is required for Commander OS to function.
