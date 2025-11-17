# Reset admin password on server
# This script connects to the EC2 server and resets the admin password

$SERVER_IP = "18.221.125.254"
$SSH_KEY = "D:\download\sl-news-key.pem"

Write-Host "🔐 Resetting admin password on server..." -ForegroundColor Cyan
Write-Host ""

# Check if SSH key exists
if (-not (Test-Path $SSH_KEY)) {
    Write-Host "❌ SSH key not found at: $SSH_KEY" -ForegroundColor Red
    Write-Host "Please provide the correct path to your SSH key." -ForegroundColor Yellow
    exit 1
}

Write-Host "📡 Connecting to server: $SERVER_IP" -ForegroundColor Yellow

# Run the reset password script on the server
$command = @"
cd /home/ubuntu/backend && source venv/bin/activate && python reset_admin_password.py
"@

ssh -i $SSH_KEY ubuntu@$SERVER_IP $command

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Admin password reset successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now login with:" -ForegroundColor Cyan
    Write-Host "  Username: admin" -ForegroundColor White
    Write-Host "  Password: admin123" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Failed to reset password" -ForegroundColor Red
    Write-Host "Please check the error messages above." -ForegroundColor Yellow
}

