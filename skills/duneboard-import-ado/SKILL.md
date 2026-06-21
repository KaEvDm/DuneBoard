---
name: duneboard-import-ado
description: Convert Azure DevOps backlog or work item data into DuneBoard Markdown tasks. Use when the user asks to migrate, import, mirror, or decompose ADO Epics, Features, User Stories, Bugs, Tasks, links, acceptance criteria, comments, or exported WIQL/CSV/JSON into DuneBoard.
---

# DuneBoard ADO Import

Import structure, not Azure DevOps ceremony.

## Inputs

Use the data the user provides. If key data is missing, ask for the smallest
missing export or snippet: ID, title, type, state, parent, links, tags,
acceptance criteria, discussion, and blockers.

## Mapping

- ADO Epic -> `kind: epic`
- ADO Feature -> `kind: feature`
- ADO User Story -> `kind: story`
- ADO Bug -> `kind: bug`
- ADO Task -> `kind: task`
- ADO Spike -> `kind: spike`
- Real predecessor/successor links -> `depends_on`
- Parent/child links -> `parent`
- Related links -> `relates_to`
- Unresolved decisions or missing fields -> `## Open Questions`
- Useful ADO IDs, URLs, area, iteration, and tags -> `## Notes`

Map states conservatively:

- New/Proposed -> `draft`
- Active/Committed -> `ready`
- Doing/In Progress -> `in_progress`
- Blocked -> `blocked`
- Resolved/Review -> `review`
- Closed/Done -> `done`
- Removed -> `canceled`

## Create Tasks

Prefer DuneBoard CLI commands so IDs stay valid:

```bash
pnpm dune task create --title "Title" --kind story --status ready --priority P1 --parent DB-0001 --label ado
pnpm dune task link DB-0012 --depends-on DB-0011
pnpm dune validate
```

If the CLI cannot express a body section, create the task with the CLI first,
then edit Markdown sections manually and validate.

## Keep It Clean

- Do not copy noisy ADO history into the work log.
- Do not create dependencies for simple parent/child hierarchy.
- Do not invent missing acceptance criteria; put gaps in `## Open Questions`.
- Keep original ADO IDs visible in notes for traceability.
- If exported specs or planning files are later folded into DuneBoard, use
  `pnpm dune migrate source-specs` to produce a reviewable plan before moving
  source material under the task archive.
