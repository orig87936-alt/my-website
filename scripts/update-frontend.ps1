# 前端更新脚本
# 用法: .\scripts\update-frontend.ps1

param(
    [string]$S3Bucket = $env:S3_BUCKET_NAME,
    [string]$CloudFrontDistributionId = $env:CLOUDFRONT_DISTRIBUTION_ID
)

Write-Host "🚀 开始更新前端..." -ForegroundColor Cyan

# 检查必需的环境变量
if (-not $S3Bucket) {
    Write-Host "❌ 错误: 未设置 S3_BUCKET_NAME 环境变量" -ForegroundColor Red
    Write-Host "请运行: `$env:S3_BUCKET_NAME='your-bucket-name'" -ForegroundColor Yellow
    exit 1
}

if (-not $CloudFrontDistributionId) {
    Write-Host "❌ 错误: 未设置 CLOUDFRONT_DISTRIBUTION_ID 环境变量" -ForegroundColor Red
    Write-Host "请运行: `$env:CLOUDFRONT_DISTRIBUTION_ID='your-distribution-id'" -ForegroundColor Yellow
    exit 1
}

# 1. 检查 AWS CLI
Write-Host "🔍 检查 AWS CLI..." -ForegroundColor Yellow
try {
    aws --version | Out-Null
} catch {
    Write-Host "❌ 错误: 未安装 AWS CLI" -ForegroundColor Red
    Write-Host "请访问: https://aws.amazon.com/cli/" -ForegroundColor Yellow
    exit 1
}

# 2. 拉取最新代码
Write-Host "📥 拉取最新代码..." -ForegroundColor Yellow
git pull origin main

# 3. 安装依赖
Write-Host "📦 安装依赖..." -ForegroundColor Yellow
npm install

# 4. 构建前端
Write-Host "🏗️ 构建前端..." -ForegroundColor Yellow
npm run build

if (-not (Test-Path "build")) {
    Write-Host "❌ 错误: 构建失败，未找到 build 目录" -ForegroundColor Red
    exit 1
}

# 5. 上传到 S3
Write-Host "☁️ 上传到 S3..." -ForegroundColor Yellow
aws s3 sync build/ "s3://$S3Bucket/" --delete

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 错误: S3 上传失败" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 文件已上传到 S3" -ForegroundColor Green

# 6. 清除 CloudFront 缓存
Write-Host "🔄 清除 CloudFront 缓存..." -ForegroundColor Yellow
$invalidation = aws cloudfront create-invalidation `
    --distribution-id $CloudFrontDistributionId `
    --paths "/*" | ConvertFrom-Json

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 错误: CloudFront 缓存清除失败" -ForegroundColor Red
    exit 1
}

$invalidationId = $invalidation.Invalidation.Id
Write-Host "✅ CloudFront 缓存清除已启动" -ForegroundColor Green
Write-Host "Invalidation ID: $invalidationId" -ForegroundColor Gray

# 7. 等待缓存清除完成（可选）
Write-Host "⏳ 等待缓存清除完成（通常需要 1-5 分钟）..." -ForegroundColor Yellow
Write-Host "你可以按 Ctrl+C 跳过等待，缓存清除会在后台继续进行" -ForegroundColor Gray

$maxWait = 300  # 最多等待 5 分钟
$waited = 0
$interval = 10

while ($waited -lt $maxWait) {
    Start-Sleep -Seconds $interval
    $waited += $interval
    
    $status = aws cloudfront get-invalidation `
        --distribution-id $CloudFrontDistributionId `
        --id $invalidationId | ConvertFrom-Json
    
    $currentStatus = $status.Invalidation.Status
    
    if ($currentStatus -eq "Completed") {
        Write-Host "✅ CloudFront 缓存清除完成！" -ForegroundColor Green
        break
    }
    
    Write-Host "⏳ 状态: $currentStatus (已等待 $waited 秒)" -ForegroundColor Gray
}

if ($waited -ge $maxWait) {
    Write-Host "⚠️ 等待超时，但缓存清除会在后台继续进行" -ForegroundColor Yellow
}

# 8. 显示部署信息
Write-Host ""
Write-Host "🎉 前端更新完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📊 部署信息:" -ForegroundColor Cyan
Write-Host "  S3 Bucket: $S3Bucket" -ForegroundColor Gray
Write-Host "  CloudFront Distribution: $CloudFrontDistributionId" -ForegroundColor Gray
Write-Host "  Invalidation ID: $invalidationId" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 请访问你的网站验证更新" -ForegroundColor Cyan

