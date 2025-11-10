# 数据模型设计 - 用户认证与订阅系统

## 📋 概述

本文档定义用户认证与订阅系统所需的数据库表结构和关系。

---

## 🗄️ 数据库表

### 1. users（用户表）

存储所有用户信息（管理员和注册用户）。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PRIMARY KEY | 用户唯一标识 |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 邮箱地址 |
| username | VARCHAR(100) | UNIQUE, NULL | 用户名（管理员必填） |
| password_hash | VARCHAR(255) | NULL | 密码哈希（OAuth 用户可为空） |
| display_name | VARCHAR(100) | NULL | 显示名称/昵称 |
| avatar_url | TEXT | NULL | 头像 URL |
| role | VARCHAR(20) | NOT NULL, DEFAULT 'user' | 角色：admin/user |
| auth_provider | VARCHAR(50) | NOT NULL, DEFAULT 'email' | 认证方式：email/google |
| google_id | VARCHAR(255) | UNIQUE, NULL | Google 用户 ID |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | 账号是否激活 |
| is_verified | BOOLEAN | NOT NULL, DEFAULT false | 邮箱是否验证 |
| last_login_at | TIMESTAMPTZ | NULL | 最后登录时间 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 更新时间 |

**索引**：
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_role ON users(role);
```

**约束**：
```sql
ALTER TABLE users ADD CONSTRAINT check_role 
  CHECK (role IN ('admin', 'user'));

ALTER TABLE users ADD CONSTRAINT check_auth_provider 
  CHECK (auth_provider IN ('email', 'google'));

-- 管理员必须有用户名
ALTER TABLE users ADD CONSTRAINT check_admin_username 
  CHECK (role != 'admin' OR username IS NOT NULL);

-- 邮箱登录必须有密码
ALTER TABLE users ADD CONSTRAINT check_email_password 
  CHECK (auth_provider != 'email' OR password_hash IS NOT NULL);
```

---

### 2. email_verifications（邮箱验证表）

存储邮箱验证码。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PRIMARY KEY | 验证记录 ID |
| email | VARCHAR(255) | NOT NULL | 邮箱地址 |
| code | VARCHAR(6) | NOT NULL | 验证码（6位数字） |
| purpose | VARCHAR(50) | NOT NULL | 用途：register/login/reset_password |
| is_used | BOOLEAN | NOT NULL, DEFAULT false | 是否已使用 |
| expires_at | TIMESTAMPTZ | NOT NULL | 过期时间（10分钟） |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 创建时间 |

**索引**：
```sql
CREATE INDEX idx_email_verifications_email ON email_verifications(email);
CREATE INDEX idx_email_verifications_code ON email_verifications(code);
CREATE INDEX idx_email_verifications_expires ON email_verifications(expires_at);
```

**约束**：
```sql
ALTER TABLE email_verifications ADD CONSTRAINT check_purpose 
  CHECK (purpose IN ('register', 'login', 'reset_password'));
```

---

### 3. subscriptions（订阅表）

存储用户订阅信息。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PRIMARY KEY | 订阅 ID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 订阅邮箱 |
| user_id | UUID | NULL, FK → users.id | 关联用户（可选） |
| subscription_types | TEXT[] | NOT NULL, DEFAULT '{}' | 订阅类型数组 |
| frequency | VARCHAR(20) | NOT NULL, DEFAULT 'weekly' | 推送频率 |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'active' | 状态 |
| source | VARCHAR(50) | NULL | 订阅来源 |
| confirmed_at | TIMESTAMPTZ | NULL | 确认时间 |
| unsubscribed_at | TIMESTAMPTZ | NULL | 退订时间 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 更新时间 |

**订阅类型**（subscription_types）：
- `article_updates` - 文章更新
- `market_analysis` - 市场分析
- `announcements` - 重要公告

**推送频率**（frequency）：
- `realtime` - 实时推送
- `daily` - 每日摘要
- `weekly` - 每周摘要

**状态**（status）：
- `pending` - 待确认
- `active` - 活跃
- `paused` - 暂停
- `unsubscribed` - 已退订

**索引**：
```sql
CREATE INDEX idx_subscriptions_email ON subscriptions(email);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_created ON subscriptions(created_at);
```

**约束**：
```sql
ALTER TABLE subscriptions ADD CONSTRAINT check_frequency 
  CHECK (frequency IN ('realtime', 'daily', 'weekly'));

ALTER TABLE subscriptions ADD CONSTRAINT check_status 
  CHECK (status IN ('pending', 'active', 'paused', 'unsubscribed'));

ALTER TABLE subscriptions ADD CONSTRAINT fk_subscriptions_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
```

---

### 4. subscription_logs（订阅日志表）

记录订阅相关的操作日志。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PRIMARY KEY | 日志 ID |
| subscription_id | UUID | NOT NULL, FK → subscriptions.id | 订阅 ID |
| action | VARCHAR(50) | NOT NULL | 操作类型 |
| details | JSONB | NULL | 详细信息 |
| ip_address | VARCHAR(45) | NULL | IP 地址 |
| user_agent | TEXT | NULL | 用户代理 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 创建时间 |

**操作类型**（action）：
- `subscribed` - 订阅
- `confirmed` - 确认
- `updated` - 更新
- `paused` - 暂停
- `resumed` - 恢复
- `unsubscribed` - 退订

**索引**：
```sql
CREATE INDEX idx_subscription_logs_subscription ON subscription_logs(subscription_id);
CREATE INDEX idx_subscription_logs_action ON subscription_logs(action);
CREATE INDEX idx_subscription_logs_created ON subscription_logs(created_at);
```

**约束**：
```sql
ALTER TABLE subscription_logs ADD CONSTRAINT fk_subscription_logs_subscription 
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE;
```

---

### 5. email_campaigns（邮件活动表）

存储群发邮件活动。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PRIMARY KEY | 活动 ID |
| name | VARCHAR(200) | NOT NULL | 活动名称 |
| subject | VARCHAR(500) | NOT NULL | 邮件主题 |
| content_html | TEXT | NOT NULL | HTML 内容 |
| content_text | TEXT | NULL | 纯文本内容 |
| target_types | TEXT[] | NOT NULL | 目标订阅类型 |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'draft' | 状态 |
| scheduled_at | TIMESTAMPTZ | NULL | 计划发送时间 |
| sent_at | TIMESTAMPTZ | NULL | 实际发送时间 |
| total_recipients | INTEGER | DEFAULT 0 | 总收件人数 |
| sent_count | INTEGER | DEFAULT 0 | 已发送数 |
| opened_count | INTEGER | DEFAULT 0 | 打开数 |
| clicked_count | INTEGER | DEFAULT 0 | 点击数 |
| created_by | UUID | NOT NULL, FK → users.id | 创建人 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 更新时间 |

**状态**（status）：
- `draft` - 草稿
- `scheduled` - 已计划
- `sending` - 发送中
- `sent` - 已发送
- `cancelled` - 已取消

**索引**：
```sql
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaigns_scheduled ON email_campaigns(scheduled_at);
CREATE INDEX idx_email_campaigns_created_by ON email_campaigns(created_by);
```

---

### 6. refresh_tokens（刷新令牌表）

存储 JWT 刷新令牌。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PRIMARY KEY | 令牌 ID |
| user_id | UUID | NOT NULL, FK → users.id | 用户 ID |
| token | VARCHAR(500) | UNIQUE, NOT NULL | 刷新令牌 |
| expires_at | TIMESTAMPTZ | NOT NULL | 过期时间 |
| is_revoked | BOOLEAN | NOT NULL, DEFAULT false | 是否已撤销 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 创建时间 |

**索引**：
```sql
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);
```

**约束**：
```sql
ALTER TABLE refresh_tokens ADD CONSTRAINT fk_refresh_tokens_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
```

---

## 🔗 表关系图

```
users (1) ──────────── (0..n) subscriptions
  │                              │
  │                              │
  │                              └─── (1..n) subscription_logs
  │
  ├─────────────── (0..n) refresh_tokens
  │
  └─────────────── (0..n) email_campaigns (created_by)

email_verifications (独立表，通过 email 关联)
```

---

## 📝 初始数据

### 默认管理员账号

```sql
INSERT INTO users (
  id, 
  email, 
  username, 
  password_hash, 
  display_name, 
  role, 
  auth_provider, 
  is_active, 
  is_verified
) VALUES (
  gen_random_uuid(),
  'admin@example.com',
  'admin',
  '$2b$12$...',  -- 密码: admin123 (需要实际加密)
  'Administrator',
  'admin',
  'email',
  true,
  true
);
```

---

## 🔄 数据迁移

### 从现有系统迁移

如果已有用户数据，需要：

1. **保留现有管理员账号**
2. **添加新字段**（role, auth_provider 等）
3. **设置默认值**
4. **数据验证**

---

*最后更新: 2025-11-10*

