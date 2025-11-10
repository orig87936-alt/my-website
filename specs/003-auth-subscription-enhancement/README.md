# 003 - 用户认证与订阅系统增强

## 📋 项目概述

将网站从强制登录模式改为开放访问模式，同时增强用户认证和订阅功能，提供更好的用户体验。

**状态**: 🟡 规划中  
**优先级**: 🔴 高  
**预计工时**: 9 天  
**开始日期**: 2025-11-12  
**目标上线**: 2025-11-24

---

## 🎯 核心目标

### 1. 开放访问 🌐
- 访客无需登录即可浏览网站内容
- 取消强制登录页面
- 提升用户体验和 SEO

### 2. 多种认证方式 🔐
- 管理员：用户名 + 密码
- 访客：邮箱 + 密码 + 验证码
- OAuth：Google 账号一键登录

### 3. 完善订阅系统 📬
- 用户可订阅网站更新
- 支持多种订阅类型和频率
- 管理员可查看和管理订阅列表

---

## 📚 文档结构

```
specs/003-auth-subscription-enhancement/
├── README.md                    # 本文件 - 项目概览
├── spec.md                      # 功能规格文档
├── data-model.md                # 数据库设计
├── plan.md                      # 实施计划
├── tasks.md                     # 任务清单
├── quickstart.md                # 快速开始指南
└── contracts/
    └── api.md                   # API 接口文档
```

---

## 🚀 快速开始

### 1. 阅读文档
```bash
# 了解功能需求
cat spec.md

# 查看数据库设计
cat data-model.md

# 查看 API 接口
cat contracts/api.md
```

### 2. 开始开发
```bash
# 查看任务清单
cat tasks.md

# 按照快速开始指南配置环境
cat quickstart.md
```

### 3. 执行迁移
```bash
cd backend
alembic revision -m "add_auth_subscription_tables"
alembic upgrade head
```

---

## 📊 功能清单

### ✅ 已完成
- [x] 功能规格文档
- [x] 数据库设计
- [x] API 接口设计
- [x] 实施计划
- [x] 任务清单

### 🔄 进行中
- [ ] 数据库迁移
- [ ] 后端开发
- [ ] 前端开发

### ⏳ 待开始
- [ ] 测试
- [ ] 部署上线

---

## 🗄️ 数据库表

### 新增表
1. **users** - 用户表（管理员 + 注册用户）
2. **email_verifications** - 邮箱验证码表
3. **subscriptions** - 订阅表
4. **subscription_logs** - 订阅日志表
5. **email_campaigns** - 邮件活动表
6. **refresh_tokens** - 刷新令牌表

详见 [data-model.md](./data-model.md)

---

## 🔌 API 端点

### 认证接口
- `POST /auth/register` - 用户注册
- `POST /auth/login` - 邮箱登录
- `POST /auth/admin-login` - 管理员登录
- `POST /auth/refresh` - 刷新 Token
- `POST /auth/logout` - 退出登录
- `GET /auth/me` - 获取当前用户
- `PUT /auth/me` - 更新用户信息

### Google OAuth
- `GET /auth/google/url` - 获取 OAuth URL
- `GET /auth/google/callback` - OAuth 回调
- `POST /auth/google/token` - Google Token 登录

### 邮箱验证
- `POST /verification/send` - 发送验证码
- `POST /verification/verify` - 验证验证码

### 订阅管理
- `POST /subscriptions` - 创建订阅
- `GET /subscriptions/confirm/{token}` - 确认订阅
- `GET /subscriptions` - 获取订阅列表（管理员）
- `PUT /subscriptions/{id}` - 更新订阅（管理员）
- `DELETE /subscriptions/{id}` - 删除订阅（管理员）
- `GET /subscriptions/export` - 导出订阅（管理员）
- `GET /subscriptions/unsubscribe/{token}` - 退订

详见 [contracts/api.md](./contracts/api.md)

---

## 🎨 UI 改动

### 头部导航
```
未登录: [Logo] [导航] [语言] [登录] [注册]
已登录: [Logo] [导航] [语言] [用户菜单▼]
管理员: [Logo] [导航] [语言] [管理员菜单▼]
```

### 新增组件
- `LoginModal` - 登录弹窗
- `RegisterModal` - 注册弹窗
- `GoogleLoginButton` - Google 登录按钮
- `UserMenu` - 用户下拉菜单
- `SubscriptionForm` - 订阅表单（优化）
- `SubscriptionManagement` - 订阅管理页面（管理员）

---

## 🔧 技术栈

### 后端
- **框架**: FastAPI
- **ORM**: SQLAlchemy
- **认证**: PyJWT + bcrypt
- **OAuth**: google-auth
- **邮件**: aiosmtplib / SendGrid

### 前端
- **框架**: React 18 + TypeScript
- **路由**: React Router
- **状态**: Zustand / Redux
- **表单**: React Hook Form + Zod
- **OAuth**: @react-oauth/google

### 第三方服务
- **Google OAuth 2.0**
- **邮件服务**: SMTP / SendGrid / AWS SES

---

## 📅 时间线

| 阶段 | 时间 | 状态 |
|------|------|------|
| 准备与设计 | 2025-11-10 ~ 11-11 | ✅ 完成 |
| 后端开发 | 2025-11-12 ~ 11-15 | ⏳ 待开始 |
| 前端开发 | 2025-11-16 ~ 11-19 | ⏳ 待开始 |
| 邮件系统 | 2025-11-20 | ⏳ 待开始 |
| 测试 | 2025-11-21 ~ 11-23 | ⏳ 待开始 |
| 部署上线 | 2025-11-24 | ⏳ 待开始 |

---

## ⚠️ 注意事项

### 安全性
- ✅ 密码必须加密存储（bcrypt）
- ✅ 防止 SQL 注入、XSS、CSRF 攻击
- ✅ 限制登录尝试次数
- ✅ Token 定期刷新

### 隐私保护
- ✅ 遵守 GDPR 规定
- ✅ 提供隐私政策
- ✅ 支持数据删除请求
- ✅ 邮件提供退订链接

### 性能优化
- ✅ 使用 Redis 缓存
- ✅ 异步发送邮件
- ✅ 数据库索引优化
- ✅ 前端代码分割

---

## 📈 成功指标

### 技术指标
- 登录响应时间 < 500ms
- 注册响应时间 < 1s
- 邮件发送延迟 < 5s
- 单元测试覆盖率 > 80%

### 业务指标
- 注册转化率 > 30%
- 订阅转化率 > 20%
- 邮件打开率 > 25%
- 退订率 < 5%

---

## 🔗 相关资源

### 文档
- [功能规格](./spec.md)
- [数据模型](./data-model.md)
- [API 接口](./contracts/api.md)
- [实施计划](./plan.md)
- [任务清单](./tasks.md)
- [快速开始](./quickstart.md)

### 外部资源
- [Google OAuth 文档](https://developers.google.com/identity/protocols/oauth2)
- [FastAPI 文档](https://fastapi.tiangolo.com/)
- [React OAuth Google](https://www.npmjs.com/package/@react-oauth/google)
- [SendGrid 文档](https://docs.sendgrid.com/)

---

## 👥 团队

- **产品负责人**: 用户
- **开发负责人**: AI Assistant
- **测试负责人**: 用户

---

## 📝 更新日志

### 2025-11-10
- ✅ 创建项目规格文档
- ✅ 完成数据库设计
- ✅ 完成 API 接口设计
- ✅ 制定实施计划
- ✅ 编写任务清单
- ✅ 编写快速开始指南

---

## 🆘 获取帮助

如果在实施过程中遇到问题：

1. 查看 [快速开始指南](./quickstart.md) 的故障排查部分
2. 检查 [API 文档](./contracts/api.md)
3. 查看后端日志和浏览器控制台
4. 参考外部资源文档

---

**准备好开始了吗？** 👉 查看 [快速开始指南](./quickstart.md)

*最后更新: 2025-11-10*

