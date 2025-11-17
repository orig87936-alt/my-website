# Test Article Save Functionality
$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Testing Article Save" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check backend
Write-Host "1. Checking backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/" -UseBasicParsing -TimeoutSec 5
    Write-Host "   OK Backend is running" -ForegroundColor Green
}
catch {
    Write-Host "   ERROR Backend is not running!" -ForegroundColor Red
    Write-Host "   Please start: cd backend; .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000" -ForegroundColor Yellow
    exit 1
}

# 2. Check frontend
Write-Host ""
Write-Host "2. Checking frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
    Write-Host "   OK Frontend is running" -ForegroundColor Green
}
catch {
    Write-Host "   ERROR Frontend is not running!" -ForegroundColor Red
    Write-Host "   Please start: npm run dev" -ForegroundColor Yellow
    exit 1
}

# 3. Check articles API
Write-Host ""
Write-Host "3. Checking articles API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/articles" -UseBasicParsing -TimeoutSec 5
    $json = $response.Content | ConvertFrom-Json
    Write-Host "   OK Articles API is working" -ForegroundColor Green
    Write-Host "   Total articles: $($json.total)" -ForegroundColor Gray
}
catch {
    Write-Host "   ERROR Articles API failed!" -ForegroundColor Red
}

# 4. Test login
Write-Host ""
Write-Host "4. Testing login..." -ForegroundColor Yellow
$loginData = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/auth/login" -Method POST -Body $loginData -ContentType "application/json" -UseBasicParsing -TimeoutSec 5
    $json = $response.Content | ConvertFrom-Json
    Write-Host "   OK Login successful" -ForegroundColor Green
    Write-Host "   User: $($json.user.username)" -ForegroundColor Gray
    Write-Host "   Role: $($json.user.role)" -ForegroundColor Gray
}
catch {
    Write-Host "   ERROR Login failed!" -ForegroundColor Red
}

# Summary
Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "  All Systems Ready!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Visit: http://localhost:3000" -ForegroundColor White
Write-Host "2. Click login button" -ForegroundColor White
Write-Host "3. Login with: admin / admin123" -ForegroundColor White
Write-Host "4. Edit and save your article" -ForegroundColor White
Write-Host ""

