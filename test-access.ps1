# 测试网站访问
$EC2_IP = "3.17.31.19"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "测试网站访问" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 测试 1: HTTP 80 端口
Write-Host "1. 测试 HTTP (端口 80)..." -ForegroundColor Yellow
$url1 = "http://$EC2_IP/docs"
Write-Host "   URL: $url1" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri $url1 -TimeoutSec 10 -UseBasicParsing
    Write-Host "   成功! 状态码: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   失败: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 测试 2: 直接访问 8000 端口
Write-Host "2. 测试 API (端口 8000)..." -ForegroundColor Yellow
$url2 = "http://${EC2_IP}:8000/docs"
Write-Host "   URL: $url2" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri $url2 -TimeoutSec 10 -UseBasicParsing
    Write-Host "   成功! 状态码: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   失败: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 测试 3: 健康检查
Write-Host "3. 测试健康检查..." -ForegroundColor Yellow
$url3 = "http://${EC2_IP}:8000/health"
Write-Host "   URL: $url3" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri $url3 -TimeoutSec 10 -UseBasicParsing
    Write-Host "   成功! 响应: $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "   失败: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "测试完成" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "如果测试成功，请在浏览器中访问:" -ForegroundColor Yellow
Write-Host "http://$EC2_IP/docs" -ForegroundColor Cyan
Write-Host "http://${EC2_IP}:8000/docs" -ForegroundColor Cyan

