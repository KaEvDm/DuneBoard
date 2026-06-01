---
id: DB-0008
title: Improve read-only UI utility
kind: task
status: done
priority: P1
parent: DB-0001
depends_on:
  - DB-0006
blocked_by: []
relates_to: []
assignee: null
labels:
  - ui
  - mvp
created_at: 2026-06-01T13:51:57.257Z
updated_at: 2026-06-01T14:02:00Z
---

## Goal

Make the read-only UI more useful for quickly understanding a DuneBoard without
adding editing, accounts, databases, or extra workflow concepts.

## Acceptance Criteria

- [x] UI supports lightweight filters for status, kind, label, and execution state.
- [x] Task rows and cards expose derived execution state.
- [x] Task detail shows file path, assignee, acceptance progress, and execution state.
- [x] Task relationships in the detail panel are clickable when they point to known tasks.
- [x] Local build and browser verification pass.

## Notes

Keep the UI read-only. Write operations remain Markdown/CLI-first.

## Open Questions

- Should the next UI step be a small command-preview drawer, or should CLI remain
  outside the UI until v0.5?

## Work Log

- 2026-06-01: Created task.
- 2026-06-01: Added filtering, execution state pills, richer task details, and
  relationship navigation.
- 2026-06-01: Verified `pnpm check`, desktop filters, relationship navigation,
  and mobile layout.
