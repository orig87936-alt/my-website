# ✅ EC2 + RDS 部署检查清单

**部署方案**: AWS EC2 + RDS  
**预计时间**: 3-4 小时  
**难度**: ⭐⭐⭐⭐ 中高

---

## 📋 部署前准备

### AWS 账户准备
- [ ] AWS 账户已创建并验证
- [ ] 信用卡已绑定
- [ ] IAM 用户已创建（推荐，而非使用 root 账户）
- [ ] AWS CLI 已安装并配置
- [ ] 选择部署区域（推荐：Tokyo 或 Singapore）

### 本地准备
- [ ] 已完成代码优化（参考 `DEPLOYMENT_PREPARATION_SUMMARY.md`）
- [ ] 前端已成功构建（`npm run build`）
- [ ] 后端依赖已确认（`requirements.txt`）
- [ ] 配置文件已准备（`PRODUCTION_SECRETS.txt`）
- [ ] 域名已准备（可选，但强烈推荐）

### 密钥准备
- [ ] SECRET_KEY 已生成（64位十六进制）
- [ ] 管理员密码已设置（至少12位强密码）
- [ ] OpenAI API Key 已准备
- [ ] DeepSeek API Key 已确认
- [ ] 数据库密码已设置（至少16位强密码）

---

## 🗄️ 步骤 1: RDS 数据库配置 (30 分钟)

### 1.1 创建 RDS 实例
- [ ] 登录 AWS RDS Console
- [ ] 选择 PostgreSQL 14.x
- [ ] 选择模板（Free tier 或 Production）
- [ ] 设置实例标识符：`sl-news-db`
- [ ] 设置主用户名：`newsadmin`
- [ ] 设置强密码并记录
- [ ] 选择实例类型：
  - [ ] db.t2.micro（免费套餐）
  - [ ] db.t3.small（推荐生产）
- [ ] 配置存储：20 GB，启用自动扩展
- [ ] 配置连接：
  - [ ] VPC: Default VPC
  - [ ] 公共访问：Yes（或配置 VPC Peering）
  - [ ] 创建新安全组：`sl-news-db-sg`
- [ ] 设置初始数据库名：`newsdb`
- [ ] 启用自动备份（7天保留期）
- [ ] 启用加密
- [ ] 启用增强监控
- [ ] 点击创建并等待（5-10分钟）

### 1.2 配置 RDS 安全组
- [ ] 进入 RDS 安全组设置
- [ ] 添加入站规则：PostgreSQL (5432)
- [ ] 源：My IP（临时，用于初始化）
- [ ] 记录安全组 ID（稍后添加 EC2 访问）

### 1.3 记录连接信息
```
Endpoint: _________________________________
Port: 5432
Database: newsdb
Username: newsadmin
Password: _________________________________

连接字符串:
postgresql+asyncpg://newsadmin:PASSWORD@ENDPOINT:5432/newsdb
```

### 1.4 初始化数据库
- [ ] 本地安装 PostgreSQL 客户端
- [ ] 连接到 RDS 实例
- [ ] 创建 pgvector 扩展：`CREATE EXTENSION IF NOT EXISTS vector;`
- [ ] 验证扩展：`\dx`
- [ ] 测试连接成功

---

## 🖥️ 步骤 2: EC2 实例配置 (30 分钟)

### 2.1 创建 EC2 实例
- [ ] 登录 AWS EC2 Console
- [ ] 点击 "Launch Instance"
- [ ] 设置名称：`sl-news-backend`
- [ ] 选择 AMI：Ubuntu Server 22.04 LTS
- [ ] 选择实例类型：
  - [ ] t2.micro（免费套餐，可能不够）
  - [ ] t3.small（推荐最小）
  - [ ] t3.medium（推荐生产）
- [ ] 创建密钥对：
  - [ ] 名称：`sl-news-key`
  - [ ] 类型：RSA
  - [ ] 格式：.pem（Linux/Mac）或 .ppk（Windows）
  - [ ] 下载并保存到安全位置
- [ ] 网络设置：
  - [ ] VPC: Default VPC
  - [ ] 自动分配公共 IP：启用
  - [ ] 创建安全组：`sl-news-backend-sg`
  - [ ] 添加规则：SSH (22), HTTP (80), HTTPS (443), Custom TCP (8000)
- [ ] 配置存储：30 GB gp3
- [ ] 启动实例并等待（1-2分钟）

### 2.2 分配弹性 IP
- [ ] 创建弹性 IP
- [ ] 关联到 EC2 实例
- [ ] 记录弹性 IP：`___________________`

### 2.3 更新安全组
- [ ] 复制 EC2 安全组 ID
- [ ] 回到 RDS 安全组
- [ ] 添加入站规则：PostgreSQL (5432)，源为 EC2 安全组 ID
- [ ] 保存规则

### 2.4 测试 SSH 连接
- [ ] 设置密钥权限（Windows）
- [ ] SSH 连接成功：`ssh -i sl-news-key.pem ubuntu@ELASTIC_IP`

---

## 🔧 步骤 3: 后端部署 (90 分钟)

### 3.1 安装系统依赖
- [ ] 更新系统：`sudo apt update && sudo apt upgrade -y`
- [ ] 安装 Python 3.11：`sudo apt install -y python3.11 python3.11-venv python3-pip`
- [ ] 安装 PostgreSQL 客户端：`sudo apt install -y postgresql-client`
- [ ] 安装 Nginx：`sudo apt install -y nginx`
- [ ] 安装 Git：`sudo apt install -y git`
- [ ] 安装其他工具：`sudo apt install -y curl wget htop`

### 3.2 上传代码
- [ ] 选择上传方式：
  - [ ] Git clone（推荐）
  - [ ] SCP 上传
- [ ] 代码已上传到 `~/backend`
- [ ] 验证文件完整性

### 3.3 配置 Python 环境
- [ ] 创建虚拟环境：`python3.11 -m venv venv`
- [ ] 激活虚拟环境：`source venv/bin/activate`
- [ ] 升级 pip：`pip install --upgrade pip`
- [ ] 安装依赖：`pip install -r requirements.txt`
- [ ] 验证安装成功

### 3.4 配置环境变量
- [ ] 创建 `.env` 文件
- [ ] 填入数据库连接字符串
- [ ] 填入 SECRET_KEY
- [ ] 填入 ADMIN_PASSWORD
- [ ] 填入 API 密钥（OpenAI, DeepSeek）
- [ ] 填入 CORS_ORIGINS
- [ ] 设置 ENVIRONMENT=production
- [ ] 设置文件权限：`chmod 600 .env`

### 3.5 初始化数据库
- [ ] 测试数据库连接
- [ ] 运行迁移：`alembic upgrade head`
- [ ] 验证表已创建
- [ ] 测试后端启动：`uvicorn app.main:app --host 0.0.0.0 --port 8000`
- [ ] 测试健康检查：`curl http://localhost:8000/health`
- [ ] 停止测试服务器（Ctrl+C）

### 3.6 配置 Systemd 服务
- [ ] 创建服务文件：`/etc/systemd/system/sl-news-api.service`
- [ ] 填入服务配置
- [ ] 重新加载 systemd：`sudo systemctl daemon-reload`
- [ ] 启用服务：`sudo systemctl enable sl-news-api`
- [ ] 启动服务：`sudo systemctl start sl-news-api`
- [ ] 检查状态：`sudo systemctl status sl-news-api`
- [ ] 查看日志确认启动成功

### 3.7 配置 Nginx
- [ ] 创建 Nginx 配置：`/etc/nginx/sites-available/sl-news`
- [ ] 填入配置内容
- [ ] 创建符号链接
- [ ] 删除默认配置
- [ ] 测试配置：`sudo nginx -t`
- [ ] 重启 Nginx：`sudo systemctl restart nginx`

### 3.8 测试后端
- [ ] 本地测试：`curl http://localhost/health`
- [ ] 外部测试：`curl http://ELASTIC_IP/health`
- [ ] API 文档：`curl http://ELASTIC_IP/docs`
- [ ] 测试文章 API：`curl http://ELASTIC_IP/api/v1/articles`

---

## 🌐 步骤 4: 前端部署 (60 分钟)

### 4.1 本地构建
- [ ] 编辑 `.env.production`
- [ ] 设置 VITE_API_URL（使用弹性 IP 或域名）
- [ ] 运行构建：`npm run build`
- [ ] 验证构建产物：`ls build/`

### 4.2 创建 S3 存储桶
- [ ] 登录 S3 Console
- [ ] 创建存储桶：`sl-news-frontend`
- [ ] 区域：us-east-1（CloudFront 推荐）
- [ ] 取消"阻止所有公共访问"
- [ ] 启用版本控制
- [ ] 配置静态网站托管
- [ ] 设置索引文档：`index.html`
- [ ] 设置错误文档：`index.html`
- [ ] 添加存储桶策略（允许公共读取）

### 4.3 上传文件
- [ ] 配置 AWS CLI（如果未配置）
- [ ] 上传文件：`aws s3 sync build/ s3://sl-news-frontend/ --delete`
- [ ] 验证文件已上传
- [ ] 测试 S3 网站 URL

### 4.4 创建 CloudFront 分发
- [ ] 登录 CloudFront Console
- [ ] 创建分发
- [ ] 源域名：S3 存储桶
- [ ] 查看器协议策略：Redirect HTTP to HTTPS
- [ ] 缓存策略：CachingOptimized
- [ ] 价格等级：Use all edge locations
- [ ] 默认根对象：`index.html`
- [ ] 创建并等待部署（5-15分钟）
- [ ] 配置错误页面（403 和 404 → /index.html）
- [ ] 记录 CloudFront 域名

### 4.5 测试前端
- [ ] 访问 CloudFront 域名
- [ ] 测试所有页面加载
- [ ] 测试前端连接后端（可能需要配置 CORS）

---

## 🔒 步骤 5: 域名和 SSL 配置 (60 分钟)

### 5.1 申请 SSL 证书（ACM）
- [ ] 登录 ACM Console
- [ ] 请求公共证书
- [ ] 添加域名：`yourdomain.com` 和 `*.yourdomain.com`
- [ ] 选择 DNS 验证
- [ ] 复制 CNAME 记录信息
- [ ] 在域名注册商添加 CNAME 记录
- [ ] 等待验证完成（5-30分钟）

### 5.2 配置 DNS（Route 53 或域名注册商）
- [ ] 添加 A 记录：`api.yourdomain.com` → EC2 弹性 IP
- [ ] 添加 A 记录（Alias）：`yourdomain.com` → CloudFront
- [ ] 添加 CNAME 记录：`www.yourdomain.com` → `yourdomain.com`
- [ ] 等待 DNS 传播（5-60分钟）

### 5.3 更新 CloudFront 使用 SSL
- [ ] 编辑 CloudFront 分发
- [ ] 添加备用域名：`yourdomain.com`, `www.yourdomain.com`
- [ ] 选择自定义 SSL 证书（ACM 证书）
- [ ] 保存更改并等待部署

### 5.4 配置后端 SSL（Let's Encrypt）
- [ ] SSH 到 EC2
- [ ] 安装 Certbot：`sudo apt install -y certbot python3-certbot-nginx`
- [ ] 获取证书：`sudo certbot --nginx -d api.yourdomain.com`
- [ ] 按照提示完成配置
- [ ] 选择重定向 HTTP 到 HTTPS
- [ ] 测试自动续期：`sudo certbot renew --dry-run`

### 5.5 更新配置
- [ ] 更新后端 `.env`：
  - [ ] CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
  - [ ] FRONTEND_URL=https://yourdomain.com
- [ ] 重启后端：`sudo systemctl restart sl-news-api`
- [ ] 更新前端 `.env.production`：
  - [ ] VITE_API_URL=https://api.yourdomain.com
- [ ] 重新构建前端：`npm run build`
- [ ] 上传到 S3：`aws s3 sync build/ s3://sl-news-frontend/ --delete`
- [ ] 清除 CloudFront 缓存

---

## ✅ 步骤 6: 验证和测试 (30 分钟)

### 6.1 后端验证
- [ ] 健康检查：`curl https://api.yourdomain.com/health`
- [ ] API 文档：访问 `https://api.yourdomain.com/docs`
- [ ] 文章列表：`curl https://api.yourdomain.com/api/v1/articles`
- [ ] SSL 证书有效
- [ ] HTTPS 重定向工作

### 6.2 前端验证
- [ ] 访问 `https://yourdomain.com`
- [ ] 访问 `https://www.yourdomain.com`
- [ ] HTTP 自动重定向到 HTTPS
- [ ] 所有页面正常加载
- [ ] 静态资源加载正常

### 6.3 功能测试
- [ ] 登录功能正常
- [ ] 新闻列表显示正常
- [ ] 新闻详情页正常
- [ ] 新闻管理功能正常（管理员）
- [ ] 预约功能正常
- [ ] 订阅功能正常
- [ ] AI 聊天功能正常
- [ ] 翻译功能正常

### 6.4 性能测试
- [ ] 首页加载时间 < 3秒
- [ ] API 响应时间 < 500ms
- [ ] 图片加载正常
- [ ] 视频播放正常

### 6.5 安全检查
- [ ] HTTPS 强制启用
- [ ] SSL 证书有效
- [ ] CORS 配置正确
- [ ] .env 文件权限正确（600）
- [ ] 数据库仅允许 EC2 访问
- [ ] SSH 仅允许特定 IP（可选）

---

## 📊 步骤 7: 监控和备份配置 (30 分钟)

### 7.1 CloudWatch 监控
- [ ] 创建 CloudWatch Dashboard
- [ ] 添加 EC2 CPU 监控
- [ ] 添加 EC2 网络监控
- [ ] 添加 RDS CPU 监控
- [ ] 添加 RDS 连接数监控
- [ ] 添加 RDS 存储监控

### 7.2 日志配置
- [ ] 确认后端日志可查看
- [ ] 确认 Nginx 日志可查看
- [ ] 配置日志轮转（可选）

### 7.3 备份配置
- [ ] RDS 自动备份已启用（7天）
- [ ] 创建数据库备份脚本
- [ ] 测试备份脚本
- [ ] 添加 cron 任务（每日备份）
- [ ] 测试恢复流程

### 7.4 告警配置（可选）
- [ ] 配置 CPU 使用率告警
- [ ] 配置磁盘空间告警
- [ ] 配置数据库连接数告警
- [ ] 配置错误日志告警

---

## 🧹 步骤 8: 清理和文档 (15 分钟)

### 8.1 安全清理
- [ ] 删除本地 `PRODUCTION_SECRETS.txt`
- [ ] 删除服务器上的临时文件
- [ ] 确认 `.env` 未提交到 Git
- [ ] 移除 RDS 安全组的 "My IP" 规则（可选）

### 8.2 文档记录
- [ ] 记录所有密码到密码管理器
- [ ] 记录 AWS 资源 ID
- [ ] 记录域名配置
- [ ] 记录部署日期和版本
- [ ] 创建运维文档

### 8.3 团队交接（如果需要）
- [ ] 分享访问凭证
- [ ] 分享部署文档
- [ ] 培训团队成员
- [ ] 设置访问权限

---

## 🎉 完成确认

### 最终检查
- [ ] ✅ 后端服务运行正常
- [ ] ✅ 前端网站可访问
- [ ] ✅ 数据库连接正常
- [ ] ✅ HTTPS 证书有效
- [ ] ✅ 所有功能测试通过
- [ ] ✅ 监控和告警配置完成
- [ ] ✅ 备份策略已实施
- [ ] ✅ 文档已完成

### 成本确认
- [ ] 了解月度成本估算
- [ ] 设置成本告警（可选）
- [ ] 确认免费额度使用情况

### 下一步
- [ ] 配置自动化部署（CI/CD）
- [ ] 优化性能
- [ ] 添加更多功能
- [ ] 收集用户反馈

---

## 📞 需要帮助？

### 参考文档
- `AWS_EC2_RDS_DEPLOYMENT_GUIDE.md` - 详细部署步骤
- `EC2_RDS_QUICK_COMMANDS.md` - 常用命令参考
- `DEPLOYMENT_PREPARATION_SUMMARY.md` - 准备工作总结

### 常见问题
- 服务无法启动 → 查看日志
- 数据库连接失败 → 检查安全组
- 前端无法访问后端 → 检查 CORS 配置
- SSL 证书问题 → 重新申请或检查 DNS

---

**检查清单版本**: 1.0  
**最后更新**: 2025-11-14  
**预计完成时间**: 3-4 小时

---

## 🎯 快速进度追踪

```
□ 步骤 1: RDS 配置 (30 分钟)
□ 步骤 2: EC2 配置 (30 分钟)
□ 步骤 3: 后端部署 (90 分钟)
□ 步骤 4: 前端部署 (60 分钟)
□ 步骤 5: 域名和 SSL (60 分钟)
□ 步骤 6: 验证测试 (30 分钟)
□ 步骤 7: 监控备份 (30 分钟)
□ 步骤 8: 清理文档 (15 分钟)
─────────────────────────────────
总计: 约 3-4 小时
```

**祝部署顺利！** 🚀

