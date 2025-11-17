# AWS CLI 配置向导
# 此脚本帮助你配置 AWS CLI 访问凭证

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AWS CLI 配置向导" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 AWS CLI 是否已安装
Write-Host "🔍 检查 AWS CLI 安装状态..." -ForegroundColor Yellow
try {
    $awsVersion = aws --version 2>&1
    Write-Host "✅ AWS CLI 已安装: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ AWS CLI 未安装" -ForegroundColor Red
    Write-Host ""
    Write-Host "请先安装 AWS CLI:" -ForegroundColor Yellow
    Write-Host "1. 运行 install-aws-cli.ps1 脚本" -ForegroundColor White
    Write-Host "2. 或访问: https://awscli.amazonaws.com/AWSCLIV2.msi" -ForegroundColor White
    Write-Host ""
    pause
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  配置 AWS 访问凭证" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 你需要准备以下信息:" -ForegroundColor Yellow
Write-Host "   1. AWS Access Key ID (从 IAM 用户获取)" -ForegroundColor White
Write-Host "   2. AWS Secret Access Key (从 IAM 用户获取)" -ForegroundColor White
Write-Host "   3. 默认区域 (推荐: us-east-1)" -ForegroundColor White
Write-Host ""

Write-Host "💡 如何获取访问密钥:" -ForegroundColor Cyan
Write-Host "   1. 登录 AWS 控制台: https://console.aws.amazon.com/" -ForegroundColor Gray
Write-Host "   2. 进入 IAM 服务" -ForegroundColor Gray
Write-Host "   3. 点击 '用户' → '创建用户' (如果还没有)" -ForegroundColor Gray
Write-Host "   4. 用户名: sl-news-deployer" -ForegroundColor Gray
Write-Host "   5. 附加策略: AdministratorAccess" -ForegroundColor Gray
Write-Host "   6. 创建访问密钥 → 下载 CSV 文件" -ForegroundColor Gray
Write-Host ""

$continue = Read-Host "是否已经准备好访问密钥? (y/n)"
if ($continue -ne 'y' -and $continue -ne 'Y') {
    Write-Host ""
    Write-Host "请先创建 IAM 用户并获取访问密钥，然后重新运行此脚本" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 0
}

Write-Host ""
Write-Host "🔧 开始配置..." -ForegroundColor Yellow
Write-Host ""

# 运行 aws configure
Write-Host "请按照提示输入以下信息:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  AWS Access Key ID: 从 CSV 文件中复制" -ForegroundColor Gray
Write-Host "  AWS Secret Access Key: 从 CSV 文件中复制" -ForegroundColor Gray
Write-Host "  Default region name: us-east-1 (推荐)" -ForegroundColor Gray
Write-Host "  Default output format: json (推荐)" -ForegroundColor Gray
Write-Host ""

aws configure

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  验证配置" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔍 验证 AWS 凭证..." -ForegroundColor Yellow
try {
    $identity = aws sts get-caller-identity 2>&1 | ConvertFrom-Json
    Write-Host "✅ AWS 配置成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "账户信息:" -ForegroundColor Cyan
    Write-Host "  用户 ARN: $($identity.Arn)" -ForegroundColor White
    Write-Host "  账户 ID: $($identity.Account)" -ForegroundColor White
    Write-Host "  用户 ID: $($identity.UserId)" -ForegroundColor White
    Write-Host ""
    
    # 保存配置信息
    $configInfo = @{
        configured_at = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        account_id = $identity.Account
        user_arn = $identity.Arn
        region = (aws configure get region)
    }
    $configInfo | ConvertTo-Json | Out-File -FilePath "aws-config-info.json" -Encoding UTF8
    Write-Host "✅ 配置信息已保存到: aws-config-info.json" -ForegroundColor Green
    
} catch {
    Write-Host "❌ 验证失败: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "请检查:" -ForegroundColor Yellow
    Write-Host "  1. Access Key ID 是否正确" -ForegroundColor White
    Write-Host "  2. Secret Access Key 是否正确" -ForegroundColor White
    Write-Host "  3. IAM 用户是否有足够的权限" -ForegroundColor White
    Write-Host ""
    Write-Host "重新配置请运行: aws configure" -ForegroundColor Cyan
    Write-Host ""
    pause
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  下一步" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ AWS CLI 配置完成！" -ForegroundColor Green
Write-Host ""
Write-Host "现在可以开始部署了:" -ForegroundColor Yellow
Write-Host "  1. 创建 RDS PostgreSQL 数据库" -ForegroundColor White
Write-Host "  2. 创建 EC2 实例" -ForegroundColor White
Write-Host "  3. 部署后端应用" -ForegroundColor White
Write-Host "  4. 部署前端到 S3" -ForegroundColor White
Write-Host ""
Write-Host "请告诉 AI 助手: '我已经配置好 AWS CLI，可以继续了'" -ForegroundColor Cyan
Write-Host ""

pause

