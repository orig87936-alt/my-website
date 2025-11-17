#!/bin/bash
# 检查服务器状态脚本

echo "========================================"
echo "🔍 检查服务器状态"
echo "========================================"
echo ""

echo "1️⃣ 检查后端服务状态..."
echo "----------------------------------------"
sudo systemctl status sl-news-backend --no-pager
echo ""

echo "2️⃣ 检查 Nginx 状态..."
echo "----------------------------------------"
sudo systemctl status nginx --no-pager
echo ""

echo "3️⃣ 检查端口监听..."
echo "----------------------------------------"
sudo netstat -tlnp | grep -E ':(80|8000)'
echo ""

echo "4️⃣ 检查后端进程..."
echo "----------------------------------------"
ps aux | grep uvicorn
echo ""

echo "5️⃣ 测试本地访问..."
echo "----------------------------------------"
echo "测试 localhost:8000/health..."
curl -s http://localhost:8000/health || echo "无法访问"
echo ""
echo "测试 localhost:80/docs..."
curl -I http://localhost:80/docs 2>&1 | head -5
echo ""

echo "6️⃣ 查看最近的后端日志..."
echo "----------------------------------------"
sudo journalctl -u sl-news-backend -n 20 --no-pager
echo ""

echo "7️⃣ 查看 Nginx 错误日志..."
echo "----------------------------------------"
sudo tail -20 /var/log/nginx/error.log
echo ""

echo "========================================"
echo "✅ 检查完成"
echo "========================================"

