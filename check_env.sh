#!/bin/bash

echo "=========================================="
echo "检查后端 .env 文件中的 DATABASE_URL"
echo "=========================================="
echo ""

# 检查 DATABASE_URL
if grep -q "DATABASE_URL" backend/.env 2>/dev/null; then
    echo "✅ 找到 DATABASE_URL:"
    grep "DATABASE_URL" backend/.env | head -1
    echo ""
    
    # 检查是否使用了正确的驱动
    if grep "DATABASE_URL" backend/.env | grep -q "postgresql+asyncpg://"; then
        echo "✅ 使用正确的驱动: postgresql+asyncpg://"
    elif grep "DATABASE_URL" backend/.env | grep -q "postgresql://"; then
        echo "❌ 错误！使用了 postgresql:// 而不是 postgresql+asyncpg://"
        echo ""
        echo "需要修改为:"
        grep "DATABASE_URL" backend/.env | sed 's/postgresql:\/\//postgresql+asyncpg:\/\//'
    else
        echo "⚠️  未知的数据库 URL 格式"
    fi
else
    echo "❌ 未找到 .env 文件或 DATABASE_URL 配置"
fi

