# ⚡ 快速部署指南（Vercel + Railway）

本指南将帮你在 30 分钟内完成部署！

---

## 📋 **前置要求**

- [ ] GitHub 账号
- [ ] DeepSeek API 密钥（已有：`sk-7dd7f650117143e9b9c2d312164cb873`）
- [ ] OpenAI API 密钥（需要获取）
- [ ] 信用卡（用于 Railway，有 $5 免费额度）

---

## 🚀 **部署步骤**

### **步骤 1: 获取 OpenAI API 密钥** ⏱️ 5 分钟

1. 访问 https://platform.openai.com/
2. 注册/登录账号
3. 进入 **API Keys** 页面
4. 点击 **Create new secret key**
5. 复制密钥（格式：`sk-proj-...`）
6. 充值 $5-10（用于向量嵌入，消耗很少）

---

### **步骤 2: 创建 Supabase 数据库** ⏱️ 5 分钟

1. 访问 https://supabase.com/
2. 使用 GitHub 登录
3. 点击 **New Project**
4. 填写信息：
   - **Name**: `sl-news-db`
   - **Database Password**: 设置强密码（记住它！）
   - **Region**: 选择离你最近的区域
5. 等待数据库创建（约 2 分钟）
6. 进入 **Settings** → **Database**
7. 复制 **Connection String** (URI 格式)
   - 格式：`postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres`
8. 进入 **SQL Editor**，运行以下 SQL：

```sql
-- 安装 pgvector 扩展
CREATE EXTENSION IF NOT EXISTS vector;

-- 验证安装
SELECT * FROM pg_extension WHERE extname = 'vector';
```

---

### **步骤 3: 部署后端到 Railway** ⏱️ 10 分钟

1. 访问 https://railway.app/
2. 使用 GitHub 登录
3. 点击 **New Project** → **Deploy from GitHub repo**
4. 选择你的仓库
5. 点击 **Add variables**，添加以下环境变量：

```bash
# 数据库
DATABASE_URL=postgresql+asyncpg://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres

# DeepSeek API
DEEPSEEK_API_KEY=sk-7dd7f650117143e9b9c2d312164cb873
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_MAX_TOKENS=1000
DEEPSEEK_TEMPERATURE=0.7

# OpenAI API
OPENAI_API_KEY=sk-proj-your-openai-key-here
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536

# JWT（生成新密钥）
SECRET_KEY=your-random-32-char-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# 管理员
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-strong-password-here

# 服务器
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=production
DEBUG=False

# 其他
VECTOR_SEARCH_LIMIT=5
CHAT_RESPONSE_TIMEOUT=3
TRANSLATION_PROVIDER=deepseek
TRANSLATION_CACHE_DAYS=30
MAX_UPLOAD_SIZE=10485760
ALLOWED_FILE_TYPES=.md,.docx
TEMP_UPLOAD_DIR=./temp_uploads
```

6. 在 **Settings** → **Deploy** 中配置：
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

7. 点击 **Deploy**，等待部署完成（约 3-5 分钟）

8. 部署成功后，Railway 会提供一个 URL（例如：`https://your-app.railway.app`）

9. **运行数据库迁移**：
   - 在 Railway 项目中，进入 **Settings** → **Variables**
   - 添加一个临时变量：`RUN_MIGRATIONS=true`
   - 或者在本地运行：
     ```bash
     cd backend
     # 设置生产数据库 URL
     export DATABASE_URL="postgresql+asyncpg://..."
     alembic upgrade head
     ```

10. **验证部署**：
    - 访问 `https://your-app.railway.app/docs`
    - 应该看到 API 文档页面

---

### **步骤 4: 配置自定义域名（可选）** ⏱️ 5 分钟

1. 在 Railway 项目中，进入 **Settings** → **Domains**
2. 点击 **Generate Domain** 或 **Custom Domain**
3. 如果使用自定义域名：
   - 添加域名：`api.yourdomain.com`
   - 在你的 DNS 提供商添加 CNAME 记录：
     ```
     类型: CNAME
     名称: api
     值: your-app.railway.app
     ```
4. 等待 DNS 传播（5-30 分钟）

---

### **步骤 5: 部署前端到 Vercel** ⏱️ 5 分钟

1. 访问 https://vercel.com/
2. 使用 GitHub 登录
3. 点击 **Add New** → **Project**
4. 选择你的仓库
5. 配置项目：
   - **Framework Preset**: Vite
   - **Root Directory**: `./`（保持默认）
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

6. 添加环境变量：
   ```bash
   VITE_API_BASE_URL=https://your-app.railway.app
   ```

7. 点击 **Deploy**，等待部署完成（约 2-3 分钟）

8. 部署成功后，Vercel 会提供一个 URL（例如：`https://your-app.vercel.app`）

9. **验证部署**：
   - 访问 `https://your-app.vercel.app`
   - 应该看到你的网站

---

### **步骤 6: 更新后端 CORS 配置** ⏱️ 2 分钟

1. 回到 Railway 项目
2. 进入 **Variables**
3. 添加/更新 `CORS_ORIGINS` 变量：
   ```bash
   CORS_ORIGINS=https://your-app.vercel.app,https://yourdomain.com
   ```
4. 添加 `FRONTEND_URL` 变量：
   ```bash
   FRONTEND_URL=https://your-app.vercel.app
   ```
5. 保存后，Railway 会自动重新部署

---

### **步骤 7: 配置自定义域名（前端，可选）** ⏱️ 5 分钟

1. 在 Vercel 项目中，进入 **Settings** → **Domains**
2. 添加你的域名：`yourdomain.com`
3. 在你的 DNS 提供商添加记录：
   ```
   类型: A
   名称: @
   值: 76.76.21.21
   
   类型: CNAME
   名称: www
   值: cname.vercel-dns.com
   ```
4. 等待 DNS 传播和 SSL 证书生成（5-30 分钟）

---

## ✅ **部署完成！测试功能**

### **测试清单**

- [ ] 访问前端网站
- [ ] 测试用户注册（如果配置了邮件服务）
- [ ] 测试管理员登录
- [ ] 浏览新闻文章
- [ ] 测试 AI 聊天机器人
- [ ] 测试预约系统
- [ ] 测试文档上传（管理员）
- [ ] 测试多语言切换

---

## 🔧 **可选配置**

### **邮件服务（Resend）**

如果需要邮箱验证码功能：

1. 访问 https://resend.com/
2. 注册账号
3. 获取 API Key
4. 在 Railway 添加环境变量：
   ```bash
   RESEND_API_KEY=re_your-key-here
   EMAIL_FROM=noreply@yourdomain.com
   EMAIL_FROM_NAME=S&L News Platform
   ```
5. 配置域名 DNS（见 `PRODUCTION_DEPLOYMENT_GUIDE.md`）

### **Google OAuth**

如果需要 Google 登录功能：

1. 访问 https://console.cloud.google.com/
2. 创建项目
3. 启用 Google+ API
4. 创建 OAuth 2.0 凭据
5. 添加授权重定向 URI：
   - `https://your-app.railway.app/api/v1/auth/google/callback`
6. 在 Railway 添加环境变量：
   ```bash
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI=https://your-app.railway.app/api/v1/auth/google/callback
   ```
7. 在 Vercel 添加环境变量：
   ```bash
   VITE_GOOGLE_CLIENT_ID=your-client-id
   ```

---

## 📊 **监控和维护**

### **Railway 监控**
- 进入项目 → **Metrics** 查看 CPU、内存、网络使用情况
- 进入 **Deployments** 查看部署历史和日志

### **Vercel 监控**
- 进入项目 → **Analytics** 查看访问统计
- 进入 **Deployments** 查看部署历史

### **数据库备份**
- Supabase 自动每日备份（免费版保留 7 天）
- 手动备份：进入 **Database** → **Backups** → **Download**

---

## 🆘 **常见问题**

### **后端部署失败**
- 检查环境变量是否正确
- 检查 `requirements.txt` 是否完整
- 查看 Railway 部署日志

### **前端无法连接后端**
- 检查 `VITE_API_BASE_URL` 是否正确
- 检查后端 `CORS_ORIGINS` 是否包含前端域名
- 检查后端是否正常运行（访问 `/docs`）

### **数据库连接失败**
- 检查 `DATABASE_URL` 格式是否正确
- 检查 Supabase 数据库是否正常运行
- 检查是否安装了 pgvector 扩展

### **AI 功能不工作**
- 检查 DeepSeek API 密钥是否正确
- 检查 OpenAI API 密钥是否正确
- 检查 API 余额是否充足

---

## 📞 **需要帮助？**

如果遇到问题，请提供：
1. 错误信息截图
2. Railway/Vercel 部署日志
3. 浏览器控制台错误信息

---

## 🎉 **恭喜！**

你的应用已经成功部署到生产环境！

**下一步**：
- 配置邮件服务（可选）
- 配置 Google OAuth（可选）
- 添加自定义域名
- 配置监控和告警
- 优化性能和 SEO

