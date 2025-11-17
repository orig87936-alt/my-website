# Test article update to reproduce the error

# 1. Login and get token
$loginBody = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

Write-Host "🔐 Logging in..." -ForegroundColor Cyan
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/admin-login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.access_token
Write-Host "✅ Token obtained" -ForegroundColor Green

# 2. Get an article
$articleId = "00266601-6651-45e7-a9aa-c3845c850848"
Write-Host "`n📖 Fetching article $articleId..." -ForegroundColor Cyan
$article = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/articles/$articleId" -Method Get
Write-Host "✅ Article fetched: $($article.title_zh)" -ForegroundColor Green

# 3. Try to update with minimal data (like the frontend does)
$updateData = @{
    title_zh = $article.title_zh
    title_en = $article.title_en
    summary_zh = $article.summary_zh
    summary_en = $article.summary_en
    category = $article.category
    status = $article.status
    author = $article.author
} | ConvertTo-Json -Depth 10

Write-Host "`n📝 Updating article..." -ForegroundColor Cyan
Write-Host "Update data:" -ForegroundColor Yellow
Write-Host $updateData -ForegroundColor Gray

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $result = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/articles/$articleId" -Method Put -Body $updateData -Headers $headers
    Write-Host "`n✅ Update successful!" -ForegroundColor Green
    Write-Host "Result:" -ForegroundColor Yellow
    $result | ConvertTo-Json -Depth 5
} catch {
    Write-Host "`n❌ Update failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

