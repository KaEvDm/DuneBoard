---
name: duneboard-agent
description: Work with DuneBoard task files in a repository. Use when Codex needs to plan, take, create, update, block, release, or close DuneBoard work; run `pnpm dune`; or preserve DuneBoard Markdown task history.
---

# DuneBoard Agent Skill

Use this skill when a repository has DuneBoard task files and the user asks you
to plan, take, update, or close DuneBoard work.

## Contract

- Markdown task files are the source of truth.
- Prefer DuneBoard CLI commands over manual frontmatter edits.
- Do not invent task IDs; let `pnpm dune task create` allocate them.
- Do not add dependencies unless they are real sequencing constraints.
- Treat `## Design` as canonical design content when present; update it before
  relying on archived specs.
- Keep work-log updates short, dated, and factual.

## Start

```bash
pnpm dune preflight --compact
```

For an external project that does not define its own `pnpm dune` script, run
the stable wrapper from the DuneBoard workspace and pass the target board root:

```powershell
C:\path\to\DuneBoard\scripts\DuneBoard.ps1 --root C:\path\to\target-project preflight --compact
```

Use the pnpm workspace form only as a fallback when the wrapper is unavailable:

```bash
pnpm --dir C:\path\to\DuneBoard dune --root C:\path\to\target-project preflight --compact
```

Read compact task context first. Read the full detail or design only when the
summary is insufficient:

```bash
pnpm dune show DB-0007 --summary
pnpm dune task log DB-0007 --tail 5
pnpm dune show DB-0007 --design
```

If preflight returns executable tasks, pick the highest-priority task that
matches the user's request and claim it:

```bash
pnpm dune task claim DB-0007 --agent <agent-name>
```

If preflight returns no matching work and new tracked work is needed, create a
task with explicit parent, priority, labels, and dependencies:

```bash
pnpm dune task create --title "Task title" --kind task --status ready --priority P1 --parent DB-0001 --depends-on DB-0007 --label area
```

## Small Fix Fast Path

For a narrow user-requested fix that is expected to touch only one or two files,
does not modify DuneBoard task files, and is not already represented by an
active board task, you may skip `next`, claim, note, release, and done.

Run only the relevant local validation, then mention that the board workflow was
intentionally skipped under the small-fix rule. Return to the full DuneBoard
workflow if the work expands across modules, changes release/deploy behavior,
touches task files, or needs durable coordination history.

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
pnpm dune preflight --compact
```
