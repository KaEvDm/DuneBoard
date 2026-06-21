# Product Spec v0.1

## Goal

Create the smallest useful public version of DuneBoard: a documented task graph
format with example tasks and implementation plan.

## Users

- Human maintainers planning agent-driven software work.
- AI agents decomposing, claiming, executing, updating, and closing tasks.
- Review agents checking task consistency and progress.

## Core Objects

### Task

A Markdown file with YAML frontmatter and standard body sections.
Tasks may include a `## Design` section when the task is the canonical design
record for a feature or decision.

### Board

A folder of task files plus optional configuration.
The board configuration can point at one or more task roots.

### Graph

Derived indexes created from task metadata:

- parent-child tree
- dependency DAG
- reverse dependency map
- ready queue
- blocked queue
- validation errors

## Task Kinds

- `epic`
- `feature`
- `story`
- `task`
- `bug`
- `spike`
- `chore`
- `decision`

## Task Statuses

- `draft`
- `ready`
- `in_progress`
- `blocked`
- `review`
- `done`
- `canceled`

## MVP Views

- List view
- Graph view
- Kanban view
- Task detail
- Ready queue
- Validation panel

## Agent Commands

Planned CLI examples:

```bash
dune init
dune task create --kind feature --title "Build MVP"
dune task link DB-0003 --depends-on DB-0002
dune task claim DB-0003 --agent codex-1
dune task note DB-0003 "Parser implemented"
dune task done DB-0003 --summary "Validated with fixtures"
dune validate
dune next
```

## Success Criteria

- A human can understand the project by reading the Markdown files.
- An agent can determine which tasks are available without reading every file.
- The validator catches duplicate IDs, missing links, invalid statuses, and
  dependency cycles.
- Kanban remains a presentation layer over the graph, not the data model.
