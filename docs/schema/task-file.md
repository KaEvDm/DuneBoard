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

## Design

## Acceptance Criteria

## Notes

## Open Questions

## Work Log
```

### Section Roles

- `## Goal` is the short executable summary: what should change and why.
- `## Design` is the canonical task-owned design record when present.
- `## Acceptance Criteria` is the completion contract.
- `## Notes` is supplemental context, observations, and non-authoritative
  working notes.
- `## Open Questions` is for unresolved decisions that should not be mistaken
  for current design.
- `## Work Log` is the dated history of task changes and execution evidence.

### Design Section Policy

`## Design` is optional at the parser level for every task kind, but authoring
policy depends on the task kind:

- `decision`: required when the task is the durable decision record.
- `epic`, `feature`, `story`, `task`, and `spike`: recommended when the task
  carries implementation design, replaces a separate feature spec, or captures
  investigation results that future agents must preserve.
- `bug` and `chore`: optional unless the fix requires non-obvious design,
  migration, rollout, or rollback details.

When present, `## Design` owns the current design facts for the task. Do not
leave conflicting current design in `## Notes`, `## Open Questions`, chat logs,
or an external task-specific spec after those facts have been folded into the
task.

Use inline Markdown directly under `## Design` for short designs. Use native
Markdown disclosure blocks when the section is long but still belongs in the
task file:

```markdown
## Design

Current design summary.

<details>
<summary>Full design</summary>

Detailed design content, alternatives, diagrams, and migration notes.

</details>
```

Inside a task section, use `###` and deeper headings for structure. A new `##`
heading starts another top-level task section.

Very large records may later move to a task bundle layout, for example
`tasks/DB-0016-slug/task.md` plus task-owned attachments. Until that structure
is implemented, keep the canonical design in the task Markdown file and link to
supporting artifacts from `## Design`.

Historical source specs can stay in archive folders for provenance, but they are
not canonical after their unique current facts have been folded into `## Design`.
Non-task documentation such as architecture, product, release, or contribution
docs may remain outside task files when it is meant to describe the project
rather than one task's executable design.

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

- `available`: task kind is executable, status is `ready`, and all dependencies
  are `done`.
- `dependency_blocked`: at least one dependency is not `done`.
- `orphan`: task violates parent rules.
- `cycle_error`: dependency graph contains a cycle.
- `stale`: task has not changed for a configured interval.

Executable kinds are `story`, `task`, `bug`, `spike`, `chore`, and `decision`.
`epic` and `feature` are planning containers and do not appear in the execution
queue.
