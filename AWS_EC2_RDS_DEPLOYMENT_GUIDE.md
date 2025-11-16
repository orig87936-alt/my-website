# 🚀 AWS EC2 + RDS 部署完整指南

**部署方案**: EC2 + RDS  
**适用于**: 生产环境  
**预计时间**: 3-4 小时  
**月度成本**: $40-70

---

## 📋 目录

1. [架构概览](#架构概览)
2. [成本估算](#成本估算)
3. [RDS 数据库配置](#rds-数据库配置)
4. [EC2 实例配置](#ec2-实例配置)
5. [安全组配置](#安全组配置)
6. [后端部署](#后端部署)
7. [前端部署](#前端部署)
8. [域名和 SSL](#域名和-ssl)
9. [监控和备份](#监控和备份)
10. [故障排查](#故障排查)

---

## 🏗️ 架构概览

```
用户浏览器
    ↓
CloudFront (CDN)
    ↓
S3 (前端静态文件)
    ↓
Route 53 (DNS)
    ↓
Application Load Balancer (可选)
    ↓
EC2 Instance (后端 API)
    ↓
RDS PostgreSQL (数据库)
```

### 组件说明

| 组件 | 用途 | 成本 |
|------|------|------|
| **EC2 t3.small** | 运行后端 API | $15-20/月 |
| **RDS db.t3.micro** | PostgreSQL 数据库 | $15-25/月 |
| **S3** | 存储前端文件 | $1-2/月 |
| **CloudFront** | CDN 加速 | $5-10/月 |
| **Route 53** | DNS 解析 | $0.5/月 |
| **Elastic IP** | 固定 IP 地址 | $0（使用时免费） |

---

## 💰 成本估算

### 方案 A: 基础配置（推荐新手）

```
EC2 t3.small (2 vCPU, 2GB RAM)      $15/月
RDS db.t3.micro (1 vCPU, 1GB RAM)   $15/月
S3 + CloudFront                      $6/月
Route 53                             $0.5/月
数据传输                              $3/月
─────────────────────────────────────────
总计                                 ~$40/月
```

### 方案 B: 生产配置（推荐）

```
EC2 t3.medium (2 vCPU, 4GB RAM)     $30/月
RDS db.t3.small (2 vCPU, 2GB RAM)   $30/月
S3 + CloudFront                      $6/月
Route 53                             $0.5/月
数据传输                              $5/月
─────────────────────────────────────────
总计                                 ~$70/月
```

### 免费额度（首年）

- ✅ EC2 t2.micro: 750 小时/月（12个月）
- ✅ RDS db.t2.micro: 750 小时/月（12个月）
- ✅ S3: 5GB 存储 + 20,000 GET 请求
- ✅ CloudFront: 50GB 数据传输
- ✅ 数据传输: 15GB/月

**首年实际成本**: 可能低至 $10-20/月！

---

## 🗄️ 步骤 1: RDS 数据库配置

### 1.1 创建 RDS 实例

1. **登录 AWS Console**
   - 访问: https://console.aws.amazon.com/rds/
   - 选择区域（推荐：Tokyo `ap-northeast-1` 或 Singapore `ap-southeast-1`）

2. **创建数据库**
   ```
   点击 "Create database"
   
   配置选项：
   ┌─────────────────────────────────────┐
   │ Engine options                      │
   ├─────────────────────────────────────┤
   │ ✓ PostgreSQL                        │
   │   Version: PostgreSQL 14.x          │
   └─────────────────────────────────────┘
   
   ┌─────────────────────────────────────┐
   │ Templates                           │
   ├─────────────────────────────────────┤
   │ ○ Production                        │
   │ ● Free tier (首年免费)              │
   │ ○ Dev/Test                          │
   └─────────────────────────────────────┘
   ```

3. **设置标识符和凭证**
   ```
   DB instance identifier: sl-news-db
   Master username: newsadmin
   Master password: [设置强密码，至少16位]
   
   ⚠️ 重要：记录这些信息！
   ```

4. **实例配置**
   ```
   DB instance class:
   - 免费套餐: db.t2.micro (1 vCPU, 1GB RAM)
   - 推荐生产: db.t3.small (2 vCPU, 2GB RAM)
   
   Storage:
   - Storage type: General Purpose SSD (gp3)
   - Allocated storage: 20 GB
   - ✓ Enable storage autoscaling
   - Maximum storage threshold: 100 GB
   ```

5. **连接配置**
   ```
   Connectivity:
   - Virtual Private Cloud (VPC): Default VPC
   - Subnet group: default
   - Public access: Yes ⚠️ (生产环境建议 No + VPC Peering)
   - VPC security group: Create new
     - Name: sl-news-db-sg
   - Availability Zone: No preference
   - Database port: 5432
   ```

6. **数据库认证**
   ```
   Database authentication:
   ✓ Password authentication
   ```

7. **附加配置**
   ```
   Initial database name: newsdb
   
   Backup:
   ✓ Enable automated backups
   - Backup retention period: 7 days
   - Backup window: 选择低峰时段（如凌晨2-3点）
   
   Encryption:
   ✓ Enable encryption
   
   Monitoring:
   ✓ Enable Enhanced Monitoring
   - Granularity: 60 seconds
   
   Maintenance:
   ✓ Enable auto minor version upgrade
   - Maintenance window: 选择低峰时段
   ```

8. **创建数据库**
   ```
   点击 "Create database"
   等待 5-10 分钟，直到状态变为 "Available"
   ```

### 1.2 配置安全组

1. **编辑 RDS 安全组**
   ```
   RDS → sl-news-db → Connectivity & security → VPC security groups
   点击安全组 ID
   ```

2. **添加入站规则**
   ```
   Inbound rules → Edit inbound rules → Add rule
   
   规则 1: 允许 EC2 访问（稍后添加）
   Type: PostgreSQL
   Protocol: TCP
   Port: 5432
   Source: [EC2 安全组 ID - 稍后填写]
   Description: Allow EC2 backend access
   
   规则 2: 临时允许本地访问（用于初始化）
   Type: PostgreSQL
   Protocol: TCP
   Port: 5432
   Source: My IP
   Description: Temporary local access
   ```

### 1.3 记录连接信息

```
RDS → sl-news-db → Connectivity & security

记录以下信息：
┌─────────────────────────────────────────────────────────┐
│ Endpoint: sl-news-db.xxxxx.ap-northeast-1.rds.amazonaws.com
│ Port: 5432                                              │
│ Database: newsdb                                        │
│ Username: newsadmin                                     │
│ Password: [你设置的密码]                                │
└─────────────────────────────────────────────────────────┘

连接字符串：
postgresql+asyncpg://newsadmin:YOUR_PASSWORD@sl-news-db.xxxxx.ap-northeast-1.rds.amazonaws.com:5432/newsdb
```

### 1.4 初始化数据库

1. **本地连接测试**（需要安装 PostgreSQL 客户端）
   ```bash
   # Windows (使用 PowerShell)
   # 先安装 PostgreSQL 客户端
   
   # 连接到 RDS
   psql -h sl-news-db.xxxxx.ap-northeast-1.rds.amazonaws.com -U newsadmin -d newsdb
   
   # 输入密码后，执行：
   \l                    # 列出数据库
   \c newsdb             # 连接到 newsdb
   \dt                   # 列出表（应该为空）
   ```

2. **启用 pgvector 扩展**
   ```sql
   -- 在 psql 中执行
   CREATE EXTENSION IF NOT EXISTS vector;
   
   -- 验证
   \dx
   -- 应该看到 vector 扩展
   ```

3. **退出**
   ```sql
   \q
   ```

---

## 🖥️ 步骤 2: EC2 实例配置

### 2.1 创建 EC2 实例

1. **登录 EC2 Console**
   - 访问: https://console.aws.amazon.com/ec2/
   - 确保在同一区域（与 RDS 相同）

2. **启动实例**
   ```
   点击 "Launch Instance"
   
   Name: sl-news-backend
   ```

3. **选择 AMI**
   ```
   Application and OS Images:
   ✓ Ubuntu Server 22.04 LTS (HVM), SSD Volume Type
   - Architecture: 64-bit (x86)
   ```

4. **选择实例类型**
   ```
   Instance type:
   - 免费套餐: t2.micro (1 vCPU, 1GB RAM) ⚠️ 可能不够
   - 推荐最小: t3.small (2 vCPU, 2GB RAM)
   - 推荐生产: t3.medium (2 vCPU, 4GB RAM)
   ```

5. **密钥对**
   ```
   Key pair (login):
   - Create new key pair
     - Name: sl-news-key
     - Type: RSA
     - Format: .pem (Linux/Mac) 或 .ppk (Windows/PuTTY)
   
   ⚠️ 下载后妥善保管！丢失无法找回！
   ```

6. **网络设置**
   ```
   Network settings:
   - VPC: Default VPC
   - Subnet: No preference
   - Auto-assign public IP: Enable
   
   Firewall (security groups):
   ○ Create security group
     - Name: sl-news-backend-sg
     - Description: Security group for S&L News backend
     
     Rules:
     ✓ SSH (22) - Source: My IP
     ✓ HTTP (80) - Source: Anywhere (0.0.0.0/0)
     ✓ HTTPS (443) - Source: Anywhere (0.0.0.0/0)
     ✓ Custom TCP (8000) - Source: Anywhere (0.0.0.0/0)
   ```

7. **存储配置**
   ```
   Configure storage:
   - Size: 30 GB (免费套餐最多 30GB)
   - Volume type: General Purpose SSD (gp3)
   - ✓ Delete on termination
   ```

8. **高级详细信息**（可选）
   ```
   Advanced details:
   - IAM instance profile: 如果需要访问 S3/其他 AWS 服务
   - User data: 可以添加启动脚本（稍后手动配置更安全）
   ```

9. **启动实例**
   ```
   点击 "Launch instance"
   等待 1-2 分钟，直到状态变为 "Running"
   ```

### 2.2 分配弹性 IP

1. **创建弹性 IP**
   ```
   EC2 → Elastic IPs → Allocate Elastic IP address
   
   Settings:
   - Network Border Group: [选择你的区域]
   - Public IPv4 address pool: Amazon's pool of IPv4 addresses
   
   点击 "Allocate"
   ```

2. **关联到 EC2 实例**
   ```
   选择刚创建的弹性 IP → Actions → Associate Elastic IP address
   
   Settings:
   - Resource type: Instance
   - Instance: sl-news-backend
   - Private IP address: [自动选择]
   
   点击 "Associate"
   ```

3. **记录弹性 IP**
   ```
   例如: 54.123.45.67
   
   ⚠️ 这将是你的后端 API 地址！
   ```

### 2.3 更新 RDS 安全组

现在我们有了 EC2 安全组 ID，可以更新 RDS 安全组：

```
1. 复制 EC2 安全组 ID (sg-xxxxx)
2. 回到 RDS 安全组
3. 编辑入站规则
4. 将之前的规则 1 的 Source 改为 EC2 安全组 ID
5. 保存规则
```

---

## 🔒 步骤 3: 安全组配置总结

### EC2 安全组 (sl-news-backend-sg)

| 类型 | 协议 | 端口 | 源 | 说明 |
|------|------|------|-----|------|
| SSH | TCP | 22 | My IP | SSH 访问 |
| HTTP | TCP | 80 | 0.0.0.0/0 | HTTP 流量 |
| HTTPS | TCP | 443 | 0.0.0.0/0 | HTTPS 流量 |
| Custom | TCP | 8000 | 0.0.0.0/0 | 后端 API（临时） |

### RDS 安全组 (sl-news-db-sg)

| 类型 | 协议 | 端口 | 源 | 说明 |
|------|------|------|-----|------|
| PostgreSQL | TCP | 5432 | sg-xxxxx (EC2) | EC2 访问 |
| PostgreSQL | TCP | 5432 | My IP | 临时本地访问 |

⚠️ **生产环境建议**：
- 移除 RDS 的 "My IP" 规则
- 将 EC2 的 8000 端口改为仅允许 ALB 访问
- 使用 VPC 私有子网部署 RDS

---

## 🔧 步骤 4: 后端部署

### 4.1 连接到 EC2

**Windows 用户（使用 PowerShell）**:
```powershell
# 设置密钥权限
icacls sl-news-key.pem /inheritance:r
icacls sl-news-key.pem /grant:r "$($env:USERNAME):(R)"

# SSH 连接
ssh -i sl-news-key.pem ubuntu@54.123.45.67
```

**或使用 PuTTY**:
```
1. 打开 PuTTY
2. Host Name: ubuntu@54.123.45.67
3. Connection → SSH → Auth → Private key: 选择 .ppk 文件
4. 点击 Open
```

### 4.2 安装系统依赖

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Python 和依赖
sudo apt install -y python3.11 python3.11-venv python3-pip

# 安装 PostgreSQL 客户端
sudo apt install -y postgresql-client

# 安装 Nginx
sudo apt install -y nginx

# 安装 Git
sudo apt install -y git

# 安装其他工具
sudo apt install -y curl wget htop
```

### 4.3 上传代码

**选项 A: 使用 Git（推荐）**
```bash
# 如果代码在 GitHub
git clone https://github.com/yourusername/your-repo.git
cd your-repo

# 如果是私有仓库
git clone https://YOUR_TOKEN@github.com/yourusername/your-repo.git
```

**选项 B: 使用 SCP 上传**
```powershell
# 在本地 PowerShell 运行
scp -i sl-news-key.pem -r "d:\主页设计\backend" ubuntu@54.123.45.67:~/
scp -i sl-news-key.pem "d:\主页设计\PRODUCTION_SECRETS.txt" ubuntu@54.123.45.67:~/
```

### 4.4 配置后端环境

```bash
# 进入后端目录
cd ~/backend  # 或 ~/your-repo/backend

# 创建虚拟环境
python3.11 -m venv venv

# 激活虚拟环境
source venv/bin/activate

# 升级 pip
pip install --upgrade pip

# 安装依赖
pip install -r requirements.txt
```

### 4.5 配置环境变量

```bash
# 创建 .env 文件
nano .env
```

填入以下内容（参考 `PRODUCTION_SECRETS.txt`）:
```bash
# 数据库配置
DATABASE_URL=postgresql+asyncpg://newsadmin:YOUR_RDS_PASSWORD@sl-news-db.xxxxx.ap-northeast-1.rds.amazonaws.com:5432/newsdb

# JWT 配置
SECRET_KEY=dfd5ca7b75d6acae1984451f3b600211945af4d74553b15e800371dc481305b2
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# 管理员配置
ADMIN_USERNAME=Administrator
ADMIN_PASSWORD=YOUR_STRONG_PASSWORD_HERE

# API 密钥
DEEPSEEK_API_KEY=sk-7dd7f650117143e9b9c2d312164cb873
OPENAI_API_KEY=YOUR_OPENAI_API_KEY

# CORS 配置
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
FRONTEND_URL=https://yourdomain.com

# 环境
ENVIRONMENT=production

# 邮件配置（可选）
RESEND_API_KEY=your_resend_key
```

保存并退出（Ctrl+X, Y, Enter）

```bash
# 设置文件权限
chmod 600 .env
```

### 4.6 初始化数据库

```bash
# 测试数据库连接
python -c "import asyncio; from app.database import engine; from sqlalchemy import text; async def test(): async with engine.begin() as conn: result = await conn.execute(text('SELECT version()')); print('Connected:', result.scalar()[:50]); asyncio.run(test())"

# 运行数据库迁移
alembic upgrade head

# 验证表已创建
python -c "from app.database import engine; from sqlalchemy import inspect; print('Tables:', inspect(engine).get_table_names())"
```

### 4.7 测试后端

```bash
# 启动后端（测试）
uvicorn app.main:app --host 0.0.0.0 --port 8000

# 在另一个终端测试
curl http://localhost:8000/health
# 应该返回: {"status":"healthy",...}
```

按 Ctrl+C 停止测试服务器。

### 4.8 配置 Systemd 服务

```bash
# 创建服务文件
sudo nano /etc/systemd/system/sl-news-api.service
```

添加以下内容:
```ini
[Unit]
Description=S&L News API Service
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/backend
Environment="PATH=/home/ubuntu/backend/venv/bin"
ExecStart=/home/ubuntu/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
Restart=always
RestartSec=10

# 安全设置
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

保存并启动服务:
```bash
# 重新加载 systemd
sudo systemctl daemon-reload

# 启用服务（开机自启）
sudo systemctl enable sl-news-api

# 启动服务
sudo systemctl start sl-news-api

# 检查状态
sudo systemctl status sl-news-api

# 查看日志
sudo journalctl -u sl-news-api -f
```

### 4.9 配置 Nginx 反向代理

```bash
# 创建 Nginx 配置
sudo nano /etc/nginx/sites-available/sl-news
```

添加以下内容:
```nginx
# 后端 API 服务器
upstream backend_api {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name api.yourdomain.com yourdomain.com;
    
    # 日志
    access_log /var/log/nginx/sl-news-access.log;
    error_log /var/log/nginx/sl-news-error.log;
    
    # API 路由
    location /api {
        proxy_pass http://backend_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket 支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 健康检查
    location /health {
        proxy_pass http://backend_api;
        access_log off;
    }
    
    # API 文档
    location /docs {
        proxy_pass http://backend_api;
    }
    
    location /openapi.json {
        proxy_pass http://backend_api;
    }
}
```

启用配置:
```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/sl-news /etc/nginx/sites-enabled/

# 删除默认配置
sudo rm /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 4.10 测试后端 API

```bash
# 本地测试
curl http://localhost/health

# 外部测试（在本地电脑运行）
curl http://54.123.45.67/health
curl http://54.123.45.67/api/docs
```

---

## 🌐 步骤 5: 前端部署（S3 + CloudFront）

### 5.1 本地构建前端

```powershell
# 在本地项目目录
cd "d:\主页设计"

# 编辑 .env.production
notepad .env.production
```

修改 API URL:
```bash
VITE_API_URL=http://54.123.45.67
# 或使用域名: https://api.yourdomain.com
```

构建:
```powershell
npm run build
```

### 5.2 创建 S3 存储桶

1. **登录 S3 Console**
   - 访问: https://s3.console.aws.amazon.com/

2. **创建存储桶**
   ```
   点击 "Create bucket"
   
   Bucket name: sl-news-frontend
   AWS Region: us-east-1 (CloudFront 推荐)
   
   Object Ownership:
   ✓ ACLs disabled
   
   Block Public Access:
   ✗ Block all public access (取消勾选)
   ✓ I acknowledge... (确认)
   
   Bucket Versioning:
   ✓ Enable
   
   点击 "Create bucket"
   ```

3. **配置静态网站托管**
   ```
   S3 → sl-news-frontend → Properties → Static website hosting
   
   ✓ Enable
   Index document: index.html
   Error document: index.html
   
   保存更改
   ```

4. **配置存储桶策略**
   ```
   S3 → sl-news-frontend → Permissions → Bucket policy
   
   添加以下策略:
   ```

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

### 5.3 上传文件到 S3

**选项 A: 使用 AWS CLI**
```powershell
# 安装 AWS CLI
# 下载: https://aws.amazon.com/cli/

# 配置 AWS 凭证
aws configure
# 输入 Access Key ID
# 输入 Secret Access Key
# Region: us-east-1
# Output format: json

# 上传文件
aws s3 sync build/ s3://sl-news-frontend/ --delete

# 验证
aws s3 ls s3://sl-news-frontend/
```

**选项 B: 使用 AWS Console**
```
S3 → sl-news-frontend → Upload
拖拽 build/ 目录下的所有文件
点击 Upload
```

### 5.4 创建 CloudFront 分发

1. **创建分发**
   ```
   CloudFront → Create distribution
   
   Origin:
   - Origin domain: sl-news-frontend.s3.us-east-1.amazonaws.com
   - Name: S3-sl-news-frontend
   - Origin access: Public
   
   Default cache behavior:
   - Viewer protocol policy: Redirect HTTP to HTTPS
   - Allowed HTTP methods: GET, HEAD, OPTIONS
   - Cache policy: CachingOptimized
   - Origin request policy: CORS-S3Origin
   
   Settings:
   - Price class: Use all edge locations (最佳性能)
   - Alternate domain names (CNAMEs): yourdomain.com, www.yourdomain.com
   - Custom SSL certificate: [稍后配置]
   - Default root object: index.html
   
   点击 "Create distribution"
   ```

2. **配置错误页面**
   ```
   CloudFront → Distributions → [你的分发] → Error pages
   
   Create custom error response:
   - HTTP error code: 403
   - Customize error response: Yes
   - Response page path: /index.html
   - HTTP response code: 200
   
   重复添加 404 错误
   ```

3. **记录 CloudFront 域名**
   ```
   例如: d1234567890.cloudfront.net
   ```

---

## 🔒 步骤 6: 域名和 SSL 配置

### 6.1 申请 SSL 证书（ACM）

1. **请求证书**
   ```
   ACM → Request certificate
   
   Certificate type: Request a public certificate
   
   Domain names:
   - yourdomain.com
   - *.yourdomain.com (通配符)
   
   Validation method: DNS validation
   
   点击 "Request"
   ```

2. **验证域名**
   ```
   ACM → Certificates → [你的证书] → Domains
   
   复制 CNAME 记录信息
   ```

3. **添加 DNS 记录**
   ```
   在你的域名注册商添加 CNAME 记录
   等待验证（通常 5-30 分钟）
   ```

### 6.2 配置 Route 53（可选）

如果使用 Route 53 管理 DNS:

```
Route 53 → Hosted zones → Create hosted zone

Domain name: yourdomain.com
Type: Public hosted zone

创建记录:
1. A 记录（后端）
   - Name: api.yourdomain.com
   - Type: A
   - Value: 54.123.45.67 (EC2 弹性 IP)

2. A 记录（前端 - Alias）
   - Name: yourdomain.com
   - Type: A - Alias
   - Alias target: CloudFront distribution

3. CNAME 记录（www）
   - Name: www.yourdomain.com
   - Type: CNAME
   - Value: yourdomain.com
```

### 6.3 更新 CloudFront 使用 SSL

```
CloudFront → Distributions → [你的分发] → Edit

Settings:
- Alternate domain names: yourdomain.com, www.yourdomain.com
- Custom SSL certificate: 选择刚申请的证书

保存更改
等待部署（5-15 分钟）
```

### 6.4 配置后端 SSL（Let's Encrypt）

```bash
# SSH 到 EC2
ssh -i sl-news-key.pem ubuntu@54.123.45.67

# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d api.yourdomain.com

# 按照提示操作
# Email: your@email.com
# Agree to terms: Yes
# Share email: No
# Redirect HTTP to HTTPS: Yes

# 测试自动续期
sudo certbot renew --dry-run
```

### 6.5 更新后端 CORS 配置

```bash
# 编辑 .env
nano ~/backend/.env
```

更新:
```bash
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

重启服务:
```bash
sudo systemctl restart sl-news-api
```

### 6.6 更新前端 API URL

```powershell
# 本地编辑 .env.production
notepad .env.production
```

更新:
```bash
VITE_API_URL=https://api.yourdomain.com
```

重新构建并上传:
```powershell
npm run build
aws s3 sync build/ s3://sl-news-frontend/ --delete

# 清除 CloudFront 缓存
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

---

## ✅ 步骤 7: 验证部署

### 后端验证

```bash
# 健康检查
curl https://api.yourdomain.com/health

# API 文档
curl https://api.yourdomain.com/docs

# 文章列表
curl https://api.yourdomain.com/api/v1/articles
```

### 前端验证

1. 访问 https://yourdomain.com
2. 检查所有页面加载
3. 测试登录功能
4. 测试新闻管理
5. 测试预约功能

---

## 📊 步骤 8: 监控和备份

### 8.1 CloudWatch 监控

```
CloudWatch → Dashboards → Create dashboard

添加小部件:
- EC2 CPU 使用率
- EC2 网络流量
- RDS CPU 使用率
- RDS 连接数
- RDS 存储空间
```

### 8.2 RDS 自动备份

已在创建时配置：
- 每日自动备份
- 保留 7 天
- 可手动创建快照

### 8.3 应用日志

```bash
# 查看后端日志
sudo journalctl -u sl-news-api -f

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/sl-news-access.log
sudo tail -f /var/log/nginx/sl-news-error.log
```

---

## 🔧 故障排查

### 后端无法启动

```bash
# 检查服务状态
sudo systemctl status sl-news-api

# 查看详细日志
sudo journalctl -u sl-news-api -n 100 --no-pager

# 检查端口占用
sudo lsof -i :8000

# 手动启动测试
cd ~/backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 数据库连接失败

```bash
# 测试连接
psql -h sl-news-db.xxxxx.ap-northeast-1.rds.amazonaws.com -U newsadmin -d newsdb

# 检查安全组
# RDS Console → Security groups → 确认 EC2 安全组在允许列表

# 检查环境变量
cat ~/backend/.env | grep DATABASE_URL
```

### 前端无法访问后端

```bash
# 检查 CORS 配置
cat ~/backend/.env | grep CORS_ORIGINS

# 检查 Nginx 配置
sudo nginx -t
sudo systemctl status nginx

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/sl-news-error.log
```

---

## 🎉 完成！

恭喜！你的应用已成功部署到 AWS EC2 + RDS！

### 下一步

- [ ] 配置监控告警
- [ ] 设置自动化部署
- [ ] 优化性能
- [ ] 配置 CDN 缓存策略
- [ ] 实施日志聚合

---

**文档版本**: 1.0  
**最后更新**: 2025-11-14  
**预计部署时间**: 3-4 小时

