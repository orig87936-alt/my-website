#!/bin/bash
# 实时监控后端日志

echo "=========================================="
echo "实时监控后端日志"
echo "=========================================="
echo ""
echo "请在浏览器中提交预约..."
echo ""

# 清空日志文件
> /home/ubuntu/backend/uvicorn.log

# 实时显示日志
tail -f /home/ubuntu/backend/uvicorn.log

