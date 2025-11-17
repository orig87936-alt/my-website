# 修复 EC2 安全组配置
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "修复 EC2 安全组配置" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$EC2_IP = "3.17.31.19"

Write-Host "步骤 1: 获取实例信息..." -ForegroundColor Yellow
$instanceJson = aws ec2 describe-instances --filters "Name=ip-address,Values=$EC2_IP" --query "Reservations[0].Instances[0]" --output json

if ($instanceJson) {
    $instance = $instanceJson | ConvertFrom-Json
    $instanceId = $instance.InstanceId
    $sgId = $instance.SecurityGroups[0].GroupId
    
    Write-Host "实例 ID: $instanceId" -ForegroundColor Green
    Write-Host "安全组 ID: $sgId" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "步骤 2: 添加安全组规则..." -ForegroundColor Yellow
    Write-Host ""
    
    # 添加 HTTP 规则
    Write-Host "添加 HTTP (80) 规则..." -ForegroundColor Gray
    aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 80 --cidr 0.0.0.0/0 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "成功" -ForegroundColor Green
    } else {
        Write-Host "规则可能已存在" -ForegroundColor Yellow
    }
    
    # 添加 HTTPS 规则
    Write-Host "添加 HTTPS (443) 规则..." -ForegroundColor Gray
    aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 443 --cidr 0.0.0.0/0 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "成功" -ForegroundColor Green
    } else {
        Write-Host "规则可能已存在" -ForegroundColor Yellow
    }
    
    # 添加 API 规则
    Write-Host "添加 API (8000) 规则..." -ForegroundColor Gray
    aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 8000 --cidr 0.0.0.0/0 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "成功" -ForegroundColor Green
    } else {
        Write-Host "规则可能已存在" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "步骤 3: 验证安全组规则..." -ForegroundColor Yellow
    aws ec2 describe-security-groups --group-ids $sgId --query "SecurityGroups[0].IpPermissions" --output table
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "完成！请等待 30 秒后测试访问" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "测试 URL:" -ForegroundColor Yellow
    Write-Host "http://$EC2_IP/docs" -ForegroundColor Cyan
    Write-Host "http://${EC2_IP}:8000/docs" -ForegroundColor Cyan
    
} else {
    Write-Host "错误: 无法找到实例" -ForegroundColor Red
    Write-Host ""
    Write-Host "请手动在 AWS 控制台配置:" -ForegroundColor Yellow
    Write-Host "1. 登录 AWS 控制台" -ForegroundColor Gray
    Write-Host "2. 进入 EC2 -> 安全组" -ForegroundColor Gray
    Write-Host "3. 找到您的安全组并添加以下入站规则:" -ForegroundColor Gray
    Write-Host "   - HTTP (80) from 0.0.0.0/0" -ForegroundColor Gray
    Write-Host "   - HTTPS (443) from 0.0.0.0/0" -ForegroundColor Gray
    Write-Host "   - Custom TCP (8000) from 0.0.0.0/0" -ForegroundColor Gray
}

