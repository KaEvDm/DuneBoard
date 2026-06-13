---
id: DB-0015
title: Prepare v0.9.0 release
kind: chore
status: done
priority: P1
parent: DB-0001
depends_on:
  - DB-0014
blocked_by: []
relates_to: []
assignee: Codex
labels:
  - release
  - github
created_at: 2026-06-13T16:36:03.705Z
updated_at: 2026-06-13T16:36:03.705Z
---

## Goal

Publish the visual graph work as `v0.9.0`.

## Acceptance Criteria

- [x] UI cleanup and visual graph changes are merged to `main`.
- [x] Version metadata is bumped to `0.9.0`.
- [x] Changelog documents the new visual graph and UI cleanup changes.
- [x] README status reflects the current release.
- [x] Release PR passes CI before tagging.

## Notes

Keep release changes limited to version metadata, release notes, and this task.
Do not commit local project registry files or personal absolute paths.

## Open Questions

None.

## Work Log

- 2026-06-13: Created release task after merging the UI cleanup and visual graph
  PRs.
