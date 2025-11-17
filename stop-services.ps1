# 停止服务脚本
# 停止占用 8000 和 3000 端口的进程

Write-Host "🛑 停止前后端服务..." -ForegroundColor Cyan
Write-Host ""

function Stop-ProcessOnPort {
    param([int]$Port, [string]$ServiceName)
    
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($connection) {
        $processId = $connection.OwningProcess
        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        
        if ($process) {
            Write-Host "停止 $ServiceName (PID: $processId, 进程: $($process.ProcessName))..." -ForegroundColor Yellow
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 1
            
            # 验证是否停止
            $stillRunning = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
            if ($stillRunning) {
                Write-Host "   ⚠️  端口 $Port 仍被占用" -ForegroundColor Yellow
            } else {
                Write-Host "   ✅ $ServiceName 已停止" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "端口 $Port ($ServiceName) 未被占用" -ForegroundColor Gray
    }
}

# 停止后端 (端口 8000)
Stop-ProcessOnPort -Port 8000 -ServiceName "后端服务"

# 停止前端 (端口 3000)
Stop-ProcessOnPort -Port 3000 -ServiceName "前端服务"

Write-Host ""
Write-Host "✅ 完成" -ForegroundColor Green
Write-Host ""
Write-Host "按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

