# Simple test with English data

# 1. Login
$loginBody = '{"username":"admin","password":"admin123"}'
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/admin-login" -Method Post -Body $loginBody -ContentType "application/json; charset=utf-8"
$token = $loginResponse.access_token
Write-Host "Token: $token"

# 2. Update with minimal data
$articleId = "00266601-6651-45e7-a9aa-c3845c850848"
$updateBody = '{
    "title_zh": "Test Title",
    "title_en": "Test Title EN",
    "summary_zh": "Test summary in Chinese with enough characters to meet minimum length requirement",
    "summary_en": "Test summary in English with enough characters to meet minimum length requirement",
    "category": "regulatory",
    "status": "published",
    "author": "Test Author"
}'

$headers = @{
    "Authorization" = "Bearer $token"
}

Write-Host "`nSending update request..."
try {
    $result = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/articles/$articleId" -Method Put -Body $updateBody -ContentType "application/json; charset=utf-8" -Headers $headers
    Write-Host "SUCCESS!" -ForegroundColor Green
    $result | ConvertTo-Json -Depth 5
} catch {
    Write-Host "FAILED!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)"
    }
}

