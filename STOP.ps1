# Stop Services Script
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Stopping Services" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Function to stop processes on a port
function Stop-PortProcess {
    param(
        [int]$Port,
        [string]$ServiceName
    )
    
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    
    if ($connections) {
        $processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        
        foreach ($processId in $processIds) {
            if ($processId -gt 0) {
                try {
                    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                    if ($process) {
                        Write-Host "  Stopping $ServiceName (PID $processId - $($process.ProcessName))..." -ForegroundColor Yellow
                        Stop-Process -Id $processId -Force
                        Write-Host "  $ServiceName stopped" -ForegroundColor Green
                    }
                } catch {
                    Write-Host "  Cannot stop process $processId" -ForegroundColor Red
                }
            }
        }
    } else {
        Write-Host "  $ServiceName not running" -ForegroundColor Gray
    }
}

# Stop backend
Write-Host "Stopping backend (port 8000)..." -ForegroundColor Cyan
Stop-PortProcess -Port 8000 -ServiceName "Backend"

Write-Host ""

# Stop frontend
Write-Host "Stopping frontend (port 3000)..." -ForegroundColor Cyan
Stop-PortProcess -Port 3000 -ServiceName "Frontend"

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "  All Services Stopped" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

Start-Sleep -Seconds 2

