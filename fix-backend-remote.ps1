# 修复远程服务器后端 502 错误
# 使用方法: .\fix-backend-remote.ps1

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Blue
Write-Host "🔧 远程修复后端 502 错误" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

$SERVER = "ubuntu@182.221.125.254"
$SCRIPT_PATH = "fix-backend-502.sh"

# 1. 上传修复脚本
Write-Host "1️⃣ 上传修复脚本到服务器..." -ForegroundColor Yellow
scp $SCRIPT_PATH ${SERVER}:~/
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 脚本上传成功" -ForegroundColor Green
} else {
    Write-Host "❌ 脚本上传失败" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 2. 赋予执行权限
Write-Host "2️⃣ 设置脚本执行权限..." -ForegroundColor Yellow
ssh $SERVER "chmod +x ~/fix-backend-502.sh"
Write-Host "✅ 权限设置完成" -ForegroundColor Green
Write-Host ""

# 3. 执行修复脚本
Write-Host "3️⃣ 执行修复脚本..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

ssh -t $SERVER "~/fix-backend-502.sh"

Write-Host ""
Write-Host "========================================" -ForegroundColor Blue
Write-Host "✅ 修复完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""
Write-Host "📝 下一步操作:" -ForegroundColor Yellow
Write-Host "  1. 在浏览器访问: http://182.221.125.254:8000/api/docs" -ForegroundColor Cyan
Write-Host "  2. 如果看到 Swagger UI，说明修复成功！" -ForegroundColor Cyan
Write-Host "  3. 如果还是 502，请运行: ssh $SERVER 'journalctl -u uvicorn -f'" -ForegroundColor Cyan
Write-Host ""

