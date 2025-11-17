# Docker 启动脚本
# 使用 Docker Compose 启动完整的开发环境

Write-Host "🐳 使用 Docker 启动开发环境..." -ForegroundColor Cyan
Write-Host ""

# 检查 Docker 是否运行
Write-Host "检查 Docker 状态..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✅ Docker 正在运行" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker 未运行，请先启动 Docker Desktop" -ForegroundColor Red
    Write-Host ""
    Write-Host "请执行以下步骤：" -ForegroundColor Yellow
    Write-Host "1. 打开 Docker Desktop" -ForegroundColor White
    Write-Host "2. 等待 Docker 启动完成" -ForegroundColor White
    Write-Host "3. 重新运行此脚本" -ForegroundColor White
    exit 1
}

Write-Host ""

# 检查 .env 文件
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  未找到 .env 文件，从 .env.example 复制..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ 已创建 .env 文件，请编辑并填入 API 密钥" -ForegroundColor Green
    Write-Host ""
}

# 检查必需的环境变量
Write-Host "检查环境变量..." -ForegroundColor Yellow
$envContent = Get-Content ".env" -Raw

$missingVars = @()
if ($envContent -notmatch "DEEPSEEK_API_KEY=sk-") {
    $missingVars += "DEEPSEEK_API_KEY"
}
if ($envContent -notmatch "OPENAI_API_KEY=sk-") {
    $missingVars += "OPENAI_API_KEY"
}

if ($missingVars.Count -gt 0) {
    Write-Host "⚠️  缺少以下环境变量：" -ForegroundColor Yellow
    $missingVars | ForEach-Object { Write-Host "   - $_" -ForegroundColor White }
    Write-Host ""
    Write-Host "请编辑 .env 文件并填入正确的 API 密钥" -ForegroundColor Yellow
    Write-Host "然后重新运行此脚本" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "按 Enter 继续（将使用默认值）或 Ctrl+C 退出"
}

Write-Host ""

# 停止并删除旧容器
Write-Host "清理旧容器..." -ForegroundColor Yellow
docker-compose down 2>$null

Write-Host ""

# 构建并启动容器
Write-Host "构建并启动容器..." -ForegroundColor Cyan
Write-Host "这可能需要几分钟时间（首次运行）..." -ForegroundColor Yellow
Write-Host ""

docker-compose up --build -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ 容器启动成功！" -ForegroundColor Green
    Write-Host ""
    
    # 等待服务就绪
    Write-Host "等待服务启动..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    # 运行数据库迁移
    Write-Host ""
    Write-Host "运行数据库迁移..." -ForegroundColor Cyan
    docker-compose exec -T backend alembic upgrade head
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "🎉 开发环境已启动！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "服务地址：" -ForegroundColor Yellow
    Write-Host "  前端: http://localhost:3000" -ForegroundColor White
    Write-Host "  后端: http://localhost:8000" -ForegroundColor White
    Write-Host "  API 文档: http://localhost:8000/docs" -ForegroundColor White
    Write-Host "  数据库: localhost:5432" -ForegroundColor White
    Write-Host ""
    Write-Host "管理员账号：" -ForegroundColor Yellow
    Write-Host "  用户名: admin" -ForegroundColor White
    Write-Host "  密码: admin123" -ForegroundColor White
    Write-Host ""
    Write-Host "常用命令：" -ForegroundColor Yellow
    Write-Host "  查看日志: docker-compose logs -f" -ForegroundColor White
    Write-Host "  停止服务: docker-compose down" -ForegroundColor White
    Write-Host "  重启服务: docker-compose restart" -ForegroundColor White
    Write-Host "  查看状态: docker-compose ps" -ForegroundColor White
    Write-Host ""
    
    # 打开浏览器
    Write-Host "正在打开浏览器..." -ForegroundColor Cyan
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:3000"
    Start-Process "http://localhost:8000/docs"
    
} else {
    Write-Host ""
    Write-Host "❌ 容器启动失败" -ForegroundColor Red
    Write-Host ""
    Write-Host "请检查错误信息并尝试以下操作：" -ForegroundColor Yellow
    Write-Host "1. 确保 Docker Desktop 正在运行" -ForegroundColor White
    Write-Host "2. 确保端口 3000、8000、5432 未被占用" -ForegroundColor White
    Write-Host "3. 查看详细日志: docker-compose logs" -ForegroundColor White
    Write-Host ""
}

