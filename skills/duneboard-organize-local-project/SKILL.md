---
name: duneboard-organize-local-project
description: Organize an existing local project into DuneBoard tasks and specs. Use when the user asks to clean up local todo notes, scattered Markdown specs, issue notes, backlog files, roadmap docs, or agent-written plans into a simple DuneBoard board without unnecessary process.
---

# DuneBoard Local Organizer

Turn scattered local project intent into a small, useful DuneBoard board.

## Scan

Read only likely planning sources first:

```bash
rg --files -g "*.md" -g "todo*" -g "Todo*" -g "ROADMAP*" -g "CHANGELOG*" -g "docs/**"
rg -in "todo|fixme|bug|blocked|next|acceptance|open question|roadmap|spec"
```

Prefer existing project docs over inferred plans.

## Normalize

- Keep real specs as docs; create tasks that point to them.
- Create one parent `epic` or `feature` only when it clarifies several child
  tasks.
- Use executable kinds for actual work: `story`, `task`, `bug`, `spike`,
  `chore`, or `decision`.
- Use `depends_on` only for real sequencing constraints.
- Put uncertainty in `## Open Questions` instead of guessing.
- Merge duplicates instead of creating parallel tasks for the same work.

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
- validation passing
