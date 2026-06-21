---
name: duneboard-agent
description: Work with DuneBoard task files in a repository. Use when Codex needs to plan, take, create, update, block, release, or close DuneBoard work; run `pnpm dune`; or preserve DuneBoard Markdown task history.
---

# DuneBoard Agent Skill

Use this skill when a repository has DuneBoard task files and the user asks you
to plan, take, update, or close DuneBoard work.

## Contract

- Markdown task files are the source of truth.
- Prefer `pnpm dune ...` commands over manual frontmatter edits.
- Do not invent task IDs; let `pnpm dune task create` allocate them.
- Do not add dependencies unless they are real sequencing constraints.
- Treat `## Design` as canonical design content when present; update it before
  relying on archived specs.
- Keep work-log updates short, dated, and factual.

## Start

```bash
pnpm dune validate
pnpm dune next
```

Read the task-owned design directly when a task has one:

```bash
pnpm dune show DB-0007 --design
pnpm dune show DB-0007 --with-design
```

If `next` returns executable tasks, pick the highest-priority task that matches
the user's request and claim it:

```bash
pnpm dune task claim DB-0007 --agent <agent-name>
```

If `next` is empty and new work is needed, create a task with explicit parent,
priority, labels, and dependencies:

```bash
pnpm dune task create --title "Task title" --kind task --status ready --priority P1 --parent DB-0001 --depends-on DB-0007 --label area
```

## Update

Use notes for progress that should survive in Git:

```bash
pnpm dune task note DB-0007 "Implemented parser checks and ran pnpm check."
```

Use `blocked` only when no local next action remains:

```bash
pnpm dune task release DB-0007 --status blocked
```

## Close

Only close a task when acceptance criteria are satisfied and verification has
run or the remaining risk is explicitly stated:

```bash
pnpm dune task done DB-0007 --summary "Validated with pnpm check."
```

## Manual Edits

Manual edits are acceptable for body text and acceptance criteria. Preserve:

- YAML frontmatter shape
- `id`
- standard sections
- `## Design` content when it carries the canonical spec
- existing work-log history

Run validation after manual edits:

```bash
pnpm dune validate
```
