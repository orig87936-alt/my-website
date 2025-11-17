# ✅ 域名配置检查清单

当你提供域名后，按照这个清单逐步完成配置。

---

## 🚀 快速开始

### 第 1 步：运行自动化脚本

```powershell
# 基本用法（只配置前端域名，后端继续使用 IP）
.\update-domain-config.ps1 -Domain "yourdomain.com"

# 完整配置（包括后端 API 域名）
.\update-domain-config.ps1 -Domain "yourdomain.com" -ApiDomain "api.yourdomain.com"

# 自定义邮件地址
.\update-domain-config.ps1 -Domain "yourdomain.com" -EmailFrom "contact@yourdomain.com"
```

脚本会自动完成：
- ✅ 更新服务器后端 CORS 配置
- ✅ 更新服务器后端前端 URL
- ✅ 更新服务器后端邮件地址
- ✅ 重启后端服务
- ✅ 更新本地前端 API 地址

---

## 📋 手动步骤检查清单

### ☑️ 步骤 1: 申请 SSL 证书 (15 分钟)

**位置**: AWS Console → Certificate Manager (us-east-1 区域)

- [ ] 切换到 **us-east-1** 区域（重要！）
- [ ] 点击 **请求证书**
- [ ] 选择 **请求公有证书**
- [ ] 添加域名：
  - [ ] `yourdomain.com`
  - [ ] `*.yourdomain.com` (通配符)
- [ ] 验证方法：**DNS 验证**
- [ ] 点击 **请求**
- [ ] 复制 CNAME 记录到 DNS 提供商
- [ ] 等待验证完成（状态变为"已颁发"）

---

### ☑️ 步骤 2: 配置 CloudFront (10 分钟)

**位置**: AWS Console → CloudFront → 你的分发

- [ ] 点击你的 CloudFront 分发
- [ ] 点击 **编辑**
- [ ] **备用域名 (CNAME)**:
  - [ ] 添加 `yourdomain.com`
  - [ ] 添加 `www.yourdomain.com`
- [ ] **自定义 SSL 证书**:
  - [ ] 选择刚申请的证书
- [ ] 点击 **保存更改**
- [ ] 等待部署完成（状态变为"已部署"）

---

### ☑️ 步骤 3: 配置 DNS (5 分钟)

**位置**: 你的域名提供商（阿里云、腾讯云、GoDaddy 等）

#### 前端域名记录

- [ ] **记录 1 - 根域名**:
  - 类型: `CNAME` (或 `A` 如果不支持根域名 CNAME)
  - 名称: `@` 或留空
  - 值: `[你的 CloudFront 域名]` (例如: d1234567890.cloudfront.net)
  - TTL: 600

- [ ] **记录 2 - www 子域名**:
  - 类型: `CNAME`
  - 名称: `www`
  - 值: `[你的 CloudFront 域名]`
  - TTL: 600

#### 后端 API 域名记录（如果使用自定义域名）

- [ ] **记录 3 - API 子域名**:
  - 类型: `A`
  - 名称: `api`
  - 值: `18.221.125.254`
  - TTL: 600

---

### ☑️ 步骤 4: 重新构建并部署前端 (5 分钟)

**位置**: 本地项目目录

- [ ] 确认 `.env.production` 已更新
- [ ] 运行构建命令:
  ```powershell
  npm run build
  ```
- [ ] 上传到 S3:
  ```powershell
  aws s3 sync build/ s3://sl-news-frontend-20241115/ --delete
  ```
- [ ] 清除 CloudFront 缓存:
  ```powershell
  aws cloudfront create-invalidation --distribution-id [YOUR_ID] --paths "/*"
  ```
- [ ] 等待缓存清除完成（1-2 分钟）

---

### ☑️ 步骤 5: 配置后端 SSL（如果使用自定义 API 域名）(10 分钟)

**位置**: SSH 连接到服务器

- [ ] SSH 连接到服务器:
  ```powershell
  ssh -i "D:\download\sl-news-key.pem" ubuntu@18.221.125.254
  ```

- [ ] 编辑 Nginx 配置:
  ```bash
  sudo nano /etc/nginx/sites-available/sl-news-backend
  ```

- [ ] 修改 `server_name`:
  ```nginx
  server_name api.yourdomain.com;
  ```

- [ ] 测试配置:
  ```bash
  sudo nginx -t
  ```

- [ ] 重启 Nginx:
  ```bash
  sudo systemctl restart nginx
  ```

- [ ] 安装 SSL 证书:
  ```bash
  sudo certbot --nginx -d api.yourdomain.com
  ```

- [ ] 选择 **Redirect HTTP to HTTPS**

- [ ] 验证自动续期:
  ```bash
  sudo certbot renew --dry-run
  ```

---

### ☑️ 步骤 6: 配置邮件服务（可选）(15 分钟)

**位置**: Resend Dashboard (https://resend.com)

- [ ] 登录 Resend
- [ ] 进入 **Domains**
- [ ] 点击 **Add Domain**
- [ ] 输入域名: `yourdomain.com`
- [ ] 复制 DNS 记录（TXT 和 MX）
- [ ] 在 DNS 提供商添加这些记录
- [ ] 等待验证通过（状态变为"Verified"）
- [ ] 更新后端 `.env`:
  ```bash
  EMAIL_FROM=noreply@yourdomain.com
  ```
- [ ] 重启后端服务:
  ```bash
  sudo systemctl restart sl-news-backend
  ```

---

## 🧪 测试检查清单

### ☑️ 前端测试

- [ ] 访问 `https://yourdomain.com`
- [ ] 访问 `https://www.yourdomain.com`
- [ ] 检查 SSL 证书有效（浏览器地址栏显示锁图标）
- [ ] 打开开发者工具 (F12)
- [ ] 检查 Console 没有 CORS 错误
- [ ] 检查 Network 标签，API 请求成功
- [ ] 测试登录功能
- [ ] 测试文章列表加载
- [ ] 测试文章详情页
- [ ] 测试文档上传

### ☑️ 后端测试

- [ ] 访问 API 文档:
  - 如果使用 IP: `http://18.221.125.254:8000/api/docs`
  - 如果使用域名: `https://api.yourdomain.com/api/docs`
- [ ] 测试健康检查:
  ```powershell
  curl https://api.yourdomain.com/health
  ```
- [ ] 检查 CORS 头部:
  ```powershell
  curl -I -H "Origin: https://yourdomain.com" https://api.yourdomain.com/health
  ```
- [ ] 应该看到: `Access-Control-Allow-Origin: https://yourdomain.com`

### ☑️ DNS 传播测试

- [ ] 使用 DNS 检查工具:
  ```powershell
  nslookup yourdomain.com
  nslookup www.yourdomain.com
  nslookup api.yourdomain.com
  ```
- [ ] 或访问: https://dnschecker.org
- [ ] 输入你的域名，检查全球 DNS 传播状态

---

## ⏱️ 预计总时间

| 步骤 | 时间 |
|------|------|
| 运行自动化脚本 | 2 分钟 |
| 申请 SSL 证书 | 15 分钟 |
| 配置 CloudFront | 10 分钟 |
| 配置 DNS | 5 分钟 |
| 重新构建部署前端 | 5 分钟 |
| 配置后端 SSL (可选) | 10 分钟 |
| 配置邮件服务 (可选) | 15 分钟 |
| DNS 传播等待 | 5-60 分钟 |
| **总计** | **45-120 分钟** |

---

## 🔧 常见问题

### Q1: DNS 配置后多久生效？
**A**: 通常 5-30 分钟，最多 48 小时。可以用 `nslookup` 检查。

### Q2: 为什么 SSL 证书必须在 us-east-1 申请？
**A**: CloudFront 只能使用 us-east-1 区域的证书。

### Q3: 可以只配置前端域名，后端继续用 IP 吗？
**A**: 可以！运行脚本时不提供 `-ApiDomain` 参数即可。

### Q4: 配置完成后还是有 CORS 错误？
**A**: 
1. 检查后端 `.env` 中的 `CORS_ORIGINS` 是否包含新域名
2. 确保使用 `https://` 而不是 `http://`
3. 重启后端服务: `sudo systemctl restart sl-news-backend`
4. 清除浏览器缓存

### Q5: CloudFront 缓存如何清除？
**A**: 
```powershell
aws cloudfront create-invalidation --distribution-id [YOUR_ID] --paths "/*"
```

---

## 📞 需要帮助？

如果遇到问题，请提供：
1. 你的域名
2. 错误信息截图
3. 浏览器开发者工具 Console 和 Network 截图
4. 后端日志: `sudo journalctl -u sl-news-backend -n 50`

---

**祝配置顺利！🎉**

