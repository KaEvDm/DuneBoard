# ADR 0002: Model Tasks as a Graph, Not a Kanban Board

## Status

Accepted

## Context

Kanban columns are easy for humans, but they do not fully describe parallelism,
sequencing, parent-child decomposition, and blockers. Agent swarms need a
machine-readable answer to "what can run now?"

## Decision

Use a task graph as the core model. Kanban is a view derived from task status.

## Consequences

- Dependencies can define parallel and sequential work.
- The ready queue can be computed.
- UI can still show a Kanban board.
- The validator must detect graph errors such as cycles and missing task IDs.

