#!/bin/bash
# 实时监控请求

echo "🔍 实时监控后端请求..."
echo "请在浏览器中提交预约..."
echo "================================"
echo ""

# 清空日志
> /home/ubuntu/backend/uvicorn.log

# 实时显示日志
tail -f /home/ubuntu/backend/uvicorn.log

