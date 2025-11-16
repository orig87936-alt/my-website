# 🚀 AWS 完整部署指南

本指南将帮你将项目部署到 AWS，使用以下服务：
- **前端**: AWS S3 + CloudFront (CDN)
- **后端**: AWS EC2 或 ECS
- **数据库**: AWS RDS (PostgreSQL)

---

## 📋 **AWS 服务概览**

| 服务 | 用途 | 月度成本估算 |
|------|------|--------------|
| **S3** | 前端静态文件存储 | $1-5 |
| **CloudFront** | CDN 加速 | $5-20 |
| **EC2 (t3.small)** | 后端服务器 | $15-20 |
| **RDS (db.t3.micro)** | PostgreSQL 数据库 | $15-25 |
| **Route 53** | DNS 域名管理 | $0.5/域名 |
| **Certificate Manager** | SSL 证书 | 免费 |
| **总计** | - | **$36-70/月** |

**节省成本的选项**：
- 使用 AWS 免费套餐（新账号 12 个月）
- 使用 Lightsail（简化版，$10-20/月）
- 使用 Lambda + API Gateway（按使用量付费）

---

## 🎯 **部署方案选择**

### **方案 A: EC2 + RDS（推荐，完全控制）**

**优势**：
- ✅ 完全控制服务器
- ✅ 易于调试和维护
- ✅ 可以 SSH 登录
- ✅ 适合中小型项目

**成本**：$36-70/月

### **方案 B: ECS (Docker) + RDS（容器化）**

**优势**：
- ✅ 自动扩展
- ✅ 高可用性
- ✅ 易于更新
- ✅ 适合大型项目

**成本**：$50-100/月

### **方案 C: Lambda + API Gateway + RDS（Serverless）**

**优势**：
- ✅ 按使用量付费
- ✅ 自动扩展
- ✅ 低流量时成本低

**成本**：$10-50/月（取决于流量）

**本指南将重点介绍方案 A（EC2 + RDS）**

---

## 📝 **前置要求**

### **1. AWS 账号**
- [ ] 注册 AWS 账号：https://aws.amazon.com/
- [ ] 绑定信用卡（用于计费）
- [ ] 启用 MFA（多因素认证，推荐）

### **2. 本地工具**
- [ ] AWS CLI：https://aws.amazon.com/cli/
- [ ] SSH 客户端（Windows 用户推荐 PuTTY）
- [ ] Git

### **3. API 密钥**
- [ ] DeepSeek API（已有）
- [ ] OpenAI API（需要获取）
- [ ] Resend API（可选，邮件服务）

---

## 🚀 **部署步骤**

### **阶段 1: 创建 RDS 数据库** ⏱️ 15-20 分钟

#### **1.1 登录 AWS 控制台**
1. 访问 https://console.aws.amazon.com/
2. 选择区域（推荐：`us-east-1` 或离你最近的区域）

#### **1.2 创建 RDS 实例**
1. 进入 **RDS** 服务
2. 点击 **Create database**
3. 配置：
   - **Engine**: PostgreSQL
   - **Version**: 14.x 或更高
   - **Template**: Free tier（如果可用）或 Dev/Test
   - **DB instance identifier**: `sl-news-db`
   - **Master username**: `postgres`
   - **Master password**: 设置强密码（记住它！）
   - **DB instance class**: `db.t3.micro`（免费套餐）或 `db.t3.small`
   - **Storage**: 20 GB（SSD）
   - **Public access**: Yes（暂时，后续可以改为 No）
   - **VPC security group**: 创建新的，名称：`sl-news-db-sg`
   - **Database name**: `newsdb`

4. 点击 **Create database**，等待 5-10 分钟

#### **1.3 配置安全组**
1. 进入 **EC2** → **Security Groups**
2. 找到 `sl-news-db-sg`
3. 编辑 **Inbound rules**：
   - **Type**: PostgreSQL
   - **Port**: 5432
   - **Source**: 
     - 暂时设置为 `0.0.0.0/0`（允许所有 IP）
     - 后续改为只允许 EC2 安全组

4. 保存规则

#### **1.4 获取数据库连接信息**
1. 回到 RDS 控制台
2. 点击你的数据库实例
3. 复制 **Endpoint**（例如：`sl-news-db.xxxxx.us-east-1.rds.amazonaws.com`）
4. 记录连接信息：
   ```
   Host: sl-news-db.xxxxx.us-east-1.rds.amazonaws.com
   Port: 5432
   Database: newsdb
   Username: postgres
   Password: [你设置的密码]
   ```

#### **1.5 安装 pgvector 扩展**
1. 使用 psql 或 pgAdmin 连接到数据库
2. 运行以下 SQL：
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   SELECT * FROM pg_extension WHERE extname = 'vector';
   ```

---

### **阶段 2: 创建 EC2 实例（后端）** ⏱️ 20-30 分钟

#### **2.1 创建 EC2 实例**
1. 进入 **EC2** 服务
2. 点击 **Launch Instance**
3. 配置：
   - **Name**: `sl-news-backend`
   - **AMI**: Ubuntu Server 22.04 LTS
   - **Instance type**: `t3.small`（推荐）或 `t2.micro`（免费套餐）
   - **Key pair**: 创建新的密钥对
     - 名称：`sl-news-key`
     - 类型：RSA
     - 格式：`.pem`（Linux/Mac）或 `.ppk`（Windows/PuTTY）
     - **下载并保存密钥文件！**
   - **Network settings**:
     - 创建新的安全组：`sl-news-backend-sg`
     - 允许 SSH (22) 从你的 IP
     - 允许 HTTP (80) 从任何地方
     - 允许 HTTPS (443) 从任何地方
     - 允许自定义 TCP (8000) 从任何地方（后端 API）
   - **Storage**: 20 GB gp3

4. 点击 **Launch instance**

#### **2.2 分配弹性 IP（可选但推荐）**
1. 进入 **EC2** → **Elastic IPs**
2. 点击 **Allocate Elastic IP address**
3. 点击 **Allocate**
4. 选择新分配的 IP，点击 **Actions** → **Associate Elastic IP address**
5. 选择你的 EC2 实例，点击 **Associate**

#### **2.3 连接到 EC2 实例**

**Linux/Mac**:
```bash
chmod 400 sl-news-key.pem
ssh -i sl-news-key.pem ubuntu@[EC2-PUBLIC-IP]
```

**Windows (PuTTY)**:
1. 使用 PuTTYgen 转换 `.pem` 为 `.ppk`
2. 在 PuTTY 中配置：
   - Host: `ubuntu@[EC2-PUBLIC-IP]`
   - Connection → SSH → Auth → Private key: 选择 `.ppk` 文件

#### **2.4 安装依赖**
连接到 EC2 后，运行：

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Python 3.11
sudo apt install -y software-properties-common
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3.11-dev

# 安装其他依赖
sudo apt install -y git nginx postgresql-client build-essential

# 安装 pip
curl -sS https://bootstrap.pypa.io/get-pip.py | sudo python3.11

# 验证安装
python3.11 --version
pip3.11 --version
```

#### **2.5 部署后端代码**

```bash
# 克隆代码（使用你的 GitHub 仓库）
cd /home/ubuntu
git clone https://github.com/your-username/your-repo.git
cd your-repo/backend

# 创建虚拟环境
python3.11 -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 创建环境变量文件
nano .env
```

在 `.env` 文件中填入：

```bash
# 数据库
DATABASE_URL=postgresql+asyncpg://postgres:[PASSWORD]@sl-news-db.xxxxx.us-east-1.rds.amazonaws.com:5432/newsdb

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
SECRET_KEY=[生成一个随机密钥: openssl rand -hex 32]
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS（暂时允许所有，后续改为你的域名）
CORS_ORIGINS=*

# 管理员
ADMIN_USERNAME=admin
ADMIN_PASSWORD=[设置强密码]

# 服务器
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=production
DEBUG=False

# 前端 URL（后续更新）
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

保存文件（Ctrl+X, Y, Enter）

#### **2.6 运行数据库迁移**

```bash
# 确保虚拟环境已激活
source venv/bin/activate

# 运行迁移
alembic upgrade head

# 验证数据库连接
python -c "from app.database import engine; print('Database connected!')"
```

#### **2.7 配置 Systemd 服务**

创建服务文件：

```bash
sudo nano /etc/systemd/system/sl-news-backend.service
```

填入以下内容：

```ini
[Unit]
Description=S&L News Backend API
After=network.target

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

# 检查状态
sudo systemctl status sl-news-backend

# 查看日志
sudo journalctl -u sl-news-backend -f
```

#### **2.8 配置 Nginx 反向代理**

```bash
sudo nano /etc/nginx/sites-available/sl-news-backend
```

填入：

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;  # 或使用 EC2 公网 IP

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

#### **2.9 验证后端**

访问：`http://[EC2-PUBLIC-IP]/docs`

应该看到 FastAPI 文档页面！

---

### **阶段 3: 部署前端到 S3 + CloudFront** ⏱️ 20-30 分钟

#### **3.1 构建前端**

在本地机器上：

```powershell
# 创建生产环境变量
Copy-Item .env.production.example .env.production

# 编辑 .env.production
notepad .env.production
```

填入：
```bash
VITE_API_BASE_URL=http://[EC2-PUBLIC-IP]
# 或使用域名: https://api.yourdomain.com
```

构建：
```powershell
npm run build
```

这会在 `build/` 目录生成静态文件。

#### **3.2 创建 S3 存储桶**

1. 进入 **S3** 服务
2. 点击 **Create bucket**
3. 配置：
   - **Bucket name**: `sl-news-frontend`（必须全局唯一）
   - **Region**: 选择与 EC2 相同的区域
   - **Block Public Access**: 取消勾选所有选项
   - 勾选确认警告
4. 点击 **Create bucket**

#### **3.3 配置 S3 为静态网站**

1. 进入你的存储桶
2. 点击 **Properties** 标签
3. 滚动到 **Static website hosting**
4. 点击 **Edit**：
   - **Enable**: 是
   - **Index document**: `index.html`
   - **Error document**: `index.html`（用于 SPA 路由）
5. 保存

#### **3.4 设置存储桶策略**

1. 点击 **Permissions** 标签
2. 滚动到 **Bucket policy**
3. 点击 **Edit**，填入：

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::sl-news-frontend/*"
        }
    ]
}
```

4. 保存

#### **3.5 上传文件到 S3**

**方法 1: 使用 AWS CLI**

```powershell
# 安装 AWS CLI（如果还没有）
# Windows: https://aws.amazon.com/cli/

# 配置 AWS CLI
aws configure
# 输入 Access Key ID
# 输入 Secret Access Key
# 输入 Region (例如: us-east-1)
# 输入 Output format: json

# 上传文件
aws s3 sync build/ s3://sl-news-frontend/ --delete
```

**方法 2: 使用 AWS 控制台**

1. 进入你的 S3 存储桶
2. 点击 **Upload**
3. 拖拽 `build/` 目录中的所有文件
4. 点击 **Upload**

#### **3.6 测试 S3 网站**

访问 S3 网站 URL（在 Properties → Static website hosting 中找到）：
`http://sl-news-frontend.s3-website-us-east-1.amazonaws.com`

#### **3.7 创建 CloudFront 分发（CDN）**

1. 进入 **CloudFront** 服务
2. 点击 **Create distribution**
3. 配置：
   - **Origin domain**: 选择你的 S3 存储桶
   - **Origin path**: 留空
   - **Viewer protocol policy**: Redirect HTTP to HTTPS
   - **Allowed HTTP methods**: GET, HEAD, OPTIONS
   - **Cache policy**: CachingOptimized
   - **Price class**: Use all edge locations（或选择更便宜的选项）
   - **Alternate domain names (CNAMEs)**: `yourdomain.com`（如果有域名）
   - **Custom SSL certificate**: 选择或创建证书（见下文）
   - **Default root object**: `index.html`

4. 点击 **Create distribution**，等待 10-15 分钟部署

---

### **阶段 4: 配置域名和 SSL** ⏱️ 30-60 分钟

#### **4.1 申请 SSL 证书**

1. 进入 **Certificate Manager**（必须在 `us-east-1` 区域）
2. 点击 **Request certificate**
3. 选择 **Request a public certificate**
4. 添加域名：
   - `yourdomain.com`
   - `*.yourdomain.com`（通配符）
5. 验证方法：DNS validation
6. 点击 **Request**
7. 按照提示在你的 DNS 提供商添加 CNAME 记录
8. 等待验证通过（5-30 分钟）

#### **4.2 配置 Route 53（或使用你的 DNS 提供商）**

**前端域名**（指向 CloudFront）：
```
类型: A (Alias)
名称: yourdomain.com
值: [CloudFront 分发域名]
```

**后端域名**（指向 EC2）：
```
类型: A
名称: api.yourdomain.com
值: [EC2 弹性 IP]
```

#### **4.3 为后端配置 SSL（Let's Encrypt）**

在 EC2 上运行：

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d api.yourdomain.com

# 按照提示操作
# 选择: Redirect HTTP to HTTPS

# 验证自动续期
sudo certbot renew --dry-run
```

---

## ✅ **部署完成检查清单**

- [ ] RDS 数据库运行正常
- [ ] pgvector 扩展已安装
- [ ] EC2 实例运行正常
- [ ] 后端 API 可访问：`https://api.yourdomain.com/docs`
- [ ] S3 存储桶配置正确
- [ ] CloudFront 分发已部署
- [ ] 前端网站可访问：`https://yourdomain.com`
- [ ] SSL 证书已配置
- [ ] DNS 记录已设置
- [ ] 测试所有功能

---

## 📊 **成本优化建议**

### **降低成本**
1. 使用 **Reserved Instances**（预留实例）- 节省 30-50%
2. 使用 **Spot Instances**（竞价实例）- 节省 70-90%（适合非关键服务）
3. 使用 **AWS Lightsail**（简化版）- 固定价格 $10-20/月
4. 启用 **S3 Intelligent-Tiering**（智能分层）
5. 配置 **CloudFront 缓存**（减少源站请求）

### **监控成本**
1. 启用 **AWS Cost Explorer**
2. 设置 **Billing Alerts**（账单告警）
3. 使用 **AWS Budgets**（预算管理）

---

## 🔧 **维护和更新**

### **更新后端代码**

```bash
# SSH 到 EC2
ssh -i sl-news-key.pem ubuntu@[EC2-IP]

# 进入项目目录
cd /home/ubuntu/your-repo

# 拉取最新代码
git pull

# 激活虚拟环境
cd backend
source venv/bin/activate

# 安装新依赖（如果有）
pip install -r requirements.txt

# 运行数据库迁移（如果有）
alembic upgrade head

# 重启服务
sudo systemctl restart sl-news-backend
```

### **更新前端代码**

```powershell
# 本地构建
npm run build

# 上传到 S3
aws s3 sync build/ s3://sl-news-frontend/ --delete

# 清除 CloudFront 缓存
aws cloudfront create-invalidation --distribution-id [DISTRIBUTION-ID] --paths "/*"
```

---

## 📞 **下一步**

你想：
1. **开始部署** - 我会逐步指导你
2. **了解 Lightsail 方案** - 更简单、更便宜的选择
3. **了解 ECS 方案** - Docker 容器化部署
4. **了解 Lambda 方案** - Serverless 部署

请告诉我你的选择！

