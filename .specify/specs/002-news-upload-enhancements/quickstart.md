# Quick Start Guide: 新闻上传功能增强

**Feature**: 002-news-upload-enhancements  
**Date**: 2025-11-09

## 目录

1. [环境准备](#环境准备)
2. [后端设置](#后端设置)
3. [前端设置](#前端设置)
4. [测试指南](#测试指南)
5. [常见问题](#常见问题)

## 环境准备

### 系统要求

- **Python**: 3.11+
- **Node.js**: 18+
- **PostgreSQL**: 14+
- **操作系统**: Windows/Linux/macOS

### API 密钥

需要以下 API 密钥：

1. **DeepSeek API Key** (必需)
   - 注册地址：https://platform.deepseek.com/
   - 用途：翻译和 AI 元数据生成
   - 成本：免费额度足够开发使用

2. **DeepL API Key** (可选)
   - 注册地址：https://www.deepl.com/pro-api
   - 用途：备选翻译服务
   - 成本：免费额度 500,000 字符/月

## 后端设置

### 1. 安装依赖

```bash
cd backend
pip install python-docx==1.1.0 mistune==3.0.2 langdetect==1.0.9 python-multipart==0.0.6
```

### 2. 配置环境变量

编辑 `backend/.env` 文件，添加以下配置：

```bash
# 翻译服务配置
TRANSLATION_PROVIDER=deepseek  # 或 deepl
DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here
DEEPL_API_KEY=your-deepl-api-key-here  # 可选

# 文档上传配置
MAX_UPLOAD_SIZE=10485760  # 10MB in bytes
ALLOWED_FILE_TYPES=.md,.docx
TEMP_UPLOAD_DIR=./temp_uploads

# 翻译缓存配置
TRANSLATION_CACHE_DAYS=30
```

### 3. 数据库迁移

```bash
cd backend

# 生成迁移文件
alembic revision --autogenerate -m "Add translation and document upload tables"

# 执行迁移
alembic upgrade head
```

### 4. 验证数据库

```bash
# 连接到 PostgreSQL
psql -U newsuser -d newsdb

# 检查表是否创建成功
\dt

# 应该看到以下表：
# - translation_cache
# - translation_logs
# - document_uploads
```

### 5. 启动后端服务

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### 6. 验证 API

访问 http://localhost:8000/api/docs 查看 API 文档，应该看到新增的端点：

- `POST /api/v1/translation/translate`
- `POST /api/v1/translation/batch-translate`
- `POST /api/v1/translation/detect-language`
- `GET /api/v1/translation/history`
- `POST /api/v1/documents/upload`
- `GET /api/v1/documents/history`
- `GET /api/v1/documents/{upload_id}`

## 前端设置

### 1. 安装依赖

```bash
cd frontend  # 或项目根目录
npm install react-dropzone@14.2.3
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 验证功能

1. 访问 http://localhost:5173
2. 登录管理员账号
3. 进入新闻管理页面
4. 应该看到：
   - "创建文章"按钮（原有）
   - "上传文档"按钮（新增）
   - 在表单中每个字段旁边有"翻译"按钮（新增）
   - 表单顶部有"全部翻译"按钮（新增）

## 测试指南

### 后端测试

#### 1. 测试翻译 API

```bash
cd backend

# 运行翻译服务测试
pytest tests/test_translation.py -v

# 运行文档解析测试
pytest tests/test_document_parser.py -v
```

#### 2. 手动测试翻译 API

```bash
# 获取 JWT Token
TOKEN=$(curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your-password"}' \
  | jq -r '.access_token')

# 测试单字段翻译
curl -X POST "http://localhost:8000/api/v1/translation/translate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "人工智能正在改变世界",
    "target_lang": "en"
  }' | jq

# 测试批量翻译
curl -X POST "http://localhost:8000/api/v1/translation/batch-translate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": [
      {"field_name": "title", "text": "AI的未来"},
      {"field_name": "summary", "text": "探讨人工智能的发展趋势"}
    ],
    "target_lang": "en"
  }' | jq

# 测试语言检测
curl -X POST "http://localhost:8000/api/v1/translation/detect-language" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, world!"}' | jq
```

#### 3. 手动测试文档上传 API

```bash
# 准备测试文件
echo "# Test Article\n\nThis is a test article." > test.md

# 上传 Markdown 文档
curl -X POST "http://localhost:8000/api/v1/documents/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.md" \
  -F "category=headline" \
  -F "auto_translate=true" | jq

# 上传 Word 文档（需要准备 .docx 文件）
curl -X POST "http://localhost:8000/api/v1/documents/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.docx" \
  -F "category=analysis" \
  -F "auto_translate=false" | jq

# 查看上传历史
curl -X GET "http://localhost:8000/api/v1/documents/history?limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 前端测试

#### 1. 测试翻译功能

1. 登录管理员账号
2. 点击"创建文章"
3. 在"中文标题"字段输入文本
4. 点击字段旁边的"翻译"按钮
5. 验证"英文标题"字段自动填充
6. 修改翻译后的文本
7. 验证修改被保存

#### 2. 测试批量翻译

1. 在表单中填写多个中文字段
2. 点击顶部的"全部翻译"按钮
3. 验证所有英文字段自动填充
4. 检查翻译质量

#### 3. 测试文档上传

**测试 Markdown 上传**:

1. 准备一个 Markdown 文件（包含图片）：
   ```markdown
   # 测试文章
   
   这是第一段内容。
   
   ![测试图片](https://example.com/image.jpg)
   
   这是第二段内容。
   ```

2. 点击"上传文档"按钮
3. 选择 Markdown 文件
4. 选择分类
5. 勾选"自动翻译"
6. 点击"上传"
7. 验证：
   - 表单自动填充
   - 图片正确显示
   - 翻译正确生成

**测试 Word 上传**:

1. 准备一个 Word 文档（包含标题、段落、图片）
2. 重复上述步骤
3. 验证表格正确转换为 Markdown

#### 4. 测试多图片支持

1. 创建包含多张图片的 Markdown 文件：
   ```markdown
   # 多图片测试
   
   ![图片1](https://example.com/1.jpg)
   
   段落内容
   
   ![图片2](https://example.com/2.jpg)
   
   更多内容
   
   ![图片3](https://example.com/3.jpg)
   ```

2. 上传文档
3. 验证所有图片都正确显示在预览中

## 性能测试

### 1. 翻译性能

```bash
# 使用 Apache Bench 测试
ab -n 100 -c 10 -p translate.json -T application/json \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/translation/translate

# translate.json 内容：
# {"text":"测试文本","target_lang":"en"}
```

**预期结果**:
- 平均响应时间 < 3 秒
- 95% 响应时间 < 5 秒
- 缓存命中率 > 60%

### 2. 文档上传性能

```bash
# 测试 5MB 文档上传
time curl -X POST "http://localhost:8000/api/v1/documents/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@large_document.docx" \
  -F "auto_translate=true"
```

**预期结果**:
- 总时间 < 15 秒
- 解析时间 < 5 秒
- 图片上传时间 < 4 秒（5 张）

## 常见问题

### Q1: 翻译 API 返回 500 错误

**原因**: DeepSeek API 密钥未配置或无效

**解决方案**:
1. 检查 `.env` 文件中的 `DEEPSEEK_API_KEY`
2. 验证 API 密钥是否有效
3. 检查 API 额度是否用完

### Q2: 文档上传失败

**原因**: 文件类型不支持或文件过大

**解决方案**:
1. 确认文件类型为 `.md` 或 `.docx`
2. 确认文件大小 < 10MB
3. 检查后端日志查看详细错误

### Q3: 图片上传失败

**原因**: 图片 URL 无效或网络问题

**解决方案**:
1. 确认图片 URL 可访问
2. 检查网络连接
3. 查看后端日志

### Q4: 翻译质量不佳

**原因**: Prompt 设计不够优化

**解决方案**:
1. 调整 `app/services/translation.py` 中的 prompt
2. 考虑切换到 DeepL API
3. 添加人工审核流程

### Q5: 缓存未生效

**原因**: 缓存键计算错误或缓存已过期

**解决方案**:
1. 检查 `translation_cache` 表
2. 验证缓存键计算逻辑
3. 调整缓存过期时间

## 开发技巧

### 1. 调试翻译服务

```python
# 在 app/services/translation.py 中添加日志
import logging
logger = logging.getLogger(__name__)

async def translate_text(text: str, target_lang: str):
    logger.info(f"Translating: {text[:50]}... to {target_lang}")
    # ...
    logger.info(f"Translation result: {result[:50]}...")
```

### 2. 测试文档解析

```python
# 创建测试脚本 test_parse.py
from app.services.document_parser import DocumentParser

parser = DocumentParser()
result = parser.parse_markdown("# Test\n\nContent")
print(result)
```

### 3. 监控性能

```python
# 在关键函数中添加性能监控
import time

start = time.time()
# ... 执行操作
elapsed = time.time() - start
logger.info(f"Operation took {elapsed:.2f} seconds")
```

## 下一步

1. ✅ 完成环境设置
2. ✅ 运行所有测试
3. ⏭️ 开始实施 Phase 1（智能翻译系统）
4. ⏭️ 开始实施 Phase 2（文档智能导入）
5. ⏭️ 性能优化和完善

## 相关文档

- [功能规格](./spec.md)
- [技术实现计划](./plan.md)
- [技术研究](./research.md)
- [数据模型设计](./data-model.md)
- [翻译 API 规范](./contracts/translation-api.md)
- [文档上传 API 规范](./contracts/document-upload-api.md)

## 支持

如有问题，请查看：
- 后端日志：`backend/logs/`
- 前端控制台：浏览器开发者工具
- API 文档：http://localhost:8000/api/docs

