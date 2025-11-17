# Test server connection
$SERVER_IP = "18.221.125.254"

Write-Host "🔍 Testing connection to server: $SERVER_IP" -ForegroundColor Cyan
Write-Host ""

# Try to connect without SSH key (will fail but show us the error)
Write-Host "Attempting to connect..." -ForegroundColor Yellow
ssh ubuntu@$SERVER_IP "echo 'Connection successful!'"

Write-Host ""
Write-Host "If you see 'Permission denied', you need to provide the SSH key." -ForegroundColor Yellow
Write-Host "If you see 'Connection successful!', the server is accessible." -ForegroundColor Green

