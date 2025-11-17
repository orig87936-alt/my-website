# Enable HTTPS for backend using self-signed certificate
# This is a temporary solution. For production, use a real domain and Let's Encrypt

$SERVER_IP = "18.221.125.254"
$SSH_KEY = "D:\download\sl-news-key.pem"

Write-Host "Enable HTTPS for Backend" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "WARNING: This will use a self-signed certificate" -ForegroundColor Yellow
Write-Host "Browser will show security warning, but it will work" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Continue? (y/n)"
if ($confirm -ne "y") {
    Write-Host "Cancelled" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "Step 1: Generate self-signed certificate..." -ForegroundColor Cyan

$setupCommand = @"
sudo mkdir -p /etc/nginx/ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/selfsigned.key \
    -out /etc/nginx/ssl/selfsigned.crt \
    -subj '/C=US/ST=State/L=City/O=SLNews/CN=$SERVER_IP'
echo 'Certificate generated'
"@

ssh -i $SSH_KEY ubuntu@$SERVER_IP $setupCommand

if ($LASTEXITCODE -ne 0) {
    Write-Host "Certificate generation failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Update Nginx configuration..." -ForegroundColor Cyan

$nginxConfig = @'
sudo cp /etc/nginx/sites-available/sl-news-backend /etc/nginx/sites-available/sl-news-backend.backup.$(date +%Y%m%d_%H%M%S)
sudo tee /etc/nginx/sites-available/sl-news-backend > /dev/null <<'NGINX_EOF'
server {
    listen 80;
    server_name _;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name _;

    ssl_certificate /etc/nginx/ssl/selfsigned.crt;
    ssl_certificate_key /etc/nginx/ssl/selfsigned.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location /uploads/ {
        alias /home/ubuntu/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
NGINX_EOF
echo 'Nginx config updated'
'@

ssh -i $SSH_KEY ubuntu@$SERVER_IP $nginxConfig

if ($LASTEXITCODE -ne 0) {
    Write-Host "Nginx config update failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 3: Test and restart Nginx..." -ForegroundColor Cyan

$restartCommand = @"
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl status nginx --no-pager | head -10
echo 'Nginx restarted'
"@

ssh -i $SSH_KEY ubuntu@$SERVER_IP $restartCommand

if ($LASTEXITCODE -ne 0) {
    Write-Host "Nginx restart may have failed" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 4: Update frontend configuration..." -ForegroundColor Cyan

$envPath = ".env.production"
if (Test-Path $envPath) {
    $content = Get-Content $envPath
    $content = $content -replace 'VITE_API_BASE_URL=http://.*', "VITE_API_BASE_URL=https://${SERVER_IP}:8000"
    $content | Set-Content $envPath
    Write-Host "Frontend config updated" -ForegroundColor Green
} else {
    Write-Host ".env.production not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "HTTPS Configuration Complete!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Rebuild and deploy frontend:" -ForegroundColor Cyan
Write-Host "   npm run build" -ForegroundColor White
Write-Host "   aws s3 sync build/ s3://sl-news-frontend-20241115/ --delete" -ForegroundColor White
Write-Host ""
Write-Host "2. Test backend API:" -ForegroundColor Cyan
Write-Host "   Visit: https://${SERVER_IP}:8000/api/docs" -ForegroundColor White
Write-Host "   (Browser will show security warning, click Advanced -> Continue)" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Test frontend:" -ForegroundColor Cyan
Write-Host "   Visit: https://sl-news-frontend.s3-website.us-east-2.amazonaws.com" -ForegroundColor White
Write-Host "   Try uploading a document" -ForegroundColor White
Write-Host ""

Write-Host "IMPORTANT:" -ForegroundColor Yellow
Write-Host "   - Self-signed certificate will show browser warning" -ForegroundColor Yellow
Write-Host "   - This is normal, click Advanced -> Continue" -ForegroundColor Yellow
Write-Host "   - For production, use a real domain and Let's Encrypt" -ForegroundColor Yellow
Write-Host ""

