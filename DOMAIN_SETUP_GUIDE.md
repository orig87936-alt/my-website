# 🌐 域名配置完整指南

当你提供实际域名后，需要进行以下配置更改。

---

## 📋 需要配置的地方

### 1️⃣ **后端配置** (服务器上)

**文件**: `/home/ubuntu/backend/.env`

需要修改的配置项：
```bash
# CORS 跨域配置
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,http://localhost:5173

# 前端 URL（用于邮件链接等）
FRONTEND_URL=https://yourdomain.com

# 邮件配置（如果使用 Resend）
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=S&L News Platform
```

**操作**: 需要重启后端服务
```bash
sudo systemctl restart sl-news-backend
```

---

### 2️⃣ **前端配置** (本地构建)

**文件**: `.env.production`

需要修改的配置项：
```bash
# 后端 API 地址
# 如果使用自定义域名：
VITE_API_BASE_URL=https://api.yourdomain.com

# 或者继续使用 EC2 IP：
VITE_API_BASE_URL=http://18.221.125.254:8000
```

**操作**: 需要重新构建并上传
```powershell
npm run build
aws s3 sync build/ s3://sl-news-frontend-20241115/ --delete
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

---

### 3️⃣ **CloudFront 配置** (AWS 控制台)

**位置**: AWS Console → CloudFront → 你的分发

需要配置：
1. **备用域名 (CNAME)**:
   - `yourdomain.com`
   - `www.yourdomain.com`

2. **SSL 证书**:
   - 在 ACM (us-east-1 区域) 申请证书
   - 为 `yourdomain.com` 和 `*.yourdomain.com`
   - 使用 DNS 验证

---

### 4️⃣ **DNS 配置** (你的域名提供商)

需要添加的记录：

**前端域名**:
```
类型: A (或 CNAME)
名称: @ (根域名)
值: CloudFront 分发域名 (例如: d1234567890.cloudfront.net)

类型: CNAME
名称: www
值: CloudFront 分发域名
```

**后端 API 域名** (可选):
```
类型: A
名称: api
值: 18.221.125.254 (EC2 公网 IP)
```

---

### 5️⃣ **Nginx 配置** (如果使用自定义后端域名)

**文件**: `/etc/nginx/sites-available/sl-news-backend`

需要修改：
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;  # 修改这里
    
    # ... 其他配置保持不变
}
```

**配置 SSL** (使用 Let's Encrypt):
```bash
sudo certbot --nginx -d api.yourdomain.com
```

---

### 6️⃣ **邮件服务配置** (可选)

如果使用 Resend 发送邮件：

1. 在 Resend Dashboard 添加域名
2. 添加 DNS 记录（TXT 和 MX）
3. 等待验证通过
4. 更新后端 `.env` 中的 `EMAIL_FROM`

---

## 🚀 自动化配置脚本

我已经为你准备了自动化脚本：`update-domain-config.ps1`

使用方法：
```powershell
.\update-domain-config.ps1 -Domain "yourdomain.com"
```

这个脚本会自动：
1. ✅ 更新服务器上的后端 `.env` 配置
2. ✅ 重启后端服务
3. ✅ 更新本地的前端 `.env.production` 配置
4. ✅ 提示你需要手动完成的步骤（DNS、CloudFront、SSL）

---

## ⏱️ 预计时间

| 步骤 | 时间 | 是否自动化 |
|------|------|-----------|
| 后端 .env 配置 | 2 分钟 | ✅ 自动 |
| 前端 .env 配置 | 1 分钟 | ✅ 自动 |
| 重新构建前端 | 5 分钟 | ⚠️ 半自动 |
| CloudFront 配置 | 10 分钟 | ❌ 手动 |
| SSL 证书申请 | 15 分钟 | ❌ 手动 |
| DNS 配置 | 5 分钟 | ❌ 手动 |
| DNS 生效等待 | 5-60 分钟 | - |
| **总计** | **45-90 分钟** | - |

---

## 📝 配置检查清单

完成域名配置后，请检查：

- [ ] 后端 `.env` 中的 `CORS_ORIGINS` 包含新域名
- [ ] 后端 `.env` 中的 `FRONTEND_URL` 更新为新域名
- [ ] 前端 `.env.production` 中的 `VITE_API_BASE_URL` 正确
- [ ] CloudFront 配置了备用域名
- [ ] CloudFront 配置了 SSL 证书
- [ ] DNS A/CNAME 记录指向 CloudFront
- [ ] 后端服务已重启
- [ ] 前端已重新构建并上传
- [ ] CloudFront 缓存已清除
- [ ] 可以通过新域名访问网站
- [ ] 可以通过新域名调用 API
- [ ] CORS 没有错误
- [ ] SSL 证书有效

---

## 🔧 故障排查

### 问题 1: CORS 错误
**解决**: 检查后端 `.env` 中的 `CORS_ORIGINS` 是否包含新域名（包括 https://）

### 问题 2: API 调用失败
**解决**: 检查前端 `.env.production` 中的 `VITE_API_BASE_URL` 是否正确

### 问题 3: 域名无法访问
**解决**: 
1. 检查 DNS 记录是否正确
2. 等待 DNS 传播（最多 48 小时，通常 5-30 分钟）
3. 使用 `nslookup yourdomain.com` 检查 DNS

### 问题 4: SSL 证书错误
**解决**: 
1. 确保在 us-east-1 区域申请证书
2. 确保 DNS 验证已完成
3. 确保 CloudFront 配置了正确的证书

---

## 💡 提示

1. **先测试后端配置**: 更新 CORS 后，先用 IP 地址测试，确保后端正常
2. **分步进行**: 不要一次性修改所有配置，逐步测试
3. **保留备份**: 修改配置前先备份原文件
4. **使用 HTTPS**: 生产环境务必使用 HTTPS
5. **清除缓存**: 每次更新前端后，记得清除 CloudFront 缓存

---

## 📞 需要帮助？

如果遇到问题，请提供：
1. 你的域名
2. 错误信息截图
3. 浏览器开发者工具的 Network 标签截图
4. 后端日志: `sudo journalctl -u sl-news-backend -n 50`

