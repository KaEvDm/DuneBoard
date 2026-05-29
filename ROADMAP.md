# Roadmap

This roadmap is intentionally small. DuneBoard should become useful before it
becomes broad.

## v0.1 - Project Definition

- Define the product vision.
- Define the Markdown task file schema.
- Define the task graph model.
- Define the GitHub contribution and release workflow.
- Add a demo board that can become the first parser fixture.

## v0.2 - Core Engine

- Parse task Markdown files.
- Validate required frontmatter.
- Build parent-child and dependency indexes.
- Detect missing links, duplicate IDs, cycles, and blocked tasks.
- Add fixtures and tests.

## v0.3 - Agent CLI

- Create tasks from the command line.
- Link dependencies.
- Claim and release tasks.
- Append work logs.
- Mark tasks blocked, ready, in review, and done.
- Print the next available tasks.

## v0.4 - Human UI

- Render task list, Kanban view, graph view, and task detail.
- Show validation errors.
- Show ready queue and blocked queue.
- Support fast local search and filters.

## v0.5 - Agent Skills

- Add skills for planning, decomposing features, executing tasks, reviewing,
  and reporting.
- Add examples for sequential and parallel task decomposition.

## v1.0 - Stable Local Workflow

- Freeze the v1 task schema.
- Provide migration rules.
- Publish install and quickstart docs.
- Tag the first stable release.

