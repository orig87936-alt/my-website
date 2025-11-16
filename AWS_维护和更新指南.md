# 🔧 AWS 维护和更新指南

部署完成后，你需要定期维护和更新网站。这份指南将告诉你如何**轻松、快速**地进行日常维护。

---

## 📊 维护概览

### 日常维护任务
| 任务 | 频率 | 耗时 | 难度 |
|------|------|------|------|
| 更新后端代码 | 按需 | 5 分钟 | ⭐ |
| 更新前端代码 | 按需 | 5 分钟 | ⭐ |
| 查看日志 | 每周 | 5 分钟 | ⭐ |
| 检查成本 | 每周 | 5 分钟 | ⭐ |
| 数据库备份 | 自动 | 0 分钟 | - |
| 更新依赖 | 每月 | 15 分钟 | ⭐⭐ |
| 安全更新 | 每月 | 10 分钟 | ⭐⭐ |

**好消息**: 大部分维护工作都可以**自动化**！

---

## 🚀 更新代码（最常用）

### 方式 1: 使用自动化脚本（推荐）⭐

#### 更新后端（5 分钟）

```powershell
# 1. SSH 连接到 EC2
ssh -i sl-news-key.pem ubuntu@你的EC2IP

# 2. 运行更新脚本
cd /home/ubuntu/sl-news-platform
./scripts/update-backend.sh
```

**脚本会自动完成**：
- ✅ 拉取最新代码
- ✅ 安装新依赖
- ✅ 运行数据库迁移
- ✅ 重启服务
- ✅ 检查服务状态

#### 更新前端（5 分钟）

```powershell
# 在本地机器上运行
cd d:\主页设计

# 使用自动部署脚本
.\scripts\deploy-to-aws.ps1 -S3Bucket "你的S3存储桶名" -CloudFrontDistributionId "你的分发ID"
```

**脚本会自动完成**：
- ✅ 构建前端
- ✅ 上传到 S3
- ✅ 清除 CloudFront 缓存

---

### 方式 2: 手动更新（详细步骤）

#### 更新后端代码

```bash
# 1. SSH 连接到 EC2
ssh -i sl-news-key.pem ubuntu@你的EC2IP

# 2. 进入项目目录
cd /home/ubuntu/sl-news-platform

# 3. 拉取最新代码
git pull origin main

# 4. 进入后端目录
cd backend

# 5. 激活虚拟环境
source venv/bin/activate

# 6. 安装/更新依赖
pip install -r requirements.txt

# 7. 运行数据库迁移（如果有）
alembic upgrade head

# 8. 重启后端服务
sudo systemctl restart sl-news-backend

# 9. 检查服务状态
sudo systemctl status sl-news-backend

# 10. 查看日志（确认无错误）
sudo journalctl -u sl-news-backend -n 50
```

#### 更新前端代码

```powershell
# 1. 在本地机器上，进入项目目录
cd d:\主页设计

# 2. 拉取最新代码（如果是团队协作）
git pull origin main

# 3. 安装新依赖（如果有）
npm install

# 4. 构建生产版本
npm run build

# 5. 上传到 S3
aws s3 sync build/ s3://你的S3存储桶名/ --delete

# 6. 清除 CloudFront 缓存
aws cloudfront create-invalidation --distribution-id 你的分发ID --paths "/*"
```

---

## 📝 常见修改场景

### 场景 1: 修改后端 API 逻辑

```bash
# 1. 在本地修改代码
# 2. 测试确认无误
# 3. 提交到 Git
git add .
git commit -m "修复了某个 bug"
git push origin main

# 4. SSH 到 EC2
ssh -i sl-news-key.pem ubuntu@你的EC2IP

# 5. 运行更新脚本
cd /home/ubuntu/sl-news-platform
./scripts/update-backend.sh
```

**耗时**: 5 分钟

---

### 场景 2: 修改前端 UI

```powershell
# 1. 在本地修改代码
# 2. 本地测试: npm run dev
# 3. 提交到 Git
git add .
git commit -m "更新了首页样式"
git push origin main

# 4. 运行部署脚本
.\scripts\deploy-to-aws.ps1 -S3Bucket "你的存储桶" -CloudFrontDistributionId "你的分发ID"
```

**耗时**: 5 分钟

---

### 场景 3: 添加新的 Python 依赖

```bash
# 1. 在本地添加依赖到 requirements.txt
echo "new-package==1.0.0" >> backend/requirements.txt

# 2. 提交到 Git
git add backend/requirements.txt
git commit -m "添加新依赖"
git push origin main

# 3. SSH 到 EC2
ssh -i sl-news-key.pem ubuntu@你的EC2IP

# 4. 更新
cd /home/ubuntu/sl-news-platform
git pull
cd backend
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart sl-news-backend
```

**耗时**: 5 分钟

---

### 场景 4: 数据库结构变更

```bash
# 1. 在本地创建迁移文件
cd backend
alembic revision --autogenerate -m "添加新字段"

# 2. 检查生成的迁移文件
# 3. 提交到 Git
git add backend/alembic/versions/*
git commit -m "数据库迁移: 添加新字段"
git push origin main

# 4. SSH 到 EC2
ssh -i sl-news-key.pem ubuntu@你的EC2IP

# 5. 运行迁移
cd /home/ubuntu/sl-news-platform
git pull
cd backend
source venv/bin/activate
alembic upgrade head
sudo systemctl restart sl-news-backend
```

**耗时**: 10 分钟

---

### 场景 5: 修改环境变量

```bash
# 1. SSH 到 EC2
ssh -i sl-news-key.pem ubuntu@你的EC2IP

# 2. 编辑 .env 文件
cd /home/ubuntu/sl-news-platform/backend
nano .env

# 3. 修改需要的变量（例如修改 API Key）
# 保存: Ctrl+X, Y, Enter

# 4. 重启服务
sudo systemctl restart sl-news-backend

# 5. 验证
sudo systemctl status sl-news-backend
```

**耗时**: 3 分钟

---

## 📊 监控和日志

### 查看后端日志

```bash
# 实时查看日志
sudo journalctl -u sl-news-backend -f

# 查看最近 100 行
sudo journalctl -u sl-news-backend -n 100

# 查看今天的日志
sudo journalctl -u sl-news-backend --since today

# 查看错误日志
sudo journalctl -u sl-news-backend -p err

# 查看特定时间段的日志
sudo journalctl -u sl-news-backend --since "2024-11-15 10:00" --until "2024-11-15 12:00"
```

### 查看 Nginx 日志

```bash
# 访问日志
sudo tail -f /var/log/nginx/access.log

# 错误日志
sudo tail -f /var/log/nginx/error.log

# 查看最近 50 行
sudo tail -n 50 /var/log/nginx/access.log
```

### 查看系统资源使用

```bash
# CPU 和内存使用
htop
# 或
top

# 磁盘使用
df -h

# 查看进程
ps aux | grep uvicorn

# 网络连接
netstat -tulpn | grep :8000
```

---

## 💰 成本监控

### 在 AWS 控制台查看成本

1. 登录 AWS 控制台
2. 进入 **Billing and Cost Management**
3. 点击 **Cost Explorer**
4. 查看本月成本

### 设置预算告警

```bash
# 1. 进入 AWS Budgets
# 2. 点击 "Create budget"
# 3. 选择 "Cost budget"
# 4. 设置预算金额（例如: $50/月）
# 5. 配置告警（例如: 达到 80% 时发邮件）
```

### 查看各服务成本

```bash
# 在 Cost Explorer 中:
# 1. 按服务分组
# 2. 查看 EC2、RDS、S3、CloudFront 各自的成本
# 3. 识别成本最高的服务
```

---

## 🔒 安全维护

### 定期更新系统

```bash
# SSH 到 EC2
ssh -i sl-news-key.pem ubuntu@你的EC2IP

# 更新系统包
sudo apt update
sudo apt upgrade -y

# 重启（如果需要）
sudo reboot
```

**频率**: 每月一次

### 更新 SSL 证书

```bash
# Let's Encrypt 证书会自动续期
# 验证自动续期是否正常
sudo certbot renew --dry-run

# 手动续期（如果需要）
sudo certbot renew
```

**频率**: 自动（每 60 天）

### 检查安全组规则

1. 进入 EC2 控制台
2. 点击 **Security Groups**
3. 检查入站规则
4. 确保只开放必要的端口

**频率**: 每季度一次

---

## 🗄️ 数据库维护

### 查看数据库状态

```bash
# 连接到 RDS
psql -h 你的RDS终端节点 -U postgres -d newsdb

# 查看数据库大小
SELECT pg_size_pretty(pg_database_size('newsdb'));

# 查看表大小
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# 退出
\q
```

### 手动备份数据库

```bash
# 在 EC2 上备份
pg_dump -h 你的RDS终端节点 -U postgres -d newsdb > backup_$(date +%Y%m%d).sql

# 下载备份到本地
scp -i sl-news-key.pem ubuntu@你的EC2IP:/home/ubuntu/backup_*.sql ./
```

### 恢复数据库

```bash
# 从备份恢复
psql -h 你的RDS终端节点 -U postgres -d newsdb < backup_20241115.sql
```

---

## 🔄 自动化维护（高级）

### 设置自动备份脚本

```bash
# 在 EC2 上创建备份脚本
nano /home/ubuntu/backup.sh
```

填入：
```bash
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# 备份数据库
pg_dump -h 你的RDS终端节点 -U postgres -d newsdb > $BACKUP_DIR/db_$DATE.sql

# 删除 7 天前的备份
find $BACKUP_DIR -name "db_*.sql" -mtime +7 -delete

echo "Backup completed: db_$DATE.sql"
```

设置定时任务：
```bash
# 编辑 crontab
crontab -e

# 添加每天凌晨 2 点备份
0 2 * * * /home/ubuntu/backup.sh >> /home/ubuntu/backup.log 2>&1
```

### 设置自动更新脚本

```bash
# 创建自动更新脚本
nano /home/ubuntu/auto-update.sh
```

填入：
```bash
#!/bin/bash
cd /home/ubuntu/sl-news-platform
git pull origin main
cd backend
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
sudo systemctl restart sl-news-backend
```

---

## 📱 远程管理工具

### 使用 VS Code Remote SSH

1. 安装 VS Code 扩展: **Remote - SSH**
2. 配置 SSH 连接
3. 直接在 VS Code 中编辑 EC2 上的文件

### 使用 AWS Systems Manager

1. 在 EC2 上安装 SSM Agent
2. 通过 AWS 控制台直接连接（无需 SSH 密钥）
3. 运行命令和脚本

---

## 🚨 故障排除

### 后端服务无法启动

```bash
# 1. 查看服务状态
sudo systemctl status sl-news-backend

# 2. 查看详细日志
sudo journalctl -u sl-news-backend -n 100

# 3. 检查配置文件
cat /home/ubuntu/sl-news-platform/backend/.env

# 4. 手动启动测试
cd /home/ubuntu/sl-news-platform/backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000

# 5. 检查端口占用
sudo netstat -tulpn | grep :8000
```

### 前端无法访问

```bash
# 1. 检查 S3 存储桶策略
# 2. 检查 CloudFront 分发状态
# 3. 清除浏览器缓存
# 4. 检查 DNS 解析
nslookup yourdomain.com
```

### 数据库连接失败

```bash
# 1. 检查 RDS 安全组
# 2. 测试连接
psql -h 你的RDS终端节点 -U postgres -d newsdb

# 3. 检查环境变量
cat /home/ubuntu/sl-news-platform/backend/.env | grep DATABASE_URL

# 4. 检查 RDS 状态（在 AWS 控制台）
```

---

## 📋 维护检查清单

### 每周检查
- [ ] 查看后端日志，确认无错误
- [ ] 检查 AWS 成本
- [ ] 检查网站可访问性
- [ ] 查看系统资源使用（CPU、内存、磁盘）

### 每月检查
- [ ] 更新系统包 (`sudo apt update && sudo apt upgrade`)
- [ ] 检查 SSL 证书有效期
- [ ] 审查安全组规则
- [ ] 检查数据库大小
- [ ] 清理旧日志和备份
- [ ] 更新 Python/Node.js 依赖

### 每季度检查
- [ ] 审查 AWS 成本，优化配置
- [ ] 检查备份策略
- [ ] 安全审计
- [ ] 性能优化
- [ ] 更新文档

---

## 🎯 最佳实践

### 1. 使用 Git 管理代码
```bash
# 永远不要直接在 EC2 上修改代码
# 应该: 本地修改 → Git 提交 → EC2 拉取
```

### 2. 测试后再部署
```bash
# 本地测试通过后再部署到生产环境
npm run dev  # 前端测试
uvicorn app.main:app --reload  # 后端测试
```

### 3. 保持环境变量安全
```bash
# 不要将 .env 文件提交到 Git
# 使用 .env.template 作为模板
```

### 4. 定期备份
```bash
# 数据库自动备份（RDS）
# 代码备份（Git）
# 配置文件备份（手动）
```

### 5. 监控和告警
```bash
# 设置 AWS CloudWatch 告警
# 设置成本告警
# 设置服务健康检查
```

---

## 🎉 总结

### 日常维护很简单！

**更新代码**: 5 分钟
```bash
# 后端
ssh ubuntu@EC2IP
./scripts/update-backend.sh

# 前端
.\scripts\deploy-to-aws.ps1
```

**查看日志**: 2 分钟
```bash
sudo journalctl -u sl-news-backend -f
```

**检查成本**: 2 分钟
```
AWS 控制台 → Billing → Cost Explorer
```

### 维护频率

- **代码更新**: 按需（通常每周 1-2 次）
- **日志检查**: 每周一次
- **成本检查**: 每周一次
- **系统更新**: 每月一次
- **安全审计**: 每季度一次

### 需要帮助？

遇到问题时：
1. 查看日志找到错误信息
2. 参考本文档的故障排除部分
3. 搜索错误信息
4. 向我提问（提供详细错误信息）

**维护并不难，熟练后只需几分钟！** 🚀

