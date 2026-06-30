# DuneBoard

<p align="center">
  <img src="docs/assets/duneboard-logo.png" alt="DuneBoard logo" width="420">
</p>

DuneBoard is a local-first task graph for AI agents and humans.

The project goal is simple: keep task management in Markdown files, then render
those files as a fast visual board, graph, and agent-ready execution queue.

## Status

Agent workflow ergonomics release. `v0.12.0` adds compact preflight and task
summary CLI views, stable Windows CLI wrappers, documented small-fix workflow
guidance, and reproducible pnpm build approvals for local Codex use.

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
- [CLI workflow](docs/cli-workflow.md)
- [Web UI](docs/web-ui.md)
- [Agent skill design](docs/agent-skill-design.md)
- [GitHub workflow](docs/github-workflow.md)
- [Release workflow](docs/release-workflow.md)
- [Roadmap](ROADMAP.md)
- [Changelog](CHANGELOG.md)

## Skills

Codex skills use `SKILL.md` as the required entrypoint. The skill name comes
from the folder and YAML frontmatter.

- [duneboard-agent](skills/duneboard-agent/SKILL.md): operate a DuneBoard board
  safely.
- [duneboard-init-project](skills/duneboard-init-project/SKILL.md): bootstrap a
  local project with DuneBoard config, agent guidance, and optional UI
  registration.
- [duneboard-import-ado](skills/duneboard-import-ado/SKILL.md): convert Azure
  DevOps work into DuneBoard tasks.
- [duneboard-organize-local-project](skills/duneboard-organize-local-project/SKILL.md):
  clean up local specs and task notes into a DuneBoard board.

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

On Windows, `Launch-DuneBoard.cmd` starts the dev server and opens the preview
when it is ready. The launcher installs dependencies first if `node_modules/`
is missing.

To open another DuneBoard project, add it to the local project registry and
select it in the UI:

```powershell
Copy-Item .duneboard\projects.example.json .duneboard\projects.local.json
pnpm dev
```

CLI commands run through the package script inside this repository:

```bash
pnpm dune validate
pnpm dune preflight --compact
pnpm dune next
pnpm dune task create --title "Example task"
```

On Windows, `scripts\DuneBoard.ps1` and `scripts\DuneBoard.cmd` run the direct
`tsx` CLI entrypoint when dependencies are installed, then fall back to pnpm if
needed:

```powershell
.\scripts\DuneBoard.ps1 preflight --compact
.\scripts\DuneBoard.ps1 show DB-0007 --summary
```

See [CLI workflow](docs/cli-workflow.md) for external board roots, compact
views, and pnpm setup notes.

## Current Preview

The first runnable preview is read-only. It parses the repository task files,
builds a board index, and renders list, board, graph, ready queue, task detail,
and validation views.

## License

MIT
