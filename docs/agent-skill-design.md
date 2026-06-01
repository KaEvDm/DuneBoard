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

## Current Shape

One compact skill:

```text
skills/duneboard-agent/SKILL.md
```

It covers the operational loop:

1. validate
2. find next work
3. claim or create a task
4. append short notes
5. release, block, or complete
6. validate again

## When to Add More Skills

Add a separate skill only when the current one becomes too broad or when usage
shows a repeated failure mode. Candidate future skills:

- `duneboard-planning` if feature decomposition needs a stricter protocol
- `duneboard-review` if board consistency review grows beyond validation

Until then, keep one skill.

