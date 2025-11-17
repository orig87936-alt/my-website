# 🚀 生产环境部署指南

本指南详细说明了将 S&L News Platform 部署到生产环境所需的所有配置和服务。

---

## 📋 **必需的服务和 API 密钥清单**

### ✅ **1. 邮件服务（邮箱验证码）**

#### **方案 A: Resend（推荐）** ⭐

**优势**：
- ✅ 免费额度：每月 3,000 封邮件
- ✅ 简单易用，专为开发者设计
- ✅ 高送达率
- ✅ 代码已集成

**步骤**：

1. **注册 Resend**
   - 访问：https://resend.com/
   - 使用 GitHub 或邮箱注册

2. **获取 API Key**
   - 登录后进入 Dashboard
   - 点击 "API Keys" → "Create API Key"
   - 复制 API Key（格式：`re_xxxxxxxxxxxxxxxxxxxxxxxxxx`）

3. **配置域名**
   - 进入 "Domains" → "Add Domain"
   - 输入你的域名（例如：`yourdomain.com`）
   - 按照提示添加 DNS 记录：
     ```
     类型: TXT
     名称: @
     值: resend-verify=xxx...
     
     类型: MX
     名称: @
     值: feedback-smtp.resend.com
     优先级: 10
     ```
   - 等待 DNS 验证通过（通常 5-30 分钟）

4. **环境变量配置**
   ```bash
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
   EMAIL_FROM=noreply@yourdomain.com
   EMAIL_FROM_NAME=S&L News Platform
   ```

---

#### **方案 B: Gmail SMTP（备选）**

**优势**：
- ✅ 完全免费
- ✅ 无需域名
- ✅ 适合小规模使用（每天最多 500 封）

**步骤**：

1. **启用两步验证**
   - 访问：https://myaccount.google.com/security
   - 找到"两步验证"并启用

2. **生成应用专用密码**
   - 访问：https://myaccount.google.com/apppasswords
   - 选择应用：邮件
   - 选择设备：其他（自定义名称）
   - 输入名称：`S&L News Platform`
   - 点击"生成"
   - 复制 16 位密码（格式：`xxxx xxxx xxxx xxxx`）

3. **环境变量配置**
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=xxxx xxxx xxxx xxxx
   EMAIL_FROM=your-email@gmail.com
   EMAIL_FROM_NAME=S&L News Platform
   ```

---

### ✅ **2. Google OAuth（谷歌账号登录）**

**步骤**：

1. **创建 Google Cloud 项目**
   - 访问：https://console.cloud.google.com/
   - 点击顶部的项目下拉菜单 → "新建项目"
   - 项目名称：`S&L News Platform`
   - 点击"创建"

2. **启用 Google+ API**
   - 在项目中，点击左侧菜单 → "API 和服务" → "库"
   - 搜索 "Google+ API"
   - 点击进入，点击"启用"

3. **配置 OAuth 同意屏幕**
   - 点击左侧菜单 → "API 和服务" → "OAuth 同意屏幕"
   - 用户类型：选择"外部"
   - 点击"创建"
   - 填写信息：
     - 应用名称：`S&L News Platform`
     - 用户支持电子邮件：你的邮箱
     - 应用首页：`https://yourdomain.com`
     - 授权网域：`yourdomain.com`
     - 开发者联系信息：你的邮箱
   - 点击"保存并继续"
   - 范围：点击"添加或移除范围"
     - 选择：`email`、`profile`、`openid`
   - 点击"保存并继续"
   - 测试用户：添加你的测试邮箱（可选）
   - 点击"保存并继续"

4. **创建 OAuth 2.0 凭据**
   - 点击左侧菜单 → "API 和服务" → "凭据"
   - 点击顶部 "创建凭据" → "OAuth 客户端 ID"
   - 应用类型：选择 "Web 应用"
   - 名称：`S&L News Platform Web Client`
   - 已获授权的 JavaScript 来源：
     ```
     http://localhost:3000
     https://yourdomain.com
     ```
   - 已获授权的重定向 URI：
     ```
     http://localhost:8000/api/v1/auth/google/callback
     https://api.yourdomain.com/api/v1/auth/google/callback
     ```
   - 点击"创建"

5. **获取凭据**
   - 创建完成后，会显示：
     - **客户端 ID**：`123456789-abc...xyz.apps.googleusercontent.com`
     - **客户端密钥**：`GOCSPX-abc123xyz...`
   - 复制这两个值

6. **环境变量配置**
   
   **后端配置** (`backend/.env`)：
   ```bash
   GOOGLE_CLIENT_ID=123456789-abc...xyz.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz...
   GOOGLE_REDIRECT_URI=https://api.yourdomain.com/api/v1/auth/google/callback
   ```
   
   **前端配置** (`.env`)：
   ```bash
   VITE_GOOGLE_CLIENT_ID=123456789-abc...xyz.apps.googleusercontent.com
   ```

---

### ✅ **3. DeepSeek API（AI 聊天和翻译）**

**用途**：
- AI 聊天机器人
- 文档翻译功能

**步骤**：

1. **注册 DeepSeek**
   - 访问：https://platform.deepseek.com/
   - 点击"注册"或"登录"
   - 使用邮箱或手机号注册

2. **获取 API Key**
   - 登录后，点击右上角头像 → "API Keys"
   - 点击"创建 API Key"
   - 输入名称：`S&L News Platform`
   - 点击"创建"
   - 复制 API Key（格式：`sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`）
   - ⚠️ **重要**：API Key 只显示一次，请妥善保存

3. **充值（可选）**
   - DeepSeek 提供免费额度
   - 如需更多额度，可在"账户" → "充值"中充值

4. **环境变量配置**
   ```bash
   DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
   DEEPSEEK_MODEL=deepseek-chat
   ```

---

### ✅ **4. OpenAI API（向量嵌入）**

**用途**：
- 文章内容的向量嵌入（用于 AI 聊天的上下文检索）

**步骤**：

1. **注册 OpenAI**
   - 访问：https://platform.openai.com/
   - 点击"Sign up"注册账号

2. **获取 API Key**
   - 登录后，点击右上角头像 → "View API keys"
   - 点击"Create new secret key"
   - 输入名称：`S&L News Platform`
   - 点击"Create secret key"
   - 复制 API Key（格式：`sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`）
   - ⚠️ **重要**：API Key 只显示一次，请妥善保存

3. **充值**
   - OpenAI 需要充值才能使用
   - 点击左侧菜单 → "Billing" → "Add payment method"
   - 添加信用卡并充值（建议至少 $5）

4. **环境变量配置**
   ```bash
   OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   EMBEDDING_MODEL=text-embedding-3-small
   EMBEDDING_DIMENSIONS=1536
   ```

---

### ✅ **5. 数据库（PostgreSQL）**

**生产环境推荐**：使用托管的 PostgreSQL 服务

#### **选项 A: Supabase（推荐，有免费额度）** ⭐

**步骤**：

1. **注册 Supabase**
   - 访问：https://supabase.com/
   - 使用 GitHub 或邮箱注册

2. **创建项目**
   - 点击"New Project"
   - 项目名称：`sl-news-platform`
   - 数据库密码：设置一个强密码（请记住）
   - 区域：选择离你最近的区域（例如：Singapore）
   - 点击"Create new project"
   - 等待项目创建完成（约 2 分钟）

3. **获取数据库连接字符串**
   - 项目创建完成后，点击左侧菜单 → "Settings" → "Database"
   - 找到"Connection string" → "URI"
   - 复制连接字符串（格式：`postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`）
   - 将 `[YOUR-PASSWORD]` 替换为你设置的密码

4. **启用 pgvector 扩展**
   - 点击左侧菜单 → "Database" → "Extensions"
   - 搜索 "vector"
   - 点击"Enable"启用 pgvector 扩展

5. **环境变量配置**
   ```bash
   DATABASE_URL=postgresql://postgres:your-password@db.xxx.supabase.co:5432/postgres
   ```

---

#### **选项 B: Railway（简单易用）**

**步骤**：

1. **注册 Railway**
   - 访问：https://railway.app/
   - 使用 GitHub 登录

2. **创建项目**
   - 点击"New Project"
   - 选择"Provision PostgreSQL"
   - 等待数据库创建完成

3. **获取连接字符串**
   - 点击 PostgreSQL 服务
   - 点击"Connect" → "PostgreSQL Connection URL"
   - 复制连接字符串

4. **环境变量配置**
   ```bash
   DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
   ```

---

### ✅ **6. 安全配置**

#### **JWT Secret Key**

**生成方式**：

```bash
# 使用 Python 生成
python -c "import secrets; print(secrets.token_urlsafe(32))"

# 或使用 OpenSSL
openssl rand -base64 32
```

**环境变量配置**：
```bash
SECRET_KEY=your-generated-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7
```

#### **管理员账号**

```bash
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-strong-admin-password
```

⚠️ **重要**：请使用强密码（至少 12 位，包含大小写字母、数字和特殊字符）

---

## 📝 **完整的环境变量配置**

### **后端配置** (`backend/.env`)

```bash
# ========================================
# 应用配置
# ========================================
APP_NAME="S&L News API"
DEBUG=False
ENVIRONMENT=production

# ========================================
# 数据库配置
# ========================================
DATABASE_URL=postgresql://postgres:your-password@db.xxx.supabase.co:5432/postgres

# ========================================
# DeepSeek API（AI 聊天和翻译）
# ========================================
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_MAX_TOKENS=1000
DEEPSEEK_TEMPERATURE=0.7

# ========================================
# OpenAI API（向量嵌入）
# ========================================
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536

# ========================================
# JWT 配置
# ========================================
SECRET_KEY=your-generated-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# ========================================
# CORS 配置
# ========================================
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# ========================================
# 邮件配置（选择一种方案）
# ========================================

# 方案 A: Resend（推荐）
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=S&L News Platform

# 方案 B: Gmail SMTP（备选）
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASSWORD=xxxx xxxx xxxx xxxx
# EMAIL_FROM=your-email@gmail.com
# EMAIL_FROM_NAME=S&L News Platform

# ========================================
# Google OAuth
# ========================================
GOOGLE_CLIENT_ID=123456789-abc...xyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz...
GOOGLE_REDIRECT_URI=https://api.yourdomain.com/api/v1/auth/google/callback

# ========================================
# 前端 URL
# ========================================
FRONTEND_URL=https://yourdomain.com

# ========================================
# 管理员账号
# ========================================
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-strong-admin-password

# ========================================
# 服务器配置
# ========================================
HOST=0.0.0.0
PORT=8000

# ========================================
# 其他配置
# ========================================
APPOINTMENT_TIME_SLOTS=09:00,09:30,10:00,10:30,11:00,11:30,13:00,13:30,14:00,14:30,15:00,15:30,16:00,16:30,17:00,17:30
EMAIL_RETRY_MAX_ATTEMPTS=3
EMAIL_RETRY_DELAYS=60,300,1800
CHAT_RESPONSE_TIMEOUT=3
VECTOR_SEARCH_LIMIT=5
TRANSLATION_PROVIDER=deepseek
TRANSLATION_CACHE_DAYS=30
MAX_UPLOAD_SIZE=10485760
ALLOWED_FILE_TYPES=.md,.docx
TEMP_UPLOAD_DIR=./temp_uploads
```

---

### **前端配置** (`.env`)

```bash
# ========================================
# 后端 API 地址
# ========================================
VITE_API_BASE_URL=https://api.yourdomain.com

# ========================================
# Google OAuth
# ========================================
VITE_GOOGLE_CLIENT_ID=123456789-abc...xyz.apps.googleusercontent.com
```

---

## 🚀 **部署步骤**

### **1. 准备工作**

- [ ] 注册域名（例如：`yourdomain.com`）
- [ ] 获取所有必需的 API 密钥（见上文）
- [ ] 创建生产数据库
- [ ] 配置 DNS 记录（如果使用 Resend）

### **2. 后端部署**

推荐使用以下平台之一：

- **Railway**：https://railway.app/
- **Render**：https://render.com/
- **Fly.io**：https://fly.io/
- **AWS EC2**：https://aws.amazon.com/ec2/

### **3. 前端部署**

推荐使用以下平台之一：

- **Vercel**：https://vercel.com/ ⭐ 推荐
- **Netlify**：https://www.netlify.com/
- **Cloudflare Pages**：https://pages.cloudflare.com/

### **4. 数据库迁移**

```bash
cd backend
alembic upgrade head
```

### **5. 测试**

- [ ] 测试邮箱验证码发送
- [ ] 测试 Google 登录
- [ ] 测试 AI 聊天
- [ ] 测试文档翻译
- [ ] 测试新闻发布

---

## 💰 **成本估算**

| 服务 | 免费额度 | 付费价格 | 推荐 |
|------|----------|----------|------|
| **Resend** | 3,000 封/月 | $20/月（50,000 封） | ⭐ |
| **Gmail SMTP** | 500 封/天 | 免费 | ✅ |
| **Google OAuth** | 无限制 | 免费 | ✅ |
| **DeepSeek API** | 有免费额度 | 按使用量计费 | ⭐ |
| **OpenAI API** | 无 | $0.0001/1K tokens | ⭐ |
| **Supabase** | 500MB 数据库 | $25/月 | ⭐ |
| **Railway** | $5 免费额度 | 按使用量计费 | ✅ |
| **Vercel** | 无限制 | 免费（个人项目） | ⭐ |

**预计月成本**：
- **最低**：$0（使用所有免费服务）
- **推荐**：$30-50/月（Supabase + DeepSeek + OpenAI）
- **高流量**：$100+/月

---

## 📞 **需要帮助？**

如果在配置过程中遇到问题，请提供：

1. 你选择的服务（Resend/Gmail、Supabase/Railway 等）
2. 具体的错误信息
3. 你已经完成的步骤

我会帮你解决！🚀

