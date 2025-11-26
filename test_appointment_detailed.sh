#!/bin/bash
# 详细测试预约 API

echo "🔍 测试 1: 创建预约 (正确数据)"
echo "================================"
curl -v -X POST http://localhost:8000/api/v1/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "张三",
    "email": "test@example.com",
    "phone": "13800138000",
    "service_type": "咨询服务",
    "appointment_date": "2025-11-28",
    "time_slot": "10:00",
    "notes": "测试预约"
  }' 2>&1 | grep -E "HTTP/|< |{|}"

echo ""
echo ""
echo "🔍 测试 2: 查看可用时间槽"
echo "================================"
curl -s http://localhost:8000/api/v1/appointments/available-slots?appointment_date=2025-11-28 | head -20

echo ""
echo ""
echo "🔍 查看后端日志 (最后 30 行)"
echo "================================"
tail -30 /home/ubuntu/backend/uvicorn.log

