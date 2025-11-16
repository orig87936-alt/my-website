# 🚀 生产环境部署准备清单

## 📋 **当前状态评估**

### ✅ **已完成的部分**

1. **前端代码**
   - ✅ React + TypeScript + Vite
   - ✅ 响应式设计
   - ✅ 多语言支持（中英文）
   - ✅ 新闻管理系统
   - ✅ 预约系统
   - ✅ AI 聊天机器人
   - ✅ 文档上传和翻译功能
   - ✅ Vercel 配置文件 (`vercel.json`)

2. **后端代码**
   - ✅ FastAPI 框架
   - ✅ PostgreSQL 数据库支持
   - ✅ JWT 认证系统
   - ✅ RESTful API
   - ✅ 数据库迁移（Alembic）
   - ✅ 文档上传和解析
   - ✅ AI 翻译服务
   - ✅ 向量搜索（pgvector）

3. **文档**
   - ✅ 部署指南 (`PRODUCTION_DEPLOYMENT_GUIDE.md`)
   - ✅ 快速启动指南 (`QUICK_START.md`)
   - ✅ Docker 设置指南 (`backend/DOCKER_SETUP.md`)

---

## ⚠️ **需要完成的部署准备工作**

### 🔑 **1. API 密钥和服务注册**

#### **必需的服务**

| 服务 | 用途 | 状态 | 获取链接 |
|------|------|------|----------|
| **DeepSeek API** | AI 聊天和翻译 | ✅ 已配置 | https://platform.deepseek.com/ |
| **OpenAI API** | 向量嵌入（文章搜索） | ❌ 需要配置 | https://platform.openai.com/ |
| **Resend** | 邮件服务（验证码） | ❌ 需要配置 | https://resend.com/ |
| **Google OAuth** | 第三方登录 | ❌ 需要配置 | https://console.cloud.google.com/ |
| **PostgreSQL 数据库** | 生产数据库 | ⚠️ 本地开发 | Supabase/AWS RDS/Railway |

#### **可选的服务**

| 服务 | 用途 | 替代方案 |
|------|------|----------|
| **Gmail SMTP** | 邮件服务 | 可替代 Resend |
| **DeepL API** | 翻译服务 | 可替代 DeepSeek 翻译 |

---

### 📝 **2. 环境变量配置**

#### **后端环境变量** (`backend/.env.production`)

需要创建生产环境配置文件：

```bash
# ========================================
# 应用配置
# ========================================
APP_NAME="S&L News API"
DEBUG=False
ENVIRONMENT=production

# ========================================
# 数据库配置（生产环境）
# ========================================
# 选项 1: Supabase（推荐，免费额度）
DATABASE_URL=postgresql+asyncpg://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres

# 选项 2: Railway
# DATABASE_URL=postgresql+asyncpg://postgres:[PASSWORD]@[HOST].railway.app:5432/railway

# 选项 3: AWS RDS
# DATABASE_URL=postgresql+asyncpg://[USER]:[PASSWORD]@[ENDPOINT].rds.amazonaws.com:5432/newsdb

# ========================================
# DeepSeek API（AI 聊天和翻译）
# ========================================
DEEPSEEK_API_KEY=sk-7dd7f650117143e9b9c2d312164cb873  # ✅ 已有
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_MAX_TOKENS=1000
DEEPSEEK_TEMPERATURE=0.7

# ========================================
# OpenAI API（向量嵌入）❌ 需要获取
# ========================================
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536

# ========================================
# JWT 配置 ⚠️ 需要生成新密钥
# ========================================
SECRET_KEY=your-production-secret-key-min-32-chars-CHANGE-THIS
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# ========================================
# CORS 配置 ⚠️ 需要更新为生产域名
# ========================================
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# ========================================
# 邮件配置 ❌ 需要配置
# ========================================
# 方案 A: Resend（推荐）
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=S&L News Platform

# 方案 B: Gmail SMTP
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # 应用专用密码
# EMAIL_FROM=your-email@gmail.com

# ========================================
# Google OAuth ❌ 需要配置
# ========================================
GOOGLE_CLIENT_ID=123456789-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_REDIRECT_URI=https://api.yourdomain.com/api/v1/auth/google/callback

# ========================================
# 前端 URL ⚠️ 需要更新
# ========================================
FRONTEND_URL=https://yourdomain.com

# ========================================
# 管理员账号 ⚠️ 需要设置强密码
# ========================================
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-strong-production-password-CHANGE-THIS

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

#### **前端环境变量** (`.env.production`)

需要创建生产环境配置文件：

```bash
# ========================================
# 后端 API 地址 ⚠️ 需要更新
# ========================================
VITE_API_BASE_URL=https://api.yourdomain.com

# ========================================
# Google OAuth ❌ 需要配置
# ========================================
VITE_GOOGLE_CLIENT_ID=123456789-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

---

### 🐳 **3. Docker 配置文件**

#### **需要创建的文件**

- [ ] `backend/Dockerfile` - 后端 Docker 镜像
- [ ] `docker-compose.yml` - 本地开发和测试
- [ ] `.dockerignore` - 排除不必要的文件

---

### 🌐 **4. 域名和 DNS 配置**

- [ ] 注册域名（例如：`yourdomain.com`）
- [ ] 配置 DNS 记录：
  - `A` 记录：`yourdomain.com` → 前端服务器 IP
  - `A` 记录：`api.yourdomain.com` → 后端服务器 IP
  - `CNAME` 记录：`www.yourdomain.com` → `yourdomain.com`
- [ ] 如果使用 Resend，配置邮件 DNS 记录（MX、TXT）

---

### 🔒 **5. SSL 证书**

- [ ] 获取 SSL 证书（Let's Encrypt 免费）
- [ ] 配置 HTTPS（大多数部署平台自动提供）

---

### 📦 **6. 数据库迁移**

- [ ] 创建生产数据库
- [ ] 安装 pgvector 扩展
- [ ] 运行数据库迁移：`alembic upgrade head`
- [ ] 创建管理员账号
- [ ] 导入初始数据（如果需要）

---

### 🚀 **7. 部署平台选择**

#### **推荐的部署方案**

| 组件 | 推荐平台 | 免费额度 | 优势 |
|------|----------|----------|------|
| **前端** | Vercel | ✅ 免费 | 自动部署、CDN、HTTPS |
| **后端** | Railway | ✅ $5/月免费 | 简单、自动部署、日志 |
| **数据库** | Supabase | ✅ 免费 | PostgreSQL + pgvector |

#### **替代方案**

- **前端**: Netlify, Cloudflare Pages, AWS S3 + CloudFront
- **后端**: Render, Fly.io, AWS EC2, DigitalOcean
- **数据库**: AWS RDS, DigitalOcean Managed Database

---

## 📝 **部署步骤清单**

### **阶段 1: 准备工作** ⏱️ 预计 2-4 小时

- [ ] 注册所有必需的服务账号
- [ ] 获取所有 API 密钥
- [ ] 注册域名
- [ ] 创建生产数据库
- [ ] 生成 JWT 密钥：`openssl rand -hex 32`
- [ ] 设置强管理员密码

### **阶段 2: 配置环境变量** ⏱️ 预计 30 分钟

- [ ] 创建 `backend/.env.production`
- [ ] 创建 `.env.production`
- [ ] 验证所有环境变量已填写

### **阶段 3: 数据库设置** ⏱️ 预计 1 小时

- [ ] 创建生产数据库实例
- [ ] 安装 pgvector 扩展
- [ ] 配置数据库连接
- [ ] 运行数据库迁移
- [ ] 验证数据库连接

### **阶段 4: 后端部署** ⏱️ 预计 1-2 小时

- [ ] 选择部署平台（推荐 Railway）
- [ ] 连接 GitHub 仓库
- [ ] 配置环境变量
- [ ] 部署后端代码
- [ ] 验证 API 可访问：`https://api.yourdomain.com/docs`
- [ ] 测试管理员登录
- [ ] 测试文章 API
- [ ] 测试 AI 聊天功能

### **阶段 5: 前端部署** ⏱️ 预计 30 分钟

- [ ] 选择部署平台（推荐 Vercel）
- [ ] 连接 GitHub 仓库
- [ ] 配置环境变量
- [ ] 配置构建命令：`npm run build`
- [ ] 配置输出目录：`build`
- [ ] 部署前端代码
- [ ] 验证网站可访问：`https://yourdomain.com`

### **阶段 6: DNS 和域名配置** ⏱️ 预计 1 小时

- [ ] 配置前端域名
- [ ] 配置后端域名
- [ ] 配置邮件 DNS（如果使用 Resend）
- [ ] 等待 DNS 传播（5-30 分钟）
- [ ] 验证 HTTPS 证书

### **阶段 7: 功能测试** ⏱️ 预计 1-2 小时

- [ ] 测试用户注册和登录
- [ ] 测试邮箱验证码
- [ ] 测试 Google OAuth 登录
- [ ] 测试新闻浏览和搜索
- [ ] 测试预约系统
- [ ] 测试 AI 聊天机器人
- [ ] 测试文档上传和翻译
- [ ] 测试管理员后台
- [ ] 测试多语言切换

### **阶段 8: 性能优化** ⏱️ 预计 1 小时

- [ ] 启用 CDN（Vercel 自动）
- [ ] 配置缓存策略
- [ ] 优化图片加载
- [ ] 测试页面加载速度
- [ ] 配置数据库索引

### **阶段 9: 监控和日志** ⏱️ 预计 30 分钟

- [ ] 配置错误监控（Sentry）
- [ ] 配置日志收集
- [ ] 设置告警通知
- [ ] 配置备份策略

---

## 🔧 **需要创建的文件**

### 1. **后端 Dockerfile**

```dockerfile
# 需要创建 backend/Dockerfile
```

### 2. **Docker Compose**

```yaml
# 需要创建 docker-compose.yml
```

### 3. **生产环境配置**

```bash
# 需要创建 backend/.env.production
# 需要创建 .env.production
```

---

## 📊 **预计总时间和成本**

### **时间投入**
- **首次部署**: 8-12 小时
- **后续更新**: 5-10 分钟（自动部署）

### **月度成本**（使用推荐方案）
- **Vercel（前端）**: $0（免费）
- **Railway（后端）**: $5-20（根据使用量）
- **Supabase（数据库）**: $0（免费额度）
- **DeepSeek API**: $0-10（根据使用量）
- **OpenAI API**: $1-5（根据使用量）
- **Resend（邮件）**: $0（免费 3000 封/月）
- **域名**: $10-15/年

**总计**: 约 $6-35/月

---

## ⚡ **快速部署方案（最小配置）**

如果你想快速上线，可以先使用最小配置：

### **必需的服务**
1. ✅ DeepSeek API（已有）
2. ❌ OpenAI API（必需，用于文章搜索）
3. ❌ 数据库（Supabase 免费）
4. ⚠️ 邮件服务（可选，不影响核心功能）
5. ⚠️ Google OAuth（可选，可以只用邮箱登录）

### **最小部署步骤**
1. 获取 OpenAI API 密钥
2. 创建 Supabase 数据库
3. 部署到 Vercel（前端）+ Railway（后端）
4. 配置域名和环境变量

**预计时间**: 2-3 小时

---

## 📞 **下一步行动**

请告诉我你想：

1. **立即开始部署** - 我会帮你逐步完成
2. **先创建 Docker 配置** - 方便本地测试和部署
3. **先获取 API 密钥** - 我会提供详细的注册指南
4. **了解具体部署平台** - 我会详细介绍 Vercel + Railway 的部署流程

你想从哪一步开始？

