# Cleanup Script: Remove Obsolete Skills Directories
# Date: 2025-12-23
# Purpose: Remove old /spec/skills/anthropic/ and /spec/skills/gemini/ 
#          after archiving to /para/archives/skills-documentation-v1/

Write-Host "🧹 A'Space OS - Skills Cleanup Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Define paths
$anthropicPath = "spec\skills\anthropic"
$geminiPath = "spec\skills\gemini"
$archivePath = "para\archives\skills-documentation-v1"

# Verify archives exist
if (-Not (Test-Path $archivePath)) {
    Write-Host "❌ ERROR: Archive directory not found!" -ForegroundColor Red
    Write-Host "   Expected: $archivePath" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Archive verified: $archivePath" -ForegroundColor Green
Write-Host ""

# Check what will be deleted
Write-Host "📋 The following directories will be DELETED:" -ForegroundColor Yellow
Write-Host ""

if (Test-Path $anthropicPath) {
    Write-Host "   - $anthropicPath" -ForegroundColor Red
    $anthropicFiles = Get-ChildItem -Path $anthropicPath -Recurse -File | Measure-Object
    Write-Host "     ($($anthropicFiles.Count) file(s))" -ForegroundColor Gray
} else {
    Write-Host "   - $anthropicPath (already deleted)" -ForegroundColor Gray
}

if (Test-Path $geminiPath) {
    Write-Host "   - $geminiPath" -ForegroundColor Red
    $geminiFiles = Get-ChildItem -Path $geminiPath -Recurse -File | Measure-Object
    Write-Host "     ($($geminiFiles.Count) file(s))" -ForegroundColor Gray
} else {
    Write-Host "   - $geminiPath (already deleted)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "⚠️  WARNING: This action cannot be undone!" -ForegroundColor Yellow
Write-Host "   (Files are already archived in $archivePath)" -ForegroundColor Gray
Write-Host ""

# Confirm deletion
$confirmation = Read-Host "Type 'DELETE' to confirm (or anything else to cancel)"

if ($confirmation -ne "DELETE") {
    Write-Host ""
    Write-Host "❌ Cleanup cancelled by user" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🗑️  Proceeding with cleanup..." -ForegroundColor Cyan
Write-Host ""

# Delete anthropic directory
if (Test-Path $anthropicPath) {
    try {
        Remove-Item -Path $anthropicPath -Recurse -Force
        Write-Host "✅ Deleted: $anthropicPath" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to delete: $anthropicPath" -ForegroundColor Red
        Write-Host "   Error: $_" -ForegroundColor Yellow
    }
} else {
    Write-Host "⏭️  Skipped: $anthropicPath (not found)" -ForegroundColor Gray
}

# Delete gemini directory
if (Test-Path $geminiPath) {
    try {
        Remove-Item -Path $geminiPath -Recurse -Force
        Write-Host "✅ Deleted: $geminiPath" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to delete: $geminiPath" -ForegroundColor Red
        Write-Host "   Error: $_" -ForegroundColor Yellow
    }
} else {
    Write-Host "⏭️  Skipped: $geminiPath (not found)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✅ Cleanup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📂 Final /spec/skills/ structure:" -ForegroundColor Cyan
Get-ChildItem -Path "spec\skills" -Recurse | Select-Object FullName | Format-Table -AutoSize

Write-Host ""
Write-Host "✅ Archives preserved in:" -ForegroundColor Green
Write-Host "   $archivePath" -ForegroundColor Cyan
Write-Host ""
