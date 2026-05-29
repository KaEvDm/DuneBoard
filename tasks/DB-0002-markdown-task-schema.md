---
id: DB-0002
title: Define Markdown task schema
kind: task
status: ready
priority: P0
parent: DB-0001
depends_on: []
blocked_by: []
relates_to: []
assignee: null
labels: [schema, mvp]
created_at: 2026-05-29T00:00:00Z
updated_at: 2026-05-29T00:00:00Z
---

## Goal

Create a minimal task file format that agents and humans can edit safely.

## Acceptance Criteria

- [ ] Frontmatter fields are documented.
- [ ] Body sections are documented.
- [ ] Status semantics are documented.
- [ ] Derived states are documented.

## Notes

The schema should stay small enough to write by hand.

## Open Questions

- Should `blocked_by` allow free text external blockers, or only task IDs?

## Work Log

- 2026-05-29: Created as a schema planning task.

