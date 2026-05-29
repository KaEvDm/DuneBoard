---
id: DB-0004
title: Specify agent CLI workflow
kind: task
status: ready
priority: P1
parent: DB-0001
depends_on: [DB-0002, DB-0003]
blocked_by: []
relates_to: []
assignee: null
labels: [cli, agents, mvp]
created_at: 2026-05-29T00:00:00Z
updated_at: 2026-05-29T00:00:00Z
---

## Goal

Define the command set agents should use instead of editing task metadata
directly.

## Acceptance Criteria

- [ ] Task creation command is specified.
- [ ] Dependency linking command is specified.
- [ ] Claim/release commands are specified.
- [ ] Work log command is specified.
- [ ] Status transition commands are specified.

## Notes

The CLI should prevent invalid states where possible.

## Open Questions

- Should agents be required to claim a task before changing it?

## Work Log

- 2026-05-29: Created as a CLI planning task.

