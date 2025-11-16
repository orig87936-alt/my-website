# ⚡ EC2 + RDS 部署快速命令参考

**用途**: 快速查找常用命令  
**配合**: `AWS_EC2_RDS_DEPLOYMENT_GUIDE.md` 使用

---

## 📋 部署流程概览

```
1. 创建 RDS 数据库 (10 分钟)
2. 创建 EC2 实例 (5 分钟)
3. 配置安全组 (5 分钟)
4. 部署后端 (60 分钟)
5. 部署前端 (30 分钟)
6. 配置域名和 SSL (30 分钟)
7. 验证测试 (20 分钟)
─────────────────────────────────
总计: 约 3 小时
```

---

## 🔑 重要信息记录

### RDS 连接信息
```
Endpoint: sl-news-db.xxxxx.ap-northeast-1.rds.amazonaws.com
Port: 5432
Database: newsdb
Username: newsadmin
Password: ___________________

连接字符串:
postgresql+asyncpg://newsadmin:PASSWORD@ENDPOINT:5432/newsdb
```

### EC2 信息
```
Instance ID: i-xxxxx
Public IP: 54.123.45.67
Elastic IP: ___________________
Key Pair: sl-news-key.pem
```

### 域名信息
```
Domain: yourdomain.com
CloudFront: d1234567890.cloudfront.net
S3 Bucket: sl-news-frontend
```

---

## 💻 本地操作命令

### 构建前端
```powershell
# 编辑配置
notepad .env.production
# 修改 VITE_API_URL=https://api.yourdomain.com

# 构建
npm run build

# 验证构建产物
ls build/
```

### 上传代码到 EC2
```powershell
# 设置密钥权限（仅首次）
icacls sl-news-key.pem /inheritance:r
icacls sl-news-key.pem /grant:r "$($env:USERNAME):(R)"

# 上传后端代码
scp -i sl-news-key.pem -r backend ubuntu@54.123.45.67:~/

# 上传配置文件
scp -i sl-news-key.pem PRODUCTION_SECRETS.txt ubuntu@54.123.45.67:~/
```

### 上传前端到 S3
```powershell
# 配置 AWS CLI（仅首次）
aws configure

# 上传文件
aws s3 sync build/ s3://sl-news-frontend/ --delete

# 清除 CloudFront 缓存
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### SSH 连接
```powershell
ssh -i sl-news-key.pem ubuntu@54.123.45.67
```

---

## 🖥️ EC2 服务器操作命令

### 首次设置

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装依赖
sudo apt install -y python3.11 python3.11-venv python3-pip postgresql-client nginx git curl wget htop

# 创建虚拟环境
cd ~/backend
python3.11 -m venv venv
source venv/bin/activate

# 安装 Python 包
pip install --upgrade pip
pip install -r requirements.txt

# 配置环境变量
nano .env
# 粘贴配置内容
chmod 600 .env

# 测试数据库连接
python -c "import asyncio; from app.database import engine; from sqlalchemy import text; async def test(): async with engine.begin() as conn: result = await conn.execute(text('SELECT version()')); print('Connected:', result.scalar()[:50]); asyncio.run(test())"

# 运行迁移
alembic upgrade head

# 测试启动
uvicorn app.main:app --host 0.0.0.0 --port 8000
# Ctrl+C 停止
```

### 配置 Systemd 服务

```bash
# 创建服务文件
sudo nano /etc/systemd/system/sl-news-api.service
```

粘贴内容:
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
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

```bash
# 启用并启动服务
sudo systemctl daemon-reload
sudo systemctl enable sl-news-api
sudo systemctl start sl-news-api
sudo systemctl status sl-news-api
```

### 配置 Nginx

```bash
# 创建配置文件
sudo nano /etc/nginx/sites-available/sl-news
```

粘贴内容:
```nginx
upstream backend_api {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name api.yourdomain.com yourdomain.com;
    
    access_log /var/log/nginx/sl-news-access.log;
    error_log /var/log/nginx/sl-news-error.log;
    
    location /api {
        proxy_pass http://backend_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    location /health {
        proxy_pass http://backend_api;
        access_log off;
    }
    
    location /docs {
        proxy_pass http://backend_api;
    }
}
```

```bash
# 启用配置
sudo ln -s /etc/nginx/sites-available/sl-news /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### 配置 SSL（Let's Encrypt）

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d api.yourdomain.com

# 测试自动续期
sudo certbot renew --dry-run
```

---

## 🔧 日常维护命令

### 服务管理

```bash
# 查看服务状态
sudo systemctl status sl-news-api

# 启动服务
sudo systemctl start sl-news-api

# 停止服务
sudo systemctl stop sl-news-api

# 重启服务
sudo systemctl restart sl-news-api

# 查看日志（实时）
sudo journalctl -u sl-news-api -f

# 查看最近 100 行日志
sudo journalctl -u sl-news-api -n 100 --no-pager
```

### Nginx 管理

```bash
# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx

# 查看访问日志
sudo tail -f /var/log/nginx/sl-news-access.log

# 查看错误日志
sudo tail -f /var/log/nginx/sl-news-error.log
```

### 代码更新

```bash
# 拉取最新代码（如果使用 Git）
cd ~/backend
git pull

# 激活虚拟环境
source venv/bin/activate

# 更新依赖
pip install -r requirements.txt

# 运行迁移
alembic upgrade head

# 重启服务
sudo systemctl restart sl-news-api

# 查看日志确认启动成功
sudo journalctl -u sl-news-api -f
```

### 数据库操作

```bash
# 连接到 RDS
psql -h sl-news-db.xxxxx.ap-northeast-1.rds.amazonaws.com -U newsadmin -d newsdb

# 常用 SQL 命令
\l                    # 列出所有数据库
\c newsdb             # 连接到数据库
\dt                   # 列出所有表
\d table_name         # 查看表结构
\dx                   # 列出扩展
SELECT version();     # 查看版本
\q                    # 退出

# 备份数据库
pg_dump -h sl-news-db.xxxxx.ap-northeast-1.rds.amazonaws.com -U newsadmin newsdb > backup_$(date +%Y%m%d).sql

# 恢复数据库
psql -h sl-news-db.xxxxx.ap-northeast-1.rds.amazonaws.com -U newsadmin newsdb < backup_20251114.sql
```

---

## 🔍 故障排查命令

### 检查服务状态

```bash
# 检查后端服务
sudo systemctl status sl-news-api
curl http://localhost:8000/health

# 检查 Nginx
sudo systemctl status nginx
sudo nginx -t

# 检查端口占用
sudo lsof -i :8000
sudo lsof -i :80
sudo lsof -i :443

# 检查进程
ps aux | grep uvicorn
ps aux | grep nginx
```

### 查看日志

```bash
# 后端日志（最近 50 行）
sudo journalctl -u sl-news-api -n 50

# 后端日志（实时）
sudo journalctl -u sl-news-api -f

# Nginx 访问日志
sudo tail -n 100 /var/log/nginx/sl-news-access.log

# Nginx 错误日志
sudo tail -n 100 /var/log/nginx/sl-news-error.log

# 系统日志
sudo tail -f /var/log/syslog
```

### 测试连接

```bash
# 测试后端健康检查
curl http://localhost:8000/health
curl http://localhost/health
curl http://54.123.45.67/health

# 测试 API
curl http://localhost:8000/api/v1/articles
curl http://54.123.45.67/api/v1/articles

# 测试数据库连接
psql -h sl-news-db.xxxxx.ap-northeast-1.rds.amazonaws.com -U newsadmin -d newsdb -c "SELECT 1;"

# 测试 DNS 解析
nslookup api.yourdomain.com
dig api.yourdomain.com

# 测试 SSL 证书
curl -I https://api.yourdomain.com
openssl s_client -connect api.yourdomain.com:443 -servername api.yourdomain.com
```

### 检查资源使用

```bash
# CPU 和内存
htop
top

# 磁盘空间
df -h

# 磁盘使用详情
du -sh ~/backend/*
du -sh /var/log/*

# 网络连接
netstat -tulpn
ss -tulpn

# 查看活动连接
sudo netstat -anp | grep :8000
```

---

## 📊 监控命令

### 系统监控

```bash
# 实时系统监控
htop

# CPU 使用率
mpstat 1

# 内存使用
free -h

# 磁盘 I/O
iostat -x 1

# 网络流量
iftop
```

### 应用监控

```bash
# 查看后端进程
ps aux | grep uvicorn

# 查看连接数
sudo netstat -an | grep :8000 | wc -l

# 查看请求日志
sudo tail -f /var/log/nginx/sl-news-access.log | grep -v "GET /health"

# 统计请求数
sudo cat /var/log/nginx/sl-news-access.log | wc -l

# 统计错误数
sudo cat /var/log/nginx/sl-news-error.log | wc -l
```

---

## 🔒 安全检查

```bash
# 检查 .env 文件权限
ls -la ~/backend/.env
# 应该是: -rw------- (600)

# 检查防火墙状态
sudo ufw status

# 检查 SSH 配置
sudo cat /etc/ssh/sshd_config | grep PermitRootLogin
# 应该是: PermitRootLogin no

# 检查系统更新
sudo apt update
sudo apt list --upgradable

# 更新系统
sudo apt upgrade -y
```

---

## 🔄 备份和恢复

### 数据库备份

```bash
# 手动备份
pg_dump -h sl-news-db.xxxxx.ap-northeast-1.rds.amazonaws.com -U newsadmin newsdb > ~/backups/newsdb_$(date +%Y%m%d_%H%M%S).sql

# 压缩备份
pg_dump -h sl-news-db.xxxxx.ap-northeast-1.rds.amazonaws.com -U newsadmin newsdb | gzip > ~/backups/newsdb_$(date +%Y%m%d_%H%M%S).sql.gz

# 创建备份脚本
nano ~/backup-db.sh
```

备份脚本内容:
```bash
#!/bin/bash
BACKUP_DIR="$HOME/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -h sl-news-db.xxxxx.ap-northeast-1.rds.amazonaws.com -U newsadmin newsdb | gzip > $BACKUP_DIR/newsdb_$DATE.sql.gz

# 保留最近 7 天的备份
find $BACKUP_DIR -name "newsdb_*.sql.gz" -mtime +7 -delete

echo "Backup completed: newsdb_$DATE.sql.gz"
```

```bash
# 设置执行权限
chmod +x ~/backup-db.sh

# 测试备份
~/backup-db.sh

# 添加到 crontab（每天凌晨 2 点）
crontab -e
# 添加: 0 2 * * * /home/ubuntu/backup-db.sh >> /home/ubuntu/backup.log 2>&1
```

### 恢复数据库

```bash
# 从备份恢复
gunzip -c ~/backups/newsdb_20251114_020000.sql.gz | psql -h sl-news-db.xxxxx.ap-northeast-1.rds.amazonaws.com -U newsadmin newsdb

# 或从未压缩的备份恢复
psql -h sl-news-db.xxxxx.ap-northeast-1.rds.amazonaws.com -U newsadmin newsdb < ~/backups/newsdb_20251114.sql
```

---

## 🚀 快速重启流程

```bash
# 完整重启（按顺序）
sudo systemctl restart sl-news-api
sudo systemctl restart nginx

# 验证
sudo systemctl status sl-news-api
sudo systemctl status nginx
curl http://localhost/health
```

---

## 📞 紧急情况处理

### 服务崩溃

```bash
# 1. 查看日志找出原因
sudo journalctl -u sl-news-api -n 100 --no-pager

# 2. 尝试重启
sudo systemctl restart sl-news-api

# 3. 如果还是失败，手动启动查看错误
cd ~/backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 数据库连接失败

```bash
# 1. 测试连接
psql -h sl-news-db.xxxxx.ap-northeast-1.rds.amazonaws.com -U newsadmin -d newsdb

# 2. 检查安全组（在 AWS Console）
# RDS → Security groups → 确认 EC2 安全组在允许列表

# 3. 检查环境变量
cat ~/backend/.env | grep DATABASE_URL
```

### 磁盘空间不足

```bash
# 1. 检查磁盘使用
df -h

# 2. 找出大文件
du -sh /* | sort -h
du -sh ~/backend/* | sort -h

# 3. 清理日志
sudo journalctl --vacuum-time=7d
sudo find /var/log -name "*.log" -mtime +7 -delete

# 4. 清理 apt 缓存
sudo apt clean
sudo apt autoclean
```

---

## ✅ 验证清单

```bash
# 后端验证
curl http://localhost:8000/health          # ✓ 本地健康检查
curl http://54.123.45.67/health            # ✓ 外部健康检查
curl https://api.yourdomain.com/health     # ✓ 域名健康检查
curl https://api.yourdomain.com/docs       # ✓ API 文档

# 前端验证
curl -I https://yourdomain.com             # ✓ 前端可访问
curl -I https://www.yourdomain.com         # ✓ www 可访问

# 数据库验证
psql -h RDS_ENDPOINT -U newsadmin -d newsdb -c "SELECT COUNT(*) FROM articles;"

# SSL 验证
curl -I https://api.yourdomain.com | grep "HTTP/2 200"
curl -I https://yourdomain.com | grep "HTTP/2 200"
```

---

**快速参考版本**: 1.0  
**最后更新**: 2025-11-14  
**配合使用**: `AWS_EC2_RDS_DEPLOYMENT_GUIDE.md`

