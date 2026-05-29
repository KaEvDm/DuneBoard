# GitHub Workflow

The project should make progress through small visible steps. A public history
is part of the product.

## Repository Setup

- Default branch: `main`
- Visibility: public
- License: MIT
- Issues: enabled
- Discussions: recommended once the repository exists
- Releases: GitHub Releases with semantic tags

## Daily Development Loop

1. Pick a tracked task or issue.
2. Create a branch from `main`.
3. Make the smallest useful change.
4. Run local checks.
5. Commit with a Conventional Commit message.
6. Open a pull request.
7. Merge after review.
8. Update `CHANGELOG.md` when user-visible behavior changes.

## Commit Rhythm

Good commits are small and explain intent:

- `docs: add task schema draft`
- `docs: record local-first ADR`
- `feat: parse task frontmatter`
- `test: add duplicate id fixture`

Avoid mixed commits like "update stuff" or "many fixes".

## Release Rhythm

Use milestones:

- `v0.1.0` for documented project definition.
- `v0.2.0` for the first parser and validator.
- `v0.3.0` for the first CLI.
- `v0.4.0` for the first UI.

Patch releases fix bugs. Minor releases add features while the project is below
`v1.0.0`.

## Branch Protection

Once CI exists, protect `main`:

- require pull request before merge
- require status checks
- require linear history if desired
- block force pushes

For the first solo commits, direct pushes are acceptable if they are clean and
small. Switch to pull requests before inviting contributors.

