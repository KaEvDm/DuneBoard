---
id: DB-0022
title: Add mouse drag panning to graph
kind: task
status: done
priority: P1
parent: DB-0020
depends_on:
  - DB-0014
blocked_by: []
relates_to:
  - DB-0020
assignee: null
labels:
  - web
  - graph
  - navigation
created_at: 2026-06-21T20:07:09Z
updated_at: 2026-06-21T21:15:26Z
---

## Goal

Improve graph navigation by allowing users to pan the graph with mouse dragging,
instead of relying only on vertical and horizontal scrollbars.

## Design

The graph surface should behave like a pannable canvas:

- dragging empty graph space moves the viewport;
- task card clicks still select tasks and do not accidentally pan;
- the cursor communicates grab/grabbing state;
- scrollbars remain available as a fallback;
- keyboard and pointer accessibility are not regressed.

The first version does not need zoom, but the pan state should be represented in
a way that would not block future zoom controls.

## Acceptance Criteria

- [x] Dragging empty graph space pans the graph horizontally and vertically.
- [x] Clicking or dragging on task cards does not break task selection.
- [x] Scrollbar navigation still works.
- [x] Cursor state communicates pannable/grabbing behavior.
- [x] Pan behavior works with large graphs wider and taller than the viewport.
- [x] Browser verification covers mouse panning and task selection after pan.

## Notes

This should make large hierarchy graphs practical before adding more advanced
features such as minimaps, zoom, or collapsed containers.

## Open Questions

- Empty-space drag is enough for the first version; task cards are excluded from
  pan start so clicks remain selection-focused.

## Work Log

- 2026-06-21: Created from graph navigation feedback.
- 2026-06-21: Added a scroll-backed graph pan area with mouse drag panning,
  grab/grabbing cursor state, preserved task-card selection, and verified in
  browser on a graph larger than the viewport.
