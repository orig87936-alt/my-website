# 个人主页 & 新闻管理系统

一个现代化的双语（中英文）个人主页和新闻管理系统，具有智能翻译和文档导入功能。

## ✨ 核心功能

### 🌐 双语支持
- 完整的中英文双语界面
- 一键切换语言
- 所有内容支持双语展示

### 🤖 智能翻译系统
- **AI 驱动翻译**: 使用 DeepSeek API 提供高质量翻译
- **智能缓存**: SHA-256 哈希缓存，30 天有效期
- **单字段翻译**: 快速翻译单个字段（< 5 秒）
- **批量翻译**: 并发翻译多个字段（最多 4 个同时）
- **自动语言检测**: 自动识别源语言
- **缓存命中率监控**: 实时监控翻译性能

### 📄 文档智能导入
- **支持格式**: Markdown (.md) 和 Word (.docx)
- **智能解析**: 自动解析文档结构和内容
- **图片提取**: 自动提取并上传图片（最多 5 张并发）
- **AI 元数据生成**:
  - 自动生成摘要（100-200 字）
  - 智能分类建议
  - 关键词标签提取（3-5 个）
- **表单自动填充**: 解析结果自动填充到新闻表单
- **自动翻译**: 可选的文档上传后自动翻译

### 📝 Markdown 支持
- **图片**: `![alt](url)` 语法
- **多级标题**: `##`, `###`, `####` 等
- **代码块**: ` ``` ` 语法，支持语法高亮
- **引用**: `>` 引用语法
- **列表**: 有序和无序列表
- **XSS 防护**: 自动过滤危险标签和脚本

### 🔒 安全特性
- **内容安全**: 文档解析时自动清理危险代码
- **XSS 防护**: Markdown 渲染时使用 rehype-sanitize
- **文件验证**:
  - 文件大小限制（10MB）
  - 文件类型验证（仅 .md 和 .docx）
- **JWT 认证**: 管理员功能需要身份验证

### ⚡ 性能优化
- **并发翻译**: 最多 4 个字段同时翻译
- **并发图片上传**: 最多 5 张图片同时上传
- **翻译缓存**: 缓存命中时 < 1 秒响应
- **后台任务**: 每天自动清理过期缓存（2 AM UTC）
- **性能监控**: 翻译时间和缓存命中率追踪

## 🚀 快速开始

### 前置要求
- Node.js 18+
- Python 3.11+
- PostgreSQL 14+ (with pgvector extension)
- DeepSeek API Key

### 环境配置

1. **克隆项目**
```bash
git clone <repository-url>
cd 主页设计
```

2. **后端配置**
```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入以下信息:
# - DATABASE_URL
# - DEEPSEEK_API_KEY
# - SECRET_KEY
```

3. **数据库初始化**
```bash
# 运行数据库迁移
alembic upgrade head

# 创建管理员账号（如果需要）
python scripts/create_admin.py
```

4. **前端配置**
```bash
cd ..  # 返回项目根目录

# 安装依赖
npm install

# 配置环境变量（如果需要）
cp .env.example .env.local
```

### 启动服务

1. **启动后端**
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

后端 API 文档: http://localhost:8000/docs

2. **启动前端**
```bash
npm run dev
```

前端应用: http://localhost:3000

### 默认管理员账号
- 用户名: `admin`
- 密码: `admin123`

## 📚 技术栈

### 后端
- **框架**: FastAPI (Python)
- **数据库**: PostgreSQL + pgvector
- **ORM**: SQLAlchemy (async)
- **迁移**: Alembic
- **AI 服务**: DeepSeek API
- **文档解析**:
  - python-docx (Word)
  - markdown + BeautifulSoup (Markdown)
- **语言检测**: langdetect
- **限流**: slowapi
- **异步任务**: asyncio

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **动画**: Framer Motion
- **Markdown 渲染**: react-markdown + rehype-sanitize
- **文件上传**: react-dropzone
- **通知**: Sonner
- **图标**: Lucide React

## 📖 使用指南

### 创建新闻

1. **登录管理后台**
   - 访问 http://localhost:3000
   - 使用管理员账号登录

2. **手动创建**
   - 点击"创建新闻"按钮
   - 填写中文字段
   - 使用翻译按钮翻译单个字段
   - 或使用"批量翻译"翻译所有字段
   - 保存新闻

3. **文档导入**
   - 点击"上传文档"按钮
   - 拖拽或选择 .md 或 .docx 文件
   - 预览解析结果
   - 可选：勾选"自动翻译"
   - 点击"使用此内容"
   - 表单自动填充
   - 保存新闻

### 翻译功能

#### 单字段翻译
- 在任何文本字段旁边点击翻译按钮
- 等待翻译完成（< 5 秒）
- 对应的英文字段自动填充

#### 批量翻译
- 填写所有中文字段
- 点击"批量翻译"按钮
- 等待所有字段翻译完成（< 15 秒）
- 所有英文字段自动填充

### 文档上传

#### 支持的格式
- Markdown (.md)
- Word (.docx)

#### 文件要求
- 最大文件大小: 10MB
- 文件必须是有效的 Markdown 或 Word 文档

#### 上传流程
1. 点击"上传文档"按钮
2. 选择文件
3. 预览解析结果
4. （可选）勾选"自动翻译"
5. 点击"使用此内容"
6. 编辑和保存

## 🔧 API 文档

### 翻译 API

#### 单字段翻译
```http
POST /api/v1/translation/translate
Content-Type: application/json

{
  "text": "要翻译的文本",
  "source_lang": "zh",  // 可选，自动检测
  "target_lang": "en"
}
```

**限流**: 30 次/分钟

#### 批量翻译
```http
POST /api/v1/translation/batch-translate
Content-Type: application/json

{
  "fields": [
    {"field_name": "title", "text": "标题"},
    {"field_name": "summary", "text": "摘要"}
  ],
  "source_lang": "zh",  // 可选
  "target_lang": "en",
  "article_id": "uuid"  // 可选
}
```

**限流**: 10 次/分钟

#### 缓存统计
```http
GET /api/v1/translation/cache-stats
```

### 文档上传 API

#### 上传文档
```http
POST /api/v1/documents/upload
Content-Type: multipart/form-data

file: <file>
auto_translate: true  // 可选
```

**限流**: 5 次/分钟

完整 API 文档: http://localhost:8000/docs

## 🧪 测试

### 性能测试
```bash
cd backend
python run_performance_tests.py
```

### 用户验收测试
参考 `backend/USER_ACCEPTANCE_TEST.md` 进行完整的用户验收测试。

## 🛠️ 开发

### 数据库迁移
```bash
cd backend

# 创建新迁移
alembic revision --autogenerate -m "描述"

# 应用迁移
alembic upgrade head

# 回滚迁移
alembic downgrade -1
```

### 代码质量
```bash
# 后端
cd backend
flake8 app/
black app/
mypy app/

# 前端
npm run lint
npm run type-check
```

## 📦 部署

### 后端部署

1. **环境变量**
   - 设置生产环境的 `DATABASE_URL`
   - 设置 `DEEPSEEK_API_KEY`
   - 生成安全的 `SECRET_KEY`
   - 设置 `ENVIRONMENT=production`

2. **数据库**
   - 运行迁移: `alembic upgrade head`
   - 启用 pgvector 扩展

3. **启动服务**
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

### 前端部署

1. **构建**
   ```bash
   npm run build
   ```

2. **部署**
   - 将 `dist/` 目录部署到静态文件服务器
   - 或使用 Vercel/Netlify 等平台

## 🔄 后台任务

### 缓存清理任务
- **频率**: 每天 2:00 AM UTC
- **功能**: 清理 30 天前的过期翻译缓存
- **日志**: 查看后端日志了解清理状态

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题，请联系项目维护者。