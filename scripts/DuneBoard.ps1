$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir
$cliEntry = Join-Path $repoRoot "packages\cli\src\index.ts"
$tsxCmd = Join-Path $repoRoot "node_modules\.bin\tsx.CMD"
$tsxBin = Join-Path $repoRoot "node_modules\.bin\tsx"

if ((Test-Path $cliEntry) -and (Test-Path $tsxCmd)) {
    & $tsxCmd $cliEntry @Args
    exit $LASTEXITCODE
}

if ((Test-Path $cliEntry) -and (Test-Path $tsxBin)) {
    & $tsxBin $cliEntry @Args
    exit $LASTEXITCODE
}

$pnpm = Get-Command pnpm.cmd -ErrorAction SilentlyContinue
if (-not $pnpm) {
    $pnpm = Get-Command pnpm -ErrorAction SilentlyContinue
}

if ($pnpm) {
    & $pnpm.Source --dir $repoRoot dune @Args
    exit $LASTEXITCODE
}

Write-Error "DuneBoard CLI could not start. Install dependencies in $repoRoot or install pnpm/Corepack."
exit 1
