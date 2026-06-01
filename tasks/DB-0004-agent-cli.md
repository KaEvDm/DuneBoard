---
id: DB-0004
title: Specify agent CLI workflow
kind: task
status: done
priority: P1
parent: DB-0001
depends_on: [DB-0002, DB-0003]
blocked_by: []
relates_to: []
assignee: null
labels: [cli, agents, mvp]
created_at: 2026-05-29T00:00:00Z
updated_at: 2026-06-01T12:45:00Z
---

## Goal

Define the command set agents should use instead of editing task metadata
directly.

## Acceptance Criteria

- [x] Task creation command is specified.
- [x] Dependency linking command is specified.
- [x] Claim/release commands are specified.
- [x] Work log command is specified.
- [x] Status transition commands are specified.

## Notes

The CLI should prevent invalid states where possible.

## Open Questions

- Should agents be required to claim a task before changing it?
- Recommended workflow: agents should claim executable tasks before changing
  implementation files, then release or complete them.

## Work Log

- 2026-05-29: Created as a CLI planning task.
- 2026-06-01: Completed through `docs/cli-workflow.md`.
