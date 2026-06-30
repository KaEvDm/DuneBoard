---
name: duneboard-init-project
description: Bootstrap DuneBoard in a local repository. Use when adding a DuneBoard board to a project, initializing tasks/, installing agent guidance, registering the project in the local DuneBoard UI selector, or making a project self-describing for future agents.
---

# DuneBoard Project Init

Bootstrap a local repository so agents and humans can use DuneBoard there.

Use this before organizing or importing real work into a new target project.

## Inputs

Identify:

- target project root
- DuneBoard workspace root
- project display name
- project id for `.duneboard/projects.local.json`
- whether the target already has `AGENTS.md`, `CLAUDE.md`, or other agent
  instruction files

Use a stable lowercase project id with hyphens, for example `that-one-book`.

## Create Board Skeleton

Create the project-local board config:

```text
.duneboard/config.yml
tasks/
```

Use this config shape:

```yaml
name: Project Name
version: 0.1
task_roots:
  - tasks
id_prefix: DB
default_status: draft
workflow:
  statuses:
    - draft
    - ready
    - in_progress
    - blocked
    - review
    - done
    - canceled
  done_statuses:
    - done
  active_statuses:
    - ready
    - in_progress
    - blocked
    - review
```

Do not delete or move existing planning files.

## Install Agent Guidance

Make the target repository self-describing for future agents:

```text
.codex/skills/duneboard-agent/SKILL.md
.codex/skills/duneboard-agent/agents/openai.yaml
.claude/skills/duneboard-agent/SKILL.md
AGENTS.md
```

Do not put the installed project-local skill in a plain root-level `skills/`
directory. That is useful as a source package inside DuneBoard itself, but it is
not where Codex or Claude Code discover project skills.

The local skill must include exact commands for the target root. If the target
project does not own the DuneBoard CLI, prefer the stable wrapper from the
DuneBoard workspace:

```powershell
C:\path\to\DuneBoard\scripts\DuneBoard.ps1 --root C:\path\to\project preflight --compact
```

Use `pnpm --dir C:\path\to\DuneBoard dune --root C:\path\to\project ...` only
as a fallback when the wrapper is unavailable.

Minimal local skill body:

````markdown
---
name: duneboard-agent
description: Work with this repository's DuneBoard board in tasks/. Use when planning, claiming, updating, blocking, releasing, or closing tasks.
---

# DuneBoard Agent Skill

- `tasks/` Markdown files are the source of truth.
- Do not invent task IDs; create tasks through the DuneBoard CLI.
- Do not delete or move source project files when updating the board.
- Use dependencies only for real sequencing constraints.

Validate and inspect work:

```powershell
C:\path\to\DuneBoard\scripts\DuneBoard.ps1 --root C:\path\to\project preflight --compact
```

For a narrow user-requested fix that touches only one or two files and does not
touch DuneBoard task files or an active board task, skip claim/note/release and
run only the relevant validation. Return to the full workflow if the work grows.
````

Include the operational loop:

- run compact preflight
- claim before implementation
- note progress
- release as blocked only when no local action remains
- close only after acceptance criteria and verification
- validate again after manual edits

If the project already has `CLAUDE.md`, append a short DuneBoard section that
points to `.claude/skills/duneboard-agent/SKILL.md` and compact preflight
commands. For `AGENTS.md`, point Codex to
`.codex/skills/duneboard-agent/SKILL.md`. For other agent instruction files,
add the same short pointer when appropriate.

Keep these instructions small. They should route agents to DuneBoard workflow,
not replace project-specific engineering rules.

## Register In Local UI

If the user wants the board visible in the DuneBoard web UI, add the target
project to the DuneBoard workspace-local registry:

```text
<DuneBoard workspace>/.duneboard/projects.local.json
```

Use this shape:

```json
{
  "projects": [
    {
      "id": "project-id",
      "name": "Project Name",
      "root": "C:\\path\\to\\project"
    }
  ]
}
```

`projects.local.json` is machine-local and should stay ignored by Git.
Preserve existing entries and append or update only the target project entry.

## Validate

Run validation using the exact command written into the target instructions:

```powershell
C:\path\to\DuneBoard\scripts\DuneBoard.ps1 --root C:\path\to\project preflight --compact
```

If the wrapper is unavailable, use the fallback form:

```powershell
pnpm --dir C:\path\to\DuneBoard dune --root C:\path\to\project preflight --compact
```

Stop when:

- config exists
- agent guidance exists
- local UI registration is present when requested
- validation passes
- source planning files were preserved
