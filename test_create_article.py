#!/usr/bin/env python3
"""测试创建文章 API"""

import requests
import json

BASE_URL = "http://localhost:8000"

# 1. 登录获取 token
print("1. 登录...")
login_response = requests.post(
    f"{BASE_URL}/api/v1/auth/admin-login",
    json={"username": "admin", "password": "admin123"}
)

if login_response.status_code != 200:
    print(f"❌ 登录失败: {login_response.status_code}")
    print(login_response.text)
    exit(1)

token = login_response.json()["access_token"]
print(f"✅ 登录成功，token: {token[:20]}...")

# 2. 创建文章
print("\n2. 创建文章...")

article_data = {
    "category": "analysis",
    "title_zh": "测试文章标题",
    "title_en": "Test Article Title",
    "summary_zh": "这是一个测试摘要",
    "summary_en": "This is a test summary",
    "lead_zh": "这是中文导语，可以很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长",
    "lead_en": "This is English lead, can be very long very long very long very long very long very long very long very long very long very long very long very long very long very long very long very long very long very long very long very long very long very long very long very long",
    "content_zh": [
        {"type": "paragraph", "text": "这是第一段中文内容"}
    ],
    "content_en": [
        {"type": "paragraph", "text": "This is the first English paragraph"}
    ],
    "author": "测试作者",
    "status": "draft"
}

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

create_response = requests.post(
    f"{BASE_URL}/api/v1/articles",
    json=article_data,
    headers=headers
)

print(f"状态码: {create_response.status_code}")

if create_response.status_code in [200, 201]:
    result = create_response.json()
    print("✅ 创建成功！")
    print(f"文章 ID: {result['id']}")
    print(f"标题: {result['title_zh']}")
    print(f"导语长度: {len(result.get('lead_zh', ''))}")
else:
    print(f"❌ 创建失败")
    print(f"响应: {create_response.text}")

