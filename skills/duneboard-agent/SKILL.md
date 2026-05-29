# DuneBoard Agent Skill

Use this skill when working inside a repository that uses DuneBoard task files.

## Source of Truth

Task state lives in Markdown files. Preserve frontmatter fields and standard
sections. Prefer DuneBoard CLI commands once they exist.

## Before Taking Work

1. Run or inspect the board validator when available.
2. Find tasks that are `ready` and have all dependencies `done`.
3. Prefer the highest-priority available task.
4. Claim the task before editing implementation files.

## Updating a Task

Keep updates small and factual:

- Append progress to `## Work Log`.
- Add unresolved decisions to `## Open Questions`.
- Mark acceptance criteria only when verified.
- Move to `blocked` when the next action requires external input.
- Move to `review` when implementation is complete but not accepted.
- Move to `done` only after acceptance criteria are satisfied.

## Decomposing Features

When turning a feature request into tasks:

1. Create one `feature` or `story` parent task.
2. Create child tasks for independent implementation units.
3. Use `depends_on` only for real sequencing constraints.
4. Avoid dependencies between tasks that can be done in parallel.
5. Add acceptance criteria to every executable task.
6. Add open questions instead of guessing product decisions.

## Work Log Format

Use dated entries:

```markdown
- 2026-05-29: Claimed task. Parsed current schema docs and identified missing
  validation rules.
```

## Completion Standard

A task is complete when:

- acceptance criteria are checked
- relevant tests or verification notes exist
- no new unresolved blocker was introduced
- the task file includes a short completion note

