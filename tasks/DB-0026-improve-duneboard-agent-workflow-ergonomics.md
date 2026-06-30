---
id: DB-0026
title: Improve DuneBoard agent workflow ergonomics
kind: chore
status: done
priority: P0
parent: DB-0001
depends_on: []
blocked_by: []
relates_to: []
assignee: null
labels:
  - cli
  - agents
  - release
created_at: 2026-06-30T02:00:38.000Z
updated_at: 2026-06-30T02:10:52.272Z
---

## Goal

Reduce DuneBoard overhead observed in real Codex usage by adding compact CLI
views, a stable Windows CLI wrapper, reproducible pnpm build approval config,
and documented fast-path guidance for small direct fixes.

## Acceptance Criteria

- [x] CLI supports compact preflight, bounded ready queues, compact task
  summaries, and work-log tail reads.
- [x] Stable Windows wrapper bypasses pnpm bootstrap when the direct `tsx`
  entrypoint is available.
- [x] Agent skills and CLI documentation prefer compact/stable workflows and
  document the Small Fix Fast Path.
- [x] Work Log compaction and release workflow guidance are documented.
- [x] Version metadata and changelog are updated for `v0.12.0`.
- [x] Board validation and repository checks pass.

## Notes


## Open Questions


## Work Log

- 2026-06-30: Created task.
- 2026-06-30: Claimed by codex.
- 2026-06-30: Added compact CLI commands, Windows wrapper scripts, tests, and
  workflow documentation updates for the retrospective findings.
- 2026-06-30: Verified with `pnpm check`,
  `scripts\DuneBoard.ps1 preflight --compact --limit 5`, and
  `pnpm dune preflight --compact --limit 5`.
- 2026-06-30: Completed. Improved compact CLI workflows, stable wrapper launch, agent guidance, release docs, and verified with pnpm check plus preflight smoke tests.
