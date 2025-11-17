# 快速修复后端 502 错误
# 使用方法: .\quick-fix-backend.ps1

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Blue
Write-Host "🚀 快速修复后端服务" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

$SERVER = "ubuntu@182.221.125.254"

# 步骤 1: 杀掉所有旧进程
Write-Host "1️⃣ 清理旧进程..." -ForegroundColor Yellow
ssh $SERVER 'sudo pkill -9 -f uvicorn; sudo fuser -k 8000/tcp 2>/dev/null; sleep 2'
Write-Host "✅ 旧进程已清理" -ForegroundColor Green
Write-Host ""

# 步骤 2: 确保防火墙规则
Write-Host "2️⃣ 检查防火墙..." -ForegroundColor Yellow
ssh $SERVER 'sudo ufw allow 8000/tcp 2>/dev/null'
Write-Host "✅ 防火墙规则已设置" -ForegroundColor Green
Write-Host ""

# 步骤 3: 确保 .env 文件存在
Write-Host "3️⃣ 检查配置文件..." -ForegroundColor Yellow
ssh $SERVER 'cd /home/ubuntu/backend; if [ ! -f .env ]; then cp .env.production .env 2>/dev/null; fi'
Write-Host "✅ 配置文件已就绪" -ForegroundColor Green
Write-Host ""

# 步骤 4: 启动服务器（使用 nohup 后台运行）
Write-Host "4️⃣ 启动后端服务..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 正在启动 uvicorn..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 使用 nohup 在后台启动
ssh $SERVER 'cd /home/ubuntu/backend; source venv/bin/activate; nohup python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > uvicorn.log 2>&1 & echo $! > uvicorn.pid; sleep 3'

Write-Host "✅ 后端服务已启动" -ForegroundColor Green
Write-Host ""

# 步骤 5: 检查服务状态
Write-Host "5️⃣ 检查服务状态..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

$healthCheck = ssh $SERVER 'curl -s http://localhost:8000/health 2>/dev/null'
if ($healthCheck -match "healthy") {
    Write-Host "✅ 后端服务运行正常！" -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host "🎉 修复成功！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host ""
    Write-Host "📝 访问地址:" -ForegroundColor Yellow
    Write-Host "  • API 文档: http://182.221.125.254:8000/api/docs" -ForegroundColor Cyan
    Write-Host "  • 健康检查: http://182.221.125.254:8000/health" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📊 查看日志:" -ForegroundColor Yellow
    Write-Host "  ssh $SERVER 'tail -f /home/ubuntu/backend/uvicorn.log'" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "⚠️  服务可能还在启动中..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 查看日志:" -ForegroundColor Yellow
    Write-Host "  ssh $SERVER 'tail -f /home/ubuntu/backend/uvicorn.log'" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🔍 检查进程:" -ForegroundColor Yellow
    Write-Host "  ssh $SERVER 'ps aux | grep uvicorn'" -ForegroundColor Cyan
    Write-Host ""
    
    # 显示最后几行日志
    Write-Host "📋 最近的日志:" -ForegroundColor Yellow
    ssh $SERVER 'tail -20 /home/ubuntu/backend/uvicorn.log 2>/dev/null'
}

Write-Host ""
Write-Host "💡 提示: 如果还是看不到，请等待 10 秒后刷新浏览器" -ForegroundColor Yellow
Write-Host ""

