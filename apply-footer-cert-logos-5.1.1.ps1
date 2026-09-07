$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
node (Join-Path $root 'apply-footer-cert-logos-5.1.1.mjs') $PWD
