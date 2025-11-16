# 🚀 AWS Lightsail 简化部署指南

**AWS Lightsail** 是 AWS 的简化版服务，提供固定价格的虚拟服务器，非常适合中小型项目。

---

## 💰 **成本对比**

| 方案 | 月度成本 | 复杂度 | 适用场景 |
|------|----------|--------|----------|
| **Lightsail** | $10-20 | ⭐ 简单 | 个人项目、中小型应用 |
| **EC2 + RDS** | $36-70 | ⭐⭐⭐ 复杂 | 需要完全控制 |
| **ECS + RDS** | $50-100 | ⭐⭐⭐⭐ 很复杂 | 大型项目、需要自动扩展 |

**Lightsail 优势**：
- ✅ 固定价格，易于预算
- ✅ 包含流量配额
- ✅ 简单易用的控制面板
- ✅ 包含静态 IP
- ✅ 自动备份（可选）

---

## 📋 **Lightsail 方案架构**

```
┌─────────────────────────────────────────────┐
│  用户                                        │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│  CloudFront (CDN) - 前端                     │
│  https://yourdomain.com                     │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│  S3 - 静态文件存储                           │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Lightsail 实例 - 后端 + 数据库              │
│  https://api.yourdomain.com                 │
│  ┌─────────────────────────────────────┐   │
│  │  Nginx (反向代理)                    │   │
│  └──────────────┬──────────────────────┘   │
│                 │                            │
│  ┌──────────────▼──────────────────────┐   │
│  │  FastAPI (后端 API)                  │   │
│  └──────────────┬──────────────────────┘   │
│                 │                            │
│  ┌──────────────▼──────────────────────┐   │
│  │  PostgreSQL (数据库)                 │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## 🚀 **部署步骤**

### **步骤 1: 创建 Lightsail 实例** ⏱️ 10 分钟

1. **登录 AWS 控制台**
   - 访问 https://lightsail.aws.amazon.com/

2. **创建实例**
   - 点击 **Create instance**
   - **Instance location**: 选择离你最近的区域
   - **Platform**: Linux/Unix
   - **Blueprint**: OS Only → Ubuntu 22.04 LTS
   - **Instance plan**: 
     - **$10/月**: 1 GB RAM, 1 vCPU, 40 GB SSD, 2 TB 流量
     - **$20/月**: 2 GB RAM, 1 vCPU, 60 GB SSD, 3 TB 流量（推荐）
   - **Instance name**: `sl-news-server`
   - 点击 **Create instance**

3. **等待实例启动**（约 1-2 分钟）

4. **配置防火墙**
   - 进入实例详情页
   - 点击 **Networking** 标签
   - 添加规则：
     - HTTP (80)
     - HTTPS (443)
     - Custom TCP (8000) - 后端 API

5. **创建静态 IP**
   - 点击 **Networking** 标签
   - 点击 **Create static IP**
   - 选择你的实例
   - 名称：`sl-news-static-ip`
   - 点击 **Create**

---

### **步骤 2: 连接到实例并安装依赖** ⏱️ 15 分钟

1. **使用浏览器 SSH**
   - 在实例详情页，点击 **Connect using SSH**
   - 或下载 SSH 密钥，使用本地 SSH 客户端

2. **更新系统**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. **安装 PostgreSQL**
   ```bash
   # 安装 PostgreSQL
   sudo apt install -y postgresql postgresql-contrib
   
   # 启动服务
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   
   # 创建数据库和用户
   sudo -u postgres psql << EOF
   CREATE DATABASE newsdb;
   CREATE USER newsuser WITH PASSWORD 'your-strong-password';
   GRANT ALL PRIVILEGES ON DATABASE newsdb TO newsuser;
   \c newsdb
   CREATE EXTENSION IF NOT EXISTS vector;
   \q
   EOF
   ```

4. **安装 Python 3.11**
   ```bash
   sudo apt install -y software-properties-common
   sudo add-apt-repository -y ppa:deadsnakes/ppa
   sudo apt update
   sudo apt install -y python3.11 python3.11-venv python3.11-dev
   curl -sS https://bootstrap.pypa.io/get-pip.py | sudo python3.11
   ```

5. **安装其他依赖**
   ```bash
   sudo apt install -y git nginx build-essential
   ```

---

### **步骤 3: 部署后端代码** ⏱️ 15 分钟

1. **克隆代码**
   ```bash
   cd /home/ubuntu
   git clone https://github.com/your-username/your-repo.git
   cd your-repo/backend
   ```

2. **创建虚拟环境**
   ```bash
   python3.11 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **创建环境变量**
   ```bash
   nano .env
   ```
   
   填入：
   ```bash
   # 数据库（本地 PostgreSQL）
   DATABASE_URL=postgresql+asyncpg://newsuser:your-strong-password@localhost:5432/newsdb
   
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
   
   # JWT
   SECRET_KEY=$(openssl rand -hex 32)
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   REFRESH_TOKEN_EXPIRE_DAYS=7
   
   # CORS
   CORS_ORIGINS=*
   
   # 管理员
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your-strong-password
   
   # 服务器
   HOST=0.0.0.0
   PORT=8000
   ENVIRONMENT=production
   DEBUG=False
   
   # 前端 URL
   FRONTEND_URL=https://yourdomain.com
   
   # 其他配置
   VECTOR_SEARCH_LIMIT=5
   CHAT_RESPONSE_TIMEOUT=3
   TRANSLATION_PROVIDER=deepseek
   TRANSLATION_CACHE_DAYS=30
   MAX_UPLOAD_SIZE=10485760
   ALLOWED_FILE_TYPES=.md,.docx
   TEMP_UPLOAD_DIR=./temp_uploads
   ```

4. **运行数据库迁移**
   ```bash
   source venv/bin/activate
   alembic upgrade head
   ```

5. **创建 Systemd 服务**
   ```bash
   sudo nano /etc/systemd/system/sl-news-backend.service
   ```
   
   填入：
   ```ini
   [Unit]
   Description=S&L News Backend API
   After=network.target postgresql.service
   
   [Service]
   Type=simple
   User=ubuntu
   WorkingDirectory=/home/ubuntu/your-repo/backend
   Environment="PATH=/home/ubuntu/your-repo/backend/venv/bin"
   ExecStart=/home/ubuntu/your-repo/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
   Restart=always
   RestartSec=10
   
   [Install]
   WantedBy=multi-user.target
   ```
   
   启动服务：
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable sl-news-backend
   sudo systemctl start sl-news-backend
   sudo systemctl status sl-news-backend
   ```

6. **配置 Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/sl-news-backend
   ```
   
   填入：
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;  # 或使用静态 IP
   
       location / {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
   
   启用配置：
   ```bash
   sudo ln -s /etc/nginx/sites-available/sl-news-backend /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **验证后端**
   - 访问：`http://[STATIC-IP]/docs`
   - 应该看到 FastAPI 文档！

---

### **步骤 4: 配置 SSL（Let's Encrypt）** ⏱️ 5 分钟

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书（需要先配置域名 DNS）
sudo certbot --nginx -d api.yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

---

### **步骤 5: 部署前端到 S3 + CloudFront** ⏱️ 20 分钟

**与标准 AWS 部署相同**，参考 `AWS_DEPLOYMENT_GUIDE.md` 的阶段 3。

---

## 📊 **成本明细**

| 服务 | 配置 | 月度成本 |
|------|------|----------|
| **Lightsail 实例** | 2 GB RAM, 1 vCPU | $20 |
| **S3** | 存储 + 请求 | $1-3 |
| **CloudFront** | CDN 流量 | $5-10 |
| **Route 53** | DNS | $0.5 |
| **总计** | - | **$26-34/月** |

**比标准 EC2 + RDS 方案节省约 30-50%！**

---

## 🔧 **备份和恢复**

### **启用自动快照**
1. 进入 Lightsail 实例详情
2. 点击 **Snapshots** 标签
3. 点击 **Enable automatic snapshots**
4. 选择时间和保留天数
5. 成本：$0.05/GB/月

### **手动备份数据库**
```bash
# 备份
sudo -u postgres pg_dump newsdb > backup_$(date +%Y%m%d).sql

# 恢复
sudo -u postgres psql newsdb < backup_20240101.sql
```

---

## 📈 **扩展和升级**

### **升级实例**
1. 创建快照
2. 从快照创建新实例（选择更大的套餐）
3. 更新 DNS 指向新实例
4. 删除旧实例

### **迁移到 RDS**
如果流量增长，可以将数据库迁移到 RDS：
1. 创建 RDS 实例
2. 导出 Lightsail PostgreSQL 数据
3. 导入到 RDS
4. 更新后端 `DATABASE_URL`
5. 重启后端服务

---

## ✅ **优势总结**

| 特性 | Lightsail | EC2 + RDS |
|------|-----------|-----------|
| **价格** | ✅ 固定 $20/月 | ❌ $36-70/月 |
| **复杂度** | ✅ 简单 | ❌ 复杂 |
| **设置时间** | ✅ 30 分钟 | ❌ 2-3 小时 |
| **流量配额** | ✅ 3 TB 包含 | ❌ 按量付费 |
| **静态 IP** | ✅ 免费 | ❌ $3.6/月 |
| **自动扩展** | ❌ 不支持 | ✅ 支持 |
| **高可用性** | ❌ 单实例 | ✅ 多可用区 |

**推荐**：
- 个人项目、MVP、中小型应用 → **Lightsail**
- 大型项目、需要自动扩展 → **EC2 + RDS**

---

## 🎯 **下一步**

你想：
1. **开始 Lightsail 部署** - 我会逐步指导
2. **了解标准 EC2 部署** - 更多控制和扩展性
3. **对比其他方案** - Vercel + Railway vs AWS

请告诉我你的选择！

