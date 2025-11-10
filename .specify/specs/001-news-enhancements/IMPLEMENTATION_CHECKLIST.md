# 实施检查清单 - 后端开发

## ✅ 规格文档完整性检查

### 1. 技术栈定义
- [x] 前端技术栈（React 18.3.1, TypeScript, Vite, Tailwind CSS）
- [x] 后端技术栈（FastAPI 0.109+, Python 3.11+, Uvicorn）
- [x] 数据库（PostgreSQL 14+, pgvector 0.5+）
- [x] AI 服务（DeepSeek Chat API, OpenAI text-embedding-3-small）
- [x] 部署平台（AWS EC2, RDS, Nginx, Systemd）

### 2. 数据库设计
- [x] articles 表（完整 SQL schema）
- [x] appointments 表（完整 SQL schema）
- [x] chat_messages 表（完整 SQL schema）
- [x] faqs 表（完整 SQL schema）
- [x] article_embeddings 表（完整 SQL schema + pgvector）
- [x] 所有索引定义
- [x] 所有约束定义（CHECK, UNIQUE, FOREIGN KEY）

### 3. API 端点定义
- [x] 认证 API（POST /api/v1/auth/login, POST /api/v1/auth/verify）
- [x] 文章 API（GET, POST, PUT, DELETE /api/v1/articles）
- [x] 预约 API（GET, POST, PUT /api/v1/appointments）
- [x] 聊天 API（POST /api/v1/chat）
- [x] FAQ 管理 API（GET, POST, PUT, DELETE /api/v1/faqs）

### 4. 功能需求
- [x] 文章导航（FR-001 到 FR-007c）
- [x] 文章自动排版（FR-008 到 FR-015）
- [x] 预约系统（FR-016 到 FR-025a）
- [x] 智能问答（FR-026 到 FR-035a）

### 5. 前端集成
- [x] 需要修改的文件列表
- [x] API 客户端代码示例
- [x] 具体集成步骤

### 6. 部署方案
- [x] 本地开发环境设置
- [x] AWS EC2 部署步骤
- [x] Nginx 配置说明
- [x] SSL 证书设置

### 7. 安全与性能
- [x] 安全考虑（CORS, SQL 注入, XSS, JWT）
- [x] 性能优化（索引, 连接池, 异步操作）
- [x] 监控和日志

---

## 🚀 实施步骤

### 阶段 1：项目初始化（第1天）

#### 1.1 创建项目结构
```bash
cd d:\主页设计
mkdir backend
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

#### 1.2 安装依赖
```bash
pip install -r requirements.txt
```

#### 1.3 配置环境变量
- 复制 `.env.example` 到 `.env`
- 填写 `DATABASE_URL`
- 填写 `DEEPSEEK_API_KEY`
- 生成 `SECRET_KEY`

#### 1.4 测试基础服务
```bash
uvicorn app.main:app --reload
# 访问 http://localhost:8000/docs
```

---

### 阶段 2：数据库设置（第1-2天）

#### 2.1 安装 PostgreSQL
- 选项 A: Docker（推荐）
  ```bash
  docker run -d --name sl-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=sl_news -p 5432:5432 ankane/pgvector
  ```
- 选项 B: 本地安装
- 选项 C: 使用 Supabase 云数据库

#### 2.2 初始化 Alembic
```bash
alembic init alembic
# 编辑 alembic/env.py
# 编辑 alembic.ini
```

#### 2.3 创建数据库模型
- 创建 `app/models/article.py`
- 创建 `app/models/appointment.py`
- 创建 `app/models/chat.py`
- 创建 `app/models/faq.py`

#### 2.4 生成迁移脚本
```bash
alembic revision --autogenerate -m "Initial tables"
alembic upgrade head
```

---

### 阶段 3：API 实现（第2-4天）

#### 3.1 认证 API
- 创建 `app/api/auth.py`
- 实现 JWT token 生成和验证
- 创建认证中间件

#### 3.2 文章 API
- 创建 `app/api/articles.py`
- 实现 CRUD 操作
- 实现分页和筛选

#### 3.3 预约 API
- 创建 `app/api/appointments.py`
- 实现时间槽冲突检测
- 实现异步邮件通知

#### 3.4 聊天 API
- 创建 `app/api/chat.py`
- 集成 DeepSeek API
- 实现 RAG 检索

#### 3.5 FAQ API
- 创建 `app/api/faqs.py`
- 实现 CRUD 操作

---

### 阶段 4：DeepSeek 集成（第4-5天）

#### 4.1 创建 DeepSeek 服务
- 创建 `app/services/deepseek.py`
- 实现聊天接口封装
- 实现错误处理和重试

#### 4.2 实现向量搜索
- 创建 `app/services/vector_search.py`
- 实现文章向量化
- 实现相似度搜索函数

#### 4.3 实现 RAG 架构
- FAQ 精确匹配
- 文章向量检索
- 上下文构建
- DeepSeek 生成答案

---

### 阶段 5：前端对接（第5-6天）

#### 5.1 创建 API 客户端
- 创建 `src/services/api.ts`
- 实现统一的 API 调用函数
- 实现错误处理

#### 5.2 修改现有组件
- 修改 `src/data/newsData.ts`（添加 category, summary, publishedAt）
- 修改 `src/components/NewsDetailPage.tsx`（添加 RelatedArticles 组件）
- 修改 `src/components/ConsultingPage.tsx`（集成预约和聊天 API）
- 修改 `src/contexts/AuthContext.tsx`（集成 JWT 认证）

#### 5.3 创建新组件
- 创建 `src/components/RelatedArticles.tsx`
- 创建 `src/components/AdminAppointmentsPage.tsx`（可选）

---

### 阶段 6：测试（第6-7天）

#### 6.1 单元测试
- 测试数据库模型
- 测试 API 端点
- 测试业务逻辑

#### 6.2 集成测试
- 测试前后端对接
- 测试 DeepSeek 集成
- 测试邮件通知

#### 6.3 端到端测试
- 测试完整的用户流程
- 测试管理员功能
- 测试错误处理

---

### 阶段 7：部署（第7-8天）

#### 7.1 AWS 环境准备
- 创建 EC2 实例
- 配置安全组
- 创建 RDS 数据库（或在 EC2 上安装 PostgreSQL）

#### 7.2 部署后端
- 安装 Python 和依赖
- 配置 Systemd 服务
- 配置 Nginx 反向代理
- 配置 SSL 证书

#### 7.3 部署前端
- 在 Vercel 设置环境变量 `VITE_API_URL`
- 重新部署前端

#### 7.4 验证和监控
- 测试所有功能
- 配置日志
- 配置监控告警

---

## 📋 验收标准

### 功能验收
- [ ] 文章详情页底部显示6篇相关文章
- [ ] 点击"加载更多"可以加载更多文章
- [ ] 预约提交成功并收到确认邮件
- [ ] 管理员可以查看所有预约
- [ ] 聊天机器人可以回答问题并引用文章
- [ ] 管理员可以编辑 FAQ 知识库

### 性能验收
- [ ] API 响应时间 < 500ms（95%）
- [ ] 聊天机器人响应时间 < 3秒（95%）
- [ ] 预约确认邮件 < 30秒送达

### 安全验收
- [ ] JWT 认证正常工作
- [ ] 管理员权限验证正常
- [ ] CORS 配置正确
- [ ] SQL 注入防护有效

---

## 🎯 新窗口启动指令

在新的对话窗口中输入：

```
/speckit.implement

请基于规格文档 .specify/specs/001-news-enhancements/spec.md 实现完整的后端系统。

该文档包含：
✅ 完整的技术栈定义（FastAPI + PostgreSQL + DeepSeek + AWS）
✅ 5个数据库表的完整 SQL schema
✅ 所有 API 端点定义（认证、文章、预约、聊天、FAQ）
✅ 前端集成方案（需要修改的文件和 API 客户端代码）
✅ AWS 部署策略（EC2 + RDS + Nginx）
✅ 安全和性能优化指南

关键需求：
- 文章底部导航：初始显示6篇，"加载更多"每次6篇，显示缩略图+标题+简介(50-80字)
- 预约系统：固定时间槽，异步邮件通知，重试机制
- 智能问答：RAG架构（FAQ + 文章向量检索），DeepSeek生成答案
- 认证：JWT token，管理员权限验证

请按照以下顺序实施：
1. 项目初始化（目录结构、依赖安装）
2. 数据库模型（SQLAlchemy ORM）
3. API 路由实现（所有端点）
4. DeepSeek 集成（RAG 架构）
5. 前端对接（修改现有组件）
6. 测试和部署指南

开始第一步：项目初始化。
```

---

## ✅ 文档完整性确认

**所有必要信息已包含在规格文档中：**

1. ✅ 技术栈完整定义
2. ✅ 数据库完整设计（5个表 + 索引 + 约束）
3. ✅ API 完整定义（所有端点 + 请求/响应）
4. ✅ 功能需求完整（35+ 个 FR）
5. ✅ 前端集成方案（文件列表 + 代码示例）
6. ✅ 部署策略（AWS 完整步骤）
7. ✅ 安全和性能指南
8. ✅ 关键澄清（文章导航、预约通知、RAG 方案）

**可以在新窗口启动 /speckit.implement 工作流了！** 🚀

