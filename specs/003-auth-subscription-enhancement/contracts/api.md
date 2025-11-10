# API 接口文档 - 用户认证与订阅系统

## 📋 概述

本文档定义用户认证与订阅系统的所有 API 接口。

**Base URL**: `http://localhost:8000/api/v1`  
**认证方式**: Bearer Token (JWT)

---

## 🔐 认证接口

### 1. 用户注册

**端点**: `POST /auth/register`  
**权限**: 公开  
**描述**: 用户通过邮箱注册账号

#### 请求体
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "verification_code": "123456",
  "display_name": "张三"  // 可选
}
```

#### 响应 (201 Created)
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "display_name": "张三",
    "avatar_url": null,
    "role": "user",
    "is_verified": true,
    "created_at": "2025-11-10T10:00:00Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

#### 错误响应
- `400 Bad Request` - 验证码错误或已过期
- `409 Conflict` - 邮箱已被注册

---

### 2. 邮箱登录

**端点**: `POST /auth/login`  
**权限**: 公开  
**描述**: 用户通过邮箱和密码登录

#### 请求体
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "remember_me": true  // 可选，默认 false
}
```

#### 响应 (200 OK)
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "display_name": "张三",
    "avatar_url": null,
    "role": "user"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

#### 错误响应
- `401 Unauthorized` - 邮箱或密码错误
- `403 Forbidden` - 账号已被禁用

---

### 3. 管理员登录

**端点**: `POST /auth/admin-login`  
**权限**: 公开  
**描述**: 管理员通过用户名和密码登录

#### 请求体
```json
{
  "username": "admin",
  "password": "admin123"
}
```

#### 响应 (200 OK)
```json
{
  "user": {
    "id": "uuid",
    "username": "admin",
    "email": "admin@example.com",
    "display_name": "Administrator",
    "role": "admin"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

---

### 4. 刷新 Token

**端点**: `POST /auth/refresh`  
**权限**: 公开  
**描述**: 使用 Refresh Token 获取新的 Access Token

#### 请求体
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### 响应 (200 OK)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

---

### 5. 退出登录

**端点**: `POST /auth/logout`  
**权限**: 需要登录  
**描述**: 撤销当前 Refresh Token

#### 请求头
```
Authorization: Bearer {access_token}
```

#### 请求体
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### 响应 (200 OK)
```json
{
  "message": "Successfully logged out"
}
```

---

### 6. 获取当前用户信息

**端点**: `GET /auth/me`  
**权限**: 需要登录  
**描述**: 获取当前登录用户的信息

#### 请求头
```
Authorization: Bearer {access_token}
```

#### 响应 (200 OK)
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": null,
  "display_name": "张三",
  "avatar_url": "https://...",
  "role": "user",
  "auth_provider": "email",
  "is_verified": true,
  "created_at": "2025-11-10T10:00:00Z"
}
```

---

### 7. 更新用户信息

**端点**: `PUT /auth/me`  
**权限**: 需要登录  
**描述**: 更新当前用户的个人信息

#### 请求头
```
Authorization: Bearer {access_token}
```

#### 请求体
```json
{
  "display_name": "李四",
  "avatar_url": "https://..."
}
```

#### 响应 (200 OK)
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "display_name": "李四",
  "avatar_url": "https://...",
  "updated_at": "2025-11-10T11:00:00Z"
}
```

---

## 🔵 Google OAuth 接口

### 8. 获取 Google OAuth URL

**端点**: `GET /auth/google/url`  
**权限**: 公开  
**描述**: 获取 Google OAuth 授权 URL

#### 响应 (200 OK)
```json
{
  "auth_url": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

---

### 9. Google OAuth 回调

**端点**: `GET /auth/google/callback`  
**权限**: 公开  
**描述**: 处理 Google OAuth 回调

#### 查询参数
- `code`: OAuth 授权码
- `state`: 状态参数

#### 响应 (302 Redirect)
重定向到前端页面，并在 URL 中携带 Token：
```
http://localhost:3000/auth/callback?access_token=...&refresh_token=...
```

---

### 10. 使用 Google Token 登录

**端点**: `POST /auth/google/token`  
**权限**: 公开  
**描述**: 使用 Google ID Token 登录

#### 请求体
```json
{
  "id_token": "eyJhbGciOiJSUzI1NiIs..."
}
```

#### 响应 (200 OK)
```json
{
  "user": {
    "id": "uuid",
    "email": "user@gmail.com",
    "display_name": "John Doe",
    "avatar_url": "https://lh3.googleusercontent.com/...",
    "role": "user",
    "auth_provider": "google"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

---

## 📧 邮箱验证接口

### 11. 发送验证码

**端点**: `POST /verification/send`  
**权限**: 公开  
**描述**: 发送邮箱验证码

#### 请求体
```json
{
  "email": "user@example.com",
  "purpose": "register"  // register | login | reset_password
}
```

#### 响应 (200 OK)
```json
{
  "message": "Verification code sent successfully",
  "expires_in": 600  // 10分钟
}
```

#### 错误响应
- `429 Too Many Requests` - 发送过于频繁（60秒内只能发送一次）

---

### 12. 验证验证码

**端点**: `POST /verification/verify`  
**权限**: 公开  
**描述**: 验证邮箱验证码

#### 请求体
```json
{
  "email": "user@example.com",
  "code": "123456",
  "purpose": "register"
}
```

#### 响应 (200 OK)
```json
{
  "valid": true,
  "message": "Verification code is valid"
}
```

#### 错误响应
- `400 Bad Request` - 验证码错误或已过期

---

## 📬 订阅接口

### 13. 创建订阅

**端点**: `POST /subscriptions`  
**权限**: 公开  
**描述**: 用户订阅网站更新

#### 请求体
```json
{
  "email": "user@example.com",
  "subscription_types": ["article_updates", "market_analysis"],
  "frequency": "weekly",  // realtime | daily | weekly
  "source": "homepage"  // 可选
}
```

#### 响应 (201 Created)
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "subscription_types": ["article_updates", "market_analysis"],
  "frequency": "weekly",
  "status": "pending",
  "message": "Please check your email to confirm subscription"
}
```

---

### 14. 确认订阅

**端点**: `GET /subscriptions/confirm/{token}`  
**权限**: 公开  
**描述**: 确认邮箱订阅

#### 路径参数
- `token`: 确认令牌

#### 响应 (200 OK)
```json
{
  "message": "Subscription confirmed successfully",
  "subscription": {
    "id": "uuid",
    "email": "user@example.com",
    "status": "active",
    "confirmed_at": "2025-11-10T10:00:00Z"
  }
}
```

---

### 15. 获取订阅列表（管理员）

**端点**: `GET /subscriptions`  
**权限**: 管理员  
**描述**: 获取所有订阅用户列表

#### 请求头
```
Authorization: Bearer {admin_access_token}
```

#### 查询参数
- `page`: 页码（默认 1）
- `page_size`: 每页数量（默认 20）
- `status`: 筛选状态（pending | active | paused | unsubscribed）
- `search`: 搜索邮箱
- `sort`: 排序字段（created_at | email）
- `order`: 排序方向（asc | desc）

#### 响应 (200 OK)
```json
{
  "items": [
    {
      "id": "uuid",
      "email": "user1@example.com",
      "subscription_types": ["article_updates"],
      "frequency": "weekly",
      "status": "active",
      "confirmed_at": "2025-11-01T10:00:00Z",
      "created_at": "2025-11-01T09:00:00Z"
    }
  ],
  "total": 156,
  "page": 1,
  "page_size": 20,
  "total_pages": 8
}
```

---

### 16. 更新订阅（管理员）

**端点**: `PUT /subscriptions/{id}`  
**权限**: 管理员  
**描述**: 更新订阅信息

#### 请求体
```json
{
  "status": "paused",
  "subscription_types": ["article_updates", "announcements"],
  "frequency": "daily"
}
```

#### 响应 (200 OK)
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "status": "paused",
  "updated_at": "2025-11-10T10:00:00Z"
}
```

---

### 17. 删除订阅（管理员）

**端点**: `DELETE /subscriptions/{id}`  
**权限**: 管理员  
**描述**: 删除订阅记录

#### 响应 (200 OK)
```json
{
  "message": "Subscription deleted successfully"
}
```

---

### 18. 导出订阅（管理员）

**端点**: `GET /subscriptions/export`  
**权限**: 管理员  
**描述**: 导出订阅列表为 CSV

#### 查询参数
- `status`: 筛选状态（可选）
- `format`: 导出格式（csv | xlsx）

#### 响应 (200 OK)
```
Content-Type: text/csv
Content-Disposition: attachment; filename="subscriptions_2025-11-10.csv"

email,status,subscription_types,frequency,created_at
user1@example.com,active,"article_updates,market_analysis",weekly,2025-11-01T10:00:00Z
...
```

---

### 19. 退订

**端点**: `GET /subscriptions/unsubscribe/{token}`  
**权限**: 公开  
**描述**: 用户退订

#### 路径参数
- `token`: 退订令牌

#### 响应 (200 OK)
```json
{
  "message": "Successfully unsubscribed",
  "email": "user@example.com"
}
```

---

## 📊 数据模型

### User
```typescript
interface User {
  id: string;
  email: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  role: 'admin' | 'user';
  auth_provider: 'email' | 'google';
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}
```

### Subscription
```typescript
interface Subscription {
  id: string;
  email: string;
  user_id?: string;
  subscription_types: string[];
  frequency: 'realtime' | 'daily' | 'weekly';
  status: 'pending' | 'active' | 'paused' | 'unsubscribed';
  source?: string;
  confirmed_at?: string;
  unsubscribed_at?: string;
  created_at: string;
  updated_at: string;
}
```

---

## 🔒 认证说明

### Access Token
- **有效期**: 1 小时
- **用途**: API 请求认证
- **格式**: JWT
- **携带方式**: `Authorization: Bearer {token}`

### Refresh Token
- **有效期**: 7 天（remember_me: true 时为 30 天）
- **用途**: 刷新 Access Token
- **格式**: JWT
- **存储**: HttpOnly Cookie 或 LocalStorage

---

*最后更新: 2025-11-10*

