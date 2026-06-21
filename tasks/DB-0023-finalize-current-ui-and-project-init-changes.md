---
id: DB-0023
title: Finalize current UI and project-init changes
kind: task
status: done
priority: P1
parent: DB-0001
depends_on: []
blocked_by: []
relates_to: []
assignee: null
labels:
  - ui
  - skills
  - cleanup
created_at: 2026-06-21T22:10:54.064Z
updated_at: 2026-06-21T22:15:05.106Z
---

## Goal

Stabilize and document the current untracked UI and project initialization work
so the repository has a coherent next checkpoint instead of an orphaned diff.

## Acceptance Criteria

- [x] Web UI dark theme and multi-status filter behavior build cleanly.
- [x] The DuneBoard project-init skill is documented in the skill pack and has
  agent metadata.
- [x] Local launch scripts are present and documented enough for a Windows user
  to start the preview.
- [x] Related source-of-truth documentation remains consistent with `DB-0015`.
- [x] Board validation and repository checks pass.

## Notes

Created to capture the already-started changes in the working tree before
taking unrelated feature work.

## Open Questions


## Work Log

- 2026-06-21: Created task.
- 2026-06-21: Claimed by Codex.
- 2026-06-21: Verified dark theme persistence and multi-status filtering in the
  browser against the DuneBoard project.
- 2026-06-21: Added README launcher guidance, closed DB-0015, validated the
  board, checked PowerShell syntax, and ran `pnpm check`.
- 2026-06-21: Completed. Finalized UI theme and status-filter work, project-init skill documentation, Windows launcher guidance, DB-0015 closure, browser verification, and pnpm check.
