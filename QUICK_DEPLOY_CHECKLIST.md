# ✅ 快速部署检查清单

**用途**: 部署前最后检查  
**时间**: 10 分钟

---

## 🔐 1. 密钥和配置

- [ ] 已生成新的 SECRET_KEY（参考 `PRODUCTION_SECRETS.txt`）
- [ ] 已设置强管理员密码（至少12位）
- [ ] 已准备 OpenAI API Key
- [ ] 已准备数据库连接字符串
- [ ] 已准备域名（或使用 IP 地址）

---

## 📁 2. 文件准备

- [ ] `backend/.env.aws.example` - AWS 配置模板已创建
- [ ] `.env.production` - 前端生产配置已创建
- [ ] `PRODUCTION_SECRETS.txt` - 密钥文件已生成
- [ ] `build/` - 前端已构建（运行 `npm run build`）

---

## 🔧 3. 代码优化

- [ ] 已实施代码分割（App.tsx 使用 lazy loading）
- [ ] 已优化 Vite 配置（manualChunks）
- [ ] 已移除开发环境 console.log
- [ ] 已测试本地构建版本

---

## ☁️ 4. AWS 资源

- [ ] Lightsail 实例已创建（2GB RAM）
- [ ] 静态 IP 已分配
- [ ] 防火墙规则已配置（80, 443, 8000）
- [ ] 数据库已准备（RDS 或本地 PostgreSQL）

---

## 🗄️ 5. 数据库

- [ ] PostgreSQL 已安装
- [ ] pgvector 扩展已启用
- [ ] 数据库用户已创建
- [ ] 数据库迁移已运行（`alembic upgrade head`）
- [ ] 测试数据已导入（可选）

---

## 🔧 6. 后端部署

- [ ] Python 虚拟环境已创建
- [ ] 依赖已安装（`pip install -r requirements.txt`）
- [ ] `.env` 文件已配置
- [ ] Systemd 服务已创建
- [ ] 服务已启动并运行
- [ ] 健康检查通过（`curl http://localhost:8000/health`）

---

## 🌐 7. 前端部署

- [ ] 前端已构建（`npm run build`）
- [ ] 文件已上传到 S3 或服务器
- [ ] Nginx 已配置
- [ ] 静态文件可访问

---

## 🔒 8. 安全配置

- [ ] CORS 已限制为生产域名
- [ ] HTTPS 已启用（Let's Encrypt 或 ACM）
- [ ] 防火墙规则已配置
- [ ] 数据库仅允许应用服务器访问
- [ ] `.env` 文件权限已设置（`chmod 600`）

---

## 🌍 9. 域名和 DNS

- [ ] DNS A 记录已配置
- [ ] SSL 证书已安装
- [ ] 域名可访问
- [ ] HTTPS 重定向已启用

---

## ✅ 10. 验证测试

- [ ] 后端健康检查：`curl https://yourdomain.com/health`
- [ ] API 文档可访问：`https://yourdomain.com/api/docs`
- [ ] 前端首页可访问：`https://yourdomain.com`
- [ ] 登录功能正常
- [ ] 新闻管理功能正常
- [ ] 预约功能正常
- [ ] AI 聊天功能正常

---

## 📊 11. 监控和备份

- [ ] 日志可查看（`journalctl -u sl-news-api`）
- [ ] 数据库备份脚本已配置
- [ ] Cron 任务已设置
- [ ] 错误监控已配置（可选）

---

## 🧹 12. 清理工作

- [ ] 删除 `PRODUCTION_SECRETS.txt`（已保存到密码管理器）
- [ ] 删除本地 `.env` 文件副本
- [ ] 确认 `.env` 未提交到 Git
- [ ] 删除测试数据（如果有）

---

## 📝 部署命令速查

### 后端启动
```bash
sudo systemctl start sl-news-api
sudo systemctl status sl-news-api
```

### 查看日志
```bash
sudo journalctl -u sl-news-api -f
```

### 重启服务
```bash
sudo systemctl restart sl-news-api
sudo systemctl restart nginx
```

### 数据库备份
```bash
pg_dump -U newsuser newsdb > backup_$(date +%Y%m%d).sql
```

### 前端更新
```bash
npm run build
aws s3 sync build/ s3://sl-news-frontend/ --delete
```

---

## 🚨 常见问题

### 后端无法启动
```bash
# 检查日志
sudo journalctl -u sl-news-api -n 50

# 检查端口占用
sudo lsof -i :8000

# 检查环境变量
cat backend/.env
```

### 数据库连接失败
```bash
# 测试连接
psql -U newsuser -d newsdb -h localhost

# 检查 PostgreSQL 状态
sudo systemctl status postgresql
```

### 前端无法访问后端
```bash
# 检查 CORS 配置
grep CORS_ORIGINS backend/.env

# 检查 Nginx 配置
sudo nginx -t
```

---

## ✅ 完成标志

当所有检查项都打勾后，你的应用就可以正式上线了！

**预计总时间**: 2-3 小时  
**难度**: ⭐⭐⭐ 中等

---

**参考文档**:
- `PRODUCTION_DEPLOYMENT_GUIDE.md` - 详细部署步骤
- `DEPLOYMENT_READINESS_REPORT.md` - 部署就绪报告
- `AWS_LIGHTSAIL_GUIDE.md` - Lightsail 快速指南

