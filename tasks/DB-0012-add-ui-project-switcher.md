---
id: DB-0012
title: Add UI project switcher
kind: task
status: done
priority: P0
parent: DB-0001
depends_on:
  - DB-0011
blocked_by: []
relates_to: []
assignee: Codex
labels:
  - web
  - ui
  - projects
  - mvp
created_at: 2026-06-01T23:30:44.278Z
updated_at: 2026-06-01T23:39:45.695Z
---

## Goal

Let users choose a DuneBoard project directly in the web UI instead of
restarting the dev server with an environment variable.

## Acceptance Criteria

- [x] Web UI loads a list of allowed local board projects from the local server.
- [x] Web UI has a project selector and reloads board data when selection changes.
- [x] Repository-local DuneBoard board is always available as the default project.
- [x] Achiever import board can be selected through local ignored config.
- [x] Public docs no longer present `DUNEBOARD_ROOT` as the normal workflow.
- [x] Build, DuneBoard validation, and browser verification pass.

## Notes

Do not commit user-specific absolute project paths. Local projects should live
in an ignored local config file.

## Open Questions

None.

## Work Log

- 2026-06-02: Created task.
- 2026-06-02: Claimed by Codex.
- 2026-06-02: Added local project API, UI project selector, ignored local
  project config, and docs for opening multiple boards without environment
  variables.
- 2026-06-02: Verified `pnpm check`, local DuneBoard validation, Achiever
  validation, and browser switching from DuneBoard to Achiever at
  `http://127.0.0.1:5175/`.
