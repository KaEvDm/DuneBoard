---
id: DB-0024
title: Prepare v0.11.0 release
kind: chore
status: done
priority: P1
parent: DB-0001
depends_on:
  - DB-0023
blocked_by: []
relates_to: []
assignee: null
labels:
  - release
  - github
created_at: 2026-06-21T22:21:20.263Z
updated_at: 2026-06-21T22:22:46.442Z
---

## Goal

Publish the workflow consolidation work as `v0.11.0`.

## Acceptance Criteria

- [x] Branch is reconciled with `origin/main` / `v0.10.0`.
- [x] Version metadata is bumped to `0.11.0`.
- [x] Changelog documents the source-of-truth, archive, graph, filter, launcher,
  and project-init changes.
- [x] Historical release tasks from `main` are archived so live task IDs remain
  unique.
- [x] Root MVP epic is closed after all live child work is done.
- [x] Board validation and repository checks pass.
- [x] Release commit is ready to tag and push.

## Notes

This release follows published `v0.10.0`; do not reuse earlier release tags.

## Open Questions


## Work Log

- 2026-06-21: Created task.
- 2026-06-21: Claimed by Codex.
- 2026-06-21: Merged `origin/main`, archived historical v0.9.0/v0.10.0 release
  tasks, bumped package metadata to `0.11.0`, updated release notes, and ran
  `pnpm dune validate` plus `pnpm check`.
- 2026-06-21: Completed. Prepared v0.11.0 release metadata, archived historical release tasks, reconciled with v0.10.0, and verified with pnpm dune validate plus pnpm check.
