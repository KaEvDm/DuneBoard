---
id: DB-0007
title: Build first agent CLI workflow
kind: task
status: done
priority: P0
parent: DB-0001
depends_on:
  - DB-0004
blocked_by: []
relates_to: []
assignee: null
labels:
  - cli
  - agents
  - mvp
created_at: 2026-06-01T12:43:30.273Z
updated_at: 2026-06-01T12:45:57.631Z
---

## Goal

Create the first CLI workflow that agents can use to inspect, validate, create,
claim, update, and complete DuneBoard tasks without hand-editing frontmatter.

## Acceptance Criteria

- [x] CLI can validate the current board.
- [x] CLI can print available next tasks.
- [x] CLI can list and show tasks.
- [x] CLI can create tasks.
- [x] CLI can append work-log notes.
- [x] CLI can link dependencies.
- [x] CLI can claim, release, and complete tasks.
- [x] CLI smoke tests pass locally.

## Notes

This is the first writable command path. The UI remains read-only.

## Open Questions

- Should the package expose a real installed binary in v0.4, or is `pnpm dune`
  enough until the CLI stabilizes?

## Work Log

- 2026-06-01: Created task.
- 2026-06-01: Added `@duneboard/cli` with read and write workflow commands.
- 2026-06-01: Completed. CLI smoke tests passed for validate, next, list, show, create, link, claim, note, release, and done.
