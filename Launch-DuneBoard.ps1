$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoRoot

$pnpm = Get-Command pnpm.cmd -ErrorAction SilentlyContinue
if (-not $pnpm) {
    $pnpm = Get-Command pnpm -ErrorAction SilentlyContinue
}

if (-not $pnpm) {
    Write-Error "pnpm was not found. Install Node.js/Corepack, then run: corepack enable"
    exit 1
}

if (-not (Test-Path (Join-Path $repoRoot "node_modules"))) {
    Write-Host "Installing dependencies..."
    & $pnpm.Source install
    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE
    }
}

$openBrowserJob = Start-Job -ScriptBlock {
    $ports = 5173..5190

    for ($attempt = 0; $attempt -lt 60; $attempt++) {
        foreach ($port in $ports) {
            $url = "http://127.0.0.1:$port/"

            try {
                $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 1

                if ($response.StatusCode -eq 200 -and $response.Content -match "DuneBoard") {
                    Start-Process $url
                    return
                }
            }
            catch {
                # The dev server is still starting or this port belongs to another app.
            }
        }

        Start-Sleep -Seconds 1
    }
}

try {
    Write-Host "Starting DuneBoard..."
    Write-Host "Press Ctrl+C to stop the dev server."
    & $pnpm.Source dev
    exit $LASTEXITCODE
}
finally {
    if ($openBrowserJob) {
        Stop-Job $openBrowserJob -ErrorAction SilentlyContinue
        Remove-Job $openBrowserJob -Force -ErrorAction SilentlyContinue
    }
}
