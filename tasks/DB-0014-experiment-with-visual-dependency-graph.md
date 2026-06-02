---
id: DB-0014
title: Experiment with visual dependency graph
kind: spike
status: done
priority: P2
parent: DB-0001
depends_on:
  - DB-0013
blocked_by: []
relates_to: []
assignee: Codex
labels:
  - web
  - graph
  - experiment
created_at: 2026-06-02T01:15:26.915Z
updated_at: 2026-06-02T01:42:29.768Z
---

## Goal

Try a real visual dependency graph in the web UI where dependency relationships
are drawn as arrows between work items.

## Acceptance Criteria

- [x] Graph view renders work items as positioned nodes.
- [x] `depends_on` relationships render as directional arrows from dependency
  to dependent work item.
- [x] `parent` relationships render as visually distinct parent-to-child
  arrows.
- [x] Nodes remain clickable and update the detail panel.
- [x] The experiment avoids new dependencies unless the custom approach is not
  viable.
- [x] Local build and browser verification pass.

## Notes

This is an experiment branch only. Do not push until the UX is reviewed.

Keep the first implementation simple: deterministic dependency-depth columns,
fixed node dimensions, SVG arrows, and existing task pills. If this feels too
limited, record that before reaching for a graph library.

Result:

- Custom SVG arrows are viable for a first dependency graph.
- Isolated tasks overwhelm the graph on sparse boards, so the prototype focuses
  on tasks with visible dependency links and reports how many isolated tasks are
  hidden.
- This is still an experiment; review visually before deciding whether to merge
  or replace with a graph library.
- Showing parent-child links turns sparse dependency boards into full hierarchy
  graphs. That is useful, but large boards may need a focus/filter affordance
  before this becomes default UI.
- Achiever needs hierarchy-first ordering. Dependency-depth columns make a large
  parent tree unreadable because sibling groups are mixed together.
- Achiever titles are long enough that graph cards need a larger fixed title
  area and a tooltip for the full title.
- Variable-height graph nodes are simple enough for the prototype and avoid
  making every card as tall as the longest title.

## Open Questions

None for the first prototype.

## Work Log

- 2026-06-02: Created task.
- 2026-06-02: Scoped experiment to a custom SVG dependency graph without adding
  a graph library.
- 2026-06-02: Built a fixed-node SVG dependency graph with clickable work items
  and directional arrows.
- 2026-06-02: Focused graph rendering on linked tasks when dependency edges are
  present, with isolated task counts shown separately.
- 2026-06-02: Verified `pnpm check`, local DuneBoard validation, Achiever
  validation, and browser behavior for DuneBoard and Achiever graphs.
- 2026-06-02: Reopened because a useful work-item graph also needs
  parent-child relationships, not only dependency links.
- 2026-06-02: Added dashed parent-to-child arrows, a relation legend, and graph
  counts for dependencies and parent links.
- 2026-06-02: Verified DuneBoard renders both dependency and parent links;
  Achiever renders as a large hierarchy graph with 97 tasks and 96 parent links.
- 2026-06-02: Reworked layout against Achiever data to use preorder hierarchy
  placement, keeping parents above their child groups and dependencies as an
  overlay.
- 2026-06-02: Reopened after Achiever browser testing showed graph card titles
  were vertically clipped.
- 2026-06-02: Added variable-height graph cards with up to six title lines and
  full-title tooltips; verified Achiever has zero clipped graph titles.
