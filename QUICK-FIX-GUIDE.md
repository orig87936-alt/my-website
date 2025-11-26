# 🚀 文档上传修复 - 快速指南

## 问题描述
文档上传时出现 `ERR_CONNECTION_REFUSED` 错误，图片无法正确识别和上传。

## 🏗️ 部署架构
- **前端**: EC2 `/home/ubuntu/frontend` → Nginx → www.s-l.ai
- **后端**: EC2 FastAPI (localhost:8000) → Nginx → api.s-l.ai
- **服务器**: 18.221.125.254 (同一台 EC2)

## 🔧 快速修复步骤

### 步骤 1: 更新本地代码
已完成以下修改：
- ✅ `backend/app/config.py` - 修复 BACKEND_URL 配置，添加验证逻辑
- ✅ `backend/app/services/document_parser.py` - 添加重试机制和错误处理
- ✅ `backend/.env` - 添加 BACKEND_URL 配置

### 步骤 2: 部署到生产环境

#### 方式 A: 使用部署脚本（推荐）
```powershell
.\deploy-fix-document-upload.ps1
```

#### 方式 B: 手动部署
```powershell
# 1. 上传文件
scp -i D:\download\sl-news-key.pem backend/app/config.py ubuntu@18.221.125.254:/home/ubuntu/backend/app/
scp -i D:\download\sl-news-key.pem backend/app/services/document_parser.py ubuntu@18.221.125.254:/home/ubuntu/backend/app/services/
scp -i D:\download\sl-news-key.pem backend/.env ubuntu@18.221.125.254:/home/ubuntu/backend/

# 2. 重启服务
ssh -i D:\download\sl-news-key.pem ubuntu@18.221.125.254
cd /home/ubuntu/backend
sudo systemctl restart news-backend
sudo systemctl status news-backend
```

### 步骤 3: 验证修复

#### 3.1 检查后端日志
```bash
ssh -i ~/.ssh/aws-key.pem ubuntu@18.221.125.254
sudo journalctl -u news-backend -n 50
```

查找以下日志：
- `✅ BACKEND_URL 配置: http://127.0.0.1:8000`
- 如果看到警告，根据提示调整配置

#### 3.2 测试文档上传
1. 访问前端: http://www.s-l.ai
2. 登录管理员账号
3. 上传一个包含图片的 DOCX 文档
4. 检查浏览器控制台是否还有错误
5. 验证图片是否正确显示

#### 3.3 使用测试脚本（可选）
```powershell
.\test-document-upload.ps1
```

## 📋 关键配置说明

### BACKEND_URL 配置
```bash
# backend/.env
BACKEND_URL=http://127.0.0.1:8000
```

**为什么使用 127.0.0.1 而不是 localhost？**
- 在某些环境中，`localhost` 可能无法正确解析
- `127.0.0.1` 更明确且可靠
- 这个 URL 用于后端内部调用，不是给前端使用的

### 重试机制
- 最多重试 3 次
- 延迟递增：1秒 → 2秒 → 4秒
- 自动处理连接错误、超时等异常

### 超时设置
- 总超时：30 秒
- 连接超时：10 秒

## 🔍 故障排查

### 如果还是出现错误：

#### 1. 检查 BACKEND_URL 配置
```bash
ssh -i D:\download\sl-news-key.pem ubuntu@18.221.125.254
cd /home/ubuntu/backend
grep BACKEND_URL .env
```

应该看到：
```
BACKEND_URL=http://127.0.0.1:8000
```

#### 2. 检查后端服务是否运行
```bash
sudo systemctl status news-backend
sudo netstat -tlnp | grep 8000
```

#### 3. 测试内部 API
```bash
curl -X GET http://127.0.0.1:8000/health
```

#### 4. 查看详细日志
```bash
sudo journalctl -u news-backend -f
```

上传文档时观察日志输出，查找：
- `📤 上传图片` - 开始上传
- `✅ 上传成功` - 成功
- `❌ 上传失败` - 失败（查看错误详情）
- `🔄 重试上传` - 触发重试

### 常见错误及解决方案

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| ERR_CONNECTION_REFUSED | BACKEND_URL 配置错误 | 修改为 `http://127.0.0.1:8000` |
| 上传超时 | 图片太大或网络慢 | 增加超时时间或压缩图片 |
| 权限错误 | uploads 目录权限不足 | `chmod 755 backend/uploads/images/` |
| 格式不支持 | WMF/EMF 转换失败 | 检查 Pillow 库是否正确安装 |

## 📚 相关文档

- 详细故障排查指南: `docs/troubleshooting-document-upload.md`
- OpenSpec 变更提案: `openspec/changes/fix-document-upload-images/`
- 部署脚本: `deploy-fix-document-upload.ps1`
- 测试脚本: `test-document-upload.ps1`

## ✅ 验收标准

修复成功的标志：
- [ ] 可以上传包含图片的 DOCX 文档
- [ ] 图片正确提取并显示
- [ ] 浏览器控制台无 ERR_CONNECTION_REFUSED 错误
- [ ] 后端日志显示 `✅ 上传成功`
- [ ] 图片 URL 可以正常访问

## 🆘 需要帮助？

如果问题仍未解决：
1. 收集完整的错误日志
2. 截图浏览器控制台
3. 提供测试文档（如果可能）
4. 联系技术支持

