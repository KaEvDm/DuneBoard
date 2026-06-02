---
id: DB-0013
title: Clean up UI status and relationship affordances
kind: task
status: done
priority: P1
parent: DB-0001
depends_on:
  - DB-0012
blocked_by: []
relates_to: []
assignee: Codex
labels:
  - web
  - ui
  - cleanup
created_at: 2026-06-02T00:00:45.827Z
updated_at: 2026-06-02T01:05:34.229Z
---

## Goal

Make the read-only web UI easier to scan without changing the Markdown task
model or adding editing workflows.

## Acceptance Criteria

- [x] Done raw status and closed execution state are visually and textually less
  confusing.
- [x] Task kind affordances cover epic, feature, story, task, bug, spike, chore,
  and decision without adding visual noise.
- [x] Relationship sections make parent/child, dependency, dependent, and related
  links clear.
- [x] Graph view no longer exposes unexplained L0/L1/L2 labels.
- [x] Detail panel remains immediately useful when selecting tasks from long
  lists.
- [x] Local DuneBoard and Achiever board validation pass.
- [x] Browser verification covers project switching from DuneBoard to Achiever.

## Notes

Audit summary:

- `done` and `canceled` are raw statuses, while `closed` is a derived execution
  state. Showing both as equal pills makes completed tasks look like two
  statuses.
- The detail panel already computes parent, children, dependencies, and
  dependents, but does not show `relates_to`.
- Graph view groups by dependency depth, but labels the columns as L0/L1/L2,
  which is implementation language rather than user-facing language.
- The right detail panel scroll position is independent and can remain scrolled
  down after another task is selected.

Keep the first pass small: UI wording, badges, relation display, and scroll
behavior only. Do not change parser schema or introduce graph libraries.

UX decision:

- `status` is the canonical stored workflow state and should be visible as the
  main state.
- Derived queue/readiness state should not be shown as a second status.
- Show readiness only when it adds information that agents and humans cannot
  get from status alone: executable `ready` work that is available, executable
  `ready` work waiting on dependencies, or non-executable planning containers.
- Do not show readiness pills for `done`, `canceled`, `in_progress`, `blocked`,
  or `review`, because those labels duplicate the stored status.
- Priority is stored history for closed tasks, but the UI should not give
  `done` or `canceled` work active priority weight.

## Open Questions

None for the first pass. Larger graph redesign should wait until there is a
clearer product shape.

## Work Log

- 2026-06-02: Created task.
- 2026-06-02: Audited current UI code and scoped the first cleanup pass.
- 2026-06-02: Added queue-state wording, kind badges, clearer relationship
  links, dependency-depth graph labels, and fixed desktop scroll behavior.
- 2026-06-02: Verified `pnpm check`, local DuneBoard validation, Achiever
  validation, and browser switching from DuneBoard to Achiever.
- 2026-06-02: Reopened to simplify the derived state UX so it only appears when
  it adds readiness information.
- 2026-06-02: Replaced always-visible queue state with optional readiness pills
  for available work, dependency-waiting work, and planning containers only.
- 2026-06-02: Reopened to hide priority affordances for closed tasks while
  keeping priority in Markdown files.
- 2026-06-02: Hid priority pills for `done` and `canceled` tasks in the web UI.
