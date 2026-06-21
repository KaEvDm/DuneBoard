---
id: DB-0020
title: Improve graph containment and navigation
kind: feature
status: done
priority: P1
parent: DB-0001
depends_on:
  - DB-0014
blocked_by: []
relates_to: []
assignee: null
labels:
  - web
  - graph
  - navigation
  - hierarchy
created_at: 2026-06-21T20:07:09Z
updated_at: 2026-06-21T21:36:25Z
---

## Goal

Make the graph view represent container tasks as visual groups and make large
graphs easier to navigate with mouse-driven panning.

## Design

Container tasks should not look like ordinary root nodes when they primarily
exist to own child work. In graph view, a task with children should be able to
render as a tinted rectangular group that contains its direct and nested child
tasks. The container title, status, and task ID remain visible in the group
header, while the child cards are laid out inside the rectangle.

The graph viewport should also support drag-to-pan with the mouse so users can
move around a large hierarchy without relying only on vertical and horizontal
scrollbars.

## Acceptance Criteria

- [x] Container tasks can render as group rectangles instead of standalone root
  cards.
- [x] Child tasks are visually contained inside the owning container.
- [x] Container color, border, and header make ownership scannable without
  overwhelming task cards.
- [x] Dependency arrows still work across and within containers.
- [x] Mouse drag panning works for large graphs.
- [x] Existing scrollbar navigation remains available.
- [x] Browser verification covers DuneBoard and a larger external board.

## Notes

This is a UX container for the graph improvements requested after seeing how
large task hierarchies read in Achiever.Bot.SwarmDev.

## Open Questions

- First version renders all tasks with visible children as containers, regardless
  of kind.
- Nested containers are allowed and render expanded.

## Work Log

- 2026-06-21: Created to group container rendering and drag-pan graph work.
- 2026-06-21: Completed via DB-0021 and DB-0022. Browser QA covered DuneBoard
  and Achiever.Bot.SwarmDev, including nested groups, group header selection,
  drag panning, and native scroll fallback.
