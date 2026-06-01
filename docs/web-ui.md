# Web UI

The web UI renders Markdown tasks from a DuneBoard board root.

By default, it opens this repository's own board:

```bash
pnpm dev
```

To open another project board, set `DUNEBOARD_ROOT` to a directory that contains
`tasks/`:

```powershell
$env:DUNEBOARD_ROOT = "C:\Users\evgen\source\repos\Achiever\DuneBoard"
pnpm dev
```

The preview runs at:

```text
http://127.0.0.1:5173
```

The UI is still read-only. Use the CLI for validation and writes:

```bash
pnpm dune --root C:\Users\evgen\source\repos\Achiever\DuneBoard validate
```
