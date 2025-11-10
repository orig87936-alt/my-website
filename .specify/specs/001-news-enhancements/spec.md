# Feature Specification: 新闻页面增强与智能功能

**Feature Branch**: `001-news-enhancements`  
**Created**: 2025-11-07  
**Status**: Draft
**Input**: 增强新闻页面功能：文章导航、自动排版、预约后端、智能问答机器人

## Clarifications

### Session 2025-11-07

- Q: 预约时间冲突处理策略 - 冲突的定义和处理方式？ → A: 固定时间槽 - 预约按固定时间段（如30分钟或1小时）划分，每个时间槽只能预约一次
- Q: 管理员身份验证与授权机制？ → A: 复用现有前端认证系统 - 使用现有的 AuthContext（admin/visitor角色，localStorage会话），后端API需验证管理员角色
- Q: 智能问答机器人的知识来源和更新机制？ → A: RAG混合方案 - 静态FAQ知识库（管理员可编辑）+ 动态检索已发布文章内容，AI根据检索结果生成答案
- Q: 预约确认通知的优先级和降级策略 - 通知失败时如何处理？ → A: 异步通知+重试 - 预约数据立即保存并返回成功，通知异步发送，失败时自动重试（最多3次），页面始终显示预约成功确认
- Q: 文章底部相关文章的显示和加载策略？ → A: 初始显示6篇，点击"加载更多"每次显示6篇。每篇文章显示：缩略图、标题、简介（50-80字），点击可跳转到文章详情页

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 文章间导航 (Priority: P1)

作为网站访问者，当我阅读完一篇新闻文章后，我希望能够方便地浏览该模块中的其他相关文章，而不需要返回新闻列表页面。

**Why this priority**: 这是提升用户体验的核心功能，能够增加用户在网站上的停留时间和文章阅读量，是最基础且影响最大的改进。

**Independent Test**: 可以通过访问任意新闻详情页，验证页面底部是否显示其他文章链接，点击后能否正确跳转到对应文章。

**Acceptance Scenarios**:

1. **Given** 用户正在阅读一篇新闻文章，**When** 用户滚动到文章底部，**Then** 系统显示"相关文章"或"更多文章"区域，展示该模块的其他文章（至少3篇，最多6篇）
2. **Given** 相关文章区域已显示，**When** 用户点击任意一篇文章的标题或缩略图，**Then** 页面跳转到对应的文章详情页
3. **Given** 当前文章是该模块中最新的文章，**When** 显示相关文章时，**Then** 优先显示最近发布的其他文章
4. **Given** 该模块只有1篇文章（当前文章），**When** 用户查看文章底部，**Then** 相关文章区域显示提示信息"暂无更多文章"或不显示该区域
5. **Given** 用户在移动设备上阅读文章，**When** 查看相关文章区域，**Then** 文章卡片以单列或双列形式响应式显示

---

### User Story 2 - 文章自动排版 (Priority: P2)

作为内容管理员，当我上传新文章时，我希望系统能够自动根据文章内容完成布局和排版，使文章呈现更加美观和易读，减少手动调整的工作量。

**Why this priority**: 这个功能能够显著提升内容发布效率，确保所有文章的视觉一致性，但不影响现有文章的阅读体验。

**Independent Test**: 可以通过上传包含不同内容类型（标题、段落、图片、列表等）的测试文章，验证系统是否自动应用正确的样式和布局。

**Acceptance Scenarios**:

1. **Given** 管理员准备上传一篇包含多个段落的文章，**When** 文章内容被提交，**Then** 系统自动识别段落并添加适当的间距和缩进
2. **Given** 文章内容包含标题（H1-H6），**When** 系统处理文章，**Then** 自动应用层级化的标题样式（字体大小、粗细、间距）
3. **Given** 文章中包含图片，**When** 系统处理文章，**Then** 自动调整图片大小以适应页面宽度，并添加适当的边距和可选的图片说明区域
4. **Given** 文章包含列表（有序或无序），**When** 系统处理文章，**Then** 自动应用列表样式，包括项目符号或编号、缩进和间距
5. **Given** 文章包含引用文本，**When** 系统识别引用标记（如 > 或特定格式），**Then** 自动应用引用样式（边框、背景色、斜体等）
6. **Given** 文章内容包含代码块或特殊格式文本，**When** 系统处理文章，**Then** 自动应用等宽字体和代码高亮样式
7. **Given** 文章内容过长，**When** 系统分析文章结构，**Then** 自动生成文章目录（基于标题层级）并固定在侧边或顶部

---

### User Story 3 - 预约功能后端实现 (Priority: P1)

作为网站访问者，当我填写预约表单后，我希望我的预约信息能够被可靠地保存和处理，并收到确认反馈，确保预约成功。

**Why this priority**: 预约功能是业务核心功能，需要后端支持才能真正可用。这是从前端展示到完整功能的关键升级。

**Independent Test**: 可以通过填写预约表单，验证数据是否被正确保存到数据库，管理员是否能查看预约记录，用户是否收到确认通知。

**Acceptance Scenarios**:

1. **Given** 用户填写完整的预约表单（姓名、联系方式、预约时间、备注），**When** 用户点击提交按钮，**Then** 系统验证表单数据并保存到数据库，返回成功提示
2. **Given** 预约提交成功，**When** 数据保存完成，**Then** 用户收到确认消息（页面提示或邮件通知），包含预约详情和预约编号
3. **Given** 用户提交的表单数据不完整或格式错误，**When** 用户点击提交，**Then** 系统显示具体的错误提示，指出哪些字段需要修正
4. **Given** 管理员登录后台系统，**When** 访问预约管理页面，**Then** 系统显示所有预约记录列表，包括预约时间、用户信息、状态等
5. **Given** 管理员查看预约列表，**When** 点击某个预约记录，**Then** 显示该预约的详细信息，并提供状态更新选项（待处理、已确认、已完成、已取消）
6. **Given** 用户选择的预约时间已被占用，**When** 提交预约，**Then** 系统提示该时间段不可用，并建议其他可用时间
7. **Given** 预约成功后，**When** 预约时间临近（如提前1天），**Then** 系统自动发送提醒通知给用户

---

### User Story 4 - 智能问答机器人 (Priority: P2)

作为网站访问者，当我对网站内容或服务有疑问时，我希望能够通过智能问答机器人快速获得答案，而不需要等待人工客服回复。

**Why this priority**: 智能问答能够显著提升用户体验和服务效率，但需要在核心功能（预约、文章导航）完成后再实现。

**Independent Test**: 可以通过在网站上打开聊天窗口，输入常见问题，验证机器人是否能够理解问题并给出准确答案。

**Acceptance Scenarios**:

1. **Given** 用户访问网站任意页面，**When** 页面加载完成，**Then** 页面右下角显示聊天机器人图标（可收起/展开）
2. **Given** 用户点击聊天机器人图标，**When** 聊天窗口打开，**Then** 机器人显示欢迎消息和常见问题快捷选项
3. **Given** 用户在聊天窗口输入问题，**When** 用户发送消息，**Then** 机器人在3秒内分析问题并返回相关答案
4. **Given** 用户询问关于预约流程的问题，**When** 机器人识别到预约相关关键词，**Then** 提供预约步骤说明和预约页面链接
5. **Given** 用户询问关于文章或新闻的问题，**When** 机器人识别到内容相关关键词，**Then** 提供相关文章链接或搜索结果
6. **Given** 机器人无法理解用户问题，**When** 分析失败，**Then** 提示用户换一种方式提问，或提供人工客服联系方式
7. **Given** 用户与机器人对话过程中，**When** 用户关闭聊天窗口，**Then** 对话历史被保存，下次打开时可以继续对话
8. **Given** 管理员访问后台，**When** 查看机器人管理页面，**Then** 可以查看对话记录、常见问题统计、更新知识库

---

### Edge Cases

- **文章导航**：当模块中文章数量非常多（超过100篇）时，如何高效加载和显示相关文章？
- **文章导航**：如何处理文章被删除或下线的情况，避免显示无效链接？
- **自动排版**：当文章包含特殊字符、emoji或多语言内容时，如何确保正确渲染？
- **自动排版**：如何处理超大图片或视频，避免页面加载缓慢？
- **预约后端**：当同一时间段收到多个预约请求时，如何处理并发冲突？
- **预约后端**：如何处理用户取消预约或修改预约时间的请求？
- **预约后端**：当邮件服务器故障时，如何确保预约数据不丢失？
- **智能问答**：当用户输入恶意内容或垃圾信息时，如何过滤和处理？
- **智能问答**：当AI服务暂时不可用时，如何提供降级方案？
- **智能问答**：如何处理多语言问题（中文、英文等）？

## Requirements *(mandatory)*

### Functional Requirements

#### 文章导航功能

- **FR-001**: 系统必须在每篇新闻详情页底部显示"相关文章"区域
- **FR-002**: 相关文章区域初始必须显示6篇同模块的其他文章（如果可用）
- **FR-003**: 每篇相关文章必须显示：缩略图（image_url）、标题（title）、简介（summary，50-80字符）
- **FR-004**: 相关文章必须按发布时间倒序排列（最新的优先）
- **FR-005**: 系统必须排除当前正在阅读的文章
- **FR-006**: 点击相关文章必须跳转到对应的文章详情页
- **FR-007**: 相关文章区域必须支持响应式布局（桌面3列、平板2列、手机1列）
- **FR-007a**: 相关文章区域必须提供"加载更多"按钮，点击后每次加载6篇额外文章
- **FR-007b**: "加载更多"按钮在没有更多文章时必须隐藏或显示"没有更多文章"提示
- **FR-007c**: 文章简介（summary）必须严格限制在50-80个字符，超出部分自动截断并添加省略号

#### 文章自动排版功能

- **FR-008**: 系统必须支持Markdown格式的文章输入
- **FR-009**: 系统必须自动识别并渲染标题（H1-H6）、段落、列表、引用、代码块
- **FR-010**: 系统必须自动调整图片大小以适应页面宽度（最大宽度100%）
- **FR-011**: 系统必须为图片添加懒加载功能，优化页面性能
- **FR-012**: 系统必须自动为长文章生成目录导航（基于H2和H3标题）
- **FR-013**: 系统必须保持文章样式的一致性（字体、颜色、间距遵循设计系统）
- **FR-014**: 系统必须支持代码语法高亮（至少支持JavaScript、Python、HTML、CSS）
- **FR-015**: 系统必须提供文章预览功能，管理员可在发布前查看最终效果

#### 预约功能后端

- **FR-016**: 系统必须提供RESTful API接口用于预约的创建、查询、更新、删除
- **FR-017**: 系统必须验证预约表单数据（必填字段、格式校验、时间有效性）
- **FR-018**: 系统必须将预约数据持久化存储到数据库
- **FR-019**: 系统必须为每个预约生成唯一的预约编号
- **FR-020**: 系统必须检查预约时间冲突，防止重复预约。预约按固定时间槽划分（如30分钟或1小时），每个时间槽只允许一个预约
- **FR-021**: 系统必须在预约成功后发送确认通知（邮件或短信）。通知发送为异步操作，失败时自动重试最多3次，不影响预约保存成功
- **FR-021a**: 预约提交成功后，系统必须立即在页面显示确认信息（包含预约编号和详情），无论通知发送是否成功
- **FR-022**: 系统必须提供管理后台界面，用于查看和管理所有预约。管理后台必须验证用户具有admin角色
- **FR-023**: 系统必须支持预约状态管理（待处理、已确认、已完成、已取消）
- **FR-024**: 系统必须记录预约的创建时间、更新时间和操作日志
- **FR-025**: 系统必须提供预约提醒功能（提前1天自动发送提醒）
- **FR-025a**: 后端API必须验证请求中的用户角色，仅允许admin角色访问管理功能（查看所有预约、更新状态等）

#### 智能问答机器人

- **FR-026**: 系统必须在网站所有页面提供聊天机器人入口（右下角浮动按钮）
- **FR-027**: 聊天窗口必须支持展开/收起功能
- **FR-028**: 机器人必须在用户发送消息后3秒内响应
- **FR-029**: 机器人必须能够理解和回答关于网站服务、预约流程、文章内容的常见问题。使用RAG（检索增强生成）方案：从FAQ知识库和已发布文章中检索相关内容，然后生成答案
- **FR-030**: 机器人必须提供常见问题快捷选项，用户可一键选择
- **FR-031**: 机器人必须支持多轮对话，理解上下文
- **FR-032**: 当机器人无法回答问题时，必须提供人工客服联系方式
- **FR-033**: 系统必须保存用户对话历史（至少保留当前会话）
- **FR-034**: 管理员必须能够查看对话记录和统计数据
- **FR-035**: 管理员必须能够更新机器人的FAQ知识库（添加、编辑、删除问答对）
- **FR-035a**: 系统必须自动索引所有已发布的文章内容，使机器人能够检索和引用最新文章

### Key Entities

- **Article（文章）**: 代表新闻文章，包含标题、内容、发布日期、作者、模块分类、缩略图、状态（已发布/草稿）
- **Appointment（预约）**: 代表用户预约记录，包含预约编号、用户姓名、联系方式、预约时间槽（固定时间段）、服务类型、状态、备注、创建时间、通知发送状态（待发送/已发送/发送失败）
- **TimeSlot（时间槽）**: 代表可预约的固定时间段，包含开始时间、结束时间、是否可用、关联的预约ID
- **NotificationQueue（通知队列）**: 代表待发送或重试的通知任务，包含预约ID、通知类型（邮件/短信）、收件人、内容、重试次数、下次重试时间、状态
- **ChatMessage（聊天消息）**: 代表用户与机器人的对话消息，包含会话ID、发送者（用户/机器人）、消息内容、时间戳
- **ChatSession（聊天会话）**: 代表一次完整的对话会话，包含会话ID、用户标识、开始时间、结束时间、消息列表
- **KnowledgeBase（知识库）**: 代表机器人的FAQ知识条目，包含问题、答案、关键词、分类、优先级、创建时间、更新时间
- **ArticleIndex（文章索引）**: 代表已索引的文章内容，包含文章ID、标题、内容摘要、向量嵌入（用于语义搜索）、索引时间

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 用户在阅读文章后，通过相关文章导航访问其他文章的比例达到30%以上
- **SC-002**: 文章自动排版功能使内容发布时间减少50%（从平均20分钟降至10分钟）
- **SC-003**: 所有自动排版的文章在桌面和移动设备上的可读性评分达到90分以上（使用可读性评估工具）
- **SC-004**: 预约提交成功率达到95%以上（排除用户主动取消的情况）
- **SC-005**: 预约确认通知在提交后30秒内送达用户
- **SC-006**: 管理员能够在后台实时查看所有预约，响应时间低于2秒
- **SC-007**: 智能问答机器人的问题解答准确率达到80%以上（基于用户反馈）
- **SC-008**: 机器人响应时间在95%的情况下低于3秒
- **SC-009**: 使用智能问答机器人后，人工客服咨询量减少40%
- **SC-010**: 用户对智能问答机器人的满意度评分达到4.0/5.0以上

---

## Technical Architecture *(mandatory)*

### Technology Stack

#### Frontend (Existing)
- **Framework**: React 18.3.1 + TypeScript
- **Build Tool**: Vite 6.3.5
- **UI Library**: Radix UI + Tailwind CSS
- **Animation**: Framer Motion
- **State Management**: React Context (AuthContext, LanguageContext)
- **Data Storage**: localStorage (temporary, will migrate to backend)
- **Deployment**: Vercel (https://your-domain.vercel.app)

#### Backend (New)
- **Framework**: FastAPI 0.109+ (Python 3.11+)
- **ASGI Server**: Uvicorn with uvloop
- **ORM**: SQLAlchemy 2.0
- **Database Migration**: Alembic
- **Validation**: Pydantic 2.5+
- **Authentication**: JWT (python-jose)
- **Password Hashing**: bcrypt (passlib)
- **HTTP Client**: httpx (async)
- **Email Service**: Resend API
- **Deployment**: AWS EC2 + Nginx + Systemd

#### Database
- **Primary Database**: PostgreSQL 14+ (AWS RDS or EC2 self-hosted)
- **Vector Extension**: pgvector 0.5+ (for semantic search)
- **Connection Pool**: SQLAlchemy pool (size=10, max_overflow=20)
- **Backup Strategy**: Daily automated backups (AWS RDS automated backups)

#### AI Services
- **Chat Model**: DeepSeek Chat API (deepseek-chat)
- **Embedding Model**: OpenAI text-embedding-3-small (1536 dimensions)
  - Alternative: DeepSeek embedding API if available
- **Vector Search**: PostgreSQL pgvector with cosine similarity
- **RAG Architecture**: FAQ knowledge base + article vector index

#### Infrastructure (AWS)
- **Compute**: EC2 t3.small (2 vCPU, 2GB RAM) or Lightsail $10/month
- **Database**: RDS PostgreSQL t3.micro (free tier eligible) or EC2 self-hosted
- **Load Balancer**: Application Load Balancer (optional, for production)
- **DNS**: Route 53
- **SSL Certificate**: AWS Certificate Manager (ACM)
- **Reverse Proxy**: Nginx
- **Process Manager**: Systemd

### System Architecture

```
┌─────────────────────────────────────────────┐
│         Frontend (Vercel)                   │
│   React + TypeScript + Tailwind CSS         │
│   https://your-domain.vercel.app            │
└─────────────────────────────────────────────┘
                    ↓ HTTPS/CORS
┌─────────────────────────────────────────────┐
│      Nginx (Reverse Proxy)                  │
│   SSL Termination + Rate Limiting           │
│   https://api.your-domain.com               │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│      FastAPI Application (Uvicorn)          │
│   - Article Management API                  │
│   - Appointment API                         │
│   - Chat API (RAG)                          │
│   - Authentication API (JWT)                │
└─────────────────────────────────────────────┘
         ↓                    ↓
┌──────────────────┐  ┌──────────────────────┐
│  PostgreSQL      │  │  External Services   │
│  + pgvector      │  │  - DeepSeek API      │
│  - articles      │  │  - OpenAI Embeddings │
│  - appointments  │  │  - Resend Email      │
│  - chat_messages │  │                      │
│  - faqs          │  │                      │
│  - embeddings    │  │                      │
└──────────────────┘  └──────────────────────┘
```

### Database Schema

#### Table: articles
```sql
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,  -- 'headline', 'regulatory', 'analysis', 'business', 'enterprise', 'outlook'
  status VARCHAR(20) DEFAULT 'published',  -- 'draft', 'published', 'archived'

  title_zh TEXT NOT NULL,
  title_en TEXT NOT NULL,
  summary_zh VARCHAR(80) NOT NULL,
  summary_en VARCHAR(80) NOT NULL,
  lead_zh TEXT,
  lead_en TEXT,

  content_zh JSONB NOT NULL,  -- Array of content blocks
  content_en JSONB NOT NULL,

  image_url TEXT,
  image_caption_zh TEXT,
  image_caption_en TEXT,
  author VARCHAR(100),

  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_category CHECK (category IN ('headline', 'regulatory', 'analysis', 'business', 'enterprise', 'outlook')),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'published', 'archived'))
);

CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_category_published ON articles(category, published_at DESC) WHERE status = 'published';
```

#### Table: appointments
```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),

  appointment_date DATE NOT NULL,
  time_slot VARCHAR(10) NOT NULL,  -- '09:00', '09:30', '10:00', etc.

  service_type VARCHAR(100),
  notes TEXT,

  status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'confirmed', 'completed', 'cancelled'
  notification_status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'sent', 'failed'
  notification_retry_count INT DEFAULT 0,
  notification_last_attempt TIMESTAMPTZ,

  confirmation_number VARCHAR(20) UNIQUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  CONSTRAINT valid_time_slot CHECK (time_slot ~ '^\d{2}:\d{2}$'),
  UNIQUE(appointment_date, time_slot) WHERE status NOT IN ('cancelled')
);

CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_notification ON appointments(notification_status, notification_retry_count)
  WHERE notification_status = 'failed' AND notification_retry_count < 3;
```

#### Table: chat_messages
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  role VARCHAR(20) NOT NULL,  -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  metadata JSONB,  -- Store sources, tokens, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_role CHECK (role IN ('user', 'assistant', 'system'))
);

CREATE INDEX idx_chat_messages_session ON chat_messages(session_id, created_at);
```

#### Table: faqs
```sql
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  keywords TEXT[] NOT NULL,
  category VARCHAR(50),
  priority INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  usage_count INT DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_faqs_keywords ON faqs USING GIN(keywords);
CREATE INDEX idx_faqs_priority ON faqs(priority DESC) WHERE is_active = true;
```

#### Table: article_embeddings
```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE article_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  embedding vector(1536) NOT NULL,  -- OpenAI text-embedding-3-small dimension
  content_text TEXT,
  language VARCHAR(10) NOT NULL,  -- 'zh', 'en'
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(article_id, language)
);

CREATE INDEX idx_article_embeddings_vector ON article_embeddings
  USING hnsw (embedding vector_cosine_ops);
```

### API Endpoints

#### Authentication
- `POST /api/v1/auth/login` - Admin login, returns JWT token
- `POST /api/v1/auth/verify` - Verify JWT token validity

#### Articles
- `GET /api/v1/articles` - List articles (query params: category, status, page, page_size)
- `GET /api/v1/articles/{id}` - Get single article
- `POST /api/v1/articles` - Create article (admin only)
- `PUT /api/v1/articles/{id}` - Update article (admin only)
- `DELETE /api/v1/articles/{id}` - Delete article (admin only)

#### Appointments
- `POST /api/v1/appointments` - Create appointment
- `GET /api/v1/appointments` - List all appointments (admin only)
- `GET /api/v1/appointments/{id}` - Get appointment details
- `PUT /api/v1/appointments/{id}` - Update appointment status (admin only)
- `GET /api/v1/appointments/available-slots` - Get available time slots for a date

#### Chat
- `POST /api/v1/chat` - Send message and get AI response
- `GET /api/v1/chat/history/{session_id}` - Get chat history (optional)

#### FAQ Management (Admin)
- `GET /api/v1/faqs` - List FAQs
- `POST /api/v1/faqs` - Create FAQ (admin only)
- `PUT /api/v1/faqs/{id}` - Update FAQ (admin only)
- `DELETE /api/v1/faqs/{id}` - Delete FAQ (admin only)

### Frontend Integration

#### Files to Modify

1. **src/data/newsData.ts**
   - Add `category` field to NewsArticle interface
   - Add `summary` field (50-80 characters)
   - Add `publishedAt` timestamp
   - Replace localStorage functions with API calls

2. **src/components/NewsDetailPage.tsx**
   - Create `RelatedArticles` component
   - Fetch related articles from API: `GET /api/v1/articles?category={category}&page=1&page_size=6`
   - Implement "Load More" button (increment page)

3. **src/components/ConsultingPage.tsx**
   - Replace `alert()` with API call: `POST /api/v1/appointments`
   - Handle API response and show confirmation
   - Integrate chat API: `POST /api/v1/chat`

4. **src/contexts/AuthContext.tsx**
   - Add API login: `POST /api/v1/auth/login`
   - Store JWT token in localStorage
   - Add token to all API requests (Authorization header)

5. **New: src/services/api.ts**
   - Create centralized API client
   - Handle authentication headers
   - Error handling and retry logic

#### API Client Example
```typescript
// src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.your-domain.com';

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('jwt_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

export const articlesAPI = {
  list: (params: { category?: string; page?: number; page_size?: number }) =>
    apiCall(`/api/v1/articles?${new URLSearchParams(params as any)}`),
  get: (id: string) => apiCall(`/api/v1/articles/${id}`),
  create: (data: any) => apiCall('/api/v1/articles', { method: 'POST', body: JSON.stringify(data) }),
};

export const appointmentsAPI = {
  create: (data: any) => apiCall('/api/v1/appointments', { method: 'POST', body: JSON.stringify(data) }),
};

export const chatAPI = {
  send: (message: string, sessionId?: string) =>
    apiCall('/api/v1/chat', { method: 'POST', body: JSON.stringify({ message, session_id: sessionId }) }),
};
```

### Deployment Strategy

#### Phase 1: Local Development
1. Set up PostgreSQL locally (Docker recommended)
2. Run FastAPI with `uvicorn app.main:app --reload`
3. Test API endpoints with Swagger UI (http://localhost:8000/docs)
4. Frontend connects to `http://localhost:8000`

#### Phase 2: AWS Deployment
1. **Provision EC2 Instance**
   - Ubuntu 22.04 LTS
   - t3.small (2 vCPU, 2GB RAM)
   - Security Group: Allow 22 (SSH), 80 (HTTP), 443 (HTTPS)

2. **Set up PostgreSQL**
   - Option A: AWS RDS PostgreSQL (managed, recommended)
   - Option B: Install on EC2 (self-managed)
   - Install pgvector extension

3. **Deploy FastAPI**
   ```bash
   # Install dependencies
   sudo apt update
   sudo apt install python3.11 python3-pip nginx

   # Clone repository
   git clone <your-repo>
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt

   # Run database migrations
   alembic upgrade head

   # Configure systemd service
   sudo nano /etc/systemd/system/fastapi.service
   sudo systemctl start fastapi
   sudo systemctl enable fastapi

   # Configure Nginx
   sudo nano /etc/nginx/sites-available/api
   sudo systemctl restart nginx
   ```

4. **Configure SSL**
   - Use AWS Certificate Manager (ACM) for ALB
   - Or use Let's Encrypt with Certbot for Nginx

5. **Update Frontend**
   - Set `VITE_API_URL=https://api.your-domain.com` in Vercel environment variables
   - Redeploy frontend

### Security Considerations

- **CORS**: Whitelist only frontend domain
- **Rate Limiting**: Implement rate limiting on API endpoints (10 req/sec per IP)
- **SQL Injection**: Use SQLAlchemy parameterized queries (automatic)
- **XSS Protection**: Sanitize user inputs, use Content-Security-Policy headers
- **JWT Security**: Use strong secret key (32+ characters), 7-day expiration
- **HTTPS Only**: Enforce HTTPS in production
- **Environment Variables**: Never commit `.env` file, use AWS Secrets Manager for production
- **Database**: Use strong passwords, restrict network access to EC2 only

### Performance Optimization

- **Database Indexing**: All foreign keys and frequently queried fields indexed
- **Connection Pooling**: SQLAlchemy pool (size=10, max_overflow=20)
- **Caching**: Consider Redis for frequently accessed data (future enhancement)
- **CDN**: Use CloudFront for static assets (future enhancement)
- **Vector Search**: Use HNSW index for fast similarity search
- **Async Operations**: Email notifications sent asynchronously (background tasks)

### Monitoring & Logging

- **Application Logs**: Use Python logging module, write to `/var/log/fastapi/`
- **Error Tracking**: Consider Sentry integration (future enhancement)
- **Performance Monitoring**: AWS CloudWatch for EC2 metrics
- **Database Monitoring**: RDS Performance Insights or pg_stat_statements
- **Uptime Monitoring**: Consider UptimeRobot or AWS CloudWatch alarms

