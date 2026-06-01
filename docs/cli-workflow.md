# CLI Workflow

DuneBoard CLI commands are the preferred write path for agents. Humans can still
edit Markdown directly, but agents should use commands where possible so task
state stays valid and consistent.

## Run

```bash
pnpm dune --help
pnpm dune validate
pnpm dune next
```

## Read Commands

### Validate

```bash
pnpm dune validate
pnpm dune validate --json
```

Validates task files and graph links.

### Next

```bash
pnpm dune next
pnpm dune next --json
```

Prints tasks that are `ready` and whose dependencies are all `done`.
Planning containers such as `epic` and `feature` are excluded from this
execution queue.

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
pnpm dune show DB-0004 --json
```

Shows task details, acceptance criteria, open questions, and work log.

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
