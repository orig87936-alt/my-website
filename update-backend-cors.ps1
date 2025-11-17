# 更新 EC2 后端的 CORS 配置
# 使用方法: .\update-backend-cors.ps1

$EC2_IP = "18.221.125.254"
$S3_WEBSITE = "http://sl-news-frontend.s3-website.us-east-2.amazonaws.com"

Write-Host "🔧 更新后端 CORS 配置..." -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 需要手动执行以下步骤:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣ SSH 连接到 EC2:" -ForegroundColor Green
Write-Host "   ssh -i your-key.pem ubuntu@$EC2_IP" -ForegroundColor White
Write-Host ""
Write-Host "2️⃣ 编辑后端 .env 文件:" -ForegroundColor Green
Write-Host "   cd /home/ubuntu/backend" -ForegroundColor White
Write-Host "   nano .env" -ForegroundColor White
Write-Host ""
Write-Host "3️⃣ 找到 CORS_ORIGINS 行，添加 S3 网站地址:" -ForegroundColor Green
Write-Host "   CORS_ORIGINS=http://localhost:5173,http://localhost:3000,$S3_WEBSITE" -ForegroundColor White
Write-Host ""
Write-Host "4️⃣ 保存文件 (Ctrl+O, Enter, Ctrl+X)" -ForegroundColor Green
Write-Host ""
Write-Host "5️⃣ 重启后端服务:" -ForegroundColor Green
Write-Host "   sudo systemctl restart backend" -ForegroundColor White
Write-Host ""
Write-Host "6️⃣ 检查服务状态:" -ForegroundColor Green
Write-Host "   sudo systemctl status backend" -ForegroundColor White
Write-Host ""
Write-Host "✅ 完成后，你的前端就能连接到后端了！" -ForegroundColor Cyan

