param(
  [Parameter(Mandatory=$false)]
  [string]$ProjectRoot = "C:\www\Afluma_Production_Website_v0_4_Source_Fidelity",
  [Parameter(Mandatory=$false)]
  [string]$OutputZip = "$PSScriptRoot\Afluma_Backend_Source_Safe.zip"
)

$ErrorActionPreference = "Stop"
if (!(Test-Path $ProjectRoot)) { throw "Project root not found: $ProjectRoot" }

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$temp = Join-Path $env:TEMP "afluma-backend-safe-$stamp"
New-Item -ItemType Directory -Force -Path $temp | Out-Null

$include = @(
  "package.json",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "tsconfig.json",
  "next.config.js",
  "next.config.mjs",
  "next.config.ts",
  "payload.config.ts",
  "src\payload.config.ts",
  "src\collections",
  "src\globals",
  "src\lib\content.ts",
  "src\migrations",
  "src\app\(payload)",
  "src\app\api",
  "src\payload-types.ts",
  "docker-compose.yml",
  "compose.yml",
  "Dockerfile",
  ".env.example"
)

foreach ($relative in $include) {
  $source = Join-Path $ProjectRoot $relative
  if (Test-Path $source) {
    $dest = Join-Path $temp $relative
    $parent = Split-Path $dest -Parent
    New-Item -ItemType Directory -Force -Path $parent | Out-Null
    if ((Get-Item $source).PSIsContainer) {
      Copy-Item -Recurse -Force $source $dest
    } else {
      Copy-Item -Force $source $dest
    }
  }
}

# Remove secret-like files defensively.
Get-ChildItem -Recurse -Force $temp | Where-Object {
  $_.Name -match '^\.env($|\.)' -and $_.Name -ne '.env.example'
} | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

Get-ChildItem -Recurse -Force $temp | Where-Object {
  $_.FullName -match '(node_modules|\.next|\.git|backup|\.afluma-rebuild)'
} | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

if (Test-Path $OutputZip) { Remove-Item -Force $OutputZip }
Compress-Archive -Path (Join-Path $temp '*') -DestinationPath $OutputZip -CompressionLevel Optimal
Remove-Item -Recurse -Force $temp
Write-Host "Created safe backend source archive: $OutputZip"
Write-Host "Review the ZIP before sharing. It should contain source/config only and no .env secrets or database dumps."
