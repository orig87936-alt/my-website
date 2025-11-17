# Fix Nginx configuration

$SERVER_IP = "18.221.125.254"
$SSH_KEY = "D:\download\sl-news-key.pem"

Write-Host "Fixing Nginx configuration..." -ForegroundColor Cyan

$fixCommand = @'
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
        add_header Cache-Control "public";
    }
}
NGINX_EOF
sudo nginx -t && sudo systemctl restart nginx
'@

ssh -i $SSH_KEY ubuntu@$SERVER_IP $fixCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host "Nginx configuration fixed and restarted!" -ForegroundColor Green
} else {
    Write-Host "Failed to fix Nginx configuration" -ForegroundColor Red
}

