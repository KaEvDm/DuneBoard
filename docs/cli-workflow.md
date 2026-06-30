# CLI Workflow

DuneBoard CLI commands are the preferred write path for agents. Humans can still
edit Markdown directly, but agents should use commands where possible so task
state stays valid and consistent.

## Run

Inside the DuneBoard repository, the package script remains the normal command
path:

```bash
pnpm dune --help
pnpm dune preflight --compact
```

On Windows, the stable wrapper avoids pnpm bootstrap checks when dependencies
are already installed:

```powershell
.\scripts\DuneBoard.ps1 preflight --compact
.\scripts\DuneBoard.ps1 --root C:\path\to\project preflight --compact
.\scripts\DuneBoard.cmd show DB-0007 --summary
```

The wrapper calls `node_modules\.bin\tsx.CMD packages\cli\src\index.ts`
directly when present, then falls back to `pnpm --dir <DuneBoard> dune ...` if
the direct entrypoint is unavailable.

For reproducible dependency setup, use the pinned package manager from
`package.json` (`pnpm@10.25.0`). The workspace intentionally approves esbuild
build scripts with `allowBuilds: esbuild` in `pnpm-workspace.yaml`, matching the
local runtime dependencies used by `tsx` and Vite.

## Read Commands

### Preflight

```bash
pnpm dune preflight
pnpm dune preflight --compact
pnpm dune preflight --json --limit 5
```

Runs validation and prints a bounded ready queue in one command. The compact
view is the preferred agent preflight because it avoids reading full task
files. If validation fails, preflight exits non-zero and prints the issues.

### Validate

```bash
pnpm dune validate
pnpm dune validate --json
```

Validates task files and graph links.
The default live scan ignores `<taskRoot>/archive/**`; validate prints the
ignored archive subtrees so archived specs, status logs, and old task files can
stay in the repository without creating duplicate live IDs or parse errors.

### Next

```bash
pnpm dune next
pnpm dune next --limit 5
pnpm dune next --json
pnpm dune next --json --limit 5
```

Prints tasks that are `ready` and whose dependencies are all `done`.
Planning containers such as `epic` and `feature` are excluded from this
execution queue. Use `--limit` when the caller only needs a bounded amount of
context.

### List

```bash
pnpm dune list
pnpm dune list --status ready
pnpm dune list --json
```

Lists tasks, optionally filtered by status.

### Show

```bash
pnpm dune show DB-0004
pnpm dune show DB-0004 --summary
pnpm dune show DB-0004 --summary --log-tail 5
pnpm dune show DB-0004 --with-design
pnpm dune show DB-0004 --design
pnpm dune show DB-0004 --json
pnpm dune show DB-0004 --summary --json
```

Shows task details, acceptance criteria, open questions, and work log. Design
content is omitted from the default text output to keep task reads compact; use
`--with-design` to include it in the detail view or `--design` to print only the
raw `## Design` section for review, migration, or agent handoff. Use
`--summary` for frontmatter, acceptance progress, goal, and the latest Work Log
entries without the full historical log.

### Task Log

```bash
pnpm dune task log DB-0004
pnpm dune task log DB-0004 --tail 5
pnpm dune task log DB-0004 --tail 5 --json
```

Prints recent `## Work Log` entries without reading the full task detail.

### Migrate Source Specs

```bash
pnpm dune migrate source-specs
pnpm dune migrate source-specs --json
```

Builds a reviewable source-spec migration plan. The plan classifies Markdown
files as task-related specs, non-task documentation, generated documentation,
existing task archives, or unknown files. Task-related specs include an owning
task when detected, a proposed `<taskRoot>/archive/...` path, required
`## Design` review steps, and a provenance note to copy into the task notes or
work log before moving the source file.

## Write Commands

### Create

```bash
pnpm dune task create --title "Build first CLI" --kind task --status ready --priority P1 --parent DB-0001 --depends-on DB-0004 --label cli,agents
```

Creates the next `DB-000X` Markdown file under `tasks/`.

### Note

```bash
pnpm dune task note DB-0007 "Implemented validate and next commands."
```

Appends a dated work-log entry.

### Link

```bash
pnpm dune task link DB-0007 --depends-on DB-0004
```

Adds dependency links to an existing task and appends a work-log entry.

### Claim

```bash
pnpm dune task claim DB-0007 --agent codex
```

Sets `assignee`, moves the task to `in_progress`, and appends a work-log entry.

### Release

```bash
pnpm dune task release DB-0007
pnpm dune task release DB-0007 --status blocked
```

Clears `assignee`, sets a release status, and appends a work-log entry.

### Done

```bash
pnpm dune task done DB-0007 --summary "CLI smoke tests pass."
```

Clears `assignee`, marks the task `done`, and appends a completion note.

### Set Status

```bash
pnpm dune task set-status DB-0007 review
```

Sets status directly. Prefer `claim`, `release`, and `done` for normal agent
workflow transitions.
