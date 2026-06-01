# Changelog

All notable changes to this project will be documented in this file.

This project follows the spirit of Keep a Changelog and uses semantic versions
once implementation releases begin.

## [Unreleased]

### Added

- Added a web UI project selector backed by a local project registry.
- Added `.duneboard/projects.example.json` for local board configuration.

### Changed

- Replaced the `DUNEBOARD_ROOT` UI workflow with selecting configured projects
  inside the UI.

## [0.7.0] - 2026-06-02

### Added

- Added web UI support for loading task files from an external
  `DUNEBOARD_ROOT`.
- Documented how to open different DuneBoard project roots in the web UI.

## [0.6.0] - 2026-06-01

### Added

- Added minimal skills for importing Azure DevOps work into DuneBoard and
  organizing local project specs/tasks into a DuneBoard board.

### Changed

- Added valid Codex skill metadata to the DuneBoard agent skill.
- Clarified why DuneBoard skills use `SKILL.md` as the required entrypoint.

## [0.5.0] - 2026-06-01

### Changed

- Simplified the DuneBoard agent skill into a compact operational protocol.
- Documented why DuneBoard should avoid excessive agent skill instructions.

## [0.4.0] - 2026-06-01

### Added

- Lightweight UI filters for status, task kind, label, and execution state.
- Derived execution state badges in task rows, cards, graph nodes, and details.
- Clickable task relationship navigation in the detail panel.

### Changed

- Task detail now shows file path, assignee, and acceptance progress.

## [0.3.0] - 2026-06-01

### Added

- Initial `@duneboard/cli` package.
- CLI commands for validation, ready queue, task listing, task detail, task
  creation, notes, claim, release, done, and direct status updates.
- CLI workflow documentation for agents and humans.

### Changed

- Ready queue now excludes planning containers (`epic` and `feature`) so agents
  only see executable task kinds.

## [0.2.0] - 2026-05-29

### Added

- Initial TypeScript workspace with `@duneboard/core` and `@duneboard/web`.
- Markdown task parser, board index, ready queue, dependency blocked queue, and
  graph validation tests.
- Read-only Vite UI for local task browsing.
- README logo asset.

### Changed

- CI now installs workspace dependencies and runs `pnpm check`.
- CI uses Node 24-ready GitHub Actions.

## [0.1.0] - 2026-05-29

### Added

- Initial public project documentation.
- Initial roadmap, architecture notes, and task schema draft.
- Initial project board written in DuneBoard Markdown task files.
- Initial agent skill draft.

[Unreleased]: https://github.com/KaEvDm/DuneBoard/compare/v0.7.0...HEAD
[0.7.0]: https://github.com/KaEvDm/DuneBoard/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/KaEvDm/DuneBoard/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/KaEvDm/DuneBoard/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/KaEvDm/DuneBoard/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/KaEvDm/DuneBoard/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/KaEvDm/DuneBoard/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/KaEvDm/DuneBoard/releases/tag/v0.1.0
