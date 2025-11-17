# Test article creation to reproduce the error

# 1. Login and get token
$loginBody = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

Write-Host "🔐 Logging in..." -ForegroundColor Cyan
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/admin-login" -Method Post -Body $loginBody -ContentType "application/json; charset=utf-8"
$token = $loginResponse.access_token
Write-Host "✅ Token obtained" -ForegroundColor Green

# 2. Create a new article with minimal data (like the frontend does)
$newArticle = @{
    title_zh = "Manus AI: 能力、局限性和市场定位"
    title_en = "Manus AI: Capabilities, Limitations, and Market Position"
    summary_zh = "Manus AI由中国初创公司Monic（蝶影效应集团旗下）开发，最近作为一个值得注意的自主AI代理出现，旨在执行复杂的多步骤任务。"
    summary_en = "Manus AI, developed by the Chinese startup Monica under the Butterfly Effect group, has recently emerged as a notable autonomous AI agent designed to execute complex multi-step tasks."
    content_zh = @(
        @{
            type = "heading"
            text = "Manus AI能力"
        },
        @{
            type = "paragraph"
            text = "Manus AI通过认识几个关键能力脱颖而出："
        }
    )
    content_en = @(
        @{
            type = "heading"
            text = "Manus AI Capabilities"
        },
        @{
            type = "paragraph"
            text = "Manus AI stands out by recognizing several key capabilities:"
        }
    )
    category = "enterprise"
    status = "published"
    author = "Siberia Fund"
    image_url = "https://images.unsplash.com/photo-1655720828428-ed1 adc"
} | ConvertTo-Json -Depth 10

Write-Host "`n📝 Creating new article..." -ForegroundColor Cyan
Write-Host "Article data:" -ForegroundColor Yellow
Write-Host $newArticle -ForegroundColor Gray

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json; charset=utf-8"
}

try {
    $result = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/articles" -Method Post -Body $newArticle -Headers $headers
    Write-Host "`n✅ Article created successfully!" -ForegroundColor Green
    Write-Host "Article ID: $($result.id)" -ForegroundColor Yellow
    $result | ConvertTo-Json -Depth 5
} catch {
    Write-Host "`n❌ Article creation failed!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    
    # Try to get more details from the response
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}

