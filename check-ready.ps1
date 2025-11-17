# Deployment Readiness Check Script

Write-Host "Checking deployment readiness..." -ForegroundColor Cyan
Write-Host ""

$allGood = $true
$warnings = @()
$errors = @()

# Check required files
Write-Host "1. Checking required files..." -ForegroundColor Yellow

$requiredFiles = @(
    "backend/Dockerfile",
    "docker-compose.yml",
    ".dockerignore",
    "vercel.json"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  OK: $file" -ForegroundColor Green
    } else {
        Write-Host "  MISSING: $file" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""
Write-Host "2. Checking environment files..." -ForegroundColor Yellow

if (Test-Path "backend/.env") {
    Write-Host "  OK: backend/.env exists" -ForegroundColor Green
} else {
    Write-Host "  MISSING: backend/.env" -ForegroundColor Red
    $allGood = $false
}

if (Test-Path ".env") {
    Write-Host "  OK: .env exists" -ForegroundColor Green
} else {
    Write-Host "  MISSING: .env" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($allGood) {
    Write-Host "All checks passed! Ready to deploy!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Read QUICK_DEPLOY_GUIDE.md" -ForegroundColor White
    Write-Host "  2. Get API keys (OpenAI, etc.)" -ForegroundColor White
    Write-Host "  3. Deploy to Vercel + Railway" -ForegroundColor White
} else {
    Write-Host "Some checks failed" -ForegroundColor Red
    Write-Host "Please fix the issues above" -ForegroundColor Yellow
}

Write-Host "========================================" -ForegroundColor Cyan

