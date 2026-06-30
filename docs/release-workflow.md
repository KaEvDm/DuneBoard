# Release Workflow

DuneBoard releases should be small, reviewable, and tied to a tracked task.

## Checklist

1. Create or select a release task.
2. Confirm the live board validates.
3. Update version metadata in root and package `package.json` files.
4. Update `CHANGELOG.md` with user-visible changes.
5. Update README status when the release changes the current project shape.
6. Run `pnpm dune validate` or `scripts\DuneBoard.ps1 preflight --compact`.
7. Run `pnpm check`.
8. Confirm CI task-ID hygiene ignores `<taskRoot>/archive/**`, matching the
   live board loader.
9. Commit the release changes.
10. Tag and push the release, then publish GitHub release notes from the
    changelog entry.

## Notes

Patch releases fix regressions or release-process bugs. Minor releases add
features while DuneBoard is below `v1.0.0`.

Release tasks should capture verification evidence, but routine deployment
records should stay concise. If release or deployment notes become long, move
durable release history into project documentation instead of appending every
event to an active task Work Log.
