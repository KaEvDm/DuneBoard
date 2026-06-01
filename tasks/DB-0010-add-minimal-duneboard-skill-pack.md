---
id: DB-0010
title: Add minimal DuneBoard skill pack
kind: task
status: done
priority: P1
parent: DB-0001
depends_on:
  - DB-0009
blocked_by: []
relates_to: []
assignee: null
labels:
  - agents
  - skills
  - ado
  - mvp
created_at: 2026-06-01T22:46:43.117Z
updated_at: 2026-06-01T22:50:58.089Z
---

## Goal

Add the smallest useful DuneBoard skill pack for real agent workflows:
validated DuneBoard task handling, Azure DevOps migration, and local project
task/spec cleanup.

## Acceptance Criteria

- [x] Existing `duneboard-agent` skill has valid Codex skill frontmatter.
- [x] A minimal Azure DevOps to DuneBoard migration skill exists.
- [x] A minimal local project task/spec cleanup skill exists.
- [x] Skill instructions stay concise and avoid generic planning advice.
- [x] Skills pass structural validation.
- [x] DuneBoard task validation and workspace checks pass.

## Notes

Skill filenames should remain `SKILL.md`; the containing folder and YAML
frontmatter define the skill identity.

## Open Questions

None.

## Work Log

- 2026-06-01: Created task.
- 2026-06-01: Claimed by Codex.
- 2026-06-01: Compared existing DuneBoard skill with Achiever ADO override
  skill format.
- 2026-06-01: Added `duneboard-import-ado` and
  `duneboard-organize-local-project` skills, fixed `duneboard-agent`
  metadata, and validated all skill folders.
- 2026-06-01: Completed. Added and validated minimal DuneBoard skill pack.
