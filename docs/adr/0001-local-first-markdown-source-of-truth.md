# ADR 0001: Markdown Files Are the Source of Truth

## Status

Accepted

## Context

DuneBoard is meant to be simple, transparent, and friendly to agents. A database
would make querying easy, but it would hide state from humans and make Git
history less useful.

## Decision

Use Markdown task files as the source of truth. Derived indexes may be cached,
but they must be rebuildable from the files.

## Consequences

- Git diffs remain meaningful.
- Humans can review and edit tasks without special tools.
- Agents can operate through CLI commands that make safe file changes.
- The parser and writer must avoid unnecessary formatting churn.

