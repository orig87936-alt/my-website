Write-Host "测试创建文章（模拟前端请求）..." -ForegroundColor Cyan

# 获取 Token
$token = Get-Content "$env:APPDATA\news-platform-token.txt" -ErrorAction SilentlyContinue
if (-not $token) {
    Write-Host "❌ 未找到认证令牌" -ForegroundColor Red
    exit
}

# 构造请求数据（模拟前端发送的数据）
$body = @{
    title_zh = "Manus AI: 能力、局限性和市场定位"
    title_en = "Manus AI: Capabilities, Limitations, and Market Position"
    summary_zh = "Manus AI由中国创业公司Monica旗下的Butterfly Effect集团开发，作为一款自主AI代理，旨在执行复杂任务。虽然在某些任务上表现出色，但在处理复杂网站和多步骤操作时仍存在局限性。该产品目前处于早期阶段，需要进一步优化以在竞争激烈的AI代理市场中占据一席之地。"
    summary_en = "Manus AI, developed by the Chinese startup Monica under the Butterfly Effect group, has recently emerged as a notable autonomous AI agent designed to execute complex tasks. While it shows promise in certain areas, it still faces limitations in handling complex websites and multi-step operations. The product is currently in its early stages and requires further optimization to establish a strong position within the competitive AI agent landscape."
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
} | ConvertTo-Json -Depth 10

Write-Host "📤 发送请求到: http://localhost:8000/api/v1/articles" -ForegroundColor Yellow
Write-Host "📋 请求数据:" -ForegroundColor Gray
Write-Host $body -ForegroundColor DarkGray

$headers = @{
    'Content-Type' = 'application/json'
    'Authorization' = "Bearer $token"
    'Origin' = 'http://localhost:3000'
}

try {
    $response = Invoke-WebRequest `
        -Uri "http://localhost:8000/api/v1/articles" `
        -Method POST `
        -Headers $headers `
        -Body $body `
        -UseBasicParsing `
        -TimeoutSec 30
    
    Write-Host "✅ 成功: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "响应:" -ForegroundColor Cyan
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
} catch {
    Write-Host "❌ 失败: $_" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "状态码: $statusCode" -ForegroundColor Yellow
        
        try {
            $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "错误详情:" -ForegroundColor Yellow
            Write-Host $responseBody -ForegroundColor Red
        } catch {
            Write-Host "无法读取错误响应" -ForegroundColor Red
        }
    }
}

