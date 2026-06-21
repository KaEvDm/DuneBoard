---
id: DB-0001
title: Define DuneBoard MVP
kind: epic
status: done
priority: P0
parent: null
depends_on: []
blocked_by: []
relates_to: []
assignee: null
labels: [ mvp, planning ]
created_at: 2026-05-29T00:00:00Z
updated_at: 2026-06-21T22:22:51.088Z
---

## Goal

Define the smallest useful version of DuneBoard for public development.

## Acceptance Criteria

- [x] The task schema is documented.
- [x] The graph model is documented.
- [x] The first implementation tasks are decomposed.
- [x] The public GitHub workflow is documented.

## Notes

This epic is the root of the initial public project setup.

## Open Questions

- Should the first UI write files directly, or should all writes go through the
  CLI/core writer?
  - Resolved 2026-06-21: the first UI remains read-only; writes go through CLI
    and core file helpers until a dedicated write path exists.

## Work Log

- 2026-05-29: Created as the root MVP epic.
- 2026-06-21: Marked MVP criteria complete after schema, graph, CLI, UI,
  skills, project switching, graph navigation, and release workflow tasks were
  implemented and documented.
- 2026-06-21: Completed. MVP definition work is complete; schema, graph model, initial implementation tasks, GitHub workflow, UI, CLI, skills, and release workflow are documented and validated.
