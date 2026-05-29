---
id: DB-0003
title: Design task graph engine
kind: task
status: ready
priority: P0
parent: DB-0001
depends_on: [DB-0002]
blocked_by: []
relates_to: []
assignee: null
labels: [graph, mvp]
created_at: 2026-05-29T00:00:00Z
updated_at: 2026-05-29T00:00:00Z
---

## Goal

Define how DuneBoard derives graph indexes from Markdown task files.

## Acceptance Criteria

- [ ] Parent-child indexing is specified.
- [ ] Dependency DAG indexing is specified.
- [ ] Ready queue rules are specified.
- [ ] Cycle detection is specified.

## Notes

The graph engine should be deterministic and rebuildable from disk.

## Open Questions

- Should `parent` imply dependency ordering between siblings? Current assumption:
  no.

## Work Log

- 2026-05-29: Created as the first dependency-based planning task.

