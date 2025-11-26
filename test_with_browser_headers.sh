#!/bin/bash
# 模拟浏览器请求

echo "🔍 模拟浏览器请求 (带 CORS 头)"
echo "================================"

curl -v -X POST http://18.221.125.254:8000/api/v1/appointments \
  -H "Content-Type: application/json" \
  -H "Origin: http://sl-news-frontend.s3-website.us-east-2.amazonaws.com" \
  -H "Referer: http://sl-news-frontend.s3-website.us-east-2.amazonaws.com/" \
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
  -d '{
    "name": "测试",
    "email": "test@example.com",
    "phone": "1234567890",
    "service_type": "咨询服务",
    "appointment_date": "2025-11-28",
    "time_slot": "11:00",
    "notes": "浏览器测试"
  }' 2>&1

echo ""
echo ""
echo "🔍 查看后端日志"
echo "================================"
tail -20 /home/ubuntu/backend/uvicorn.log

