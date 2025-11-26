#!/bin/bash
# 重启后端并启用详细日志

echo "🛑 停止现有后端进程..."
pkill -f "uvicorn app.main:app"
sleep 2

echo "🚀 启动后端 (带日志)..."
cd /home/ubuntu/backend
source venv/bin/activate

# 启动后端并将输出重定向到日志文件
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2 --log-level debug > /home/ubuntu/backend/uvicorn.log 2>&1 &

echo "等待后端启动..."
sleep 5

echo ""
echo "✅ 后端已启动,PID: $(pgrep -f 'uvicorn app.main:app')"
echo ""
echo "📋 日志文件: /home/ubuntu/backend/uvicorn.log"
echo ""
echo "🔍 测试 API..."
curl -s http://localhost:8000/api/health || echo "API 未响应"

