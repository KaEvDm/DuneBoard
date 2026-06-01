# Web UI

The web UI renders Markdown tasks from local DuneBoard project roots.

Run the local UI:

```bash
pnpm dev
```

The preview runs at:

```text
http://127.0.0.1:5173
```

The repository-local board is always available as `DuneBoard`.

## Local Projects

To add local boards to the project selector, create
`.duneboard/projects.local.json`:

```powershell
Copy-Item .duneboard\projects.example.json .duneboard\projects.local.json
```

Then edit the local file:

```json
{
  "projects": [
    {
      "id": "achiever",
      "name": "Achiever",
      "root": "C:\\path\\to\\Achiever\\DuneBoard"
    }
  ]
}
```

`projects.local.json` is ignored by Git so personal filesystem paths are not
published.

The UI is still read-only. Use the CLI for validation and writes:

```bash
pnpm dune --root C:\path\to\Achiever\DuneBoard validate
```
