# Fix CORS configuration on server
$SERVER_IP = "18.221.125.254"
$SSH_KEY = "D:\download\sl-news-key.pem"

Write-Host "🔧 Fixing CORS configuration on server..." -ForegroundColor Cyan
Write-Host ""

# Update CORS_ORIGINS to use HTTPS
$command = @"
cd /home/ubuntu/backend && \
sed -i 's|CORS_ORIGINS=.*|CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:3002,http://sl-news-frontend.s3-website.us-east-2.amazonaws.com,https://sl-news-frontend.s3-website.us-east-2.amazonaws.com|g' .env && \
echo '✅ CORS configuration updated' && \
grep CORS .env
"@

Write-Host "📝 Updating CORS configuration..." -ForegroundColor Yellow
ssh -i $SSH_KEY ubuntu@$SERVER_IP $command

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🔄 Restarting backend service..." -ForegroundColor Yellow
    
    # Restart the backend service
    $restart_command = @"
sudo systemctl restart sl-news-backend && \
echo '✅ Backend service restarted' && \
sleep 3 && \
sudo systemctl status sl-news-backend --no-pager | head -20
"@
    
    ssh -i $SSH_KEY ubuntu@$SERVER_IP $restart_command
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ CORS configuration fixed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Please try uploading the document again." -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "⚠️ Service restart may have failed. Please check manually." -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "❌ Failed to update CORS configuration" -ForegroundColor Red
}

