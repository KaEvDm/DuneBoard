---
id: DB-0025
title: Fix CI task ID archive scan
kind: bug
status: done
priority: P0
parent: DB-0001
depends_on: []
blocked_by: []
relates_to: []
assignee: null
labels:
  - ci
  - release
created_at: 2026-06-21T22:27:09.363Z
updated_at: 2026-06-21T22:28:38.422Z
---

## Goal

Fix the release CI failure where the repository hygiene duplicate-ID check
scanned archived task records even though `tasks/archive/**` is intentionally
outside the live board.

## Acceptance Criteria

- [x] CI task ID uniqueness check ignores `tasks/archive/**`.
- [x] The check still scans live task Markdown files.
- [x] Version metadata and changelog are updated for `v0.11.1`.
- [x] Board validation and repository checks pass.

## Notes

The failed `v0.11.0` check reported duplicate `DB-0015` and `DB-0016` because
historical release tasks were archived with their original frontmatter.

## Open Questions


## Work Log

- 2026-06-21: Created task.
- 2026-06-21: Claimed by Codex.
- 2026-06-21: Updated CI duplicate-ID scan to prune archive subtrees and
  prepared patch release metadata.
- 2026-06-21: Completed. Fixed CI duplicate-ID scan to ignore task archive subtrees, bumped patch metadata to v0.11.1, and verified with duplicate-ID script, pnpm dune validate, and pnpm check.
