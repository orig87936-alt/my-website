# ✅ 生产环境部署检查清单

使用此清单确保你已准备好所有必需的配置和服务。

---

## 📋 **必需服务清单**

### **1️⃣ 邮件服务（二选一）**

- [ ] **Resend（推荐）**
  - [ ] 注册账号：https://resend.com/
  - [ ] 获取 API Key：`re_xxxxxxxxxxxxxxxxxxxxxxxxxx`
  - [ ] 添加并验证域名
  - [ ] 配置 DNS 记录（TXT + MX）
  - [ ] 设置发件邮箱：`noreply@yourdomain.com`

- [ ] **Gmail SMTP（备选）**
  - [ ] 启用两步验证
  - [ ] 生成应用专用密码：https://myaccount.google.com/apppasswords
  - [ ] 复制 16 位密码

---

### **2️⃣ Google OAuth**

- [ ] 创建 Google Cloud 项目：https://console.cloud.google.com/
- [ ] 启用 Google+ API
- [ ] 配置 OAuth 同意屏幕
- [ ] 创建 OAuth 2.0 凭据
- [ ] 配置授权重定向 URI：
  - [ ] `https://api.yourdomain.com/api/v1/auth/google/callback`
  - [ ] `https://yourdomain.com`
- [ ] 获取客户端 ID：`123456789-abc...xyz.apps.googleusercontent.com`
- [ ] 获取客户端密钥：`GOCSPX-abc123xyz...`

---

### **3️⃣ DeepSeek API**

- [ ] 注册账号：https://platform.deepseek.com/
- [ ] 创建 API Key
- [ ] 复制 API Key：`sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- [ ] （可选）充值账户

---

### **4️⃣ OpenAI API**

- [ ] 注册账号：https://platform.openai.com/
- [ ] 创建 API Key
- [ ] 复制 API Key：`sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- [ ] 添加支付方式并充值（至少 $5）

---

### **5️⃣ 数据库（二选一）**

- [ ] **Supabase（推荐）**
  - [ ] 注册账号：https://supabase.com/
  - [ ] 创建项目
  - [ ] 设置数据库密码
  - [ ] 启用 pgvector 扩展
  - [ ] 获取连接字符串

- [ ] **Railway（备选）**
  - [ ] 注册账号：https://railway.app/
  - [ ] 创建 PostgreSQL 服务
  - [ ] 获取连接字符串

---

### **6️⃣ 安全配置**

- [ ] 生成 JWT Secret Key（至少 32 字符）
  ```bash
  python -c "import secrets; print(secrets.token_urlsafe(32))"
  ```
- [ ] 设置强管理员密码（至少 12 位）

---

### **7️⃣ 域名和 DNS**

- [ ] 注册域名（例如：`yourdomain.com`）
- [ ] 配置 DNS 记录：
  - [ ] A 记录：`yourdomain.com` → 前端服务器 IP
  - [ ] A 记录：`api.yourdomain.com` → 后端服务器 IP
  - [ ] （如使用 Resend）TXT 记录：域名验证
  - [ ] （如使用 Resend）MX 记录：邮件发送

---

## 📝 **环境变量配置清单**

### **后端环境变量** (`backend/.env`)

```bash
# 应用配置
APP_NAME="S&L News API"
DEBUG=False
ENVIRONMENT=production

# 数据库
DATABASE_URL=postgresql://...

# DeepSeek API
DEEPSEEK_API_KEY=sk-...
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1

# OpenAI API
OPENAI_API_KEY=sk-...
EMBEDDING_MODEL=text-embedding-3-small

# JWT
SECRET_KEY=your-generated-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
CORS_ORIGINS=https://yourdomain.com

# 邮件（选择一种）
# Resend
RESEND_API_KEY=re-...
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=S&L News Platform

# 或 Gmail SMTP
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASSWORD=xxxx xxxx xxxx xxxx
# EMAIL_FROM=your-email@gmail.com

# Google OAuth
GOOGLE_CLIENT_ID=123456789-...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
GOOGLE_REDIRECT_URI=https://api.yourdomain.com/api/v1/auth/google/callback

# 前端 URL
FRONTEND_URL=https://yourdomain.com

# 管理员
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-strong-password

# 服务器
HOST=0.0.0.0
PORT=8000
```

### **前端环境变量** (`.env`)

```bash
# 后端 API
VITE_API_BASE_URL=https://api.yourdomain.com

# Google OAuth
VITE_GOOGLE_CLIENT_ID=123456789-...apps.googleusercontent.com
```

---

## 🚀 **部署步骤清单**

### **准备阶段**

- [ ] 完成所有服务注册和配置
- [ ] 获取所有 API 密钥
- [ ] 创建生产数据库
- [ ] 配置 DNS 记录

### **后端部署**

- [ ] 选择部署平台（Railway/Render/Fly.io/AWS）
- [ ] 配置环境变量
- [ ] 部署后端代码
- [ ] 运行数据库迁移：`alembic upgrade head`
- [ ] 验证后端 API：访问 `https://api.yourdomain.com/docs`

### **前端部署**

- [ ] 选择部署平台（Vercel/Netlify/Cloudflare Pages）
- [ ] 配置环境变量
- [ ] 部署前端代码
- [ ] 验证前端：访问 `https://yourdomain.com`

### **功能测试**

- [ ] 测试用户注册
- [ ] 测试邮箱验证码接收
- [ ] 测试邮箱验证链接
- [ ] 测试 Google 登录
- [ ] 测试管理员登录
- [ ] 测试新闻发布
- [ ] 测试 AI 聊天
- [ ] 测试文档翻译
- [ ] 测试预约功能
- [ ] 测试订阅功能

---

## 📊 **你需要提供给我的信息**

当你准备好部署时，请提供以下信息：

### **1. 邮件服务**
- [ ] 选择的方案：Resend / Gmail SMTP
- [ ] Resend API Key（如选择 Resend）
- [ ] Gmail 应用专用密码（如选择 Gmail）
- [ ] 发件邮箱地址

### **2. Google OAuth**
- [ ] Google Client ID
- [ ] Google Client Secret
- [ ] 授权重定向 URI

### **3. API 密钥**
- [ ] DeepSeek API Key
- [ ] OpenAI API Key

### **4. 数据库**
- [ ] 数据库连接字符串（DATABASE_URL）

### **5. 域名**
- [ ] 前端域名（例如：`yourdomain.com`）
- [ ] 后端域名（例如：`api.yourdomain.com`）

### **6. 安全**
- [ ] JWT Secret Key
- [ ] 管理员密码

---

## 💡 **快速开始建议**

如果你是第一次部署，建议按以下顺序进行：

1. **先使用免费服务测试**：
   - Gmail SMTP（邮件）
   - Supabase（数据库）
   - Railway（后端）
   - Vercel（前端）

2. **测试所有功能正常后**：
   - 考虑升级到 Resend（更好的邮件送达率）
   - 考虑使用自定义域名

3. **流量增长后**：
   - 升级数据库套餐
   - 增加 API 额度

---

## 📞 **需要帮助？**

准备好后，请告诉我：

1. ✅ 你已经完成了哪些步骤
2. ❓ 你在哪个步骤遇到了问题
3. 📋 你获取到的配置信息（API Key 等）

我会帮你完成剩余的配置和部署！🚀

---

## 🎯 **下一步**

当你准备好所有配置后，我可以帮你：

1. 更新前端代码以支持真正的 Google OAuth（目前是 Mock）
2. 创建部署脚本
3. 配置 CI/CD 自动部署
4. 优化生产环境性能
5. 设置监控和日志

请告诉我你想先做什么！

