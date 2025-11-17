# Configure AWS credentials on EC2 server for S3 access

$SERVER_IP = "18.221.125.254"
$SSH_KEY = "D:\download\sl-news-key.pem"

Write-Host "Configure AWS Credentials on EC2" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "请选择配置方式:" -ForegroundColor Yellow
Write-Host "1. 使用 IAM 角色 (推荐，更安全)" -ForegroundColor White
Write-Host "2. 配置 AWS 凭证文件" -ForegroundColor White
Write-Host ""

$choice = Read-Host "请输入选择 (1 或 2)"

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "使用 IAM 角色配置..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "步骤:" -ForegroundColor Yellow
    Write-Host "1. 打开 AWS EC2 控制台" -ForegroundColor White
    Write-Host "2. 选择您的 EC2 实例 (18.221.125.254)" -ForegroundColor White
    Write-Host "3. 点击 'Actions' -> 'Security' -> 'Modify IAM role'" -ForegroundColor White
    Write-Host "4. 如果没有合适的角色，创建一个新角色:" -ForegroundColor White
    Write-Host "   - 服务类型: EC2" -ForegroundColor Gray
    Write-Host "   - 权限策略: AmazonS3FullAccess" -ForegroundColor Gray
    Write-Host "   - 角色名称: EC2-S3-Access-Role" -ForegroundColor Gray
    Write-Host "5. 将角色附加到 EC2 实例" -ForegroundColor White
    Write-Host "6. 等待几分钟让角色生效" -ForegroundColor White
    Write-Host ""
    Write-Host "完成后按任意键继续验证..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

    # 验证 IAM 角色
    Write-Host ""
    Write-Host "验证 IAM 角色..." -ForegroundColor Cyan

    ssh -i $SSH_KEY ubuntu@$SERVER_IP 'aws sts get-caller-identity; echo ""; echo "Testing S3 access..."; aws s3 ls s3://sl-news-frontend/'

} elseif ($choice -eq "2") {
    Write-Host ""
    Write-Host "配置 AWS 凭证文件..." -ForegroundColor Cyan
    Write-Host ""

    # 获取 AWS 凭证
    Write-Host "请输入 AWS 凭证信息:" -ForegroundColor Yellow
    $AWS_ACCESS_KEY_ID = Read-Host "AWS Access Key ID"
    $AWS_SECRET_ACCESS_KEY = Read-Host "AWS Secret Access Key" -AsSecureString
    $AWS_SECRET_ACCESS_KEY_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($AWS_SECRET_ACCESS_KEY)
    )

    Write-Host ""
    Write-Host "配置凭证..." -ForegroundColor Cyan

    # 创建临时脚本文件
    $tempScript = @"
#!/bin/bash
mkdir -p ~/.aws
echo '[default]' > ~/.aws/credentials
echo 'aws_access_key_id = $AWS_ACCESS_KEY_ID' >> ~/.aws/credentials
echo 'aws_secret_access_key = $AWS_SECRET_ACCESS_KEY_PLAIN' >> ~/.aws/credentials
echo '[default]' > ~/.aws/config
echo 'region = us-east-2' >> ~/.aws/config
echo 'output = json' >> ~/.aws/config
chmod 600 ~/.aws/credentials
chmod 600 ~/.aws/config
echo 'AWS credentials configured'
echo ''
echo 'Testing credentials...'
aws sts get-caller-identity
echo ''
echo 'Testing S3 access...'
aws s3 ls s3://sl-news-frontend/
"@

    $tempScript | Out-File -FilePath "temp-aws-config.sh" -Encoding ASCII -NoNewline

    # 上传并执行脚本
    scp -i $SSH_KEY temp-aws-config.sh "ubuntu@${SERVER_IP}:/tmp/"
    ssh -i $SSH_KEY ubuntu@$SERVER_IP 'bash /tmp/temp-aws-config.sh; rm /tmp/temp-aws-config.sh'

    # 删除本地临时文件
    Remove-Item "temp-aws-config.sh" -ErrorAction SilentlyContinue

} else {
    Write-Host "无效的选择" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "配置完成！" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步: 运行 .\upload-via-server.ps1 重新部署" -ForegroundColor Yellow
Write-Host ""

