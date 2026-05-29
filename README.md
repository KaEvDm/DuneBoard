# DuneBoard

DuneBoard is a local-first task graph for AI agents and humans.

The project goal is simple: keep task management in Markdown files, then render
those files as a fast visual board, graph, and agent-ready execution queue.

## Status

Project definition release. The first public milestone, `v0.1.0`, defines the
Markdown task format, graph model, CLI workflow direction, minimal UI direction,
and public development workflow.

## Why

Agent runtimes need a task system that is easy to read, easy to edit, and safe
for many agents to use in parallel. Traditional Kanban boards are useful as a
view, but agents also need dependency graphs, parent-child decomposition,
open questions, work logs, and clear readiness rules.

## Principles

- Markdown is the source of truth.
- Kanban is a view, not the core model.
- The core model is a task graph.
- Humans should understand the project by reading files.
- Agents should use narrow commands and skills instead of ad hoc edits.
- The smallest useful workflow wins.

## Planned Shape

```text
tasks/
  DB-0001-project-mvp.md
  DB-0002-markdown-task-schema.md
  DB-0003-task-graph-engine.md
.duneboard/
  config.yml
skills/
  duneboard-agent/
apps/
  web/
packages/
  core/
  cli/
```

## Example Task

```markdown
---
id: DB-0002
title: Define Markdown task schema
kind: task
status: ready
priority: P1
parent: DB-0001
depends_on: []
labels: [core, mvp]
---

## Goal
Create a minimal task file format that agents and humans can edit safely.

## Acceptance Criteria
- [ ] Schema supports parent-child relationships
- [ ] Schema supports predecessor-successor dependencies
- [ ] Schema validates status, kind, priority, and IDs

## Work Log
```

## Documentation

- [Vision](docs/vision.md)
- [Product spec v0.1](docs/product-spec-v0.1.md)
- [Architecture](docs/architecture.md)
- [Task schema](docs/schema/task-file.md)
- [GitHub workflow](docs/github-workflow.md)
- [Roadmap](ROADMAP.md)
- [Changelog](CHANGELOG.md)

## Project Board

This repository dogfoods the planned format in [tasks](tasks/). Those files are
the first DuneBoard board and will become parser fixtures as the implementation
starts.

## Run Locally

```bash
pnpm install
pnpm dev
```

The preview UI runs at `http://127.0.0.1:5173`.

## Current Preview

The first runnable preview is read-only. It parses the repository task files,
builds a board index, and renders list, board, graph, ready queue, task detail,
and validation views.

## License

MIT
