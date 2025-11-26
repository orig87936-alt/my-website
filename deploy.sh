#!/bin/bash

# 部署脚本 - Gmail SMTP 邮件功能
# 使用方法: ./deploy.sh

set -e  # 遇到错误立即退出

echo "🚀 开始部署 Gmail SMTP 邮件功能..."
echo "="*60

# 1. 检查当前目录
if [ ! -d "backend" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 2. 进入 backend 目录
cd backend

# 3. 安装依赖
echo ""
echo "📦 安装依赖..."
pip install aiosmtplib==3.0.1

# 4. 检查 .env 配置
echo ""
echo "🔍 检查 .env 配置..."
if ! grep -q "SMTP_HOST" .env; then
    echo "⚠️  警告: .env 文件中缺少 SMTP 配置"
    echo "请手动添加以下配置到 .env 文件:"
    echo ""
    echo "# Gmail SMTP Configuration"
    echo "SMTP_HOST=smtp.gmail.com"
    echo "SMTP_PORT=587"
    echo "SMTP_USER=zeno.wangzeyu@gmail.com"
    echo "SMTP_PASSWORD=qxngmgfsqelgxjfm"
    echo "ADMIN_NOTIFICATION_EMAIL=orig87936@gmail.com"
    echo ""
    read -p "配置完成后按回车继续..."
fi

# 5. 运行测试
echo ""
echo "🧪 运行邮件功能测试..."
python test_smtp_email.py

# 6. 询问是否重启服务
echo ""
echo "="*60
read -p "测试通过！是否重启后端服务？(y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 重启后端服务..."
    
    # 检查使用的进程管理器
    if command -v pm2 &> /dev/null; then
        echo "使用 PM2 重启..."
        pm2 restart news-platform-backend || echo "⚠️  PM2 重启失败，请手动重启"
    elif command -v systemctl &> /dev/null; then
        echo "使用 systemd 重启..."
        sudo systemctl restart news-platform-backend || echo "⚠️  systemd 重启失败，请手动重启"
    else
        echo "⚠️  未检测到 PM2 或 systemd"
        echo "请手动重启后端服务:"
        echo "  python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"
    fi
fi

echo ""
echo "="*60
echo "✅ 部署完成！"
echo ""
echo "📧 邮件配置:"
echo "  发件邮箱: zeno.wangzeyu@gmail.com"
echo "  管理员邮箱: orig87936@gmail.com"
echo ""
echo "🎯 下一步:"
echo "  1. 通过前端提交测试预约"
echo "  2. 检查邮箱是否收到邮件"
echo "  3. 验证邮件内容是否正确"
echo ""
echo "📚 详细文档: DEPLOYMENT_GUIDE.md"
echo "="*60

