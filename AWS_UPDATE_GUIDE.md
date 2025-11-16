# 🔄 AWS 部署后更新指南

本指南介绍如何在 AWS 部署后进行代码更新和维护。

---

## 📋 **目录**

1. [自动部署（推荐）](#自动部署推荐)
2. [手动更新](#手动更新)
3. [数据库迁移](#数据库迁移)
4. [回滚策略](#回滚策略)
5. [监控和日志](#监控和日志)

---

## 🚀 **自动部署（推荐）**

### **设置 GitHub Actions CI/CD**

#### **步骤 1: 配置 GitHub Secrets**

在 GitHub 仓库中，进入 **Settings → Secrets and variables → Actions**，添加以下 secrets：

**后端部署所需：**
```
EC2_HOST                    # EC2 公网 IP 或域名
EC2_USERNAME                # SSH 用户名（通常是 ubuntu）
EC2_SSH_KEY                 # SSH 私钥内容（.pem 文件的完整内容）
```

**前端部署所需：**
```
AWS_ACCESS_KEY_ID           # AWS IAM 访问密钥 ID
AWS_SECRET_ACCESS_KEY       # AWS IAM 访问密钥
AWS_REGION                  # AWS 区域（例如 us-east-1）
S3_BUCKET_NAME              # S3 存储桶名称
CLOUDFRONT_DISTRIBUTION_ID  # CloudFront 分发 ID
VITE_API_BASE_URL          # 后端 API 地址
```

#### **步骤 2: 获取 EC2 SSH 密钥内容**

在本地机器上：

```powershell
# 读取 .pem 文件内容
Get-Content sl-news-key.pem | clip
```

然后粘贴到 GitHub Secrets 的 `EC2_SSH_KEY` 中。

#### **步骤 3: 创建 IAM 用户（用于 S3 部署）**

1. 登录 AWS Console
2. 进入 **IAM → Users → Create user**
3. 用户名：`github-actions-deploy`
4. 权限策略：
   - `AmazonS3FullAccess`
   - `CloudFrontFullAccess`
5. 创建访问密钥，保存到 GitHub Secrets

#### **步骤 4: 测试自动部署**

```bash
# 提交代码到 main 分支
git add .
git commit -m "Test auto deployment"
git push origin main
```

GitHub Actions 会自动：
1. ✅ 检测到代码变更
2. ✅ 构建前端/后端
3. ✅ 部署到 AWS
4. ✅ 运行健康检查
5. ✅ 通知部署结果

---

## 🛠️ **手动更新**

如果你不想使用 CI/CD，可以手动更新：

### **更新后端代码**

```bash
# 1. SSH 到 EC2
ssh -i sl-news-key.pem ubuntu@[EC2-IP]

# 2. 进入项目目录
cd /home/ubuntu/your-repo

# 3. 拉取最新代码
git pull origin main

# 4. 激活虚拟环境
cd backend
source venv/bin/activate

# 5. 安装新依赖（如果有）
pip install -r requirements.txt

# 6. 运行数据库迁移（如果有）
alembic upgrade head

# 7. 重启服务
sudo systemctl restart sl-news-backend

# 8. 检查服务状态
sudo systemctl status sl-news-backend

# 9. 查看日志（确保没有错误）
sudo journalctl -u sl-news-backend -f
```

### **更新前端代码**

在本地机器上：

```powershell
# 1. 拉取最新代码
git pull origin main

# 2. 安装新依赖（如果有）
npm install

# 3. 构建前端
npm run build

# 4. 上传到 S3
aws s3 sync build/ s3://sl-news-frontend/ --delete

# 5. 清除 CloudFront 缓存
aws cloudfront create-invalidation --distribution-id [DISTRIBUTION-ID] --paths "/*"

# 6. 等待缓存清除完成（通常 1-5 分钟）
# 访问网站验证更新
```

---

## 🗄️ **数据库迁移**

### **创建新的数据库迁移**

在本地开发环境：

```bash
# 1. 修改数据库模型（例如 backend/app/models/article.py）

# 2. 生成迁移文件
cd backend
alembic revision --autogenerate -m "Add new column to articles"

# 3. 检查生成的迁移文件
# 文件位置：backend/alembic/versions/xxxx_add_new_column_to_articles.py

# 4. 提交到 Git
git add backend/alembic/versions/
git commit -m "Add database migration: Add new column to articles"
git push origin main
```

### **在生产环境应用迁移**

**方式 1：自动（通过 CI/CD）**
- GitHub Actions 会自动运行 `alembic upgrade head`

**方式 2：手动**
```bash
# SSH 到 EC2
ssh -i sl-news-key.pem ubuntu@[EC2-IP]

# 进入项目目录
cd /home/ubuntu/your-repo/backend
source venv/bin/activate

# 应用迁移
alembic upgrade head

# 重启服务
sudo systemctl restart sl-news-backend
```

### **回滚数据库迁移**

```bash
# 回滚到上一个版本
alembic downgrade -1

# 回滚到特定版本
alembic downgrade <revision_id>

# 查看迁移历史
alembic history
```

---

## ⏮️ **回滚策略**

### **回滚后端代码**

```bash
# SSH 到 EC2
ssh -i sl-news-key.pem ubuntu@[EC2-IP]

# 进入项目目录
cd /home/ubuntu/your-repo

# 查看提交历史
git log --oneline -10

# 回滚到特定提交
git reset --hard <commit-hash>

# 重启服务
cd backend
source venv/bin/activate
sudo systemctl restart sl-news-backend
```

### **回滚前端代码**

```powershell
# 本地回滚
git reset --hard <commit-hash>

# 重新构建和部署
npm run build
aws s3 sync build/ s3://sl-news-frontend/ --delete
aws cloudfront create-invalidation --distribution-id [DISTRIBUTION-ID] --paths "/*"
```

### **蓝绿部署（零停机更新）**

如果你需要零停机更新，可以使用蓝绿部署：

1. **创建新的 EC2 实例**（绿色环境）
2. **部署新代码到绿色环境**
3. **测试绿色环境**
4. **切换负载均衡器到绿色环境**
5. **保留蓝色环境一段时间（以便回滚）**

---

## 📊 **监控和日志**

### **查看后端日志**

```bash
# 实时查看日志
sudo journalctl -u sl-news-backend -f

# 查看最近 100 行日志
sudo journalctl -u sl-news-backend -n 100

# 查看特定时间段的日志
sudo journalctl -u sl-news-backend --since "2025-01-01 00:00:00" --until "2025-01-01 23:59:59"

# 查看错误日志
sudo journalctl -u sl-news-backend -p err
```

### **查看 Nginx 日志**

```bash
# 访问日志
sudo tail -f /var/log/nginx/access.log

# 错误日志
sudo tail -f /var/log/nginx/error.log
```

### **设置日志告警**

创建一个简单的监控脚本：

```bash
# 创建监控脚本
sudo nano /home/ubuntu/monitor.sh
```

内容：
```bash
#!/bin/bash

# 检查服务状态
if ! systemctl is-active --quiet sl-news-backend; then
    echo "❌ Backend service is down!" | mail -s "Alert: Backend Down" your-email@example.com
fi

# 检查磁盘空间
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "⚠️ Disk usage is ${DISK_USAGE}%" | mail -s "Alert: High Disk Usage" your-email@example.com
fi
```

设置定时任务：
```bash
# 编辑 crontab
crontab -e

# 添加：每 5 分钟检查一次
*/5 * * * * /home/ubuntu/monitor.sh
```

---

## 🔧 **常见更新场景**

### **场景 1: 修复 Bug**

```bash
# 1. 本地修复 bug
# 2. 提交代码
git add .
git commit -m "Fix: 修复文章保存问题"
git push origin main

# 3. GitHub Actions 自动部署
# 或手动 SSH 更新（见上文）
```

### **场景 2: 添加新功能**

```bash
# 1. 开发新功能
# 2. 如果有数据库变更，创建迁移
alembic revision --autogenerate -m "Add new feature"

# 3. 提交代码
git add .
git commit -m "Feature: 添加新闻上传功能"
git push origin main

# 4. 自动部署会运行迁移
```

### **场景 3: 更新依赖**

```bash
# 1. 更新 package.json 或 requirements.txt
npm update
# 或
pip install --upgrade <package>
pip freeze > requirements.txt

# 2. 提交代码
git add .
git commit -m "Update dependencies"
git push origin main

# 3. 部署时会自动安装新依赖
```

### **场景 4: 更新环境变量**

```bash
# SSH 到 EC2
ssh -i sl-news-key.pem ubuntu@[EC2-IP]

# 编辑环境变量
cd /home/ubuntu/your-repo/backend
nano .env

# 重启服务
sudo systemctl restart sl-news-backend
```

---

## 📝 **更新检查清单**

每次更新前，检查：

- [ ] 代码已在本地测试
- [ ] 数据库迁移已创建（如果需要）
- [ ] 环境变量已更新（如果需要）
- [ ] 依赖已更新（如果需要）
- [ ] 备份数据库（重大更新时）
- [ ] 通知用户（如果有停机时间）

---

## 🎯 **推荐工作流程**

### **日常开发**

```
本地开发 → 测试 → 提交到 main → GitHub Actions 自动部署 → 验证
```

### **重大更新**

```
本地开发 → 测试 → 提交到 dev 分支 → 手动部署到测试环境 → 测试 → 合并到 main → 自动部署到生产 → 验证
```

---

## 📞 **需要帮助？**

如果遇到问题：

1. **查看日志**：`sudo journalctl -u sl-news-backend -f`
2. **检查服务状态**：`sudo systemctl status sl-news-backend`
3. **测试 API**：`curl http://localhost:8000/health`
4. **回滚代码**：见上文回滚策略

---

## 🔗 **相关文档**

- `AWS_DEPLOYMENT_GUIDE.md` - 完整部署指南
- `backend/alembic/README` - 数据库迁移文档
- `.github/workflows/` - CI/CD 配置

