---
id: DB-0011
title: Support external board root in web UI
kind: task
status: done
priority: P1
parent: DB-0001
depends_on:
  - DB-0010
blocked_by: []
relates_to: []
assignee: null
labels:
  - web
  - ui
  - import
  - mvp
created_at: 2026-06-01T23:16:27.083Z
updated_at: 2026-06-01T23:22:26.740Z
---

## Goal

Allow the web UI to render a DuneBoard board stored outside the DuneBoard
repository, starting with the imported Achiever board.

## Acceptance Criteria

- [x] Web UI can load task Markdown from `DUNEBOARD_ROOT/tasks`.
- [x] Default web UI behavior still loads the repository's own `tasks/`.
- [x] Achiever import board can be opened locally without copying files into
  the DuneBoard repository.
- [x] Documentation explains how to open a specific board root.
- [x] Build and validation pass.

## Notes

Needed after importing `C:\Users\evgen\source\repos\Achiever\DuneBoard`.
This should be a real product capability for opening different projects, not a
temporary copy/symlink workaround.

## Open Questions

None.

## Work Log

- 2026-06-02: Created task.
- 2026-06-02: Claimed by Codex.
- 2026-06-02: Confirmed that web UI currently reads only repository-local
  `tasks/*.md` through Vite `import.meta.glob`.
- 2026-06-02: Added `DUNEBOARD_ROOT` web loading, opened the Achiever import
  board in the browser, and verified 97 tasks with 0 validation issues.
- 2026-06-02: Completed. Web UI can open external DuneBoard roots via DUNEBOARD_ROOT.
