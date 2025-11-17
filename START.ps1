# Quick Start Script - Optimized
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Starting Services" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Function to stop processes on a port
function Stop-PortProcess {
    param([int]$Port)
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    foreach ($conn in $connections) {
        $processId = $conn.OwningProcess
        if ($processId -gt 0) {
            Write-Host "  Stopping process $processId on port $Port..." -ForegroundColor Yellow
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        }
    }
    Start-Sleep -Seconds 1
}

# Step 1: Check and clean ports
Write-Host "1. Checking ports..." -ForegroundColor Yellow

$port8000 = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
if ($port8000) {
    Write-Host "  Port 8000 in use, cleaning..." -ForegroundColor Yellow
    Stop-PortProcess 8000
} else {
    Write-Host "  Port 8000 available" -ForegroundColor Green
}

$port3000 = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($port3000) {
    Write-Host "  Port 3000 in use, cleaning..." -ForegroundColor Yellow
    Stop-PortProcess 3000
} else {
    Write-Host "  Port 3000 available" -ForegroundColor Green
}

Write-Host ""
Write-Host "2. Starting services..." -ForegroundColor Yellow
Write-Host ""

# Start backend
$backendPath = Join-Path $PSScriptRoot "backend"
$pythonExe = Join-Path $backendPath "venv\Scripts\python.exe"

if (-not (Test-Path $pythonExe)) {
    Write-Host "Error: Python virtual environment not found!" -ForegroundColor Red
    Write-Host "Please run: cd backend; python -m venv venv; .\venv\Scripts\activate; pip install -r requirements.txt" -ForegroundColor Yellow
    exit 1
}

Write-Host "  Starting backend (port 8000)..." -ForegroundColor Cyan
$backendCmd = "Set-Location '$backendPath'; & '$pythonExe' -m uvicorn app.main:app --reload --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd -WindowStyle Normal

Start-Sleep -Seconds 2

# Start frontend
Write-Host "  Starting frontend (port 3000)..." -ForegroundColor Cyan
$frontendCmd = "Set-Location '$PSScriptRoot'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd -WindowStyle Normal

Write-Host ""
Write-Host "3. Waiting for services to be ready..." -ForegroundColor Yellow

# Wait for backend
$maxWait = 15
$waited = 0
$backendReady = $false

while ($waited -lt $maxWait) {
    Start-Sleep -Seconds 1
    $waited++
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/" -UseBasicParsing -TimeoutSec 1 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $backendReady = $true
            Write-Host ""
            Write-Host "  Backend ready! ($waited seconds)" -ForegroundColor Green
            break
        }
    } catch {
        Write-Host "." -NoNewline -ForegroundColor Gray
    }
}

if (-not $backendReady) {
    Write-Host ""
    Write-Host "  Backend starting... (may need more time)" -ForegroundColor Yellow
}

# Wait for frontend
$waited = 0
$frontendReady = $false

while ($waited -lt $maxWait) {
    Start-Sleep -Seconds 1
    $waited++
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 1 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $frontendReady = $true
            Write-Host ""
            Write-Host "  Frontend ready! ($waited seconds)" -ForegroundColor Green
            break
        }
    } catch {
        Write-Host "." -NoNewline -ForegroundColor Gray
    }
}

if (-not $frontendReady) {
    Write-Host ""
    Write-Host "  Frontend starting... (may need more time)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "  Services Started!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Access URLs:" -ForegroundColor Cyan
Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:   http://localhost:8000" -ForegroundColor White
Write-Host "  API Docs:  http://localhost:8000/api/docs" -ForegroundColor White
Write-Host ""

# Open browser
if ($frontendReady) {
    Write-Host "Opening browser..." -ForegroundColor Cyan
    Start-Process "http://localhost:3000"
} else {
    Write-Host "Tip: Visit http://localhost:3000 when frontend is ready" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit this window (services will continue running)..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

