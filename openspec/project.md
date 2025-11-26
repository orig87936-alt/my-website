# Project Context

## Purpose
这是一个企业新闻平台/主页设计项目，提供新闻管理、预约系统、AI 聊天机器人等功能。
支持多语言翻译、富文本编辑、文档上传等企业级功能。

## Tech Stack

### Frontend
- **框架**: React 18.3.1 + TypeScript
- **构建工具**: Vite 6.3.5
- **UI 组件库**: Radix UI (完整组件套件)
- **富文本编辑器**: TipTap 3.10.5 (支持 Markdown)
- **样式**: Tailwind CSS
- **图表**: Recharts
- **国际化**: 自定义 i18n 系统
- **其他**: React Hook Form, React Markdown, React Dropzone

### Backend
- **语言**: Python
- **框架**: FastAPI
- **数据库**: PostgreSQL (支持 pgvector) / SQLite
- **ORM**: SQLAlchemy + Alembic (数据库迁移)
- **部署**: Docker + AWS (EC2, RDS, S3, Lightsail)

### 部署环境
- **前端**: AWS S3 静态托管 / EC2 + Nginx
- **后端**: AWS EC2 + Nginx 反向代理
- **数据库**: AWS RDS PostgreSQL / 本地 SQLite
- **域名**: s-l.ai (GoDaddy DNS)

## Project Conventions

### Code Style
- **命名规范**:
  - 组件使用 PascalCase (如 `NewsEditor.tsx`)
  - 工具函数使用 camelCase
  - 常量使用 UPPER_SNAKE_CASE
  - 文件名与组件名保持一致
- **TypeScript**: 严格类型检查，避免使用 `any`
- **组件结构**: 功能组件 + Hooks，避免类组件
- **样式**: 优先使用 Tailwind CSS 工具类

### Architecture Patterns
- **前端架构**:
  - `src/components/`: 可复用 UI 组件
  - `src/pages/`: 页面级组件
  - `src/services/`: API 调用服务
  - `src/contexts/`: React Context 状态管理
  - `src/hooks/`: 自定义 Hooks
  - `src/utils/`: 工具函数
  - `src/i18n/`: 国际化配置

- **后端架构**:
  - `backend/app/`: 主应用代码
  - `backend/alembic/`: 数据库迁移脚本
  - RESTful API 设计
  - JWT 认证授权

- **状态管理**: React Context + Hooks (AuthContext, LanguageContext)
- **路由**: 基于组件的路由系统
- **API 通信**: Fetch API + 统一错误处理

### Testing Strategy
- **手动测试**: 使用 HTML 测试页面 (如 `test-*.html`)
- **API 测试**: Python 测试脚本 (如 `test_*.py`)
- **部署验证**: PowerShell 脚本 (如 `test-*.ps1`)
- **压力测试**: `stress_test_news_creation.py`

### Git Workflow
- **分支策略**:
  - `main`: 生产环境
  - `003-*`: 功能分支 (如 `003-auth-subscription-enhancement`)
- **提交规范**: 描述性提交信息，包含功能说明
- **部署流程**: 本地构建 → 上传 S3/EC2 → 验证

## Domain Context

### 核心功能模块
1. **新闻管理系统**
   - 富文本编辑器 (TipTap + Markdown)
   - 文章分类管理
   - 图片上传 (支持 DOCX 文档图片解析)
   - 多语言翻译 (中英文)

2. **预约系统**
   - 在线预约表单
   - 预约管理后台
   - 邮件通知

3. **AI 聊天机器人**
   - OpenAI API 集成
   - 智能客服功能

4. **用户认证**
   - JWT Token 认证
   - 管理员权限管理
   - 订阅系统

### 业务术语
- **Article/News**: 新闻文章
- **Category**: 业务类别
- **Lead**: 潜在客户/咨询
- **Appointment**: 预约
- **Translation**: 文章翻译

## Important Constraints

### 技术约束
- **CORS**: 必须正确配置跨域访问 (前后端分离)
- **文件上传**:
  - 图片大小限制: 10MB
  - 支持格式: JPG, PNG, GIF, WEBP
  - DOCX 文档图片需要特殊处理 (WMF/EMF 格式转换)
- **数据库**:
  - 文章内容使用 JSON 格式存储
  - 支持 SQLite (开发) 和 PostgreSQL (生产)
- **部署**:
  - 前端必须构建后部署 (不能直接部署源码)
  - 后端需要配置环境变量 (.env)

### 业务约束
- **多语言**: 必须支持中英文切换
- **SEO**: 文章需要支持 Markdown 格式
- **安全**: 管理员功能需要认证保护
- **性能**: 图片需要优化加载

## External Dependencies

### 云服务
- **AWS Services**:
  - EC2: 后端服务器
  - RDS: PostgreSQL 数据库
  - S3: 静态文件存储
  - Lightsail: 备选部署方案
- **域名服务**: GoDaddy DNS

### 第三方 API
- **OpenAI API**: AI 聊天机器人功能
- **翻译服务**: 文章多语言翻译

### 开发工具
- **包管理**: npm
- **容器化**: Docker + Docker Compose
- **数据库迁移**: Alembic
- **反向代理**: Nginx

### 监控和日志
- **后端日志**: `backend_debug.log`
- **部署脚本**: PowerShell (Windows) + Bash (Linux)
- **监控脚本**: `monitor-*.ps1`, `check-*.ps1`
