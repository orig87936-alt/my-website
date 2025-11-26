# Clear HSTS cache for Edge browser
Write-Host "🔧 Clearing HSTS cache for Microsoft Edge..." -ForegroundColor Cyan

# Close Edge browser
Write-Host "📌 Closing Edge browser..." -ForegroundColor Yellow
Get-Process -Name "msedge" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Path to Edge user data
$edgeDataPath = "$env:LOCALAPPDATA\Microsoft\Edge\User Data"

# Find all profile directories
$profiles = @("Default", "Profile 1", "Profile 2", "Profile 3")

foreach ($profile in $profiles) {
    $transportSecurityFile = Join-Path $edgeDataPath "$profile\TransportSecurity"
    
    if (Test-Path $transportSecurityFile) {
        Write-Host "🗑️  Deleting HSTS cache for $profile..." -ForegroundColor Green
        Remove-Item $transportSecurityFile -Force
    }
}

Write-Host "✅ HSTS cache cleared!" -ForegroundColor Green
Write-Host "📌 Opening website..." -ForegroundColor Cyan

# Wait a moment
Start-Sleep -Seconds 1

# Open the website
Start-Process "http://www.s-l.ai"

Write-Host "✅ Done! The website should now open without HSTS errors." -ForegroundColor Green

