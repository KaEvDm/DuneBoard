# Contributing

DuneBoard is early. The best contributions are small, explicit, and tied to a
tracked issue or task file.

## Workflow

1. Open or pick an issue.
2. Create a branch from `main`.
3. Make a small focused change.
4. Add or update tests when behavior changes.
5. Open a pull request with a clear summary and verification notes.

## Branch Names

Use short descriptive names:

- `docs/task-schema`
- `feat/parser-frontmatter`
- `fix/dependency-cycle-detection`

## Commit Style

Use Conventional Commits:

- `docs: add task schema draft`
- `feat: parse task frontmatter`
- `fix: reject duplicate task ids`
- `test: add cycle detection fixture`

## Pull Requests

Each PR should answer:

- What changed?
- Why was it changed?
- How was it verified?
- What remains out of scope?

## Design Rules

- Prefer Markdown files over hidden state.
- Prefer explicit graph rules over implicit board behavior.
- Keep schemas small and stable.
- Do not add cloud, auth, database, or realtime sync before the local workflow
  is useful.

