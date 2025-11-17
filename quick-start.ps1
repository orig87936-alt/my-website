# 快速启动脚本 - 无检查版本
# 适用于依赖已安装、端口未被占用的情况

Write-Host "🚀 快速启动前后端服务..." -ForegroundColor Cyan
Write-Host ""

$backendPath = Join-Path $PSScriptRoot "backend"
$pythonExe = Join-Path $backendPath "venv\Scripts\python.exe"

# 启动后端
Write-Host "启动后端 (http://localhost:8000)..." -ForegroundColor Yellow
$backendCmd = "cd '$backendPath'; & '$pythonExe' -m uvicorn app.main:app --reload --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd

Start-Sleep -Seconds 2

# 启动前端
Write-Host "启动前端 (http://localhost:3000)..." -ForegroundColor Yellow
$frontendCmd = "cd '$PSScriptRoot'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "✅ 服务启动中..." -ForegroundColor Green
Write-Host ""
Write-Host "📍 访问地址：" -ForegroundColor Cyan
Write-Host "   前端：http://localhost:3000" -ForegroundColor White
Write-Host "   后端：http://localhost:8000/docs" -ForegroundColor White
Write-Host ""

# 等待几秒后打开浏览器
Start-Sleep -Seconds 5
Start-Process "http://localhost:3000"

Write-Host "浏览器已打开，按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

