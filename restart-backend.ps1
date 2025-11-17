# 重启后端服务脚本

Write-Host "🔄 重启后端服务..." -ForegroundColor Cyan

# 1. 查找并停止现有的后端进程
Write-Host "🛑 停止现有后端进程..." -ForegroundColor Yellow
$processes = Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*uvicorn*" -or $_.CommandLine -like "*app.main*"
}

if ($processes) {
    $processes | ForEach-Object {
        Write-Host "  停止进程 PID: $($_.Id)" -ForegroundColor Gray
        Stop-Process -Id $_.Id -Force
    }
    Start-Sleep -Seconds 2
    Write-Host "✅ 已停止现有进程" -ForegroundColor Green
} else {
    Write-Host "ℹ️ 没有找到运行中的后端进程" -ForegroundColor Gray
}

# 2. 进入后端目录
Set-Location backend

# 3. 激活虚拟环境
Write-Host "🐍 激活虚拟环境..." -ForegroundColor Yellow
if (Test-Path "venv\Scripts\Activate.ps1") {
    .\venv\Scripts\Activate.ps1
} else {
    Write-Host "❌ 错误: 未找到虚拟环境" -ForegroundColor Red
    Write-Host "请先运行: python -m venv venv" -ForegroundColor Yellow
    exit 1
}

# 4. 启动后端
Write-Host "🚀 启动后端服务..." -ForegroundColor Yellow
Write-Host ""
Write-Host "后端将在 http://localhost:8000 运行" -ForegroundColor Cyan
Write-Host "API 文档: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "按 Ctrl+C 停止服务" -ForegroundColor Gray
Write-Host ""

# 启动 uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

