#!/bin/bash
# 测试预约 API

echo "🔍 测试创建预约 (使用 time_slot)..."
curl -X POST http://localhost:8000/api/v1/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试",
    "email": "test@example.com",
    "phone": "1234567890",
    "service_type": "咨询服务",
    "appointment_date": "2025-11-27",
    "time_slot": "09:30",
    "notes": "测试预约"
  }'

echo ""
echo "✅ 测试完成"

