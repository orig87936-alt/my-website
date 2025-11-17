# 🚀 使用客户 IAM 账号部署指南

## 📋 前提条件

从客户那里获取以下信息：
- ✅ AWS Access Key ID
- ✅ AWS Secret Access Key  
- ✅ AWS 区域（例如：us-east-1）
- ✅ IAM 用户权限确认（需要以下权限）：
  - EC2 完全访问
  - RDS 完全访问
  - S3 完全访问
  - CloudFront 完全访问
  - IAM 读取权限

---

## 第一步：安装和配置 AWS CLI

### 1.1 检查 AWS CLI 是否已安装

打开 PowerShell，运行：
```powershell
aws --version
```

**如果显示版本号**：✅ 已安装，跳到步骤 1.2

**如果提示找不到命令**：需要安装

### 1.2 安装 AWS CLI（如果需要）

**方法1：直接下载安装**
1. 访问：https://awscli.amazonaws.com/AWSCLIV2.msi
2. 下载并运行安装程序
3. 使用默认设置完成安装
4. **关闭并重新打开 PowerShell**

**方法2：使用脚本安装**
1. 右键点击 `install-aws-cli.ps1`
2. 选择"以管理员身份运行"

### 1.3 配置客户的 IAM 凭证

在 PowerShell 中运行：
```powershell
aws configure
```

按提示输入：
```
AWS Access Key ID [None]: 粘贴客户提供的 Access Key ID
AWS Secret Access Key [None]: 粘贴客户提供的 Secret Access Key
Default region name [None]: us-east-1  (或客户指定的区域)
Default output format [None]: json
```

### 1.4 验证配置

```powershell
aws sts get-caller-identity
```

应该看到类似输出：
```json
{
    "UserId": "AIDAXXXXXXXXXX",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/username"
}
```

✅ 如果看到账户信息，说明配置成功！

---

## 第二步：准备部署配置

### 2.1 确认项目信息

请向客户确认：
- [ ] 是否有域名？（如果有，记录域名）
- [ ] 数据库密码要求（RDS PostgreSQL 主密码）
- [ ] 管理员账号密码（后台登录密码）
- [ ] 是否需要配置邮件服务？（Resend API）
- [ ] 是否需要 Google 登录？（Google OAuth）

### 2.2 生成安全密钥

在 PowerShell 中运行：
```powershell
# 生成 JWT Secret Key
python -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32))"

# 生成强密码（用于数据库和管理员）
python -c "import secrets; import string; chars = string.ascii_letters + string.digits + '!@#$%^&*'; print(''.join(secrets.choice(chars) for _ in range(16)))"
```

记录生成的密钥，稍后会用到。

---

## 第三步：创建 RDS PostgreSQL 数据库

### 3.1 使用 AWS 控制台创建（推荐）

1. 登录 AWS 控制台：https://console.aws.amazon.com/
2. 搜索并进入 **RDS** 服务
3. 点击 **"创建数据库"**

**配置选项**：
- 引擎类型：`PostgreSQL`
- 版本：`PostgreSQL 14.x` 或更高
- 模板：`免费套餐`（如果可用）或 `开发/测试`
- 数据库实例标识符：`sl-news-db`
- 主用户名：`postgres`
- 主密码：使用步骤 2.2 生成的强密码
- 实例类：`db.t3.micro`（免费套餐）
- 存储：`20 GB`
- 公开访问：`是`（暂时，后续可改为否）
- VPC 安全组：`创建新的` → 名称：`sl-news-db-sg`
- 初始数据库名称：`newsdb`

4. 点击 **"创建数据库"**
5. 等待 5-10 分钟，直到状态变为 **"可用"**

### 3.2 配置安全组

1. 在 RDS 控制台，点击数据库实例
2. 点击 **"连接性和安全性"** 标签
3. 找到 **VPC 安全组**，点击安全组名称
4. 点击 **"入站规则"** → **"编辑入站规则"**
5. 添加规则：
   - 类型：`PostgreSQL`
   - 端口：`5432`
   - 源：`0.0.0.0/0`（暂时允许所有，后续改为 EC2 安全组）
6. 保存规则

### 3.3 记录数据库连接信息

在 RDS 控制台，复制 **"终端节点"**，例如：
```
sl-news-db.c1a2b3c4d5e6.us-east-1.rds.amazonaws.com
```

保存到 `deployment-config.json` 文件中。

---

## 第四步：创建 EC2 实例

### 4.1 启动 EC2 实例

1. 进入 **EC2** 服务
2. 点击 **"启动实例"**

**配置**：
- 名称：`sl-news-backend`
- AMI：`Ubuntu Server 22.04 LTS`
- 实例类型：`t3.small`（推荐）或 `t2.micro`（免费套餐）
- 密钥对：
  - 点击 **"创建新密钥对"**
  - 名称：`sl-news-key`
  - 类型：`RSA`
  - 格式：`.pem`
  - **下载并保存密钥文件**
- 网络设置：
  - 创建安全组：`sl-news-backend-sg`
  - 入站规则：
    - SSH (22) - 源：`我的 IP`
    - HTTP (80) - 源：`0.0.0.0/0`
    - HTTPS (443) - 源：`0.0.0.0/0`
    - 自定义 TCP (8000) - 源：`0.0.0.0/0`
- 存储：`20 GiB gp3`

3. 点击 **"启动实例"**

### 4.2 分配弹性 IP

1. 在 EC2 控制台，点击 **"弹性 IP"**
2. 点击 **"分配弹性 IP 地址"** → **"分配"**
3. 选择新分配的 IP，点击 **"操作"** → **"关联弹性 IP 地址"**
4. 选择实例：`sl-news-backend`
5. 点击 **"关联"**
6. **记录弹性 IP 地址**（例如：`54.123.45.67`）

---

## 第五步：部署后端到 EC2

### 5.1 连接到 EC2

```powershell
# 设置密钥文件权限（仅首次）
icacls sl-news-key.pem /inheritance:r
icacls sl-news-key.pem /grant:r "$($env:USERNAME):(R)"

# 连接到 EC2（替换为你的弹性 IP）
ssh -i sl-news-key.pem ubuntu@54.123.45.67
```

### 5.2 在 EC2 上安装依赖

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Python 3.11
sudo apt install -y software-properties-common
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3.11-dev

# 安装其他工具
sudo apt install -y git nginx postgresql-client build-essential curl

# 安装 pip
curl -sS https://bootstrap.pypa.io/get-pip.py | sudo python3.11

# 验证
python3.11 --version
```

### 5.3 上传代码到 EC2

**方法1：使用 Git（推荐）**

如果代码已经在 GitHub/GitLab：
```bash
cd /home/ubuntu
git clone https://github.com/your-repo/sl-news-platform.git
cd sl-news-platform
```

**方法2：使用 SCP 上传**

在本地 PowerShell 中：
```powershell
scp -i sl-news-key.pem -r "d:\主页设计" ubuntu@54.123.45.67:/home/ubuntu/sl-news-platform
```

### 5.4 配置后端环境

```bash
cd /home/ubuntu/sl-news-platform/backend

# 创建虚拟环境
python3.11 -m venv venv
source venv/bin/activate

# 安装依赖
pip install --upgrade pip
pip install -r requirements.txt

# 创建目录
mkdir -p uploads/images temp_uploads
```

### 5.5 配置环境变量

```bash
nano .env
```

填入（替换为实际值）：
```bash
DATABASE_URL=postgresql+asyncpg://postgres:你的RDS密码@RDS终端节点:5432/newsdb
SECRET_KEY=步骤2.2生成的密钥
DEEPSEEK_API_KEY=sk-7dd7f650117143e9b9c2d312164cb873
OPENAI_API_KEY=sk-not-used
CORS_ORIGINS=*
FRONTEND_URL=http://你的弹性IP
ADMIN_USERNAME=admin
ADMIN_PASSWORD=步骤2.2生成的密码
ENVIRONMENT=production
DEBUG=False
HOST=0.0.0.0
PORT=8000
```

保存：`Ctrl+X` → `Y` → `Enter`

### 5.6 运行数据库迁移

```bash
source venv/bin/activate
alembic upgrade head
```

### 5.7 配置 Systemd 服务

```bash
sudo nano /etc/systemd/system/sl-news-backend.service
```

填入：
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

启动服务：
```bash
sudo systemctl daemon-reload
sudo systemctl enable sl-news-backend
sudo systemctl start sl-news-backend
sudo systemctl status sl-news-backend
```

### 5.8 配置 Nginx

```bash
sudo nano /etc/nginx/sites-available/sl-news-backend
```

填入：
```nginx
server {
    listen 80;
    server_name _;
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        alias /home/ubuntu/sl-news-platform/backend/uploads/;
        expires 30d;
    }
}
```

启用：
```bash
sudo ln -s /etc/nginx/sites-available/sl-news-backend /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### 5.9 验证后端

访问：`http://你的弹性IP/docs`

应该看到 FastAPI 文档页面！

---

## 第六步：部署前端到 S3

### 6.1 本地构建前端

在本地 PowerShell：
```powershell
cd "d:\主页设计"

# 更新环境变量
@"
VITE_API_BASE_URL=http://你的弹性IP
"@ | Out-File -Encoding UTF8 .env.production

# 构建
npm install
npm run build
```

### 6.2 创建 S3 存储桶

```powershell
# 创建存储桶（名称必须全局唯一）
$bucketName = "sl-news-frontend-$(Get-Date -Format 'yyyyMMdd')"
aws s3 mb s3://$bucketName --region us-east-1

# 配置为静态网站
aws s3 website s3://$bucketName --index-document index.html --error-document index.html

# 设置公共访问
aws s3api put-bucket-policy --bucket $bucketName --policy @"
{
    \"Version\": \"2012-10-17\",
    \"Statement\": [{
        \"Sid\": \"PublicReadGetObject\",
        \"Effect\": \"Allow\",
        \"Principal\": \"*\",
        \"Action\": \"s3:GetObject\",
        \"Resource\": \"arn:aws:s3:::$bucketName/*\"
    }]
}
"@

# 上传文件
aws s3 sync build/ s3://$bucketName/ --delete

# 获取网站 URL
Write-Host "前端网站 URL: http://$bucketName.s3-website-us-east-1.amazonaws.com"
```

---

## 第七步：测试

访问：
- 前端：`http://存储桶名.s3-website-us-east-1.amazonaws.com`
- 后端：`http://弹性IP/docs`

---

## 📝 完成后交付给客户

1. **访问地址**：
   - 前端：S3 网站 URL
   - 后端 API：http://弹性IP/docs
   - 管理员账号：admin / 你设置的密码

2. **AWS 资源清单**：
   - RDS 实例：sl-news-db
   - EC2 实例：sl-news-backend
   - S3 存储桶：sl-news-frontend-YYYYMMDD
   - 弹性 IP：记录的 IP 地址

3. **重要文件**：
   - EC2 密钥：sl-news-key.pem（交给客户保管）
   - 数据库密码：记录在安全的地方
   - 管理员密码：记录在安全的地方

---

## 🆘 故障排查

**后端无法访问**：
```bash
# 检查服务状态
sudo systemctl status sl-news-backend

# 查看日志
sudo journalctl -u sl-news-backend -n 50

# 检查 Nginx
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

**数据库连接失败**：
- 检查 RDS 安全组是否允许 EC2 访问
- 检查 .env 中的 DATABASE_URL 是否正确
- 测试连接：`psql -h RDS终端节点 -U postgres -d newsdb`

---

需要帮助？随时问我！🚀

