# Vision

DuneBoard is a task tracker for swarms of AI agents.

The core idea is to make coordination visible, durable, and easy to edit:
Markdown files hold the truth, while UI and CLI tools render that truth into
views for humans and execution queues for agents.

## Problem

Agent runtimes can generate work faster than humans can supervise it. A useful
task system for agents must answer:

- What should be done next?
- What can be done in parallel?
- What is blocked, and why?
- What changed since the last review?
- Which agent owns a task right now?
- What evidence proves that a task is done?

Most task boards answer only part of this. They often model status columns
better than dependency graphs.

## Product Thesis

DuneBoard should model tasks as a graph first and render Kanban as one of many
views.

Agents need explicit structure:

- parent-child decomposition for features and epics
- dependency edges for sequential work
- ready queues for parallel work
- work logs for traceability
- open questions for human review
- validation errors when the board becomes inconsistent

Humans need simplicity:

- readable Markdown files
- a clean local UI
- predictable Git history
- no server required for the default workflow

## Non-goals

- Replacing Jira, Linear, GitHub Issues, or project management suites.
- Building cloud sync before the local workflow works.
- Adding agent runtime logic into the task tracker.
- Making Markdown unreadable in order to support complex UI behavior.

