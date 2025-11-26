# Delta for Document Upload

## MODIFIED Requirements

### Requirement: 后端 API URL 配置
系统 MUST 使用正确的后端 API URL 进行内部服务调用。

#### Scenario: 生产环境配置
- **WHEN** 系统部署到生产环境
- **THEN** BACKEND_URL 应配置为 `http://api.s-l.ai` 或 `http://127.0.0.1:8000`
- **AND** 不应使用 `http://localhost:8000`（可能在容器环境中失败）

#### Scenario: 开发环境配置
- **WHEN** 系统在本地开发环境运行
- **THEN** BACKEND_URL 可以使用 `http://localhost:8000`
- **AND** 应通过环境变量灵活配置

### Requirement: 图片上传错误处理
系统 SHALL 提供健壮的图片上传错误处理机制。

#### Scenario: 上传失败重试
- **WHEN** 图片上传失败（网络错误、超时等）
- **THEN** 系统应自动重试最多 3 次
- **AND** 每次重试间隔递增（1s, 2s, 4s）

#### Scenario: 连接被拒绝错误
- **WHEN** 出现 ERR_CONNECTION_REFUSED 错误
- **THEN** 系统应记录详细错误日志
- **AND** 返回用户友好的错误消息
- **AND** 提示检查后端服务状态

#### Scenario: 部分图片上传失败
- **WHEN** 文档中有多张图片，部分上传失败
- **THEN** 系统应继续处理其他图片
- **AND** 在响应中标记哪些图片失败
- **AND** 不应导致整个文档上传失败

## ADDED Requirements

### Requirement: 图片上传日志记录
系统 MUST 记录详细的图片上传日志以便调试。

#### Scenario: 上传过程日志
- **WHEN** 开始上传图片
- **THEN** 记录图片文件名、大小、格式
- **AND** 记录目标 URL
- **AND** 记录上传结果（成功/失败）

#### Scenario: 错误详情日志
- **WHEN** 上传失败
- **THEN** 记录完整的错误堆栈
- **AND** 记录 HTTP 状态码和响应内容
- **AND** 记录重试次数

### Requirement: 内部函数调用优化
系统 SHOULD 优先使用内部函数调用而非 HTTP 请求。

#### Scenario: 同进程图片上传
- **WHEN** 文档解析服务需要上传图片
- **THEN** 应直接调用上传服务的内部函数
- **AND** 避免通过 HTTP 请求自己的 API
- **AND** 减少网络开销和潜在错误

#### Scenario: HTTP 请求作为备选
- **WHEN** 内部函数调用不可用
- **THEN** 可以使用 HTTP 请求作为备选方案
- **AND** 使用正确配置的 BACKEND_URL

### Requirement: 环境变量验证
系统 SHALL 在启动时验证关键环境变量。

#### Scenario: 启动时配置检查
- **WHEN** 应用启动
- **THEN** 验证 BACKEND_URL 已配置
- **AND** 验证 URL 格式正确
- **AND** 记录警告如果使用默认值

#### Scenario: 配置错误提示
- **WHEN** 检测到配置错误
- **THEN** 在日志中输出清晰的错误信息
- **AND** 提供修复建议
- **AND** 不应静默失败

## ADDED Requirements

### Requirement: Nginx 配置验证
系统部署 MUST 确保 Nginx 正确配置以支持文档上传。

#### Scenario: 文件大小限制
- **WHEN** 部署到生产环境
- **THEN** Nginx client_max_body_size 应至少为 50MB
- **AND** 与后端 MAX_FILE_SIZE 配置一致

#### Scenario: 超时设置
- **WHEN** 上传大文件或处理复杂文档
- **THEN** Nginx 超时设置应至少 300 秒
- **AND** 包括 proxy_connect_timeout, proxy_send_timeout, proxy_read_timeout

#### Scenario: 缓冲设置
- **WHEN** 处理文件上传
- **THEN** 应禁用 proxy_request_buffering
- **AND** 应禁用 proxy_buffering
- **AND** 允许流式上传

