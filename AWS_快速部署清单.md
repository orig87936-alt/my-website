# ✅ AWS 快速部署清单

使用此清单确保你完成了所有必要的步骤。

---

## 📋 部署前准备

### AWS 账号设置
- [ ] 注册 AWS 账号
- [ ] 绑定信用卡
- [ ] 启用 MFA（多因素认证）
- [ ] 创建 IAM 用户
- [ ] 下载访问密钥 CSV 文件
- [ ] 安装 AWS CLI
- [ ] 配置 AWS CLI (`aws configure`)
- [ ] 验证配置 (`aws sts get-caller-identity`)

### 第三方服务准备
- [ ] 获取 OpenAI API Key（必需）
- [ ] 获取 Resend API Key（可选，用于邮件）
- [ ] 配置 Google OAuth（可选，用于 Google 登录）
- [ ] 准备域名（可选，用于自定义域名）

---

## 🗄️ 数据库部署（RDS PostgreSQL）

### 创建 RDS 实例
- [ ] 进入 RDS 控制台
- [ ] 创建 PostgreSQL 数据库
  - [ ] 引擎：PostgreSQL 14+
  - [ ] 实例标识符：`sl-news-db`
  - [ ] 主用户名：`postgres`
  - [ ] 设置强密码（记录下来）
  - [ ] 实例类：`db.t3.micro` 或 `db.t3.small`
  - [ ] 存储：20 GB
  - [ ] 公开访问：是
  - [ ] 初始数据库名：`newsdb`

### 配置安全组
- [ ] 编辑 RDS 安全组入站规则
- [ ] 添加 PostgreSQL (5432) 规则
- [ ] 源：`0.0.0.0/0`（暂时）

### 验证数据库
- [ ] 复制 RDS 终端节点
- [ ] 测试数据库连接
- [ ] 安装 pgvector 扩展
  ```sql
  CREATE EXTENSION IF NOT EXISTS vector;
  ```

**记录信息**：
```
RDS 终端节点: _______________________________
数据库名: newsdb
用户名: postgres
密码: _______________________________
```

---

## 🖥️ 后端部署（EC2）

### 创建 EC2 实例
- [ ] 进入 EC2 控制台
- [ ] 启动实例
  - [ ] 名称：`sl-news-backend`
  - [ ] AMI：Ubuntu Server 22.04 LTS
  - [ ] 实例类型：`t3.small` 或 `t2.micro`
  - [ ] 创建密钥对：`sl-news-key`
  - [ ] 下载密钥文件（.pem 或 .ppk）
  - [ ] 创建安全组：`sl-news-backend-sg`
    - [ ] SSH (22) - 我的 IP
    - [ ] HTTP (80) - 任何位置
    - [ ] HTTPS (443) - 任何位置
    - [ ] 自定义 TCP (8000) - 任何位置
  - [ ] 存储：20 GB gp3

### 分配弹性 IP
- [ ] 分配弹性 IP
- [ ] 关联到 EC2 实例
- [ ] 记录弹性 IP：`_______________________________`

### 连接到 EC2
- [ ] 使用 SSH 连接到 EC2
  ```powershell
  ssh -i sl-news-key.pem ubuntu@[弹性IP]
  ```

### 安装依赖
- [ ] 更新系统：`sudo apt update && sudo apt upgrade -y`
- [ ] 安装 Python 3.11
- [ ] 安装 Git、Nginx、PostgreSQL 客户端
- [ ] 验证安装

### 部署代码
- [ ] 克隆代码仓库（或使用 SCP 上传）
- [ ] 创建虚拟环境
- [ ] 安装 Python 依赖
- [ ] 创建 `.env` 文件
- [ ] 配置环境变量（数据库、API 密钥等）

### 数据库迁移
- [ ] 运行 `alembic upgrade head`
- [ ] 验证数据库连接

### 配置服务
- [ ] 创建 Systemd 服务文件
- [ ] 启用并启动服务
- [ ] 检查服务状态
- [ ] 查看日志确认无错误

### 配置 Nginx
- [ ] 创建 Nginx 配置文件
- [ ] 启用配置
- [ ] 测试配置：`sudo nginx -t`
- [ ] 重启 Nginx

### 验证后端
- [ ] 访问 `http://[弹性IP]/docs`
- [ ] 确认看到 FastAPI 文档页面

---

## 🌐 前端部署（S3 + CloudFront）

### 构建前端
- [ ] 创建 `.env.production` 文件
- [ ] 配置 `VITE_API_BASE_URL=http://[弹性IP]`
- [ ] 运行 `npm run build`
- [ ] 确认 `build/` 目录存在

### 创建 S3 存储桶
- [ ] 进入 S3 控制台
- [ ] 创建存储桶
  - [ ] 名称：`sl-news-frontend-[随机数字]`
  - [ ] 区域：与 EC2 相同
  - [ ] 取消勾选"阻止所有公共访问"
- [ ] 记录存储桶名称：`_______________________________`

### 配置 S3
- [ ] 启用静态网站托管
  - [ ] 索引文档：`index.html`
  - [ ] 错误文档：`index.html`
- [ ] 设置存储桶策略（允许公共读取）
- [ ] 记录 S3 网站 URL：`_______________________________`

### 上传文件
- [ ] 使用 AWS CLI 上传：`aws s3 sync build/ s3://[存储桶名]/ --delete`
- [ ] 或使用控制台上传

### 测试 S3 网站
- [ ] 访问 S3 网站 URL
- [ ] 确认网站可访问

### 创建 CloudFront 分发
- [ ] 进入 CloudFront 控制台
- [ ] 创建分发
  - [ ] 源域：S3 网站终端节点
  - [ ] 查看器协议策略：Redirect HTTP to HTTPS
  - [ ] 默认根对象：`index.html`
- [ ] 等待分发部署（10-15 分钟）
- [ ] 记录 CloudFront 域名：`_______________________________`

### 配置错误页面
- [ ] 添加自定义错误响应（403 → /index.html）
- [ ] 添加自定义错误响应（404 → /index.html）

### 测试 CloudFront
- [ ] 访问 CloudFront 域名
- [ ] 确认网站通过 HTTPS 访问

---

## 🔐 域名和 SSL（可选）

### 申请 SSL 证书
- [ ] 切换到 us-east-1 区域
- [ ] 进入 Certificate Manager
- [ ] 请求公有证书
  - [ ] 域名：`yourdomain.com` 和 `*.yourdomain.com`
  - [ ] 验证方法：DNS 验证
- [ ] 添加 CNAME 记录到 DNS
- [ ] 等待验证通过

### 配置 CloudFront
- [ ] 编辑 CloudFront 分发
- [ ] 添加备用域名：`yourdomain.com`
- [ ] 选择自定义 SSL 证书

### 配置 DNS
- [ ] 添加 A 记录（别名）指向 CloudFront
- [ ] 添加 A 记录 `api.yourdomain.com` 指向 EC2 弹性 IP

### 配置后端 SSL
- [ ] 在 EC2 上安装 Certbot
- [ ] 获取 Let's Encrypt 证书
- [ ] 配置自动续期

### 更新环境变量
- [ ] 更新后端 `.env`：`CORS_ORIGINS`、`FRONTEND_URL`
- [ ] 更新前端 `.env.production`：`VITE_API_BASE_URL`
- [ ] 重新构建并部署前端
- [ ] 重启后端服务

---

## 🔑 第三方服务配置

### Resend 邮件服务
- [ ] 注册 Resend 账号
- [ ] 创建 API Key
- [ ] 添加域名
- [ ] 配置 DNS 记录（TXT 和 MX）
- [ ] 等待验证通过
- [ ] 更新后端 `.env`：`RESEND_API_KEY`、`EMAIL_FROM`

### Google OAuth
- [ ] 创建 Google Cloud 项目
- [ ] 启用 Google+ API
- [ ] 配置 OAuth 同意屏幕
- [ ] 创建 OAuth 2.0 凭据
- [ ] 添加授权重定向 URI
- [ ] 更新后端 `.env`：`GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET`
- [ ] 更新前端 `.env.production`：`VITE_GOOGLE_CLIENT_ID`

### OpenAI API
- [ ] 注册 OpenAI 账号
- [ ] 创建 API Key
- [ ] 充值至少 $5
- [ ] 更新后端 `.env`：`OPENAI_API_KEY`

### 重启服务
- [ ] 重启后端服务
- [ ] 重新构建并部署前端

---

## ✅ 测试和验证

### 功能测试
- [ ] 访问前端网站
- [ ] 访问后端 API 文档
- [ ] 测试用户注册（邮箱验证码）
- [ ] 测试 Google 登录
- [ ] 测试新闻浏览
- [ ] 测试管理员登录
- [ ] 测试新闻发布
- [ ] 测试图片上传
- [ ] 测试 AI 聊天机器人
- [ ] 测试文档翻译
- [ ] 测试预约功能

### 性能测试
- [ ] 测试页面加载速度
- [ ] 测试 API 响应时间
- [ ] 检查 CloudFront 缓存是否生效

### 安全检查
- [ ] 确认 HTTPS 正常工作
- [ ] 检查 CORS 配置
- [ ] 验证 JWT 认证
- [ ] 检查敏感信息是否泄露

---

## 📊 监控和维护

### 设置监控
- [ ] 配置 AWS CloudWatch 告警
- [ ] 设置成本告警
- [ ] 配置日志监控

### 备份策略
- [ ] 启用 RDS 自动备份
- [ ] 配置 S3 版本控制
- [ ] 创建 EC2 快照

### 文档记录
- [ ] 记录所有密码和密钥（安全存储）
- [ ] 记录 AWS 资源 ID
- [ ] 创建运维文档

---

## 🎉 部署完成

**最终访问地址**：
- 前端：`https://yourdomain.com` 或 `https://[CloudFront域名]`
- 后端 API：`https://api.yourdomain.com/docs` 或 `http://[弹性IP]/docs`

**预计月度成本**：$36-60（使用免费套餐可降至 $0-20）

**下一步**：
1. 监控成本和性能
2. 优化缓存策略
3. 配置 CDN 加速
4. 实施安全加固
5. 设置自动化部署

---

## 📞 需要帮助？

如果遇到问题，请检查：
1. AWS 控制台中的服务状态
2. EC2 日志：`sudo journalctl -u sl-news-backend -f`
3. Nginx 日志：`sudo tail -f /var/log/nginx/error.log`
4. CloudFront 分发状态

常见问题解决方案请参考 `AWS_部署实施指南.md`。

