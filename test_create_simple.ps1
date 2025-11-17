# Simple test for creating article

# 1. Login
$loginBody = '{"username":"admin","password":"admin123"}'
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/admin-login" -Method Post -Body $loginBody -ContentType "application/json; charset=utf-8"
$token = $loginResponse.access_token
Write-Host "Token obtained: $token"

# 2. Read article data from JSON file
$articleData = Get-Content "new_article.json" -Raw -Encoding UTF8

Write-Host "`nArticle data to send:"
Write-Host $articleData

# 3. Create article
$headers = @{
    "Authorization" = "Bearer $token"
}

Write-Host "`nSending create request..."
try {
    $result = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/articles" -Method Post -Body $articleData -ContentType "application/json; charset=utf-8" -Headers $headers
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "Article ID: $($result.id)"
    $result | ConvertTo-Json -Depth 5
} catch {
    Write-Host "FAILED!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)"
    }
}

