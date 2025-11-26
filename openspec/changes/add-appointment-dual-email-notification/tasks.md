# 实施任务清单

## 0. 前置准备 - 配置邮件服务 ⚠️ 必须先完成
- [ ] 0.1 注册 Resend 账号（https://resend.com）
- [ ] 0.2 在 Resend 控制台创建 API Key
- [ ] 0.3 在 Resend 验证发件域名（或使用 Resend 提供的测试域名）
- [ ] 0.4 在 `backend/.env` 配置 `RESEND_API_KEY`（替换占位符）
- [ ] 0.5 在 `backend/.env` 配置 `EMAIL_FROM`（使用已验证的域名邮箱）
- [ ] 0.6 测试现有用户确认邮件是否能正常发送

## 1. 配置更新
- [ ] 1.1 在 `backend/app/config.py` 添加 `COMPANY_NOTIFICATION_EMAIL` 配置项
- [ ] 1.2 更新 `backend/.env` 添加 `COMPANY_NOTIFICATION_EMAIL` 配置
- [ ] 1.3 更新 `backend/.env.example` 添加配置示例
- [ ] 1.4 更新 `backend/.env.production.example` 添加配置示例

## 2. 邮件模板创建
- [ ] 2.1 创建公司通知邮件 HTML 模板 `backend/app/templates/emails/appointment_company_notification.html`
- [ ] 2.2 设计邮件内容包含：客户姓名、联系方式、预约时间、服务类型、备注
- [ ] 2.3 添加邮件样式，保持与现有邮件模板一致的设计风格

## 3. 邮件服务扩展
- [ ] 3.1 在 `EmailService` 类中添加 `send_company_appointment_notification` 方法
- [ ] 3.2 实现邮件内容构建逻辑（HTML 和纯文本版本）
- [ ] 3.3 添加错误处理和日志记录
- [ ] 3.4 支持配置检查（如果未配置公司邮箱则跳过）

## 4. 预约流程更新
- [ ] 4.1 在 `appointments.py` 路由中添加公司通知邮件后台任务
- [ ] 4.2 创建 `send_company_notification_task` 后台任务函数
- [ ] 4.3 确保邮件发送失败不影响预约创建流程
- [ ] 4.4 更新日志记录，区分用户邮件和公司邮件的发送状态

## 5. 测试
- [ ] 5.1 测试用户确认邮件正常发送
- [ ] 5.2 测试公司通知邮件正常发送
- [ ] 5.3 测试未配置公司邮箱时的降级处理
- [ ] 5.4 测试邮件发送失败时的错误处理
- [ ] 5.5 测试邮件内容在不同邮件客户端的显示效果
- [ ] 5.6 更新或创建集成测试脚本

## 6. 文档更新
- [ ] 6.1 更新部署文档，说明新的配置项
- [ ] 6.2 添加邮件模板自定义指南（可选）
- [ ] 6.3 更新 README 或相关文档说明双向邮件通知功能

## 7. 部署准备
- [ ] 7.1 在生产环境配置公司通知邮箱
- [ ] 7.2 验证 Resend API 配额是否足够
- [ ] 7.3 准备回滚方案（如果需要）

