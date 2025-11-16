# ⚡ 快速更新参考卡片

## 🚀 **最快更新方式（推荐）**

```bash
# 1. 提交代码
git add .
git commit -m "你的更新说明"
git push origin main

# 2. GitHub Actions 自动部署 ✅
# 3. 等待 2-5 分钟
# 4. 验证更新
```

---

## 🛠️ **手动更新后端（5 分钟）**

```bash
# SSH 到 EC2
ssh -i sl-news-key.pem ubuntu@[EC2-IP]

# 快速更新
cd /home/ubuntu/your-repo && \
git pull && \
cd backend && \
source venv/bin/activate && \
pip install -r requirements.txt && \
alembic upgrade head && \
sudo systemctl restart sl-news-backend

# 检查状态
sudo systemctl status sl-news-backend
```

---

## 🎨 **手动更新前端（3 分钟）**

```powershell
# 本地构建
npm run build

# 部署到 S3
aws s3 sync build/ s3://sl-news-frontend/ --delete

# 清除缓存
aws cloudfront create-invalidation --distribution-id [ID] --paths "/*"
```

---

## 🗄️ **数据库迁移**

```bash
# 创建迁移
alembic revision --autogenerate -m "描述"

# 应用迁移
alembic upgrade head

# 回滚迁移
alembic downgrade -1
```

---

## 📊 **常用命令**

```bash
# 查看日志
sudo journalctl -u sl-news-backend -f

# 重启服务
sudo systemctl restart sl-news-backend

# 检查服务状态
sudo systemctl status sl-news-backend

# 测试 API
curl http://localhost:8000/health
```

---

## ⏮️ **紧急回滚**

```bash
# 回滚代码
git reset --hard <commit-hash>
git push -f origin main

# 或手动回滚
ssh -i sl-news-key.pem ubuntu@[EC2-IP]
cd /home/ubuntu/your-repo
git reset --hard <commit-hash>
sudo systemctl restart sl-news-backend
```

---

## 🔧 **故障排查**

```bash
# 1. 检查服务状态
sudo systemctl status sl-news-backend

# 2. 查看错误日志
sudo journalctl -u sl-news-backend -p err -n 50

# 3. 测试数据库连接
cd /home/ubuntu/your-repo/backend
source venv/bin/activate
python -c "from app.database import engine; print('DB OK')"

# 4. 测试 API
curl http://localhost:8000/docs
```

---

## 📞 **紧急联系**

- **GitHub Actions 日志**: https://github.com/your-repo/actions
- **AWS Console**: https://console.aws.amazon.com
- **CloudFront 缓存清除**: 通常需要 1-5 分钟

