# 快速开始 - 用户认证与订阅系统增强

## 📋 概述

本文档帮助你快速开始实施用户认证与订阅系统增强功能。

---

## ✅ 前置条件

### 环境要求
- Python 3.11+
- Node.js 18+
- PostgreSQL 16+
- Redis 7+ (可选，用于缓存)

### 已安装的依赖
```bash
# 后端
pip install fastapi uvicorn sqlalchemy alembic asyncpg
pip install pyjwt bcrypt python-multipart aiosmtplib
pip install google-auth google-auth-oauthlib

# 前端
npm install react react-router-dom
npm install @react-oauth/google axios zustand
npm install react-hook-form zod
```

---

## 🚀 快速开始

### 步骤 1：配置环境变量

创建或更新 `backend/.env` 文件：

```env
# 数据库
DATABASE_URL=postgresql+asyncpg://newsuser:newspass123@localhost:5432/newsdb

# JWT 密钥（生成一个随机字符串）
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/auth/google/callback

# 邮件服务（选择一种）
# 选项 1: SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
SMTP_FROM_NAME=News Platform

# 选项 2: SendGrid
# SENDGRID_API_KEY=your-sendgrid-api-key
# SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# 前端 URL
FRONTEND_URL=http://localhost:3000

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

---

### 步骤 2：创建数据库迁移

```bash
cd backend

# 创建迁移文件
alembic revision -m "add_auth_subscription_tables"

# 编辑迁移文件（参考 data-model.md）
# backend/alembic/versions/xxx_add_auth_subscription_tables.py

# 执行迁移
alembic upgrade head
```

---

### 步骤 3：配置 Google OAuth

#### 3.1 创建 Google Cloud 项目
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 "Google+ API"

#### 3.2 创建 OAuth 2.0 凭据
1. 导航到 "APIs & Services" > "Credentials"
2. 点击 "Create Credentials" > "OAuth client ID"
3. 选择 "Web application"
4. 配置：
   - **Name**: News Platform
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000`
     - `http://localhost:8000`
   - **Authorized redirect URIs**:
     - `http://localhost:8000/api/v1/auth/google/callback`
     - `http://localhost:3000/auth/callback`
5. 保存 Client ID 和 Client Secret 到 `.env`

---

### 步骤 4：配置邮件服务

#### 选项 A: 使用 Gmail SMTP

1. 启用 Gmail 两步验证
2. 生成应用专用密码：
   - 访问 [Google Account Security](https://myaccount.google.com/security)
   - 选择 "App passwords"
   - 生成新密码
3. 将密码添加到 `.env` 的 `SMTP_PASSWORD`

#### 选项 B: 使用 SendGrid

1. 注册 [SendGrid](https://sendgrid.com/)
2. 创建 API Key
3. 验证发件人邮箱
4. 将 API Key 添加到 `.env`

---

### 步骤 5：运行后端

```bash
cd backend

# 启动开发服务器
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 访问 API 文档
# http://localhost:8000/docs
```

---

### 步骤 6：配置前端

更新 `src/config.ts`：

```typescript
export const config = {
  apiBaseUrl: 'http://localhost:8000/api/v1',
  googleClientId: 'your-google-client-id.apps.googleusercontent.com',
  tokenStorageKey: 'auth_token',
  refreshTokenStorageKey: 'refresh_token',
};
```

---

### 步骤 7：运行前端

```bash
cd ..  # 返回项目根目录

# 启动开发服务器
npm run dev

# 访问应用
# http://localhost:3000
```

---

## 🧪 测试功能

### 测试 1：访客浏览
1. 打开 `http://localhost:3000`
2. ✅ 应该直接显示首页，无需登录
3. ✅ 可以浏览文章列表
4. ✅ 右上角显示"登录"和"注册"按钮

### 测试 2：用户注册
1. 点击"注册"按钮
2. 输入邮箱地址
3. 点击"发送验证码"
4. 检查邮箱，输入验证码
5. 设置密码和昵称
6. 点击"注册"
7. ✅ 注册成功，自动登录

### 测试 3：邮箱登录
1. 点击"登录"按钮
2. 输入邮箱和密码
3. 点击"登录"
4. ✅ 登录成功，显示用户菜单

### 测试 4：Google 登录
1. 点击"登录"按钮
2. 点击"使用 Google 登录"
3. 选择 Google 账号
4. ✅ 登录成功，自动创建账号

### 测试 5：管理员登录
1. 点击"登录"按钮
2. 输入用户名：`admin`
3. 输入密码：`admin123`（默认密码）
4. 点击"登录"
5. ✅ 登录成功，显示"管理后台"入口

### 测试 6：订阅功能
1. 滚动到首页底部
2. 输入邮箱地址
3. 选择订阅类型和频率
4. 点击"订阅"
5. 检查邮箱，点击确认链接
6. ✅ 订阅成功

### 测试 7：订阅管理（管理员）
1. 以管理员身份登录
2. 点击"管理后台" > "订阅管理"
3. ✅ 查看所有订阅用户
4. ✅ 搜索和筛选功能正常
5. ✅ 导出 CSV 功能正常

---

## 🔍 故障排查

### 问题 1：数据库连接失败
```
sqlalchemy.exc.OperationalError: could not connect to server
```

**解决方案**：
1. 检查 PostgreSQL 是否运行
2. 检查 `.env` 中的 `DATABASE_URL` 是否正确
3. 检查数据库用户权限

### 问题 2：邮件发送失败
```
aiosmtplib.errors.SMTPAuthenticationError
```

**解决方案**：
1. 检查 SMTP 凭据是否正确
2. 确认已启用"应用专用密码"（Gmail）
3. 检查防火墙是否阻止 SMTP 端口

### 问题 3：Google OAuth 失败
```
invalid_client: The OAuth client was not found
```

**解决方案**：
1. 检查 `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET`
2. 确认重定向 URI 配置正确
3. 检查 Google Cloud Console 中的 OAuth 设置

### 问题 4：Token 验证失败
```
401 Unauthorized: Could not validate credentials
```

**解决方案**：
1. 检查 `SECRET_KEY` 是否一致
2. 清除浏览器缓存和 LocalStorage
3. 重新登录获取新 Token

---

## 📚 下一步

完成快速开始后，你可以：

1. **阅读详细文档**：
   - [功能规格](./spec.md)
   - [数据模型](./data-model.md)
   - [API 接口](./contracts/api.md)
   - [实施计划](./plan.md)

2. **开始开发**：
   - 按照 [任务清单](./tasks.md) 逐步实施
   - 参考 [API 文档](./contracts/api.md) 开发接口

3. **测试和优化**：
   - 编写单元测试
   - 进行性能优化
   - 收集用户反馈

---

## 💡 最佳实践

### 安全性
- ✅ 使用强密码策略（至少 8 位，包含字母和数字）
- ✅ 定期更换 `SECRET_KEY`
- ✅ 使用 HTTPS（生产环境）
- ✅ 限制登录尝试次数
- ✅ 定期审计用户权限

### 性能
- ✅ 使用 Redis 缓存 Token
- ✅ 异步发送邮件
- ✅ 数据库查询优化
- ✅ 使用 CDN 加速静态资源

### 用户体验
- ✅ 提供清晰的错误提示
- ✅ 优化表单验证
- ✅ 支持记住登录状态
- ✅ 提供忘记密码功能

---

## 🆘 获取帮助

如果遇到问题：

1. 查看 [故障排查](#-故障排查) 部分
2. 检查后端日志：`backend/logs/`
3. 检查浏览器控制台错误
4. 查看 API 文档：`http://localhost:8000/docs`

---

*最后更新: 2025-11-10*

