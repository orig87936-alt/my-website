# Change: 添加预约双向邮件通知

## Why

### 当前状态
- ✅ 用户确认邮件**代码已实现**（`EmailService.send_appointment_confirmation`）
- ⚠️ 但**未配置 Resend API Key**，邮件实际上不会发送（只打印日志）
- ❌ 公司通知邮件**完全未实现**

### 存在的问题
1. 用户预约后收不到确认邮件（因为未配置邮件服务）
2. 公司无法及时收到新预约的通知
3. 公司需要手动登录后台查看新预约
4. 可能错过重要的预约请求
5. 响应时间较慢，影响客户体验

### 改进目标
添加双向邮件通知功能可以：
- ✅ 配置邮件服务，让用户真正收到确认邮件
- 🆕 实时通知公司有新预约
- 📈 提高响应速度
- 😊 改善客户服务质量

## What Changes

- 在用户完成预约后，系统自动发送两封邮件：
  1. **用户确认邮件**（✅ 已存在）- 包含预约详情和确认号
  2. **公司通知邮件**（🆕 新增）- 包含客户信息和预约详情
- 添加公司邮箱配置项到环境变量（COMPANY_NOTIFICATION_EMAIL）
- 创建公司通知邮件 HTML 模板
- 在 EmailService 中添加发送公司通知邮件的方法
- 在预约创建流程中添加公司通知邮件后台任务
- 增强邮件发送失败的日志记录

## Impact

### 受影响的规格 (Specs)
- `appointment-system` - 预约系统核心功能

### 受影响的代码
- `backend/app/services/email.py` - 添加公司通知邮件方法
- `backend/app/routers/appointments.py` - 更新预约创建流程，添加公司通知任务
- `backend/app/config.py` - 添加公司邮箱配置
- `backend/.env.example` - 添加配置示例
- `backend/app/templates/emails/` - 新增公司通知邮件模板

### 数据库变更
- 无需数据库变更

### API 变更
- 无 API 接口变更（仅后台逻辑）

### 配置变更
- 新增环境变量：`COMPANY_NOTIFICATION_EMAIL`（公司接收通知的邮箱地址）

## 风险评估

### 低风险
- 不影响现有用户确认邮件功能
- 不改变 API 接口
- 向后兼容（如果未配置公司邮箱，只发送用户邮件）

### 注意事项
- **必须配置有效的 Resend API Key** 才能真正发送邮件
- 需要配置有效的公司邮箱地址
- 邮件发送失败不应阻塞预约流程
- 需要测试邮件模板在不同邮件客户端的显示效果

## 前置条件

### 必须完成的配置
在实施此功能之前，需要：
1. **注册 Resend 账号** - https://resend.com
2. **获取 API Key** - 在 Resend 控制台创建 API Key
3. **配置环境变量**：
   - `RESEND_API_KEY` - Resend API Key（当前未配置）
   - `EMAIL_FROM` - 发件人邮箱（需要在 Resend 验证域名）
   - `COMPANY_NOTIFICATION_EMAIL` - 公司接收通知的邮箱（新增）

### 可选配置
- 自定义邮件模板样式
- 配置邮件发送重试策略

