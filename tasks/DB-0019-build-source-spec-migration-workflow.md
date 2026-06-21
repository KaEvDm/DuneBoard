---
id: DB-0019
title: Build source spec migration workflow
kind: feature
status: done
priority: P1
parent: DB-0015
depends_on:
  - DB-0016
  - DB-0018
blocked_by: []
relates_to:
  - DB-0015
assignee: null
labels:
  - import
  - design
  - archive
created_at: 2026-06-21T20:02:09Z
updated_at: 2026-06-21T20:47:24Z
---

## Goal

Turn external task-related specs into self-contained DuneBoard task design
content, then archive the original source material with provenance.

## Design

The migration workflow should replace the old rule "do not delete source specs
because tasks are only summaries" with a safer rule:

1. Classify a source file as task-related, general documentation, generated
   documentation, or unknown.
2. For task-related specs, fold unique current design facts into the owning
   task's `## Design`.
3. Record provenance in the task notes or work log.
4. Move the original stale source file under `task/archive/`.
5. Leave non-task documentation systems in their project-owned location.

The workflow should be reviewable before applying moves because source specs may
contain important design detail that should not be lost.

## Acceptance Criteria

- [x] The organizer/import workflow can produce a reviewable migration plan.
- [x] The plan distinguishes task-related specs from non-task documentation.
- [x] Applied migrations preserve provenance from original path to task/archive
  path.
- [x] The workflow requires `## Design` to contain the current design facts
  before archiving the original task-related spec.
- [x] Regression coverage uses a project with active specs, stale specs,
  generated documentation, and task archives.

## Notes

This task is about making DuneBoard self-contained, not about moving every
Markdown file in a repository. The first implementation is a CLI-assisted
workflow: `pnpm dune migrate source-specs` produces the review plan, while
agents or humans apply moves only after reviewing `## Design` and provenance.

## Open Questions

- Resolved 2026-06-21: The first version is a CLI-assisted skill workflow. It
  creates reviewable plans but does not automatically move files.

## Work Log

- 2026-06-21: Created after clarifying that DuneBoard should become the full
  source of truth for active task-owned designs.
- 2026-06-21: Added `dune migrate source-specs` Markdown/JSON planning,
  organizer/import guidance, provenance requirements, and regression coverage
  for active specs, stale specs, generated docs, general docs, unknown files,
  and existing task archives. Verified with `pnpm test`, `pnpm build`,
  `pnpm dune validate`, `pnpm dune migrate source-specs`, JSON smoke output,
  and `git diff --check`.
