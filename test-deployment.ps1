# Test deployment

$FRONTEND_URL = "http://sl-news-frontend.s3-website.us-east-2.amazonaws.com"
$BACKEND_URL = "https://18.221.125.254:8000"

Write-Host "Testing Deployment" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Testing Frontend..." -ForegroundColor Cyan
Write-Host "   URL: $FRONTEND_URL" -ForegroundColor White

try {
    $response = Invoke-WebRequest -Uri $FRONTEND_URL -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "   Status: OK (200)" -ForegroundColor Green
    } else {
        Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   Status: Failed - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "2. Testing Backend API..." -ForegroundColor Cyan
Write-Host "   URL: $BACKEND_URL/health" -ForegroundColor White

try {
    # Skip certificate validation for self-signed cert
    add-type @"
        using System.Net;
        using System.Security.Cryptography.X509Certificates;
        public class TrustAllCertsPolicy : ICertificatePolicy {
            public bool CheckValidationResult(
                ServicePoint srvPoint, X509Certificate certificate,
                WebRequest request, int certificateProblem) {
                return true;
            }
        }
"@
    [System.Net.ServicePointManager]::CertificatePolicy = New-Object TrustAllCertsPolicy
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12
    
    $response = Invoke-WebRequest -Uri "$BACKEND_URL/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "   Status: OK (200)" -ForegroundColor Green
        Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
    } else {
        Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   Status: Failed - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Open your browser and visit:" -ForegroundColor Cyan
Write-Host "   $FRONTEND_URL" -ForegroundColor White
Write-Host ""
Write-Host "2. IMPORTANT - First time setup:" -ForegroundColor Yellow
Write-Host "   a. Open a new tab and visit:" -ForegroundColor White
Write-Host "      https://18.221.125.254:8000/api/docs" -ForegroundColor White
Write-Host "   b. You will see a security warning" -ForegroundColor White
Write-Host "   c. Click 'Advanced' -> 'Continue to 18.221.125.254 (unsafe)'" -ForegroundColor White
Write-Host "   d. This accepts the self-signed certificate" -ForegroundColor White
Write-Host ""
Write-Host "3. Go back to your website and test:" -ForegroundColor Cyan
Write-Host "   - Browse news articles" -ForegroundColor White
Write-Host "   - Try uploading a document" -ForegroundColor White
Write-Host ""
Write-Host "If you see any CORS errors, let me know!" -ForegroundColor Yellow
Write-Host ""

