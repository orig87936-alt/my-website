# 部署脚本 - Gmail SMTP 邮件功能 (PowerShell)
# 使用方法: .\deploy.ps1

Write-Host "🚀 开始部署 Gmail SMTP 邮件功能..." -ForegroundColor Green
Write-Host ("="*60)

# 1. 检查当前目录
if (-not (Test-Path "backend")) {
    Write-Host "❌ 错误: 请在项目根目录运行此脚本" -ForegroundColor Red
    exit 1
}

# 2. 进入 backend 目录
Set-Location backend

# 3. 安装依赖
Write-Host ""
Write-Host "📦 安装依赖..." -ForegroundColor Cyan
pip install aiosmtplib==3.0.1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 依赖安装失败" -ForegroundColor Red
    exit 1
}

# 4. 检查 .env 配置
Write-Host ""
Write-Host "🔍 检查 .env 配置..." -ForegroundColor Cyan

if (-not (Test-Path ".env")) {
    Write-Host "❌ 错误: .env 文件不存在" -ForegroundColor Red
    exit 1
}

$envContent = Get-Content .env -Raw
if ($envContent -notmatch "SMTP_HOST") {
    Write-Host "⚠️  警告: .env 文件中缺少 SMTP 配置" -ForegroundColor Yellow
    Write-Host "请手动添加以下配置到 .env 文件:"
    Write-Host ""
    Write-Host "# Gmail SMTP Configuration"
    Write-Host "SMTP_HOST=smtp.gmail.com"
    Write-Host "SMTP_PORT=587"
    Write-Host "SMTP_USER=zeno.wangzeyu@gmail.com"
    Write-Host "SMTP_PASSWORD=qxngmgfsqelgxjfm"
    Write-Host "ADMIN_NOTIFICATION_EMAIL=orig87936@gmail.com"
    Write-Host ""
    Read-Host "配置完成后按回车继续"
}

# 5. 运行测试
Write-Host ""
Write-Host "🧪 运行邮件功能测试..." -ForegroundColor Cyan
python test_smtp_email.py

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 测试失败" -ForegroundColor Red
    exit 1
}

# 6. 询问是否启动服务
Write-Host ""
Write-Host ("="*60)
$restart = Read-Host "测试通过！是否启动后端服务？(y/n)"

if ($restart -eq "y" -or $restart -eq "Y") {
    Write-Host "🚀 启动后端服务..." -ForegroundColor Green
    Write-Host ""
    Write-Host "服务将在后台运行..."
    Write-Host "访问 http://localhost:8000/health 检查服务状态"
    Write-Host "访问 http://localhost:8000/api/docs 查看 API 文档"
    Write-Host ""
    Write-Host "按 Ctrl+C 停止服务"
    Write-Host ""
    
    # 启动服务
    python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
}

Write-Host ""
Write-Host ("="*60)
Write-Host "✅ 部署完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📧 邮件配置:"
Write-Host "  发件邮箱: zeno.wangzeyu@gmail.com"
Write-Host "  管理员邮箱: orig87936@gmail.com"
Write-Host ""
Write-Host "🎯 下一步:"
Write-Host "  1. 通过前端提交测试预约"
Write-Host "  2. 检查邮箱是否收到邮件"
Write-Host "  3. 验证邮件内容是否正确"
Write-Host ""
Write-Host "📚 详细文档: DEPLOYMENT_GUIDE.md"
Write-Host ("="*60)

