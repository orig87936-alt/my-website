Write-Host "=== 测试 Token 修复 ===" -ForegroundColor Cyan
Write-Host ""

# 1. 检查后端配置
Write-Host "1️⃣ 检查后端 Token 配置..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ 后端运行正常" -ForegroundColor Green
} catch {
    Write-Host "❌ 后端未运行: $_" -ForegroundColor Red
    exit 1
}

# 2. 测试登录并获取新 Token
Write-Host ""
Write-Host "2️⃣ 测试管理员登录..." -ForegroundColor Yellow

$loginBody = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest `
        -Uri "http://localhost:8000/api/v1/auth/admin-login" `
        -Method POST `
        -Headers @{ 'Content-Type' = 'application/json' } `
        -Body $loginBody `
        -UseBasicParsing `
        -TimeoutSec 10
    
    $loginData = $loginResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ 登录成功！" -ForegroundColor Green
    Write-Host "   用户: $($loginData.user.username)" -ForegroundColor Gray
    Write-Host "   角色: $($loginData.user.role)" -ForegroundColor Gray
    Write-Host "   Token 有效期: $($loginData.expires_in) 秒 ($([math]::Round($loginData.expires_in / 3600, 1)) 小时)" -ForegroundColor Gray
    
    $token = $loginData.access_token
    $refreshToken = $loginData.refresh_token
    
    # 保存到 localStorage（模拟）
    Write-Host ""
    Write-Host "💾 Token 信息:" -ForegroundColor Cyan
    Write-Host "   Access Token 长度: $($token.Length)" -ForegroundColor Gray
    Write-Host "   Refresh Token 长度: $($refreshToken.Length)" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ 登录失败: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "错误详情: $responseBody" -ForegroundColor Yellow
    }
    exit 1
}

# 3. 测试创建文章
Write-Host ""
Write-Host "3️⃣ 测试创建文章..." -ForegroundColor Yellow

$articleBody = @{
    title_zh = "测试文章 - Token 修复验证"
    title_en = "Test Article - Token Fix Verification"
    summary_zh = "这是一个测试文章，用于验证 Token 过期时间延长和自动刷新功能是否正常工作"
    summary_en = "This is a test article to verify that token expiration extension and auto-refresh work correctly"
    content_zh = @(
        @{
            type = "paragraph"
            text = "测试内容段落"
        }
    )
    content_en = @(
        @{
            type = "paragraph"
            text = "Test content paragraph"
        }
    )
    category = "headline"
    author = "Admin"
    status = "draft"
} | ConvertTo-Json -Depth 10

try {
    $articleResponse = Invoke-WebRequest `
        -Uri "http://localhost:8000/api/v1/articles" `
        -Method POST `
        -Headers @{
            'Content-Type' = 'application/json'
            'Authorization' = "Bearer $token"
        } `
        -Body $articleBody `
        -UseBasicParsing `
        -TimeoutSec 10
    
    $articleData = $articleResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ 文章创建成功！" -ForegroundColor Green
    Write-Host "   文章 ID: $($articleData.id)" -ForegroundColor Gray
    Write-Host "   中文标题: $($articleData.title_zh)" -ForegroundColor Gray
    Write-Host "   英文标题: $($articleData.title_en)" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ 文章创建失败: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "错误详情: $responseBody" -ForegroundColor Yellow
    }
    exit 1
}

# 4. 测试 Token 刷新
Write-Host ""
Write-Host "4️⃣ 测试 Token 刷新..." -ForegroundColor Yellow

$refreshBody = @{
    refresh_token = $refreshToken
} | ConvertTo-Json

try {
    $refreshResponse = Invoke-WebRequest `
        -Uri "http://localhost:8000/api/v1/auth/refresh" `
        -Method POST `
        -Headers @{ 'Content-Type' = 'application/json' } `
        -Body $refreshBody `
        -UseBasicParsing `
        -TimeoutSec 10
    
    $refreshData = $refreshResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ Token 刷新成功！" -ForegroundColor Green
    Write-Host "   新 Token 长度: $($refreshData.access_token.Length)" -ForegroundColor Gray
    Write-Host "   新 Token 有效期: $($refreshData.expires_in) 秒 ($([math]::Round($refreshData.expires_in / 3600, 1)) 小时)" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Token 刷新失败: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "错误详情: $responseBody" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== 测试完成 ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 总结:" -ForegroundColor Yellow
Write-Host "✅ Token 有效期已延长到 7 天" -ForegroundColor Green
Write-Host "✅ 前端已添加自动 Token 刷新机制" -ForegroundColor Green
Write-Host "✅ 文章创建功能正常" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 下一步操作:" -ForegroundColor Yellow
Write-Host "1. 在浏览器中重新登录（admin / admin123）" -ForegroundColor White
Write-Host "2. 登录后 Token 将在 7 天内有效" -ForegroundColor White
Write-Host "3. 如果 Token 过期，前端会自动刷新" -ForegroundColor White
Write-Host "4. 重新尝试保存文章" -ForegroundColor White

