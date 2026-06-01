---
id: DB-0005
title: Specify minimal human UI
kind: task
status: done
priority: P1
parent: DB-0001
depends_on: [DB-0002, DB-0003]
blocked_by: []
relates_to: []
assignee: null
labels: [ui, mvp]
created_at: 2026-05-29T00:00:00Z
updated_at: 2026-06-01T12:45:00Z
---

## Goal

Define the first UI views for reading and navigating a DuneBoard workspace.

## Acceptance Criteria

- [x] List view is specified.
- [x] Kanban view is specified as a derived status view.
- [x] Graph view is specified.
- [x] Task detail panel is specified.
- [x] Validation panel is specified.

## Notes

The first UI can be read-only if that helps ship faster.

## Open Questions

- Should edit support be in v0.4, or should users edit Markdown and refresh?
- Current assumption: write operations should go through CLI first; UI editing can
  come later after command semantics are stable.

## Work Log

- 2026-05-29: Created as a UI planning task.
- 2026-06-01: Completed through the read-only Vite UI in `@duneboard/web`.
