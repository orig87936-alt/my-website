Write-Host "测试创建 Manus AI 文章..." -ForegroundColor Cyan

# 获取 Token
$token = Get-Content "$env:APPDATA\news-platform-token.txt" -ErrorAction SilentlyContinue
if (-not $token) {
    Write-Host "❌ 未找到认证令牌，正在登录..." -ForegroundColor Yellow
    
    # 登录
    $loginBody = '{"username":"admin","password":"admin123"}'
    try {
        $loginResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/auth/admin-login" -Method POST -Headers @{'Content-Type'='application/json'} -Body $loginBody -UseBasicParsing
        $loginData = $loginResponse.Content | ConvertFrom-Json
        $token = $loginData.access_token
        New-Item -Path "$env:APPDATA" -Name "news-platform-token.txt" -ItemType File -Value $token -Force | Out-Null
        Write-Host "✅ 登录成功" -ForegroundColor Green
    } catch {
        Write-Host "❌ 登录失败: $_" -ForegroundColor Red
        exit
    }
}

# 构造文章数据（完全模拟前端发送的数据）
$articleData = @{
    title_zh = "Manus AI: 能力、局限性和市场定位"
    title_en = "Manus AI: Capabilities, Limitations, and Market Position"
    summary_zh = "Manus AI由中国创业公司Monica旗下的Butterfly Effect集团开发，作为一款自主AI代理，旨在执行复杂任务。虽然在某些任务上表现出色，但在处理复杂网站和多步骤操作时仍存在局限性。该产品目前处于早期阶段，需要进一步优化以在竞争激烈的AI代理市场中占据一席之地。"
    summary_en = "Manus AI, developed by the Chinese startup Monica under the Butterfly Effect group, has recently emerged as a notable autonomous AI agent designed to execute complex tasks. While it shows promise in certain areas, it still faces limitations in handling complex websites and multi-step operations. The product is currently in its early stages and requires further optimization to establish a strong position within the competitive AI agent landscape."
    lead_zh = "Manus AI由中国创业公司Monica（隶属Butterfly Effect集团）开发，最近作为一个值得关注的自主AI代理出现，旨在执行复杂任务。虽然在某些领域表现出潜力，但在处理复杂网站和多步骤操作时仍面临局限性。该产品目前处于早期阶段，需要进一步优化才能在竞争激烈的AI代理领域占据有利地位。"
    lead_en = "Manus AI, developed by the Chinese startup Monica under the Butterfly Effect group, has recently emerged as a notable autonomous AI agent designed to execute complex tasks. While it shows promise in certain areas, it still faces limitations in handling complex websites and multi-step operations. The product is currently in its early stages and requires further optimization to establish a strong position within the competitive AI agent landscape."
    content_zh = @(
        @{
            type = "heading"
            text = "Manus AI的能力"
            level = 2
        }
        @{
            type = "paragraph"
            text = "Manus AI能够执行一个个为其设定的任务，并且在某些情况下表现出色。"
        }
        @{
            type = "heading"
            text = "Manus AI的局限性"
            level = 2
        }
        @{
            type = "paragraph"
            text = "Manus AI在处理复杂网站和多步骤操作时仍存在局限性。"
        }
    )
    content_en = @(
        @{
            type = "heading"
            text = "Manus AI Capabilities"
            level = 2
        }
        @{
            type = "paragraph"
            text = "Manus AI is capable of executing tasks assigned to it and performs well in certain scenarios."
        }
        @{
            type = "heading"
            text = "Manus AI Limitations"
            level = 2
        }
        @{
            type = "paragraph"
            text = "Manus AI still faces limitations when handling complex websites and multi-step operations."
        }
    )
    category = "headline"
    author = "Siberia Fund"
    status = "published"
    image_url = "https://images.unsplash.com/photo-1655720828018-adc9e2e5175a"
}

$body = $articleData | ConvertTo-Json -Depth 10

Write-Host "📤 发送请求到: http://localhost:8000/api/v1/articles" -ForegroundColor Yellow
Write-Host ""

$headers = @{
    'Content-Type' = 'application/json; charset=utf-8'
    'Authorization' = "Bearer $token"
}

try {
    $response = Invoke-WebRequest `
        -Uri "http://localhost:8000/api/v1/articles" `
        -Method POST `
        -Headers $headers `
        -Body ([System.Text.Encoding]::UTF8.GetBytes($body)) `
        -UseBasicParsing `
        -TimeoutSec 30
    
    Write-Host "✅ 成功: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ""
    Write-Host "响应:" -ForegroundColor Cyan
    $responseData = $response.Content | ConvertFrom-Json
    Write-Host "文章 ID: $($responseData.id)" -ForegroundColor Green
    Write-Host "标题（中文）: $($responseData.title_zh)" -ForegroundColor Gray
    Write-Host "标题（英文）: $($responseData.title_en)" -ForegroundColor Gray
    Write-Host "状态: $($responseData.status)" -ForegroundColor Gray
    Write-Host "发布时间: $($responseData.published_at)" -ForegroundColor Gray
} catch {
    Write-Host "❌ 失败" -ForegroundColor Red
    Write-Host ""
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "状态码: $statusCode" -ForegroundColor Yellow
        
        try {
            $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "错误详情:" -ForegroundColor Yellow
            Write-Host $responseBody -ForegroundColor Red
            
            # 尝试解析 JSON 错误
            try {
                $errorData = $responseBody | ConvertFrom-Json
                Write-Host ""
                Write-Host "解析后的错误:" -ForegroundColor Yellow
                $errorData | ConvertTo-Json -Depth 5
            } catch {
                # 无法解析为 JSON
            }
        } catch {
            Write-Host "无法读取错误响应" -ForegroundColor Red
        }
    } else {
        Write-Host "错误: $_" -ForegroundColor Red
    }
}

