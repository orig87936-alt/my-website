# 开发环境启动脚本
# 同时启动后端和前端服务

Write-Host "🚀 启动开发环境..." -ForegroundColor Cyan
Write-Host ""

# 检查后端是否已经在运行
$backendRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/docs" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        $backendRunning = $true
        Write-Host "✅ 后端服务已在运行 (http://localhost:8000)" -ForegroundColor Green
    }
} catch {
    Write-Host "⏳ 后端服务未运行，准备启动..." -ForegroundColor Yellow
}

# 检查前端是否已经在运行
$frontendRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        $frontendRunning = $true
        Write-Host "✅ 前端服务已在运行 (http://localhost:3000)" -ForegroundColor Green
    }
} catch {
    Write-Host "⏳ 前端服务未运行，准备启动..." -ForegroundColor Yellow
}

Write-Host ""

# 启动后端（如果未运行）
if (-not $backendRunning) {
    Write-Host "🔧 启动后端服务..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\activate; uvicorn app.main:app --reload --port 8000"
    Write-Host "⏳ 等待后端启动..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
}

# 启动前端（如果未运行）
if (-not $frontendRunning) {
    Write-Host "🎨 启动前端服务..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
    Write-Host "⏳ 等待前端启动..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}

Write-Host ""
Write-Host "✨ 开发环境启动完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📍 访问地址：" -ForegroundColor Cyan
Write-Host "   前端：http://localhost:3000" -ForegroundColor White
Write-Host "   后端 API 文档：http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "🔑 管理员登录：" -ForegroundColor Cyan
Write-Host "   用户名：admin" -ForegroundColor White
Write-Host "   密码：（你的管理员密码）" -ForegroundColor White
Write-Host ""
Write-Host "📝 新闻管理：" -ForegroundColor Cyan
Write-Host "   1. 登录后点击右上角菜单" -ForegroundColor White
Write-Host "   2. 在'管理'部分点击'新闻管理'" -ForegroundColor White
Write-Host "   3. 开始创建和管理文章！" -ForegroundColor White
Write-Host ""
Write-Host "📖 详细测试指南：请查看 NEWS_ADMIN_TESTING_GUIDE.md" -ForegroundColor Yellow
Write-Host ""

# 打开浏览器
Write-Host "🌐 正在打开浏览器..." -ForegroundColor Cyan
Start-Sleep -Seconds 2
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "✅ 完成！按任意键退出..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

