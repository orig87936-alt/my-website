# AWS 部署脚本 - 前端部署到 S3 + CloudFront
# 使用方法: .\scripts\deploy-to-aws.ps1

param(
    [string]$S3Bucket = "",
    [string]$CloudFrontDistributionId = "",
    [switch]$SkipBuild = $false,
    [switch]$SkipInvalidation = $false
)

Write-Host "🚀 AWS 部署脚本" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 检查 AWS CLI
Write-Host "检查 AWS CLI..." -ForegroundColor Yellow
try {
    $awsVersion = aws --version 2>&1
    Write-Host "✅ AWS CLI 已安装: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误: 未安装 AWS CLI" -ForegroundColor Red
    Write-Host "请访问 https://aws.amazon.com/cli/ 下载安装" -ForegroundColor Yellow
    exit 1
}

# 检查 AWS 配置
Write-Host "检查 AWS 配置..." -ForegroundColor Yellow
try {
    $identity = aws sts get-caller-identity 2>&1 | ConvertFrom-Json
    Write-Host "✅ AWS 已配置: $($identity.Arn)" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误: AWS CLI 未配置" -ForegroundColor Red
    Write-Host "请运行: aws configure" -ForegroundColor Yellow
    exit 1
}

# 获取 S3 存储桶名称
if ([string]::IsNullOrEmpty($S3Bucket)) {
    Write-Host ""
    Write-Host "请输入 S3 存储桶名称（例如: sl-news-frontend-20241115）:" -ForegroundColor Cyan
    $S3Bucket = Read-Host
    
    if ([string]::IsNullOrEmpty($S3Bucket)) {
        Write-Host "❌ 错误: S3 存储桶名称不能为空" -ForegroundColor Red
        exit 1
    }
}

# 验证 S3 存储桶是否存在
Write-Host ""
Write-Host "验证 S3 存储桶..." -ForegroundColor Yellow
try {
    aws s3 ls "s3://$S3Bucket" 2>&1 | Out-Null
    Write-Host "✅ S3 存储桶存在: $S3Bucket" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误: S3 存储桶不存在或无权访问: $S3Bucket" -ForegroundColor Red
    exit 1
}

# 构建前端
if (-not $SkipBuild) {
    Write-Host ""
    Write-Host "📦 构建前端..." -ForegroundColor Cyan
    
    # 检查 .env.production 文件
    if (-not (Test-Path ".env.production")) {
        Write-Host "⚠️  警告: .env.production 文件不存在" -ForegroundColor Yellow
        Write-Host "创建默认配置文件..." -ForegroundColor Yellow
        
        @"
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_GOOGLE_CLIENT_ID=your-google-client-id
"@ | Out-File -Encoding UTF8 .env.production
        
        Write-Host "请编辑 .env.production 文件并重新运行脚本" -ForegroundColor Yellow
        exit 1
    }
    
    # 运行构建
    Write-Host "运行 npm run build..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 错误: 构建失败" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ 构建完成" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⏭️  跳过构建步骤" -ForegroundColor Yellow
}

# 检查 build 目录
if (-not (Test-Path "build")) {
    Write-Host "❌ 错误: build 目录不存在" -ForegroundColor Red
    Write-Host "请先运行构建: npm run build" -ForegroundColor Yellow
    exit 1
}

# 上传到 S3
Write-Host ""
Write-Host "📤 上传文件到 S3..." -ForegroundColor Cyan
Write-Host "存储桶: $S3Bucket" -ForegroundColor White

try {
    aws s3 sync build/ "s3://$S3Bucket/" --delete --cache-control "public, max-age=31536000, immutable" --exclude "index.html" --exclude "*.html"
    aws s3 sync build/ "s3://$S3Bucket/" --delete --cache-control "public, max-age=0, must-revalidate" --exclude "*" --include "index.html" --include "*.html"
    
    Write-Host "✅ 文件上传完成" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误: 上传失败" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# CloudFront 缓存失效
if (-not $SkipInvalidation) {
    if ([string]::IsNullOrEmpty($CloudFrontDistributionId)) {
        Write-Host ""
        Write-Host "请输入 CloudFront 分配 ID（例如: E1234567890ABC）:" -ForegroundColor Cyan
        Write-Host "（留空跳过缓存失效）" -ForegroundColor Gray
        $CloudFrontDistributionId = Read-Host
    }
    
    if (-not [string]::IsNullOrEmpty($CloudFrontDistributionId)) {
        Write-Host ""
        Write-Host "🔄 创建 CloudFront 缓存失效..." -ForegroundColor Cyan
        
        try {
            $invalidation = aws cloudfront create-invalidation `
                --distribution-id $CloudFrontDistributionId `
                --paths "/*" 2>&1 | ConvertFrom-Json
            
            Write-Host "✅ 缓存失效已创建: $($invalidation.Invalidation.Id)" -ForegroundColor Green
            Write-Host "状态: $($invalidation.Invalidation.Status)" -ForegroundColor White
        } catch {
            Write-Host "⚠️  警告: 缓存失效创建失败" -ForegroundColor Yellow
            Write-Host $_.Exception.Message -ForegroundColor Yellow
        }
    } else {
        Write-Host ""
        Write-Host "⏭️  跳过 CloudFront 缓存失效" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "⏭️  跳过 CloudFront 缓存失效" -ForegroundColor Yellow
}

# 完成
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "🎉 部署完成！" -ForegroundColor Green
Write-Host ""
Write-Host "S3 网站 URL: http://$S3Bucket.s3-website-$(aws configure get region).amazonaws.com" -ForegroundColor White

if (-not [string]::IsNullOrEmpty($CloudFrontDistributionId)) {
    Write-Host "CloudFront URL: https://$(aws cloudfront get-distribution --id $CloudFrontDistributionId --query 'Distribution.DomainName' --output text)" -ForegroundColor White
}

Write-Host ""
Write-Host "提示: 如果配置了自定义域名，请访问你的域名查看网站" -ForegroundColor Gray
Write-Host ""

