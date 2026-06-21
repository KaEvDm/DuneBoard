---
id: DB-0021
title: Render graph container groups
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
  - hierarchy
created_at: 2026-06-21T20:07:09Z
updated_at: 2026-06-21T21:24:47Z
---

## Goal

Render parent/container tasks in the graph as enclosing rectangles with their
owned child tasks inside, instead of showing every container as a normal root
node.

## Design

The first pass should treat container tasks as tasks with children, with a likely
special emphasis on `epic` and `feature` kinds. A container group needs:

- a stable rectangle with responsive padding;
- a header showing ID, title, kind, and status;
- a subtle color keyed by status or kind;
- child node placement inside the group bounds;
- edge routing that remains readable for dependencies crossing group borders.

Container groups should preserve task selection: clicking the group header
selects the container task, clicking a child card selects that child.

## Acceptance Criteria

- [x] Parent/container tasks are rendered as group rectangles in graph view.
- [x] Direct child tasks are placed within the parent rectangle.
- [x] Nested child tasks have a defined first-version behavior.
- [x] Container header is clickable and selects the container task.
- [x] Dependency and parent relationships remain legible.
- [x] No task title clipping regressions are introduced.
- [x] Visual QA covers at least one board with nested hierarchy.

## Notes

DB-0014 already proved that parent-child graph edges are useful, but large
hierarchies still read like loose root nodes. This task changes the visual
metaphor from "all nodes connected by arrows" to "work grouped by ownership".

## Open Questions

- Collapse controls stay out of this first version; container headers show direct
  child counts and nested groups render expanded.

## Work Log

- 2026-06-21: Created from graph UX feedback.
- 2026-06-21: Added container group rectangles for parent tasks, expanded nested
  group rendering, clickable group headers, and browser QA on the DuneBoard
  nested hierarchy.
