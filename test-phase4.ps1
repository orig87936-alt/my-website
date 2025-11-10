# Phase 4 Frontend Testing Script
# This script helps you quickly test the Phase 4 frontend integration

Write-Host "🚀 Phase 4 Frontend Testing Helper" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Check if backend is running
Write-Host "📡 Checking backend status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ Backend is running!" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is NOT running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start the backend first:" -ForegroundColor Yellow
    Write-Host "  cd backend" -ForegroundColor White
    Write-Host "  .\venv\Scripts\activate.ps1" -ForegroundColor White
    Write-Host "  uvicorn app.main:app --reload" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Check if .env file exists
Write-Host ""
Write-Host "📄 Checking .env file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ .env file exists" -ForegroundColor Green
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "VITE_API_BASE_URL") {
        Write-Host "✅ VITE_API_BASE_URL is configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  VITE_API_BASE_URL not found in .env" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  .env file not found, creating from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Created .env file" -ForegroundColor Green
}

# Check if node_modules exists
Write-Host ""
Write-Host "📦 Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Dependencies not installed" -ForegroundColor Yellow
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Display test instructions
Write-Host ""
Write-Host "📋 Testing Instructions:" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Make sure you have test data in the backend:" -ForegroundColor White
Write-Host "   - Visit http://localhost:8000/api/docs" -ForegroundColor Gray
Write-Host "   - Create at least 7 articles in the same category" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start the frontend dev server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Green
Write-Host ""
Write-Host "3. Open http://localhost:5173 in your browser" -ForegroundColor White
Write-Host ""
Write-Host "4. Navigate to an article detail page" -ForegroundColor White
Write-Host ""
Write-Host "5. Scroll to the bottom to see Related Articles" -ForegroundColor White
Write-Host ""
Write-Host "6. Click 'Load More' to load additional articles" -ForegroundColor White
Write-Host ""
Write-Host "📖 For detailed testing guide, see:" -ForegroundColor Cyan
Write-Host "   PHASE4_FRONTEND_TESTING.md" -ForegroundColor White
Write-Host ""

# Ask if user wants to start dev server
Write-Host "Do you want to start the frontend dev server now? (Y/N): " -ForegroundColor Yellow -NoNewline
$response = Read-Host

if ($response -eq "Y" -or $response -eq "y") {
    Write-Host ""
    Write-Host "🚀 Starting frontend dev server..." -ForegroundColor Green
    Write-Host ""
    npm run dev
} else {
    Write-Host ""
    Write-Host "👋 Run 'npm run dev' when you're ready!" -ForegroundColor Cyan
}

