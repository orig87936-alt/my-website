# Change: 修复文档上传图片识别失败问题

## Why
当前文档上传功能存在严重问题：
- DOCX 文档中的图片无法正确识别和上传
- 出现 `ERR_CONNECTION_REFUSED` 错误（连接被拒绝）
- 图片上传 API 调用失败，导致文档解析不完整
- 用户无法正常使用文档上传功能

### 根本原因分析
从截图和代码分析，问题出在：
1. **后端 API URL 配置错误**: `BACKEND_URL` 配置为 `http://localhost:8000`，但在生产环境应该是 `http://api.s-l.ai` 或 `https://18.221.125.254:8000`
2. **图片上传 endpoint 调用失败**: `upload_images_concurrently` 函数尝试调用 `/api/v1/upload/image`，但连接被拒绝
3. **CORS 配置可能不完整**: 虽然有 CORS 配置，但可能缺少对图片上传的特殊处理

## What Changes
- 修复后端 `BACKEND_URL` 配置，使其指向正确的生产环境地址
- 优化图片上传逻辑，添加重试机制和更好的错误处理
- 确保 Nginx 配置支持大文件上传（已有 50MB 限制，需验证）
- 添加详细的日志记录，便于调试
- 改进错误提示，让用户知道具体哪个环节失败

## Impact
- **Affected specs**: document-upload
- **Affected code**:
  - `backend/app/config.py` - 修复 BACKEND_URL 配置
  - `backend/app/services/document_parser.py` - 优化图片上传逻辑
  - `backend/app/routers/documents.py` - 改进错误处理
  - `backend/.env` - 添加生产环境配置
  - `api.s-l.ai-with-upload.conf` - 验证 Nginx 配置
- **Breaking changes**: 无
- **Migration needed**: 需要更新服务器上的 `.env` 文件

## Deployment Architecture
```
用户浏览器 (www.s-l.ai)
    ↓
S3 静态网站 (sl-news-frontend.s3-website.us-east-2.amazonaws.com)
    ↓ API 请求
Nginx (api.s-l.ai:80) → FastAPI (localhost:8000)
    ↓ 图片上传
FastAPI 内部调用 (/api/v1/upload/image)
    ↓
保存到 uploads/images/ 目录
```

### 当前问题
- FastAPI 尝试调用 `http://localhost:8000/api/v1/upload/image`
- 但在 Docker 容器或某些环境中，`localhost` 可能无法正确解析
- 应该使用 `http://127.0.0.1:8000` 或直接调用内部函数

## Benefits
- 用户可以正常上传包含图片的 DOCX 文档
- 图片能够正确提取、转换和上传
- 提供清晰的错误提示，便于问题排查
- 提升系统稳定性和用户体验

