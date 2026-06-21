---
id: DB-0015
title: Make DuneBoard the canonical design source of truth
kind: epic
status: done
priority: P0
parent: DB-0001
depends_on: []
blocked_by: []
relates_to: []
assignee: null
labels:
  - design
  - schema
  - archive
  - source-of-truth
created_at: 2026-06-21T20:02:09Z
updated_at: 2026-06-21T22:14:12.826Z
---

## Goal

Make DuneBoard task records self-contained enough to be the canonical source of
truth for active work, including complete design decisions, not only executable
summaries.

## Design

DuneBoard should distinguish three kinds of project knowledge:

- Live work truth: task records under the configured task root.
- Historical task-related truth: archived under the task root's `archive/`
  subtree.
- Non-task documentation systems: left in their project-owned location when they
  are not the DuneBoard source of truth for active work.

For task-owned design, the default canonical location should be the task record
itself, using a first-class `## Design` section. Long designs may use native
Markdown `<details>` blocks inside that section, or a future task bundle format
when a single file becomes too large to review comfortably.

The old import stance, "source specs and design docs are preserved because tasks
are executable summaries", should become a transitional migration rule: preserve
source specs until their unique design facts are folded into the DuneBoard task,
then move the original task-related artifact under `<taskRoot>/archive/` with
provenance.

## Acceptance Criteria

- [x] The canonical location for active task-owned design content is specified.
- [x] The migration path from external task-related specs into `## Design` is
  documented.
- [x] Archive semantics are specified so stale task material does not appear as
  live work.
- [x] UI, CLI, and skills consistently treat DuneBoard tasks as the source of
  truth when `## Design` exists.
- [x] Non-task documentation systems remain allowed outside the task root.

## Notes

This epic comes from the Achiever.Bot.SwarmDev cleanup where task-related plans,
status logs, and specs needed to move under `task/`, while a separate generated
Wiki-LLM system had to remain outside DuneBoard ownership.

## Open Questions

- Should the long-form design extension be native `<details>` inside one task
  file, a task bundle directory, or both?
  - Resolved 2026-06-21: use native `<details>` inside the task file now; keep
    task bundles as a future option for very large records.
- Should `## Design` be required for epics/features, or only recommended until
  a task references external specs?
  - Resolved 2026-06-21: optional at the parser level; required by authoring
    policy for durable decisions and recommended when a task owns design facts.

## Work Log

- 2026-06-21: Created after project cleanup exposed the need for a stricter
  design-source-of-truth model.
- 2026-06-21: Closed remaining criteria after schema, archive scan, migration,
  UI, CLI, and skill guidance were implemented in child tasks.
- 2026-06-21: Completed. Canonical design-source workflow is documented across schema, archive semantics, migration planning, UI/CLI affordances, and agent skills.
