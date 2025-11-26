#!/bin/bash
# 测试预约并捕获错误

echo "🔍 重启后端服务以启用日志..."
sudo systemctl restart backend
sleep 3

echo ""
echo "🔍 测试创建预约..."
curl -v -X POST http://localhost:8000/api/v1/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试用户",
    "email": "test@example.com",
    "phone": "1234567890",
    "service_type": "咨询服务",
    "appointment_date": "2025-11-27",
    "time_slot": "14:00",
    "notes": "测试预约"
  }' 2>&1

echo ""
echo ""
echo "🔍 查看最新的后端日志..."
sudo journalctl -u backend -n 50 --no-pager | tail -30

