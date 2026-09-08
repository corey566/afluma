param(
    [string]$BaseUrl = 'http://localhost:3000'
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$BaseUrl = $BaseUrl.TrimEnd('/')
$Failures = New-Object System.Collections.Generic.List[string]
$Warnings = New-Object System.Collections.Generic.List[string]

function Add-Failure([string]$Message) {
    $Failures.Add($Message)
    Write-Host "FAIL: $Message" -ForegroundColor Red
}

function Add-Warning([string]$Message) {
    $Warnings.Add($Message)
    Write-Host "WARN: $Message" -ForegroundColor Yellow
}

function Get-Text([string]$Url) {
    try {
        $Response = Invoke-WebRequest -Uri $Url -UseBasicParsing -MaximumRedirection 5
        return [pscustomobject]@{
            Status = [int]$Response.StatusCode
            Body = [string]$Response.Content
            Headers = $Response.Headers
        }
    }
    catch {
        $Code = 0
        if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
            $Code = [int]$_.Exception.Response.StatusCode
        }
        return [pscustomobject]@{ Status = $Code; Body = ''; Headers = @{} }
    }
}

function Test-AuthorityPage([string]$Path) {
    $Before = $Failures.Count
    $Url = if ($Path -eq '/') { "$BaseUrl/" } else { "$BaseUrl$Path" }
    $Result = Get-Text $Url

    if ($Result.Status -ne 200) {
        Add-Failure "$Path returned HTTP $($Result.Status)."
        return
    }

    if ($Result.Body -notmatch '(?i)<title>[^<]+</title>') {
        Add-Failure "$Path is missing an HTML title."
    }

    if ($Result.Body -notmatch '(?i)<link[^>]+rel=["'']canonical["''][^>]*>') {
        Add-Failure "$Path is missing a canonical link."
    }

    if ($Result.Body -match '(?i)<meta[^>]+name=["'']robots["''][^>]+content=["''][^"'']*noindex') {
        Add-Failure "$Path is still emitting noindex."
    }

    if ($Result.Body -notmatch '(?i)<h1\b') {
        Add-Failure "$Path is missing an H1."
    }

    if ($Failures.Count -eq $Before) {
        Write-Host "PASS: $Path returned 200 with title, canonical, indexable robots state and H1." -ForegroundColor Green
    }
}

Write-Host "`n=== AFLUMA v0.6 LIVE SEARCH READINESS AUDIT ===" -ForegroundColor Cyan
Write-Host "Target: $BaseUrl" -ForegroundColor DarkGray

$AuthorityPaths = @(
    '/',
    '/products/',
    '/products/afluma-commerce/',
    '/products/serenops/',
    '/platform/agenticos/',
    '/workforce/',
    '/services/',
    '/services/ai-automation/',
    '/services/seo-digital-growth/',
    '/research/',
    '/trust/'
)

Write-Host "`n--- Authority pages ---" -ForegroundColor Cyan
foreach ($Path in $AuthorityPaths) {
    Test-AuthorityPage $Path
}

Write-Host "`n--- robots.txt ---" -ForegroundColor Cyan
$RobotsBefore = $Failures.Count
$Robots = Get-Text "$BaseUrl/robots.txt"
if ($Robots.Status -ne 200) {
    Add-Failure "robots.txt returned HTTP $($Robots.Status)."
}
else {
    if ($Robots.Body -match '(?is)User-agent:\s*\*.*?Disallow:\s*/\s*(?:\r?\n|$)') {
        Add-Failure 'robots.txt appears to block the entire site for all crawlers.'
    }

    if ($Robots.Body -match '(?is)User-agent:\s*OAI-SearchBot.*?Disallow:\s*/\s*(?:\r?\n|$)') {
        Add-Failure 'robots.txt explicitly blocks OAI-SearchBot from the entire site.'
    }
    elseif ($Robots.Body -notmatch '(?i)OAI-SearchBot') {
        Add-Warning 'robots.txt does not explicitly mention OAI-SearchBot. This is not automatically a block; verify CDN/WAF crawler access separately.'
    }

    if ($Robots.Body -notmatch '(?im)^Sitemap:\s*https?://') {
        Add-Warning 'robots.txt does not advertise an absolute sitemap URL.'
    }

    if ($Failures.Count -eq $RobotsBefore) {
        Write-Host 'PASS: robots.txt is reachable and no full-site crawler block was detected.' -ForegroundColor Green
    }
}

Write-Host "`n--- sitemap.xml ---" -ForegroundColor Cyan
$SitemapBefore = $Failures.Count
$Sitemap = Get-Text "$BaseUrl/sitemap.xml"
if ($Sitemap.Status -ne 200) {
    Add-Failure "sitemap.xml returned HTTP $($Sitemap.Status)."
}
else {
    foreach ($Path in $AuthorityPaths) {
        $Absolute = if ($Path -eq '/') { 'https://afluma.com/' } else { "https://afluma.com$Path" }
        if ($Sitemap.Body -notmatch [regex]::Escape($Absolute)) {
            Add-Failure "Authority URL is missing from sitemap.xml: $Absolute"
        }
    }

    if ($Failures.Count -eq $SitemapBefore) {
        Write-Host 'PASS: sitemap.xml contains every v0.6 authority URL checked by this gate.' -ForegroundColor Green
    }
}

Write-Host "`n--- llms.txt (informational only) ---" -ForegroundColor Cyan
$Llms = Get-Text "$BaseUrl/llms.txt"
if ($Llms.Status -eq 200) {
    Write-Host 'INFO: llms.txt exists. Treat it as supplemental documentation, not a Google ranking requirement.' -ForegroundColor DarkGray
}
else {
    Add-Warning 'llms.txt was not found. This does not block Google Search or AI search discovery.'
}

Write-Host "`n--- Summary ---" -ForegroundColor Cyan
Write-Host "Failures: $($Failures.Count)"
Write-Host "Warnings: $($Warnings.Count)"

if ($Failures.Count -gt 0) {
    Write-Host "`nAFLUMA v0.6 SEARCH READINESS AUDIT FAILED" -ForegroundColor Red
    foreach ($Failure in $Failures) {
        Write-Host " - $Failure" -ForegroundColor Red
    }
    exit 1
}

Write-Host "`nAFLUMA v0.6 SEARCH READINESS AUDIT PASSED" -ForegroundColor Green
if ($Warnings.Count -gt 0) {
    Write-Host 'Warnings still require review before calling crawler/CDN readiness complete.' -ForegroundColor Yellow
}
