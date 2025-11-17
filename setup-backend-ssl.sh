#!/bin/bash
# 为后端配置 SSL 证书（使用 Let's Encrypt）

set -e

echo "🔐 为后端配置 SSL 证书"
echo "================================"
echo ""

# 检查是否安装了 certbot
if ! command -v certbot &> /dev/null; then
    echo "📦 安装 Certbot..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
fi

# 获取当前 EC2 公网 IP
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com)
echo "📍 当前 EC2 公网 IP: $PUBLIC_IP"
echo ""

echo "⚠️  注意：Let's Encrypt 需要域名，不能为 IP 地址签发证书"
echo ""
echo "你有两个选择："
echo "1. 使用自签名证书（仅用于测试，浏览器会显示警告）"
echo "2. 配置域名后使用 Let's Encrypt（推荐）"
echo ""

read -p "请选择 (1/2): " choice

if [ "$choice" = "1" ]; then
    echo ""
    echo "🔧 生成自签名证书..."
    
    # 创建证书目录
    sudo mkdir -p /etc/nginx/ssl
    
    # 生成自签名证书
    sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/selfsigned.key \
        -out /etc/nginx/ssl/selfsigned.crt \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=$PUBLIC_IP"
    
    echo "✅ 自签名证书已生成"
    echo ""
    echo "📝 更新 Nginx 配置..."
    
    # 备份原配置
    sudo cp /etc/nginx/sites-available/sl-news-backend /etc/nginx/sites-available/sl-news-backend.backup
    
    # 创建新的 HTTPS 配置
    sudo tee /etc/nginx/sites-available/sl-news-backend > /dev/null <<'EOF'
# HTTP - 重定向到 HTTPS
server {
    listen 80;
    server_name _;
    return 301 https://$host$request_uri;
}

# HTTPS
server {
    listen 443 ssl;
    server_name _;
    
    # SSL 证书
    ssl_certificate /etc/nginx/ssl/selfsigned.crt;
    ssl_certificate_key /etc/nginx/ssl/selfsigned.key;
    
    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # 增加上传文件大小限制
    client_max_body_size 10M;
    
    # API 路由
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket 支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # 静态文件
    location /uploads/ {
        alias /home/ubuntu/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF
    
    # 测试配置
    sudo nginx -t
    
    # 重启 Nginx
    sudo systemctl restart nginx
    
    echo "✅ Nginx 配置已更新"
    echo ""
    echo "⚠️  注意：使用自签名证书时，浏览器会显示安全警告"
    echo "   你需要在浏览器中手动信任该证书"
    echo ""
    echo "🌐 后端 API 地址: https://$PUBLIC_IP:8000"
    
elif [ "$choice" = "2" ]; then
    echo ""
    echo "📝 配置域名后使用 Let's Encrypt"
    echo ""
    read -p "请输入你的后端域名（例如: api.yourdomain.com）: " domain
    
    if [ -z "$domain" ]; then
        echo "❌ 域名不能为空"
        exit 1
    fi
    
    echo ""
    echo "📝 更新 Nginx 配置..."
    
    # 备份原配置
    sudo cp /etc/nginx/sites-available/sl-news-backend /etc/nginx/sites-available/sl-news-backend.backup
    
    # 创建临时 HTTP 配置（用于 Let's Encrypt 验证）
    sudo tee /etc/nginx/sites-available/sl-news-backend > /dev/null <<EOF
server {
    listen 80;
    server_name $domain;
    client_max_body_size 10M;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /uploads/ {
        alias /home/ubuntu/backend/uploads/;
        expires 30d;
    }
}
EOF
    
    # 测试配置
    sudo nginx -t
    
    # 重启 Nginx
    sudo systemctl restart nginx
    
    echo "✅ Nginx 配置已更新"
    echo ""
    echo "🔐 申请 Let's Encrypt 证书..."
    echo ""
    
    # 申请证书
    sudo certbot --nginx -d $domain --non-interactive --agree-tos --email admin@$domain --redirect
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ SSL 证书配置成功！"
        echo ""
        echo "🌐 后端 API 地址: https://$domain"
        echo ""
        echo "📝 验证自动续期:"
        sudo certbot renew --dry-run
    else
        echo ""
        echo "❌ SSL 证书申请失败"
        echo "   请确保："
        echo "   1. 域名 DNS 已正确配置并指向此服务器"
        echo "   2. 端口 80 和 443 已在安全组中开放"
    fi
else
    echo "❌ 无效的选择"
    exit 1
fi

echo ""
echo "================================"
echo "✅ 配置完成！"
echo "================================"

