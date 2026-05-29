# Task File Schema

This is the draft DuneBoard task format.

## File Name

```text
DB-0001-short-slug.md
```

The file name starts with the task ID and ends with a lowercase slug.

## Frontmatter

```yaml
---
id: DB-0001
title: Build DuneBoard MVP
kind: epic
status: ready
priority: P1
parent: null
depends_on: []
blocked_by: []
relates_to: []
assignee: null
labels: [mvp]
created_at: 2026-05-29T00:00:00Z
updated_at: 2026-05-29T00:00:00Z
---
```

## Required Fields

- `id`
- `title`
- `kind`
- `status`
- `priority`
- `parent`
- `depends_on`
- `labels`

## Optional Fields

- `blocked_by`
- `relates_to`
- `assignee`
- `created_at`
- `updated_at`

## Body Sections

Tasks should use these sections in this order:

```markdown
## Goal

## Acceptance Criteria

## Notes

## Open Questions

## Work Log
```

## Status Semantics

- `draft`: not ready for execution.
- `ready`: can be executed once dependencies are done.
- `in_progress`: claimed and being worked on.
- `blocked`: cannot proceed until a blocker is resolved.
- `review`: implementation is done and needs review.
- `done`: accepted and closed.
- `canceled`: intentionally abandoned.

## Derived States

These are computed, not stored:

- `available`: status is `ready` and all dependencies are `done`.
- `dependency_blocked`: at least one dependency is not `done`.
- `orphan`: task violates parent rules.
- `cycle_error`: dependency graph contains a cycle.
- `stale`: task has not changed for a configured interval.

