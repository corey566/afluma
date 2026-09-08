param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectRoot,

    [switch]$SkipTypecheck,

    [switch]$RunBuild
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$Utf8 = [System.Text.Encoding]::UTF8
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Write-Step([string]$Text) {
    Write-Host "`n=== $Text ===" -ForegroundColor Cyan
}

function Assert-Exists([string]$Path, [string]$Label) {
    if (-not (Test-Path -LiteralPath $Path)) {
        throw "$Label was not found: $Path"
    }
}

function Read-Utf8([string]$Path) {
    return [System.IO.File]::ReadAllText((Resolve-Path -LiteralPath $Path).Path, $Utf8)
}

function Write-Utf8([string]$Path, [string]$Content) {
    [System.IO.File]::WriteAllText($Path, $Content, $Utf8NoBom)
}

$ProjectRoot = (Resolve-Path -LiteralPath $ProjectRoot).Path
$PackageRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

$AflumaPage = Join-Path $ProjectRoot 'src\afluma-site\AflumaPage.tsx'
$FrontendPage = Join-Path $ProjectRoot 'src\app\(frontend)\[[...segments]]\page.tsx'
$SourceExpanded = Join-Path $PackageRoot 'src\afluma-site\expanded'
$TargetExpanded = Join-Path $ProjectRoot 'src\afluma-site\expanded'

Write-Step 'AFLUMA v0.5 CONTENT EXPANSION PRECHECK'
Assert-Exists $AflumaPage 'AflumaPage.tsx'
Assert-Exists $FrontendPage 'Frontend catch-all page'
Assert-Exists $SourceExpanded 'Expanded content package'
Assert-Exists (Join-Path $SourceExpanded 'content.ts') 'Expanded content model'
Assert-Exists (Join-Path $SourceExpanded 'ExpandedAflumaPage.tsx') 'Expanded page renderer'
Assert-Exists (Join-Path $SourceExpanded 'ExpandedAflumaClient.tsx') 'Expanded interactive client components'
Assert-Exists (Join-Path $SourceExpanded 'ExpandedAflumaPage.module.css') 'Expanded page styles'

$Stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$BackupDir = Join-Path $ProjectRoot "backups\website-v0.5-content-expansion-$Stamp"
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

$BackupAflumaPage = Join-Path $BackupDir 'AflumaPage.tsx'
$BackupFrontendPage = Join-Path $BackupDir 'frontend-page.tsx'
$BackupExpanded = Join-Path $BackupDir 'expanded'
$HadExpanded = Test-Path -LiteralPath $TargetExpanded

Copy-Item -LiteralPath $AflumaPage -Destination $BackupAflumaPage -Force
Copy-Item -LiteralPath $FrontendPage -Destination $BackupFrontendPage -Force
if ($HadExpanded) {
    Copy-Item -LiteralPath $TargetExpanded -Destination $BackupExpanded -Recurse -Force
}

Write-Host "Backup created: $BackupDir" -ForegroundColor DarkGray

$Applied = $false

try {
    Write-Step 'INSTALLING EXPANDED PAGE PACKAGE'

    if (Test-Path -LiteralPath $TargetExpanded) {
        Remove-Item -LiteralPath $TargetExpanded -Recurse -Force
    }

    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $TargetExpanded) | Out-Null
    Copy-Item -LiteralPath $SourceExpanded -Destination $TargetExpanded -Recurse -Force

    foreach ($Required in @(
        'content.ts',
        'ExpandedAflumaPage.tsx',
        'ExpandedAflumaClient.tsx',
        'ExpandedAflumaPage.module.css'
    )) {
        Assert-Exists (Join-Path $TargetExpanded $Required) "Installed $Required"
    }

    Write-Host 'Expanded content package copied.' -ForegroundColor Green

    Write-Step 'PATCHING AFLUMA PAGE ROUTING'

    $PageText = Read-Utf8 $AflumaPage

    $ExpandedImport = "import { ExpandedAflumaPage, shouldUseExpandedPage } from './expanded/ExpandedAflumaPage'"
    if (-not $PageText.Contains($ExpandedImport)) {
        $ImportAnchors = @(
            "import AflumaHero from '@/components/hero/AflumaHero'",
            "import { CinematicHero } from './CinematicHero'"
        )

        $ImportAnchor = $null
        foreach ($Candidate in $ImportAnchors) {
            if ($PageText.Contains($Candidate)) {
                $ImportAnchor = $Candidate
                break
            }
        }

        if (-not $ImportAnchor) {
            throw 'Could not locate a safe AflumaPage import anchor. Nothing was patched.'
        }

        $PageText = $PageText.Replace(
            $ImportAnchor,
            "$ImportAnchor`r`n$ExpandedImport"
        )
    }

    $ExpandedDispatch = "  if(shouldUseExpandedPage(slug,doc)) return <ExpandedAflumaPage slug={slug} doc={doc}/>"
    if (-not $PageText.Contains($ExpandedDispatch)) {
        $HomeDispatchPattern = "(?m)^(\s*)if\(slug==='home'\)\s*return\s*<HomePage"
        $HomeMatch = [regex]::Match($PageText, $HomeDispatchPattern)

        if (-not $HomeMatch.Success) {
            throw "Could not locate the HomePage dispatch anchor in AflumaPage.tsx. Existing routing was not modified."
        }

        $InsertAt = $HomeMatch.Index
        $PageText = $PageText.Insert($InsertAt, "$ExpandedDispatch`r`n")
    }

    Write-Utf8 $AflumaPage $PageText

    $VerifyPage = Read-Utf8 $AflumaPage
    if (-not $VerifyPage.Contains($ExpandedImport)) {
        throw 'ExpandedAflumaPage import verification failed.'
    }
    if (-not $VerifyPage.Contains($ExpandedDispatch)) {
        throw 'Expanded page dispatch verification failed.'
    }

    Write-Host 'AflumaPage routing patched and verified.' -ForegroundColor Green

    Write-Step 'PATCHING CORE-ROUTE FALLBACKS'

    $FrontendText = Read-Utf8 $FrontendPage

    $FrontendExpandedImport = "import { ExpandedAflumaPage } from '@/afluma-site/expanded/ExpandedAflumaPage'"
    $FrontendContentImport = "import { pageForSlug, shouldUseExpandedPage } from '@/afluma-site/expanded/content'"
    $FrontendImportAnchor = "import { AflumaPage } from '@/afluma-site/AflumaPage'"

    if (-not $FrontendText.Contains($FrontendImportAnchor)) {
        throw 'Could not locate AflumaPage import in the frontend catch-all route.'
    }

    if (-not $FrontendText.Contains($FrontendExpandedImport)) {
        $FrontendText = $FrontendText.Replace(
            $FrontendImportAnchor,
            "$FrontendImportAnchor`r`n$FrontendExpandedImport"
        )
    }

    if (-not $FrontendText.Contains($FrontendContentImport)) {
        $FrontendText = $FrontendText.Replace(
            $FrontendExpandedImport,
            "$FrontendExpandedImport`r`n$FrontendContentImport"
        )
    }

    $MetadataOld = '  if(!result) return {}'
    $MetadataNew = @'
  if(!result){
    const expanded=pageForSlug(normalizeSlug(segments))
    if(!expanded) return {}
    return {
      title: `${expanded.title} | Afluma`,
      description: expanded.lede,
      robots: { index: false, follow: true },
    }
  }
'@

    if (-not $FrontendText.Contains('const expanded=pageForSlug(normalizeSlug(segments))')) {
        if (-not $FrontendText.Contains($MetadataOld)) {
            throw 'Could not locate the metadata missing-route anchor. Frontend route was not safely patched.'
        }
        $FrontendText = $FrontendText.Replace($MetadataOld, $MetadataNew.TrimEnd())
    }

    $MissingOld = '  if(!result) notFound()'
    $MissingNew = @'
  if(!result&&shouldUseExpandedPage(normalizeSlug(segments))){
    return <ExpandedAflumaPage slug={normalizeSlug(segments)}/>
  }
  if(!result) notFound()
'@

    if (-not $FrontendText.Contains('if(!result&&shouldUseExpandedPage(normalizeSlug(segments)))')) {
        if (-not $FrontendText.Contains($MissingOld)) {
            throw 'Could not locate the runtime missing-route anchor. Frontend route was not safely patched.'
        }
        $FrontendText = $FrontendText.Replace($MissingOld, $MissingNew.TrimEnd())
    }

    Write-Utf8 $FrontendPage $FrontendText

    $VerifyFrontend = Read-Utf8 $FrontendPage
    foreach ($Expected in @(
        $FrontendExpandedImport,
        $FrontendContentImport,
        'const expanded=pageForSlug(normalizeSlug(segments))',
        'if(!result&&shouldUseExpandedPage(normalizeSlug(segments)))'
    )) {
        if (-not $VerifyFrontend.Contains($Expected)) {
            throw "Frontend patch verification failed for: $Expected"
        }
    }

    Write-Host 'Core-route fallback and metadata fallback patched.' -ForegroundColor Green

    Write-Step 'STATIC CONTENT GATES'

    $ContentPath = Join-Path $TargetExpanded 'content.ts'
    $ContentText = Read-Utf8 $ContentPath

    foreach ($RequiredPhrase in @(
        "slug: 'home'",
        "slug: 'company'",
        "slug: 'services'",
        "slug: 'workforce'",
        "slug: 'privacy'",
        "slug: 'terms'",
        "slug: 'cookies'",
        "slug: 'accessibility'",
        "slug: 'research'",
        "slug: 'proof'",
        "name: 'Yara Halo'",
        "name: 'Lumina'"
    )) {
        if (-not $ContentText.Contains($RequiredPhrase)) {
            throw "Required expanded content was not found: $RequiredPhrase"
        }
    }

    $AgentNameMatches = [regex]::Matches($ContentText, "(?m)^\s*name:\s*'[^']+'")
    if ($AgentNameMatches.Count -lt 10) {
        throw "Expected at least 10 digital coworker profiles, found $($AgentNameMatches.Count)."
    }

    Write-Host "Digital coworker profile gate: $($AgentNameMatches.Count) profiles found." -ForegroundColor Green

    if (-not $SkipTypecheck) {
        Write-Step 'TYPESCRIPT GATE'
        Push-Location $ProjectRoot
        try {
            npx tsc --noEmit
            if ($LASTEXITCODE -ne 0) {
                throw "TypeScript gate failed with exit code $LASTEXITCODE."
            }
        }
        finally {
            Pop-Location
        }
        Write-Host 'TypeScript gate passed.' -ForegroundColor Green
    }
    else {
        Write-Host 'TypeScript gate skipped by explicit switch.' -ForegroundColor Yellow
    }

    if ($RunBuild) {
        Write-Step 'PRODUCTION BUILD GATE'
        Push-Location $ProjectRoot
        try {
            npm run build
            if ($LASTEXITCODE -ne 0) {
                throw "Production build failed with exit code $LASTEXITCODE."
            }
        }
        finally {
            Pop-Location
        }
        Write-Host 'Production build gate passed.' -ForegroundColor Green
    }
    else {
        Write-Host 'Production build was not requested. Run this script again with -RunBuild when the local database/environment required by the Next.js/Payload build is ready.' -ForegroundColor DarkYellow
    }

    $Applied = $true
}
catch {
    Write-Host "`nAFLUMA v0.5 CONTENT EXPANSION FAILED" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "Restoring original source files..." -ForegroundColor Yellow

    Copy-Item -LiteralPath $BackupAflumaPage -Destination $AflumaPage -Force
    Copy-Item -LiteralPath $BackupFrontendPage -Destination $FrontendPage -Force

    if (Test-Path -LiteralPath $TargetExpanded) {
        Remove-Item -LiteralPath $TargetExpanded -Recurse -Force
    }

    if ($HadExpanded -and (Test-Path -LiteralPath $BackupExpanded)) {
        Copy-Item -LiteralPath $BackupExpanded -Destination $TargetExpanded -Recurse -Force
    }

    Write-Host "Rollback complete. Backup retained at: $BackupDir" -ForegroundColor Yellow
    exit 1
}

if (-not $Applied) {
    Write-Host 'Expansion did not complete.' -ForegroundColor Red
    exit 1
}

Write-Step 'AFLUMA v0.5 CONTENT EXPANSION APPLIED'
Write-Host 'Expanded core pages, agent profiles, interactive sections and legal content are installed.' -ForegroundColor Green
Write-Host "Backup retained at: $BackupDir" -ForegroundColor DarkGray
Write-Host 'Next validation: run the app and manually inspect Home, Company, Services, Workforce, individual agent pages, Platform, Products, Research, Proof, Trust, Privacy, Terms, Cookies and Accessibility on desktop and mobile.' -ForegroundColor Cyan
