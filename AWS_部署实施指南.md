# 🚀 AWS 部署实施指南 - 分步操作手册

本指南将**手把手**带你完成AWS部署，每一步都有详细的命令和截图说明。

---

## 📊 部署架构图

```
用户浏览器
    ↓
CloudFront (CDN) → S3 (前端静态文件)
    ↓
Route 53 (DNS)
    ↓
EC2 (后端 FastAPI) → RDS PostgreSQL (数据库)
    ↓
第三方服务: DeepSeek, OpenAI, Resend
```

---

## 💰 成本估算

| 服务 | 配置 | 月度成本 |
|------|------|----------|
| RDS (PostgreSQL) | db.t3.micro | $15-20 |
| EC2 | t3.small | $15-20 |
| S3 | 存储 + 流量 | $1-5 |
| CloudFront | CDN 流量 | $5-15 |
| Route 53 | DNS 托管 | $0.5 |
| **总计** | - | **$36-60/月** |

**免费套餐**: 新AWS账号前12个月可享受免费套餐，包括：
- EC2 t2.micro 750小时/月
- RDS db.t2.micro 750小时/月
- S3 5GB 存储
- CloudFront 50GB 流量

---

## 🎯 第一步：AWS 账号准备（15分钟）

### 1.1 注册 AWS 账号

1. 访问 https://aws.amazon.com/
2. 点击 **"创建 AWS 账户"**
3. 填写信息：
   - 邮箱地址
   - 密码
   - AWS 账户名称
4. 选择账户类型：**个人**
5. 填写联系信息和信用卡信息
6. 验证手机号码
7. 选择支持计划：**基本支持 - 免费**

### 1.2 启用 MFA（多因素认证）- 推荐

1. 登录 AWS 控制台
2. 点击右上角账户名 → **安全凭证**
3. 找到 **多重验证 (MFA)**
4. 点击 **激活 MFA**
5. 选择 **虚拟 MFA 设备**
6. 使用手机 App（如 Google Authenticator）扫描二维码
7. 输入两个连续的 MFA 代码

### 1.3 创建 IAM 用户（用于 CLI 访问）

1. 进入 **IAM** 服务
2. 点击左侧 **用户** → **创建用户**
3. 用户名：`sl-news-deployer`
4. 勾选 **提供用户访问权限**
5. 选择 **我要创建 IAM 用户**
6. 点击 **下一步**
7. 权限选项：**直接附加策略**
8. 搜索并勾选以下策略：
   - `AdministratorAccess`（或更细粒度的权限）
9. 点击 **下一步** → **创建用户**
10. **重要**：下载 CSV 文件（包含访问密钥）

### 1.4 安装 AWS CLI

**Windows (PowerShell)**:
```powershell
# 下载安装程序
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

# 验证安装
aws --version
```

**配置 AWS CLI**:
```powershell
aws configure

# 输入以下信息（从 CSV 文件获取）：
# AWS Access Key ID: AKIA...
# AWS Secret Access Key: ...
# Default region name: us-east-1  # 或选择离你最近的区域
# Default output format: json
```

**验证配置**:
```powershell
aws sts get-caller-identity
```

应该看到你的账户信息。

---

## 🗄️ 第二步：创建 RDS PostgreSQL 数据库（20分钟）

### 2.1 创建数据库实例

1. 登录 AWS 控制台
2. 搜索并进入 **RDS** 服务
3. 点击 **创建数据库**

**配置选项**：

**引擎选项**：
- 引擎类型：`PostgreSQL`
- 版本：`PostgreSQL 14.x` 或更高

**模板**：
- 选择：`免费套餐`（如果可用）或 `开发/测试`

**设置**：
- 数据库实例标识符：`sl-news-db`
- 主用户名：`postgres`
- 主密码：设置强密码（记住它！）
- 确认密码：再次输入

**实例配置**：
- 数据库实例类：`db.t3.micro`（免费套餐）或 `db.t3.small`

**存储**：
- 存储类型：`通用型 SSD (gp3)`
- 分配的存储：`20 GB`
- 取消勾选 **启用存储自动扩展**（节省成本）

**连接**：
- 计算资源：`不连接到 EC2 计算资源`
- 网络类型：`IPv4`
- VPC：默认 VPC
- 公开访问：`是`（暂时，后续可改为否）
- VPC 安全组：`创建新的`
  - 新 VPC 安全组名称：`sl-news-db-sg`
- 可用区：`无首选项`

**数据库身份验证**：
- 选择：`密码身份验证`

**其他配置**：
- 初始数据库名称：`newsdb`
- 取消勾选 **启用自动备份**（开发环境，节省成本）
- 取消勾选 **启用加密**（可选）

4. 点击 **创建数据库**
5. 等待 5-10 分钟，直到状态变为 **可用**

### 2.2 配置安全组（允许外部访问）

1. 在 RDS 控制台，点击你的数据库实例
2. 点击 **连接性和安全性** 标签
3. 找到 **VPC 安全组**，点击安全组名称（如 `sl-news-db-sg`）
4. 点击 **入站规则** 标签
5. 点击 **编辑入站规则**
6. 点击 **添加规则**：
   - 类型：`PostgreSQL`
   - 协议：`TCP`
   - 端口范围：`5432`
   - 源：`0.0.0.0/0`（暂时允许所有 IP，后续改为 EC2 安全组）
   - 描述：`Allow PostgreSQL from anywhere`
7. 点击 **保存规则**

### 2.3 获取数据库连接信息

1. 回到 RDS 控制台
2. 点击你的数据库实例
3. 在 **连接性和安全性** 标签中，复制 **终端节点**
   - 例如：`sl-news-db.c1a2b3c4d5e6.us-east-1.rds.amazonaws.com`
4. 记录连接信息：

```
主机: sl-news-db.c1a2b3c4d5e6.us-east-1.rds.amazonaws.com
端口: 5432
数据库: newsdb
用户名: postgres
密码: [你设置的密码]
```

### 2.4 测试数据库连接

**使用 psql（如果已安装）**:
```powershell
psql -h sl-news-db.c1a2b3c4d5e6.us-east-1.rds.amazonaws.com -U postgres -d newsdb
# 输入密码
```

**或使用 Python 测试**:
```powershell
# 在项目根目录
cd backend
.\venv\Scripts\activate

# 创建测试脚本
@"
import asyncpg
import asyncio

async def test_connection():
    conn = await asyncpg.connect(
        host='sl-news-db.c1a2b3c4d5e6.us-east-1.rds.amazonaws.com',
        port=5432,
        user='postgres',
        password='你的密码',
        database='newsdb'
    )
    version = await conn.fetchval('SELECT version()')
    print(f'Connected! PostgreSQL version: {version}')
    await conn.close()

asyncio.run(test_connection())
"@ | Out-File -Encoding UTF8 test_rds_connection.py

python test_rds_connection.py
```

### 2.5 安装 pgvector 扩展

**重要**：AWS RDS PostgreSQL 14+ 已内置 pgvector 支持。

使用 psql 或任何 PostgreSQL 客户端连接后，运行：

```sql
CREATE EXTENSION IF NOT EXISTS vector;

-- 验证安装
SELECT * FROM pg_extension WHERE extname = 'vector';
```

---

## 🖥️ 第三步：创建 EC2 实例并部署后端（30分钟）

### 3.1 创建 EC2 实例

1. 进入 **EC2** 服务
2. 点击 **启动实例**

**配置**：

**名称和标签**：
- 名称：`sl-news-backend`

**应用程序和操作系统映像 (AMI)**：
- 快速启动：`Ubuntu`
- AMI：`Ubuntu Server 22.04 LTS (HVM), SSD Volume Type`
- 架构：`64 位 (x86)`

**实例类型**：
- 选择：`t3.small`（推荐）或 `t2.micro`（免费套餐）

**密钥对（登录）**：
- 点击 **创建新密钥对**
  - 密钥对名称：`sl-news-key`
  - 密钥对类型：`RSA`
  - 私有密钥文件格式：`.pem`（Linux/Mac）或 `.ppk`（Windows/PuTTY）
- 点击 **创建密钥对**
- **重要**：下载并保存密钥文件到安全位置

**网络设置**：
- 点击 **编辑**
- VPC：默认 VPC
- 子网：无首选项
- 自动分配公有 IP：`启用`
- 防火墙（安全组）：`创建安全组`
  - 安全组名称：`sl-news-backend-sg`
  - 描述：`Security group for S&L News backend`
  - 入站安全组规则：
    1. SSH (22) - 源：`我的 IP`
    2. HTTP (80) - 源：`任何位置 (0.0.0.0/0)`
    3. HTTPS (443) - 源：`任何位置 (0.0.0.0/0)`
    4. 自定义 TCP (8000) - 源：`任何位置 (0.0.0.0/0)` - 描述：`Backend API`

**配置存储**：
- 大小：`20 GiB`
- 卷类型：`gp3`

3. 点击 **启动实例**
4. 等待实例状态变为 **正在运行**

### 3.2 分配弹性 IP（推荐）

1. 在 EC2 控制台，点击左侧 **弹性 IP**
2. 点击 **分配弹性 IP 地址**
3. 点击 **分配**
4. 选择新分配的 IP，点击 **操作** → **关联弹性 IP 地址**
5. 实例：选择 `sl-news-backend`
6. 点击 **关联**

记录弹性 IP 地址（例如：`54.123.45.67`）

### 3.3 连接到 EC2 实例

**Windows (使用 PowerShell + OpenSSH)**:
```powershell
# 设置密钥文件权限（仅首次）
icacls sl-news-key.pem /inheritance:r
icacls sl-news-key.pem /grant:r "$($env:USERNAME):(R)"

# 连接到 EC2
ssh -i sl-news-key.pem ubuntu@54.123.45.67
```

**或使用 PuTTY（Windows）**:
1. 下载 PuTTY: https://www.putty.org/
2. 使用 PuTTYgen 转换 `.pem` 为 `.ppk`
3. 在 PuTTY 中：
   - Host Name: `ubuntu@54.123.45.67`
   - Connection → SSH → Auth → Private key: 选择 `.ppk` 文件
   - 点击 **Open**

连接成功后，你会看到 Ubuntu 命令行。

---

## 📦 第四步：在 EC2 上部署后端（继续）

### 4.1 更新系统并安装依赖

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Python 3.11
sudo apt install -y software-properties-common
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3.11-dev

# 安装其他必需工具
sudo apt install -y git nginx postgresql-client build-essential curl

# 安装 pip for Python 3.11
curl -sS https://bootstrap.pypa.io/get-pip.py | sudo python3.11

# 验证安装
python3.11 --version
pip3.11 --version
git --version
nginx -v
```

### 4.2 克隆代码仓库

**选项 A: 从 GitHub 克隆（推荐）**

首先，你需要将代码推送到 GitHub：

```powershell
# 在本地机器上（Windows PowerShell）
cd d:\主页设计

# 初始化 Git（如果还没有）
git init
git add .
git commit -m "Initial commit for AWS deployment"

# 创建 GitHub 仓库并推送
# 1. 访问 https://github.com/new
# 2. 创建新仓库（例如：sl-news-platform）
# 3. 运行以下命令：
git remote add origin https://github.com/你的用户名/sl-news-platform.git
git branch -M main
git push -u origin main
```

然后在 EC2 上克隆：

```bash
# 在 EC2 上
cd /home/ubuntu
git clone https://github.com/你的用户名/sl-news-platform.git
cd sl-news-platform
```

**选项 B: 使用 SCP 上传代码**

```powershell
# 在本地机器上（Windows PowerShell）
scp -i sl-news-key.pem -r d:\主页设计 ubuntu@54.123.45.67:/home/ubuntu/sl-news-platform
```

### 4.3 配置后端环境

```bash
# 进入后端目录
cd /home/ubuntu/sl-news-platform/backend

# 创建虚拟环境
python3.11 -m venv venv

# 激活虚拟环境
source venv/bin/activate

# 升级 pip
pip install --upgrade pip

# 安装依赖
pip install -r requirements.txt

# 创建必要的目录
mkdir -p uploads/images temp_uploads
```

### 4.4 配置环境变量

```bash
# 创建生产环境配置文件
nano .env.production
```

填入以下内容（**替换为你的实际值**）：

```bash
# 数据库配置
DATABASE_URL=postgresql+asyncpg://postgres:你的RDS密码@sl-news-db.c1a2b3c4d5e6.us-east-1.rds.amazonaws.com:5432/newsdb

# DeepSeek API
DEEPSEEK_API_KEY=sk-7dd7f650117143e9b9c2d312164cb873
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_MAX_TOKENS=1000
DEEPSEEK_TEMPERATURE=0.7

# OpenAI API（需要获取）
OPENAI_API_KEY=sk-your-openai-key-here
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536

# JWT 配置（生成新的密钥）
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS（暂时允许所有，后续改为你的域名）
CORS_ORIGINS=*

# 管理员账号
ADMIN_USERNAME=admin
ADMIN_PASSWORD=你的强密码

# 服务器配置
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=production
DEBUG=False

# 前端 URL（后续更新为你的域名）
FRONTEND_URL=http://54.123.45.67

# 其他配置
VECTOR_SEARCH_LIMIT=5
CHAT_RESPONSE_TIMEOUT=3
TRANSLATION_PROVIDER=deepseek
TRANSLATION_CACHE_DAYS=30
MAX_UPLOAD_SIZE=10485760
ALLOWED_FILE_TYPES=.md,.docx
TEMP_UPLOAD_DIR=./temp_uploads
```

保存文件：`Ctrl+X` → `Y` → `Enter`

```bash
# 复制为 .env
cp .env.production .env
```

### 4.5 运行数据库迁移

```bash
# 确保虚拟环境已激活
source venv/bin/activate

# 运行 Alembic 迁移
alembic upgrade head

# 验证数据库连接
python3 -c "from app.database import engine; print('Database connected successfully!')"
```

### 4.6 配置 Systemd 服务（自动启动）

```bash
# 创建服务文件
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
WorkingDirectory=/home/ubuntu/sl-news-platform/backend
Environment="PATH=/home/ubuntu/sl-news-platform/backend/venv/bin"
EnvironmentFile=/home/ubuntu/sl-news-platform/backend/.env
ExecStart=/home/ubuntu/sl-news-platform/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

保存并启动服务：

```bash
# 重新加载 systemd
sudo systemctl daemon-reload

# 启用服务（开机自启）
sudo systemctl enable sl-news-backend

# 启动服务
sudo systemctl start sl-news-backend

# 检查状态
sudo systemctl status sl-news-backend

# 查看日志
sudo journalctl -u sl-news-backend -f
```

### 4.7 配置 Nginx 反向代理

```bash
# 创建 Nginx 配置
sudo nano /etc/nginx/sites-available/sl-news-backend
```

填入以下内容：

```nginx
server {
    listen 80;
    server_name _;  # 暂时接受所有域名

    # 增加上传文件大小限制
    client_max_body_size 10M;

    # API 路由
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket 支持（如果需要）
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # 静态文件（上传的图片等）
    location /uploads/ {
        alias /home/ubuntu/sl-news-platform/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

启用配置：

```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/sl-news-backend /etc/nginx/sites-enabled/

# 删除默认配置
sudo rm /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx

# 检查状态
sudo systemctl status nginx
```

### 4.8 验证后端部署

在浏览器中访问：
```
http://54.123.45.67/docs
```

你应该看到 FastAPI 的 Swagger 文档页面！🎉

---

## 🌐 第五步：构建并部署前端到 S3 + CloudFront（30分钟）

### 5.1 在本地构建前端

**在本地机器上（Windows PowerShell）**:

```powershell
# 进入项目目录
cd d:\主页设计

# 创建生产环境配置
@"
VITE_API_BASE_URL=http://54.123.45.67
"@ | Out-File -Encoding UTF8 .env.production

# 安装依赖（如果还没有）
npm install

# 构建生产版本
npm run build
```

构建完成后，`build/` 目录包含所有静态文件。

### 5.2 创建 S3 存储桶

1. 进入 **S3** 服务
2. 点击 **创建存储桶**

**配置**：
- 存储桶名称：`sl-news-frontend-[随机数字]`（必须全局唯一，例如：`sl-news-frontend-20241115`）
- AWS 区域：选择与 EC2 相同的区域（例如：`us-east-1`）
- 对象所有权：`ACL 已禁用`
- **取消勾选** "阻止所有公共访问"
  - 取消勾选所有 4 个选项
  - 勾选确认警告
- 其他设置保持默认

3. 点击 **创建存储桶**

### 5.3 配置 S3 为静态网站托管

1. 进入你创建的存储桶
2. 点击 **属性** 标签
3. 滚动到底部，找到 **静态网站托管**
4. 点击 **编辑**
5. 配置：
   - 静态网站托管：`启用`
   - 托管类型：`托管静态网站`
   - 索引文档：`index.html`
   - 错误文档：`index.html`（用于 SPA 路由）
6. 点击 **保存更改**
7. 记录 **存储桶网站终端节点**（例如：`http://sl-news-frontend-20241115.s3-website-us-east-1.amazonaws.com`）

### 5.4 设置存储桶策略（允许公共读取）

1. 点击 **权限** 标签
2. 滚动到 **存储桶策略**
3. 点击 **编辑**
4. 填入以下策略（**替换存储桶名称**）：

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::sl-news-frontend-20241115/*"
        }
    ]
}
```

5. 点击 **保存更改**

### 5.5 上传文件到 S3

**方法 1: 使用 AWS CLI（推荐）**

```powershell
# 在本地机器上
cd d:\主页设计

# 同步文件到 S3
aws s3 sync build/ s3://sl-news-frontend-20241115/ --delete

# 验证上传
aws s3 ls s3://sl-news-frontend-20241115/
```

**方法 2: 使用 AWS 控制台**

1. 进入你的 S3 存储桶
2. 点击 **上传**
3. 点击 **添加文件** 和 **添加文件夹**
4. 选择 `build/` 目录中的所有文件和文件夹
5. 点击 **上传**

### 5.6 测试 S3 网站

访问 S3 网站终端节点：
```
http://sl-news-frontend-20241115.s3-website-us-east-1.amazonaws.com
```

你应该看到你的网站！🎉

### 5.7 创建 CloudFront 分发（CDN 加速）

1. 进入 **CloudFront** 服务
2. 点击 **创建分配**

**源设置**：
- 源域：选择你的 S3 存储桶（**注意**：选择网站终端节点，不是存储桶本身）
  - 手动输入：`sl-news-frontend-20241115.s3-website-us-east-1.amazonaws.com`
- 源路径：留空
- 名称：自动生成
- 源访问：`公有`

**默认缓存行为**：
- 查看器协议策略：`Redirect HTTP to HTTPS`
- 允许的 HTTP 方法：`GET, HEAD, OPTIONS`
- 缓存策略：`CachingOptimized`
- 源请求策略：无

**设置**：
- 价格类别：`使用所有边缘站点`（或选择更便宜的选项）
- 备用域名 (CNAME)：留空（后续添加）
- 自定义 SSL 证书：留空（后续配置）
- 默认根对象：`index.html`
- 标准日志记录：`关闭`

3. 点击 **创建分配**
4. 等待 10-15 分钟，直到状态变为 **已启用**

### 5.8 配置 CloudFront 错误页面（用于 SPA 路由）

1. 进入你的 CloudFront 分配
2. 点击 **错误页面** 标签
3. 点击 **创建自定义错误响应**
4. 配置：
   - HTTP 错误代码：`403: Forbidden`
   - 自定义错误响应：`是`
   - 响应页面路径：`/index.html`
   - HTTP 响应代码：`200: OK`
5. 点击 **创建自定义错误响应**
6. 重复步骤 3-5，添加 `404: Not Found` 错误

### 5.9 测试 CloudFront

访问 CloudFront 域名（在分配详情中找到）：
```
https://d1234567890abc.cloudfront.net
```

你的网站现在通过 HTTPS 和 CDN 加速访问了！🚀

---

## 🔐 第六步：配置域名和 SSL 证书（可选，30分钟）

如果你有自己的域名（例如：`yourdomain.com`），可以配置自定义域名和 SSL。

### 6.1 申请 SSL 证书（AWS Certificate Manager）

**重要**：必须在 `us-east-1` 区域申请证书（CloudFront 要求）

1. 切换到 **美国东部（弗吉尼亚北部）us-east-1** 区域
2. 进入 **Certificate Manager** 服务
3. 点击 **请求证书**
4. 证书类型：`请求公有证书`
5. 点击 **下一步**
6. 完全限定域名：
   - `yourdomain.com`
   - `*.yourdomain.com`（通配符，可选）
7. 验证方法：`DNS 验证`
8. 密钥算法：`RSA 2048`
9. 点击 **请求**

### 6.2 验证域名所有权

1. 点击证书 ID
2. 在 **域** 部分，点击 **在 Route 53 中创建记录**（如果使用 Route 53）
3. 或者，复制 CNAME 记录到你的 DNS 提供商：
   - 名称：`_abc123...`
   - 值：`_xyz789...acm-validations.aws.`
4. 等待验证完成（5-30 分钟）

### 6.3 配置 CloudFront 使用自定义域名

1. 进入你的 CloudFront 分配
2. 点击 **编辑**
3. 配置：
   - 备用域名 (CNAME)：`yourdomain.com`
   - 自定义 SSL 证书：选择你刚申请的证书
4. 点击 **保存更改**

### 6.4 配置 DNS（Route 53 或其他）

**使用 Route 53**：

1. 进入 **Route 53** 服务
2. 点击 **托管区域** → 选择你的域名
3. 点击 **创建记录**
4. 配置：
   - 记录名称：留空（根域名）或 `www`
   - 记录类型：`A - IPv4 地址`
   - 别名：`是`
   - 路由流量至：`CloudFront 分配的别名`
   - 选择你的 CloudFront 分配
5. 点击 **创建记录**

**后端 API 域名**：

1. 点击 **创建记录**
2. 配置：
   - 记录名称：`api`
   - 记录类型：`A - IPv4 地址`
   - 值：`54.123.45.67`（你的 EC2 弹性 IP）
3. 点击 **创建记录**

### 6.5 为后端配置 SSL（Let's Encrypt）

在 EC2 上运行：

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 更新 Nginx 配置
sudo nano /etc/nginx/sites-available/sl-news-backend
```

修改 `server_name`：
```nginx
server_name api.yourdomain.com;
```

保存后：

```bash
# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx

# 获取 SSL 证书
sudo certbot --nginx -d api.yourdomain.com

# 按照提示操作：
# 1. 输入邮箱
# 2. 同意服务条款
# 3. 选择：Redirect HTTP to HTTPS

# 验证自动续期
sudo certbot renew --dry-run
```

现在你的后端 API 也支持 HTTPS 了！

### 6.6 更新环境变量

**后端 `.env`**：
```bash
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

**前端重新构建**：
```powershell
# 更新 .env.production
@"
VITE_API_BASE_URL=https://api.yourdomain.com
"@ | Out-File -Encoding UTF8 .env.production

# 重新构建
npm run build

# 上传到 S3
aws s3 sync build/ s3://sl-news-frontend-20241115/ --delete

# 清除 CloudFront 缓存
aws cloudfront create-invalidation --distribution-id E1234567890ABC --paths "/*"
```

---

## 🔑 第七步：配置第三方服务 API（30分钟）

### 7.1 配置 Resend 邮件服务

1. 访问 https://resend.com/
2. 注册账号
3. 进入 Dashboard → **API Keys**
4. 点击 **Create API Key**
5. 复制 API Key（格式：`re_...`）
6. 进入 **Domains** → **Add Domain**
7. 输入你的域名：`yourdomain.com`
8. 按照提示添加 DNS 记录（TXT 和 MX）
9. 等待验证通过

**更新后端 `.env`**：
```bash
RESEND_API_KEY=re_your_actual_key_here
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=S&L News Platform
```

### 7.2 配置 Google OAuth

1. 访问 https://console.cloud.google.com/
2. 创建新项目：`S&L News Platform`
3. 启用 **Google+ API**
4. 配置 OAuth 同意屏幕
5. 创建 OAuth 2.0 凭据
6. 添加授权重定向 URI：
   - `https://api.yourdomain.com/api/v1/auth/google/callback`
7. 复制客户端 ID 和密钥

**更新后端 `.env`**：
```bash
GOOGLE_CLIENT_ID=123456789-abc...xyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz...
GOOGLE_REDIRECT_URI=https://api.yourdomain.com/api/v1/auth/google/callback
```

**更新前端 `.env.production`**：
```bash
VITE_GOOGLE_CLIENT_ID=123456789-abc...xyz.apps.googleusercontent.com
```

### 7.3 配置 OpenAI API

1. 访问 https://platform.openai.com/
2. 注册并登录
3. 进入 **API keys**
4. 点击 **Create new secret key**
5. 复制 API Key
6. 充值至少 $5

**更新后端 `.env`**：
```bash
OPENAI_API_KEY=sk-your_actual_openai_key_here
```

### 7.4 重启后端服务

```bash
# SSH 到 EC2
ssh -i sl-news-key.pem ubuntu@54.123.45.67

# 重启服务
sudo systemctl restart sl-news-backend

# 检查日志
sudo journalctl -u sl-news-backend -f
```

---

## ✅ 第八步：测试和验证（15分钟）

### 8.1 功能测试清单

- [ ] 访问前端网站：`https://yourdomain.com`
- [ ] 访问后端 API 文档：`https://api.yourdomain.com/docs`
- [ ] 测试用户注册（邮箱验证码）
- [ ] 测试 Google 登录
- [ ] 测试新闻浏览
- [ ] 测试管理员登录
- [ ] 测试新闻发布
- [ ] 测试图片上传
- [ ] 测试 AI 聊天机器人
- [ ] 测试文档翻译
- [ ] 测试预约功能

### 8.2 性能测试

```bash
# 测试后端响应时间
curl -w "@-" -o /dev/null -s https://api.yourdomain.com/health <<'EOF'
    time_namelookup:  %{time_namelookup}\n
       time_connect:  %{time_connect}\n
    time_appconnect:  %{time_appconnect}\n
      time_redirect:  %{time_redirect}\n
   time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
         time_total:  %{time_total}\n
EOF
```

### 8.3 监控和日志

**查看后端日志**：
```bash
# 实时日志
sudo journalctl -u sl-news-backend -f

# 最近 100 行
sudo journalctl -u sl-news-backend -n 100

# 错误日志
sudo journalctl -u sl-news-backend -p err
```

**查看 Nginx 日志**：
```bash
# 访问日志
sudo tail -f /var/log/nginx/access.log

# 错误日志
sudo tail -f /var/log/nginx/error.log
```

---

## 🔧 维护和更新

### 更新后端代码

```bash
# SSH 到 EC2
ssh -i sl-news-key.pem ubuntu@54.123.45.67

# 进入项目目录
cd /home/ubuntu/sl-news-platform

# 拉取最新代码
git pull

# 激活虚拟环境
cd backend
source venv/bin/activate

# 安装新依赖
pip install -r requirements.txt

# 运行数据库迁移
alembic upgrade head

# 重启服务
sudo systemctl restart sl-news-backend
```

### 更新前端代码

```powershell
# 本地构建
npm run build

# 上传到 S3
aws s3 sync build/ s3://sl-news-frontend-20241115/ --delete

# 清除 CloudFront 缓存
aws cloudfront create-invalidation --distribution-id E1234567890ABC --paths "/*"
```

---

## 🎉 部署完成！

恭喜！你的网站已成功部署到 AWS！

**访问地址**：
- 前端：`https://yourdomain.com`
- 后端 API：`https://api.yourdomain.com/docs`

**下一步建议**：
1. 配置 AWS CloudWatch 监控
2. 设置自动备份
3. 配置 CDN 缓存策略
4. 启用 WAF（Web 应用防火墙）
5. 配置成本告警

需要帮助？随时问我！🚀

