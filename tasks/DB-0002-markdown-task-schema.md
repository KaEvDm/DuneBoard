---
id: DB-0002
title: Define Markdown task schema
kind: task
status: done
priority: P0
parent: DB-0001
depends_on: []
blocked_by: []
relates_to: []
assignee: null
labels: [schema, mvp]
created_at: 2026-05-29T00:00:00Z
updated_at: 2026-06-01T12:45:00Z
---

## Goal

Create a minimal task file format that agents and humans can edit safely.

## Acceptance Criteria

- [x] Frontmatter fields are documented.
- [x] Body sections are documented.
- [x] Status semantics are documented.
- [x] Derived states are documented.

## Notes

The schema should stay small enough to write by hand.

## Open Questions

- Should `blocked_by` allow free text external blockers, or only task IDs?
- Current v0.2 behavior allows strings, so task IDs and external blocker text can
  both be represented.

## Work Log

- 2026-05-29: Created as a schema planning task.
- 2026-06-01: Completed through `docs/schema/task-file.md` and the
  `@duneboard/core` frontmatter schema.
