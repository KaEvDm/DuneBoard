---
id: DB-0016
title: Specify task-owned design document format
kind: decision
status: done
priority: P0
parent: DB-0015
depends_on:
  - DB-0002
blocked_by: []
relates_to:
  - DB-0015
assignee: null
labels:
  - schema
  - design
  - source-of-truth
created_at: 2026-06-21T20:02:09Z
updated_at: 2026-06-21T20:20:52Z
---

## Goal

Define the durable format for full design documents owned by DuneBoard tasks.

## Design

The decided baseline is:

- `## Goal` remains the executable summary.
- `## Acceptance Criteria` remains the completion contract.
- `## Design` becomes the canonical design document for the task when present.
- `## Notes` remains supplemental context, not the authoritative design.
- `## Open Questions` carries unresolved decisions.
- `## Work Log` records change history.

Long design content can be folded inside `## Design` with native Markdown:

```md
## Design

Short current design summary.

<details>
<summary>Full design rationale</summary>

Long design content, alternatives, diagrams, and migration notes.

</details>
```

Task bundles are explicitly deferred. Very large records may later move to a
task bundle layout, for example `tasks/DB-0016-slug/task.md` plus task-owned
attachments, but canonical design content stays in the task Markdown file until
that structure is implemented.

## Acceptance Criteria

- [x] The task schema documents `## Design` as canonical design content when
  present.
- [x] The schema explains when to use inline content, `<details>`, and any
  future task bundle structure.
- [x] The schema states whether `## Design` is optional, recommended, or
  required by task kind.
- [x] The relationship between `## Design`, `## Notes`, `## Open Questions`,
  and archived source specs is unambiguous.
- [x] At least one parser test covers `## Design` preservation.

## Notes

The durable policy is now written in `docs/schema/task-file.md`. Existing UI,
CLI, and skill work can treat `## Design` as the task-owned source of truth.

## Open Questions

- Resolved 2026-06-21: Design status is represented by task `status`; the
  `## Design` section does not have a separate review state.

## Work Log

- 2026-06-21: Created to turn the Achiever cleanup lesson into a schema-level
  decision.
- 2026-06-21: Documented the task-owned `## Design` policy in the schema, added
  parser preservation coverage, and verified with `pnpm test`, `pnpm build`, and
  `pnpm dune validate`.
