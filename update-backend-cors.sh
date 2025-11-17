#!/bin/bash

# 更新后端 CORS 配置以允许 S3 网站访问
# 使用方法: ./update-backend-cors.sh

set -e

echo "🔧 更新后端 CORS 配置..."

# EC2 连接信息
EC2_IP="18.221.125.254"
EC2_USER="ubuntu"
BACKEND_DIR="/home/ubuntu/backend"

# S3 网站地址
S3_WEBSITE="http://sl-news-frontend.s3-website.us-east-2.amazonaws.com"

echo "📝 连接到 EC2 服务器..."

# 使用 SSH 连接并更新 .env 文件
ssh -i "your-key.pem" ${EC2_USER}@${EC2_IP} << 'ENDSSH'

# 进入后端目录
cd /home/ubuntu/backend

# 备份当前 .env 文件
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# 更新 CORS_ORIGINS
echo "📝 更新 CORS_ORIGINS..."

# 检查是否已经包含 S3 网站地址
if grep -q "sl-news-frontend.s3-website" .env; then
    echo "✅ S3 网站地址已在 CORS 配置中"
else
    # 添加 S3 网站地址到 CORS_ORIGINS
    sed -i 's|CORS_ORIGINS=\(.*\)|CORS_ORIGINS=\1,http://sl-news-frontend.s3-website.us-east-2.amazonaws.com|' .env
    echo "✅ 已添加 S3 网站地址到 CORS 配置"
fi

# 显示更新后的 CORS 配置
echo "📋 当前 CORS 配置:"
grep CORS_ORIGINS .env

# 重启后端服务
echo "🔄 重启后端服务..."
sudo systemctl restart backend

# 检查服务状态
echo "📊 检查服务状态..."
sudo systemctl status backend --no-pager

echo "✅ 后端 CORS 配置更新完成！"

ENDSSH

echo "✅ 完成！"

