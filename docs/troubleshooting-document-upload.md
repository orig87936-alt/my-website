# 文档上传故障排查指南

## 问题：ERR_CONNECTION_REFUSED 错误

### 症状
- 上传 DOCX 文档时出现 `ERR_CONNECTION_REFUSED` 错误
- 浏览器控制台显示无法连接到 `localhost:8000/uploads/images/`
- 图片无法正确提取和上传

### 根本原因
后端配置中的 `BACKEND_URL` 设置为 `http://localhost:8000`，但在生产环境中：
- 前端部署在 S3 静态网站
- 后端部署在 EC2 服务器
- 浏览器无法访问服务器的 `localhost`

### 解决方案

#### 1. 修改后端配置

编辑 `backend/.env` 文件：

```bash
# 生产环境配置
BACKEND_URL=http://127.0.0.1:8000

# 或者使用域名（如果配置了内部 DNS）
# BACKEND_URL=http://api.s-l.ai
```

**注意**：
- 使用 `127.0.0.1` 而不是 `localhost`，因为在某些容器环境中 `localhost` 可能无法正确解析
- 这个 URL 用于后端内部调用，不是给前端使用的

#### 2. 重启后端服务

```bash
sudo systemctl restart news-backend
```

#### 3. 验证配置

```bash
# 检查环境变量
grep BACKEND_URL backend/.env

# 检查服务日志
sudo journalctl -u news-backend -n 50
```

## 常见问题

### Q1: 为什么要使用 127.0.0.1 而不是 localhost？

**A**: 在某些环境中（特别是 Docker 容器），`localhost` 可能指向容器内部而不是宿主机。使用 `127.0.0.1` 更明确且可靠。

### Q2: 图片上传失败但文档上传成功？

**A**: 这是部分失败的情况。检查：
1. 后端日志中的详细错误信息
2. 图片格式是否支持（JPG, PNG, GIF, WEBP）
3. 图片大小是否超过限制
4. WMF/EMF 格式转换是否成功

### Q3: 如何查看详细的上传日志？

**A**: 
```bash
# 实时查看日志
sudo journalctl -u news-backend -f

# 查看最近的错误
sudo journalctl -u news-backend -p err -n 50
```

### Q4: Nginx 配置是否正确？

**A**: 检查以下配置：
```nginx
# 文件大小限制
client_max_body_size 50M;

# 超时设置
proxy_connect_timeout 300s;
proxy_send_timeout 300s;
proxy_read_timeout 300s;

# 缓冲设置
proxy_request_buffering off;
proxy_buffering off;
```

### Q5: 如何测试图片上传功能？

**A**: 使用提供的测试脚本：
```powershell
.\test-document-upload.ps1
```

## 调试步骤

### 1. 检查后端服务状态
```bash
sudo systemctl status news-backend
```

### 2. 检查端口监听
```bash
sudo netstat -tlnp | grep 8000
```

### 3. 测试内部 API 调用
```bash
curl -X GET http://127.0.0.1:8000/health
```

### 4. 检查 uploads 目录权限
```bash
ls -la /home/ubuntu/news-platform/backend/uploads/images/
```

### 5. 查看详细错误日志
```bash
sudo journalctl -u news-backend -n 100 --no-pager
```

## 性能优化建议

### 1. 并发上传限制
当前设置为最多 5 个并发上传。如果需要调整：

```python
# backend/app/services/document_parser.py
async def upload_images_concurrently(
    images: List[Tuple[str, bytes]], 
    auth_token: str,
    max_concurrent: int = 5  # 调整这个值
):
```

### 2. 重试策略
当前重试 3 次，延迟为 1s, 2s, 4s。如果需要调整：

```python
max_retries = 3
retry_delays = [1, 2, 4]  # 秒
```

### 3. 超时设置
当前超时 30 秒。如果上传大图片需要更长时间：

```python
timeout = aiohttp.ClientTimeout(total=30, connect=10)
```

## 监控和告警

### 关键指标
- 文档上传成功率
- 图片上传成功率
- 平均上传时间
- 错误率（按错误类型分类）

### 日志关键字
- `✅ 上传成功` - 成功上传
- `❌ 上传失败` - 上传失败
- `🔄 重试上传` - 触发重试
- `ERR_CONNECTION_REFUSED` - 连接被拒绝
- `上传超时` - 超时错误

## 联系支持

如果问题仍未解决，请提供：
1. 完整的错误日志
2. 浏览器控制台截图
3. 后端服务日志
4. 测试文档（如果可能）

