# 域名配置自动化脚本
# 使用方法: .\update-domain-config.ps1 -Domain "yourdomain.com" [-ApiDomain "api.yourdomain.com"]

param(
    [Parameter(Mandatory=$true)]
    [string]$Domain,
    
    [Parameter(Mandatory=$false)]
    [string]$ApiDomain = "",
    
    [Parameter(Mandatory=$false)]
    [string]$EmailFrom = ""
)

$SERVER_IP = "18.221.125.254"
$SSH_KEY = "D:\download\sl-news-key.pem"

Write-Host "🌐 域名配置自动化脚本" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# 如果没有提供 API 域名，使用 EC2 IP
if ([string]::IsNullOrEmpty($ApiDomain)) {
    $ApiUrl = "http://${SERVER_IP}:8000"
    Write-Host "⚠️  未提供 API 域名，将使用 EC2 IP: $ApiUrl" -ForegroundColor Yellow
} else {
    $ApiUrl = "https://${ApiDomain}"
    Write-Host "✅ 使用自定义 API 域名: $ApiUrl" -ForegroundColor Green
}

# 如果没有提供邮件地址，使用默认
if ([string]::IsNullOrEmpty($EmailFrom)) {
    $EmailFrom = "noreply@${Domain}"
}

Write-Host ""
Write-Host "📋 配置信息:" -ForegroundColor Cyan
Write-Host "  前端域名: https://${Domain}" -ForegroundColor White
Write-Host "  前端域名 (www): https://www.${Domain}" -ForegroundColor White
Write-Host "  后端 API: $ApiUrl" -ForegroundColor White
Write-Host "  邮件地址: $EmailFrom" -ForegroundColor White
Write-Host ""

# 确认
$confirm = Read-Host "是否继续? (y/n)"
if ($confirm -ne "y") {
    Write-Host "❌ 已取消" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "第 1 步: 更新服务器后端配置" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# 构建 CORS_ORIGINS
$corsOrigins = "https://${Domain},https://www.${Domain},http://localhost:5173,http://localhost:3000"

# 更新服务器上的 .env 文件
$updateBackendCommand = @"
cd /home/ubuntu/backend && \
cp .env .env.backup.\$(date +%Y%m%d_%H%M%S) && \
sed -i 's|CORS_ORIGINS=.*|CORS_ORIGINS=${corsOrigins}|g' .env && \
sed -i 's|FRONTEND_URL=.*|FRONTEND_URL=https://${Domain}|g' .env && \
sed -i 's|EMAIL_FROM=.*|EMAIL_FROM=${EmailFrom}|g' .env && \
echo '✅ 后端配置已更新' && \
echo '' && \
echo '📋 更新后的配置:' && \
grep -E 'CORS_ORIGINS|FRONTEND_URL|EMAIL_FROM' .env
"@

Write-Host "📝 更新后端 .env 文件..." -ForegroundColor Yellow
ssh -i $SSH_KEY ubuntu@$SERVER_IP $updateBackendCommand

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 更新后端配置失败" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔄 重启后端服务..." -ForegroundColor Yellow

$restartCommand = @"
sudo systemctl restart sl-news-backend && \
echo '✅ 后端服务已重启' && \
sleep 3 && \
sudo systemctl status sl-news-backend --no-pager | head -15
"@

ssh -i $SSH_KEY ubuntu@$SERVER_IP $restartCommand

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  后端服务重启可能失败，请手动检查" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "第 2 步: 更新本地前端配置" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# 更新本地 .env.production 文件
$envProductionPath = ".env.production"

if (Test-Path $envProductionPath) {
    # 备份
    Copy-Item $envProductionPath "${envProductionPath}.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    
    # 读取文件
    $content = Get-Content $envProductionPath
    
    # 更新 VITE_API_BASE_URL
    $content = $content -replace 'VITE_API_BASE_URL=.*', "VITE_API_BASE_URL=$ApiUrl"
    
    # 写回文件
    $content | Set-Content $envProductionPath
    
    Write-Host "✅ 前端配置已更新: $envProductionPath" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 更新后的配置:" -ForegroundColor Cyan
    Get-Content $envProductionPath | Select-String "VITE_API_BASE_URL"
} else {
    Write-Host "⚠️  未找到 .env.production 文件" -ForegroundColor Yellow
    Write-Host "请手动创建并添加: VITE_API_BASE_URL=$ApiUrl" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "✅ 自动化配置完成!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📝 接下来需要手动完成的步骤:" -ForegroundColor Yellow
Write-Host ""

Write-Host "1️⃣  重新构建并部署前端:" -ForegroundColor Cyan
Write-Host "   npm run build" -ForegroundColor White
Write-Host "   aws s3 sync build/ s3://sl-news-frontend-20241115/ --delete" -ForegroundColor White
Write-Host "   aws cloudfront create-invalidation --distribution-id YOUR_ID --paths '/*'" -ForegroundColor White
Write-Host ""

Write-Host "2️⃣  配置 CloudFront (AWS 控制台):" -ForegroundColor Cyan
Write-Host "   - 进入 CloudFront → 你的分发 → 编辑" -ForegroundColor White
Write-Host "   - 备用域名 (CNAME): ${Domain}, www.${Domain}" -ForegroundColor White
Write-Host "   - 自定义 SSL 证书: 选择你的证书" -ForegroundColor White
Write-Host ""

Write-Host "3️⃣  申请 SSL 证书 (AWS Certificate Manager):" -ForegroundColor Cyan
Write-Host "   - 区域: us-east-1 (必须)" -ForegroundColor White
Write-Host "   - 域名: ${Domain}, *.${Domain}" -ForegroundColor White
Write-Host "   - 验证方法: DNS 验证" -ForegroundColor White
Write-Host ""

Write-Host "4️⃣  配置 DNS (你的域名提供商):" -ForegroundColor Cyan
Write-Host "   前端域名:" -ForegroundColor White
Write-Host "   - 类型: CNAME" -ForegroundColor White
Write-Host "   - 名称: @" -ForegroundColor White
Write-Host "   - 值: [CloudFront 分发域名]" -ForegroundColor White
Write-Host ""
Write-Host "   - 类型: CNAME" -ForegroundColor White
Write-Host "   - 名称: www" -ForegroundColor White
Write-Host "   - 值: [CloudFront 分发域名]" -ForegroundColor White
Write-Host ""

if (-not [string]::IsNullOrEmpty($ApiDomain)) {
    Write-Host "   后端 API 域名:" -ForegroundColor White
    Write-Host "   - 类型: A" -ForegroundColor White
    Write-Host "   - 名称: api" -ForegroundColor White
    Write-Host "   - 值: ${SERVER_IP}" -ForegroundColor White
    Write-Host ""
    
    Write-Host "5️⃣  配置后端 SSL (在服务器上):" -ForegroundColor Cyan
    Write-Host "   ssh -i `"$SSH_KEY`" ubuntu@${SERVER_IP}" -ForegroundColor White
    Write-Host "   sudo nano /etc/nginx/sites-available/sl-news-backend" -ForegroundColor White
    Write-Host "   # 修改 server_name 为: ${ApiDomain}" -ForegroundColor White
    Write-Host "   sudo nginx -t" -ForegroundColor White
    Write-Host "   sudo systemctl restart nginx" -ForegroundColor White
    Write-Host "   sudo certbot --nginx -d ${ApiDomain}" -ForegroundColor White
    Write-Host ""
}

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "📖 详细说明请查看: DOMAIN_SETUP_GUIDE.md" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ 配置脚本执行完成!" -ForegroundColor Green

