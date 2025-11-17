# AWS CLI 安装脚本
# 请以管理员身份运行此脚本

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AWS CLI 安装脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否以管理员身份运行
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ 错误: 请以管理员身份运行此脚本" -ForegroundColor Red
    Write-Host ""
    Write-Host "右键点击此文件，选择 '以管理员身份运行'" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

Write-Host "✅ 管理员权限确认" -ForegroundColor Green
Write-Host ""

# 下载 AWS CLI 安装程序
Write-Host "📥 正在下载 AWS CLI 安装程序..." -ForegroundColor Yellow
$installerPath = "$env:TEMP\AWSCLIV2.msi"

try {
    Invoke-WebRequest -Uri "https://awscli.amazonaws.com/AWSCLIV2.msi" -OutFile $installerPath -UseBasicParsing
    Write-Host "✅ 下载完成" -ForegroundColor Green
} catch {
    Write-Host "❌ 下载失败: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "请手动下载: https://awscli.amazonaws.com/AWSCLIV2.msi" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host ""
Write-Host "🔧 正在安装 AWS CLI..." -ForegroundColor Yellow
Write-Host "   (这可能需要几分钟时间)" -ForegroundColor Gray
Write-Host ""

# 安装 AWS CLI
try {
    Start-Process msiexec.exe -ArgumentList "/i `"$installerPath`" /qn /norestart" -Wait -NoNewWindow
    Write-Host "✅ 安装完成" -ForegroundColor Green
} catch {
    Write-Host "❌ 安装失败: $_" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "🔄 刷新环境变量..." -ForegroundColor Yellow

# 刷新环境变量
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host ""
Write-Host "✅ 验证安装..." -ForegroundColor Yellow

# 验证安装
try {
    $version = & "C:\Program Files\Amazon\AWSCLIV2\aws.exe" --version 2>&1
    Write-Host "✅ AWS CLI 安装成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "版本信息: $version" -ForegroundColor Cyan
} catch {
    Write-Host "⚠️  安装完成，但需要重启 PowerShell" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "请关闭此窗口，重新打开 PowerShell，然后运行: aws --version" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  下一步: 配置 AWS CLI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 登录 AWS 控制台: https://console.aws.amazon.com/" -ForegroundColor White
Write-Host "2. 创建 IAM 用户并获取访问密钥" -ForegroundColor White
Write-Host "3. 运行: aws configure" -ForegroundColor White
Write-Host ""

pause

