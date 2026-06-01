---
id: DB-0009
title: Define minimal agent skill protocol
kind: task
status: done
priority: P1
parent: DB-0001
depends_on:
  - DB-0007
blocked_by: []
relates_to: []
assignee: null
labels:
  - agents
  - skills
  - mvp
created_at: 2026-06-01T22:37:03.039Z
updated_at: 2026-06-01T22:40:00Z
---

## Goal

Define the smallest useful DuneBoard agent skill protocol so agents use the
board consistently without being overloaded with generic instructions.

## Acceptance Criteria

- [x] Skill focuses on DuneBoard-specific operations, not generic reasoning.
- [x] Skill documents validate, next, claim, create, note, release, and done flow.
- [x] Skill warns against invented task IDs and fake dependencies.
- [x] Skill keeps manual edit rules short and explicit.
- [x] Skill design rationale is documented.

## Notes

One compact skill is enough for now. Add role-specific skills only after usage
shows repeated failure modes.

## Open Questions

- Should future planning/review skills exist as separate files, or remain
  sections in the single agent skill until the protocol stabilizes?

## Work Log

- 2026-06-01: Created task.
- 2026-06-01: Rewrote `skills/duneboard-agent/SKILL.md` as a compact
  operational protocol and added `docs/agent-skill-design.md`.
