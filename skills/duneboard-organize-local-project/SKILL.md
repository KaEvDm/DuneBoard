---
name: duneboard-organize-local-project
description: Organize an existing local project into DuneBoard tasks and specs. Use when the user asks to clean up local todo notes, scattered Markdown specs, issue notes, backlog files, roadmap docs, or agent-written plans into a simple DuneBoard board without unnecessary process.
---

# DuneBoard Local Organizer

Turn scattered local project intent into a small, useful DuneBoard board.

If the target repository does not already have `.duneboard/config.yml`,
a configured task root, and project-local DuneBoard agent guidance, run the
`duneboard-init-project` workflow first.

## Scan

Read only likely planning sources first:

```bash
rg --files -g "*.md" -g "todo*" -g "Todo*" -g "ROADMAP*" -g "CHANGELOG*" -g "docs/**"
rg -in "todo|fixme|bug|blocked|next|acceptance|open question|roadmap|spec"
```

Prefer existing project docs over inferred plans.

## Normalize

- Preserve source planning files. Treat local docs, TODO files, status logs, and
  backlog notes as source material; do not delete, move, or rewrite them while
  creating DuneBoard tasks unless the user explicitly asks for cleanup.
- Add source paths in task notes or work logs so each imported task can be traced
  back to the original file.
- When the user explicitly wants DuneBoard to be the only source of truth, fold
  unique design facts into the task's `## Design` section before archiving the
  old spec.
- Keep general project documentation under `docs/` when the repository does not
  already define a different documentation system. Do not move generated or
  tool-owned documentation roots such as a project-owned `wiki/` unless the user
  explicitly asks for that migration and the related hooks/skills are updated.
  Keep live DB task files in the configured task root, and historical
  task/spec/status material under that root's `archive/` subtree so it is not
  parsed as live work.
- Create one parent `epic` or `feature` only when it clarifies several child
  tasks.
- Use executable kinds for actual work: `story`, `task`, `bug`, `spike`,
  `chore`, or `decision`.
- Use `depends_on` only for real sequencing constraints.
- Put uncertainty in `## Open Questions` instead of guessing.
- Merge duplicates instead of creating parallel tasks for the same work.

## Source Spec Migration

When the user wants DuneBoard to become the active source of truth, produce a
reviewable migration plan before moving source files:

```bash
pnpm dune migrate source-specs > .duneboard/source-spec-migration-plan.md
pnpm dune migrate source-specs --json
```

Review each plan item before applying it:

- `task_related_spec`: fold unique current facts into the owning task's
  `## Design`, add the provenance note to `## Notes` or `## Work Log`, then move
  the source file to the proposed `<taskRoot>/archive/...` path.
- `non_task_documentation`: leave it in place unless the user explicitly wants a
  documentation reorganization.
- `generated_documentation`: leave it with the generator or generated-docs
  workflow.
- `task_archive`: leave it in the archive unless the user asks to restore or
  inspect archived material.
- `unknown`: inspect manually; do not move it by default.

Never archive a task-related spec until the owning task's `## Design` contains
the current design facts that future agents need.

## Create Or Update

Use the CLI when possible:

```bash
pnpm dune validate
pnpm dune task create --title "Title" --kind task --status ready --priority P1 --parent DB-0001 --label cleanup
pnpm dune task note DB-0012 "Linked to docs/spec.md."
pnpm dune validate
```

Manual Markdown edits are acceptable for acceptance criteria and notes after
the task exists.

## Stop Condition

Stop when the board has:

- clear next executable tasks
- no fake dependencies
- unresolved questions captured
- source planning files preserved or explicitly accounted for
- agent guidance installed for future agents via `duneboard-init-project`
- validation passing
