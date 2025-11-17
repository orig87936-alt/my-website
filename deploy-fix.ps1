# 快速部署修复脚本
# 用于将 main.py 的 CSP 修复部署到 EC2

Write-Host "🚀 开始部署 CSP 修复..." -ForegroundColor Green

# 1. 上传修复后的文件到 EC2
Write-Host "`n📤 上传 main.py 到 EC2..." -ForegroundColor Cyan
scp -i sl-news-key.pem backend/app/main.py ubuntu@18.221.125.254:/home/ubuntu/sl-news-platform/backend/app/main.py

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 文件上传成功" -ForegroundColor Green
} else {
    Write-Host "❌ 文件上传失败" -ForegroundColor Red
    exit 1
}

# 2. 重启后端服务
Write-Host "`n🔄 重启后端服务..." -ForegroundColor Cyan
ssh -i sl-news-key.pem ubuntu@18.221.125.254 "sudo systemctl restart sl-news-backend"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 服务重启成功" -ForegroundColor Green
} else {
    Write-Host "❌ 服务重启失败" -ForegroundColor Red
    exit 1
}

# 3. 等待服务启动
Write-Host "`n⏳ 等待服务启动（5秒）..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# 4. 检查服务状态
Write-Host "`n🔍 检查服务状态..." -ForegroundColor Cyan
ssh -i sl-news-key.pem ubuntu@18.221.125.254 "sudo systemctl status sl-news-backend --no-pager"

Write-Host "`n✅ 部署完成！" -ForegroundColor Green
Write-Host "`n📝 请在浏览器中访问：" -ForegroundColor Yellow
Write-Host "   http://18.221.125.254:8000/api/docs" -ForegroundColor Cyan

