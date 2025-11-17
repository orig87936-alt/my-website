# 检查后端部署状态
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "检查后端部署状态" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$EC2_IP = "3.17.31.19"

# 1. 测试 HTTP 端口 80
Write-Host "1. 测试 HTTP (端口 80)..." -ForegroundColor Yellow
try {
    $url = "http://$EC2_IP/docs"
    $response = Invoke-WebRequest -Uri $url -TimeoutSec 10 -ErrorAction Stop
    Write-Host "成功访问 $url" -ForegroundColor Green
    Write-Host "状态码: $($response.StatusCode)" -ForegroundColor Green
}
catch {
    Write-Host "无法访问 http://$EC2_IP/docs" -ForegroundColor Red
    Write-Host "错误: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 2. 测试 API 端口 8000
Write-Host "2. 测试 API (端口 8000)..." -ForegroundColor Yellow
try {
    $url = "http://${EC2_IP}:8000/docs"
    $response = Invoke-WebRequest -Uri $url -TimeoutSec 10 -ErrorAction Stop
    Write-Host "成功访问 $url" -ForegroundColor Green
    Write-Host "状态码: $($response.StatusCode)" -ForegroundColor Green
}
catch {
    Write-Host "无法访问 http://${EC2_IP}:8000/docs" -ForegroundColor Red
    Write-Host "错误: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 3. 测试健康检查端点
Write-Host "3. 测试健康检查端点..." -ForegroundColor Yellow
try {
    $url = "http://${EC2_IP}:8000/health"
    $response = Invoke-WebRequest -Uri $url -TimeoutSec 10 -ErrorAction Stop
    Write-Host "健康检查通过" -ForegroundColor Green
    Write-Host "响应: $($response.Content)" -ForegroundColor Green
}
catch {
    Write-Host "健康检查失败" -ForegroundColor Red
    Write-Host "错误: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "下一步操作" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "请运行以下命令检查服务器状态:" -ForegroundColor Yellow
Write-Host ""
$sshCmd = "ssh ubuntu@" + $EC2_IP
Write-Host $sshCmd -ForegroundColor Cyan
Write-Host ""

