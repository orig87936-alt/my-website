# 🚀 上传前端到 S3
# 快速上传脚本

Write-Host "🚀 开始上传前端到 S3..." -ForegroundColor Cyan
Write-Host ""

# S3 配置
$S3_BUCKET = "sl-news-frontend-20241115"
$BUILD_DIR = "build"

# 1. 检查 build 目录
if (-not (Test-Path $BUILD_DIR)) {
    Write-Host "❌ 错误: build 目录不存在" -ForegroundColor Red
    Write-Host "请先运行: npm run build" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ 找到 build 目录" -ForegroundColor Green

# 2. 上传到 S3
Write-Host ""
Write-Host "📤 上传文件到 S3..." -ForegroundColor Yellow
aws s3 sync $BUILD_DIR s3://$S3_BUCKET/ --delete --cache-control "public, max-age=31536000" --exclude "index.html"

# 3. 单独上传 index.html (不缓存)
Write-Host ""
Write-Host "📤 上传 index.html (无缓存)..." -ForegroundColor Yellow
aws s3 cp "$BUILD_DIR/index.html" "s3://$S3_BUCKET/index.html" --cache-control "no-cache, no-store, must-revalidate"

# 4. 完成
Write-Host ""
Write-Host "✅ 上传完成！" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 网站地址: http://sl-news-frontend.s3-website.us-east-2.amazonaws.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 提示: 请等待 1-2 分钟让 S3 更新缓存" -ForegroundColor Gray

