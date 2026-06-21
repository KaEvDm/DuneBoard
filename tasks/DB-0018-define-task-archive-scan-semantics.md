---
id: DB-0018
title: Define task archive and scan semantics
kind: task
status: done
priority: P1
parent: DB-0015
depends_on:
  - DB-0003
blocked_by: []
relates_to:
  - DB-0015
assignee: null
labels:
  - archive
  - core
  - cli
created_at: 2026-06-21T20:02:09Z
updated_at: 2026-06-21T20:40:27Z
---

## Goal

Specify and implement how DuneBoard distinguishes live task records from
historical task-related material under `archive/`.

## Design

Within each configured task root:

- root-level task files are live work records;
- task bundle directories, if adopted, are live work records;
- `archive/**` is historical task-related material and is not part of the live
  queue;
- archived files may keep frontmatter and IDs without affecting `next`,
  validation, readiness, or graph calculations unless an explicit archive command
  opts into reading them.

This lets projects keep absolutely all task-related material under `task/`
without stale specs, status logs, or completed plans polluting active work.

## Acceptance Criteria

- [x] The architecture docs define live task roots and archive subtrees.
- [x] Core loading excludes `<taskRoot>/archive/**` from the live board.
- [x] Validation explains archive exclusions clearly.
- [x] Archived task/spec/status files can remain in the repository without
  creating duplicate live IDs.
- [x] A fixture covers `task/archive/**` containing Markdown files with and
  without task frontmatter.

## Notes

This is separate from general documentation. It is about task-related material:
plans, source specs, status logs, completed task files, and import reports.

## Open Questions

- Resolved 2026-06-21: The scan contract is enough for now. A dedicated archive
  command should be a later task if users need move/restore/report workflows.

## Work Log

- 2026-06-21: Created after the Achiever cleanup required `task/archive/` to be
  the safe place for stale task-related material.
- 2026-06-21: Implemented recursive live task loading with immediate
  `<taskRoot>/archive/**` exclusion in CLI and web loaders, documented validate
  output, added CLI fixture coverage for archived duplicate/frontmatter-free
  Markdown, and verified with `pnpm test`, `pnpm build`, `pnpm dune validate`,
  and `git diff --check`.
