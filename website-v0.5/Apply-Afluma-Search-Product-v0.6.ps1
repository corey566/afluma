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

Write-Step 'AFLUMA v0.6 SEARCH + PRODUCT PRECHECK'
Assert-Exists $AflumaPage 'AflumaPage.tsx'
Assert-Exists $FrontendPage 'Frontend catch-all page'
Assert-Exists $SourceExpanded 'Expanded content package'

foreach ($Required in @(
    'content.ts',
    'ExpandedAflumaPage.tsx',
    'ExpandedAflumaClient.tsx',
    'ExpandedAflumaPage.module.css',
    'SearchProductUpgrade.tsx',
    'SearchProductUpgrade.module.css',
    'searchProductContent.ts',
    'searchMetadata.ts'
)) {
    Assert-Exists (Join-Path $SourceExpanded $Required) "Package file $Required"
}

$Stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$BackupDir = Join-Path $ProjectRoot "backups\website-v0.6-search-product-$Stamp"
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
    Write-Step 'INSTALLING v0.6 EXPANDED PACKAGE'

    if (Test-Path -LiteralPath $TargetExpanded) {
        Remove-Item -LiteralPath $TargetExpanded -Recurse -Force
    }

    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $TargetExpanded) | Out-Null
    Copy-Item -LiteralPath $SourceExpanded -Destination $TargetExpanded -Recurse -Force

    foreach ($Required in @(
        'content.ts',
        'ExpandedAflumaPage.tsx',
        'ExpandedAflumaClient.tsx',
        'ExpandedAflumaPage.module.css',
        'SearchProductUpgrade.tsx',
        'SearchProductUpgrade.module.css',
        'searchProductContent.ts',
        'searchMetadata.ts'
    )) {
        Assert-Exists (Join-Path $TargetExpanded $Required) "Installed $Required"
    }

    Write-Host 'v0.6 content, product and search modules copied.' -ForegroundColor Green

    Write-Step 'ENSURING EXPANDED PAGE ROUTING'

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
            throw 'Could not locate a safe AflumaPage import anchor.'
        }

        $PageText = $PageText.Replace($ImportAnchor, "$ImportAnchor`r`n$ExpandedImport")
    }

    $ExpandedDispatch = "  if(shouldUseExpandedPage(slug,doc)) return <ExpandedAflumaPage slug={slug} doc={doc}/>"
    if (-not $PageText.Contains($ExpandedDispatch)) {
        $HomeDispatchPattern = "(?m)^(\s*)if\(slug==='home'\)\s*return\s*<HomePage"
        $HomeMatch = [regex]::Match($PageText, $HomeDispatchPattern)
        if (-not $HomeMatch.Success) {
            throw 'Could not locate the HomePage dispatch anchor in AflumaPage.tsx.'
        }
        $PageText = $PageText.Insert($HomeMatch.Index, "$ExpandedDispatch`r`n")
    }

    Write-Utf8 $AflumaPage $PageText

    $VerifyPage = Read-Utf8 $AflumaPage
    if (-not $VerifyPage.Contains($ExpandedImport) -or -not $VerifyPage.Contains($ExpandedDispatch)) {
        throw 'Expanded page routing verification failed.'
    }

    Write-Host 'Expanded page routing is present.' -ForegroundColor Green

    Write-Step 'PATCHING SEARCH METADATA + CORE FALLBACKS'

    $FrontendText = Read-Utf8 $FrontendPage
    $AflumaImportAnchor = "import { AflumaPage } from '@/afluma-site/AflumaPage'"
    $ExpandedPageImport = "import { ExpandedAflumaPage } from '@/afluma-site/expanded/ExpandedAflumaPage'"
    $ExpandedContentImport = "import { pageForSlug, shouldUseExpandedPage } from '@/afluma-site/expanded/content'"
    $SearchMetadataImport = "import { getExpandedSearchMetadata } from '@/afluma-site/expanded/searchMetadata'"

    if (-not $FrontendText.Contains($AflumaImportAnchor)) {
        throw 'Could not locate AflumaPage import in frontend route.'
    }

    if (-not $FrontendText.Contains($ExpandedPageImport)) {
        $FrontendText = $FrontendText.Replace($AflumaImportAnchor, "$AflumaImportAnchor`r`n$ExpandedPageImport")
    }
    if (-not $FrontendText.Contains($ExpandedContentImport)) {
        $FrontendText = $FrontendText.Replace($ExpandedPageImport, "$ExpandedPageImport`r`n$ExpandedContentImport")
    }
    if (-not $FrontendText.Contains($SearchMetadataImport)) {
        $FrontendText = $FrontendText.Replace($ExpandedContentImport, "$ExpandedContentImport`r`n$SearchMetadataImport")
    }

    $MetadataPattern = '(?s)export async function generateMetadata\(\{params\}:Props\):Promise<Metadata>\{.*?\r?\n\}(?=\r?\n\r?\nexport default async function DynamicPage)'
    $MetadataMatch = [regex]::Match($FrontendText, $MetadataPattern)

    if (-not $MetadataMatch.Success) {
        throw 'Could not safely locate the generateMetadata function. Metadata was not changed.'
    }

    $MetadataReplacement = @'
export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {segments}=await params
  const {isEnabled}=await draftMode()
  const slug=normalizeSlug(segments)
  const result=await getPageBySlug(slug,isEnabled)
  const expanded=pageForSlug(slug)
  const expandedSearch=expanded?getExpandedSearchMetadata(expanded):null

  if(!result){
    if(!expanded||!expandedSearch) return {}
    return {
      title:expandedSearch.title,
      description:expandedSearch.description,
      keywords:expandedSearch.keywords,
      alternates:{canonical:expandedSearch.canonical},
      robots:expandedSearch.robots.index
        ?{index:true,follow:true,googleBot:{index:true,follow:true,'max-image-preview':'large','max-video-preview':-1,'max-snippet':-1}}
        :{index:false,follow:true},
      openGraph:{type:'website',siteName:'Afluma',title:expandedSearch.title,description:expandedSearch.description,url:expandedSearch.canonical,images:[{url:'/afluma-v07/generated/hero-android.png',alt:'Afluma AI-native business systems'}]},
      twitter:{card:'summary_large_image',title:expandedSearch.title,description:expandedSearch.description,images:['/afluma-v07/generated/hero-android.png']},
    }
  }

  const doc=result.doc as any
  const seo=doc.seo||{}
  const cmsIndexable=Boolean(doc.recommendedIndexable)&&doc._status==='published'
  const indexable=expandedSearch?expandedSearch.robots.index:cmsIndexable
  const canonical=expandedSearch?.canonical||seo.canonicalURL||undefined
  const title=expandedSearch?.title||seo.title||doc.title||'Afluma'
  const description=expandedSearch?.description||seo.description||doc.summary||'Afluma designs, builds and operates intelligent digital systems.'

  return {
    title,
    description,
    keywords:expandedSearch?.keywords,
    alternates:canonical?{canonical}:undefined,
    robots:indexable?{index:true,follow:true,googleBot:{index:true,follow:true,'max-image-preview':'large','max-video-preview':-1,'max-snippet':-1}}:{index:false,follow:true},
    openGraph:{type:'website',siteName:'Afluma',title,description,url:canonical,images:[{url:'/afluma-v07/generated/hero-android.png',alt:'Afluma AI-native business systems'}]},
    twitter:{card:'summary_large_image',title,description,images:['/afluma-v07/generated/hero-android.png']},
  }
}
'@

    $FrontendText = [regex]::Replace($FrontendText, $MetadataPattern, $MetadataReplacement.TrimEnd(), 1)

    if (-not $FrontendText.Contains('if(!result&&shouldUseExpandedPage(normalizeSlug(segments)))')) {
        $MissingOld = '  if(!result) notFound()'
        $MissingNew = @'
  if(!result&&shouldUseExpandedPage(normalizeSlug(segments))){
    return <ExpandedAflumaPage slug={normalizeSlug(segments)}/>
  }
  if(!result) notFound()
'@
        if (-not $FrontendText.Contains($MissingOld)) {
            throw 'Could not locate runtime missing-route anchor.'
        }
        $FrontendText = $FrontendText.Replace($MissingOld, $MissingNew.TrimEnd())
    }

    Write-Utf8 $FrontendPage $FrontendText

    $VerifyFrontend = Read-Utf8 $FrontendPage
    foreach ($Expected in @(
        $ExpandedPageImport,
        $ExpandedContentImport,
        $SearchMetadataImport,
        'const expandedSearch=expanded?getExpandedSearchMetadata(expanded):null',
        'const indexable=expandedSearch?expandedSearch.robots.index:cmsIndexable',
        'if(!result&&shouldUseExpandedPage(normalizeSlug(segments)))'
    )) {
        if (-not $VerifyFrontend.Contains($Expected)) {
            throw "Frontend v0.6 verification failed for: $Expected"
        }
    }

    Write-Host 'Authority metadata, canonical and index policy patched.' -ForegroundColor Green

    Write-Step 'STATIC v0.6 CONTENT GATES'

    $AuthorityText = Read-Utf8 (Join-Path $TargetExpanded 'searchProductContent.ts')
    $MetadataText = Read-Utf8 (Join-Path $TargetExpanded 'searchMetadata.ts')
    $RendererText = Read-Utf8 (Join-Path $TargetExpanded 'ExpandedAflumaPage.tsx')

    foreach ($Phrase in @(
        "'products/afluma-commerce'",
        "'products/serenops'",
        "'platform/agenticos'",
        "'services/seo-digital-growth'",
        "'services/ai-automation'",
        "The ten are jobs, not mascots.",
        "Fleet is the first module being completed. Process Inspector is still unfinished.",
        "English, Sinhala, Tamil and Hindi",
        "Retrieval is not memory, and memory is not organizational truth."
    )) {
        if (-not $AuthorityText.Contains($Phrase)) {
            throw "Required v0.6 authority content was not found: $Phrase"
        }
    }

    foreach ($Phrase in @(
        "'products/afluma-commerce'",
        "'products/serenops'",
        "'platform/agenticos'",
        "'services/seo-digital-growth'",
        'isAuthorityIndexable'
    )) {
        if (-not $MetadataText.Contains($Phrase)) {
            throw "Required search metadata policy was not found: $Phrase"
        }
    }

    if (-not $RendererText.Contains('<SearchProductUpgrade slug={page.slug} />')) {
        throw 'SearchProductUpgrade is not connected to the expanded renderer.'
    }

    Write-Host 'v0.6 product/search content gates passed.' -ForegroundColor Green

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
        Write-Host 'Production build was not requested. Re-run with -RunBuild after TypeScript succeeds and the local Payload/PostgreSQL environment is ready.' -ForegroundColor DarkYellow
    }

    $Applied = $true
}
catch {
    Write-Host "`nAFLUMA v0.6 SEARCH + PRODUCT UPGRADE FAILED" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host 'Restoring original source files...' -ForegroundColor Yellow

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
    Write-Host 'Upgrade did not complete.' -ForegroundColor Red
    exit 1
}

Write-Step 'AFLUMA v0.6 SEARCH + PRODUCT UPGRADE APPLIED'
Write-Host 'Product authority, AI/search discovery content, semantic UI and authority-page metadata policy are installed.' -ForegroundColor Green
Write-Host "Backup retained at: $BackupDir" -ForegroundColor DarkGray
Write-Host 'Next gate: visually inspect Products, Commerce, SerenOps, AgenticOS, Workforce, Services, AI Automation, SEO & Digital Growth, Research, Trust and Home on desktop + mobile.' -ForegroundColor Cyan
