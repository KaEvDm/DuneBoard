# ADR 0003: Start TypeScript-first, Add Rust Later if Needed

## Status

Accepted

## Context

DuneBoard needs a polished local UI and graph interactions early. TypeScript has
strong tooling for Markdown, validation, CLIs, and React UI. Rust is a good
candidate for packaging, native file watching, and high-performance indexing,
but it is not required for the first useful version.

## Decision

Start with TypeScript for the core, CLI, and UI. Consider Tauri/Rust later for
desktop packaging or performance-sensitive filesystem work.

## Consequences

- Faster MVP implementation.
- One language across core, CLI, tests, and UI.
- Rust remains available without becoming a premature dependency.

