# Agent Skill Design

DuneBoard skills should stay small. Modern models usually know how to plan,
write code, and summarize work; the skill should not repeat generic reasoning
advice.

## Purpose

The skill exists to prevent DuneBoard-specific mistakes:

- bypassing the CLI when a safe command exists
- inventing task IDs
- adding fake dependencies
- closing tasks without acceptance and verification notes
- losing task history while editing Markdown

## Non-goals

- Teaching general project management.
- Teaching general software engineering.
- Encoding a full Scrum, Agile, or Kanban method.
- Splitting into many role skills before real usage proves a need.
- Embedding agent-runtime behavior into the task tracker.

## Source File Shape

`SKILL.md` is the required skill entrypoint. Inside the DuneBoard repository,
the source skill pack lives under `skills/`:

```text
skills/duneboard-agent/SKILL.md
```

When DuneBoard is installed into another project, copy the project-local
operational skill to agent-discoverable locations instead:

```text
.codex/skills/duneboard-agent/SKILL.md
.claude/skills/duneboard-agent/SKILL.md
```

Do not install target-project skills into a plain root-level `skills/`
directory; agents may not discover that path automatically.

## Current Shape

Keep a compact core skill:

```text
skills/duneboard-agent/SKILL.md
```

It covers the operational loop:

1. run compact preflight for tracked work
2. find matching ready work
3. claim or create a task when durable coordination is needed
4. append short notes for progress that should survive in Git
5. release, block, or complete
6. validate again after task-file edits

It also documents a Small Fix Fast Path: for narrow direct user fixes that do
not touch task files or active board work, agents can skip claim/note/release
and run only the relevant local validation. This keeps the smallest useful
workflow from becoming ceremony while preserving the full board protocol for
tracked work.

Add workflow skills only when they prevent repeated DuneBoard-specific mistakes:

```text
skills/duneboard-init-project/SKILL.md
skills/duneboard-import-ado/SKILL.md
skills/duneboard-organize-local-project/SKILL.md
```

These skills should stay narrow. Project-specific overrides, such as concrete
ADO account names or area paths, belong in the target project, not in DuneBoard.

## When to Add More Skills

Add a separate skill only when the current one becomes too broad or when usage
shows a repeated failure mode. Candidate future skills:

- `duneboard-planning` if feature decomposition needs a stricter protocol
- `duneboard-review` if board consistency review grows beyond validation

Until then, keep the skill pack at these four skills.
