---
id: DB-0017
title: Implement design document affordances
kind: feature
status: done
priority: P1
parent: DB-0015
depends_on:
  - DB-0016
blocked_by: []
relates_to:
  - DB-0015
assignee: null
labels:
  - web
  - cli
  - design
created_at: 2026-06-21T20:02:09Z
updated_at: 2026-06-21T20:29:53Z
---

## Goal

Make long task-owned design content usable in DuneBoard without hiding it from
search, review, or agent workflows.

## Acceptance Criteria

- [x] The web detail view renders `## Design` as a first-class section.
- [x] Long design content can be collapsed without removing it from search.
- [x] The task list and board views remain compact even when selected tasks have
  long design sections.
- [x] CLI workflows can show or extract design content for a single task.
- [x] Agent skill guidance treats `## Design` as canonical and preserves it
  during task edits.
- [x] Browser verification covers a task with a long design section.

## Notes

The web detail panel renders `## Design` as a collapsible section, search
includes design text, and list/board cards stay compact. CLI detail output stays
compact by default and has explicit design flags.

## Open Questions

- Resolved 2026-06-21: `dune show` omits design by default. Use
  `--with-design` to include it in detail output and `--design` to extract only
  the raw `## Design` section.

## Work Log

- 2026-06-21: Created after deciding that design content must be part of the
  DuneBoard task experience, not an external source spec.
- 2026-06-21: Added CLI design flags, documented them, fixed fenced-heading
  section parsing, updated agent guidance, and verified DB-0016 in the browser
  with search, collapse/expand, and board compactness checks.
