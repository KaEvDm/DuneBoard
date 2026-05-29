---
id: DB-0006
title: Build first runnable preview
kind: task
status: review
priority: P0
parent: DB-0001
depends_on: [DB-0002, DB-0003, DB-0005]
blocked_by: []
relates_to: []
assignee: null
labels: [core, ui, mvp]
created_at: 2026-05-29T00:00:00Z
updated_at: 2026-05-29T00:00:00Z
---

## Goal

Create the first local preview that turns DuneBoard Markdown tasks into a human
readable UI.

## Acceptance Criteria

- [x] The repository has a TypeScript workspace.
- [x] The core package parses Markdown task files.
- [x] The core package builds a board index with ready and blocked queues.
- [x] The web app renders list, board, graph, detail, and validation views.
- [x] Local build and browser verification pass.

## Notes

This task represents the first runnable implementation slice after the public
project-definition release.

## Open Questions

- Should the first editable workflow go through CLI commands only, or should the
  UI also write Markdown files in v0.3?

## Work Log

- 2026-05-29: Added core parser/indexer and read-only Vite UI on
  `feat/runnable-preview`.
- 2026-05-29: Verified `pnpm check` and browser layout checks for desktop and
  mobile widths.
