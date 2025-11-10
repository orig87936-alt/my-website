# Tasks: 新闻上传功能增强 - 智能翻译与文档导入

**Input**: Design documents from `.specify/specs/002-news-upload-enhancements/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: 不包含测试任务（规格中未明确要求 TDD）

**Organization**: 任务按用户故事分组，每个故事可独立实现和测试

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行执行（不同文件，无依赖）
- **[Story]**: 任务所属用户故事（US1, US2）
- 包含精确的文件路径

## Path Conventions

- **Web app**: `backend/app/`, `src/` (frontend)
- 后端路径：`backend/app/routers/`, `backend/app/services/`, `backend/app/models/`
- 前端路径：`src/components/`, `src/services/`

---

## Phase 1: Setup (共享基础设施)

**Purpose**: 项目初始化和基本结构

- [ ] T001 创建新分支 `002-news-upload-enhancements`
- [ ] T002 [P] 安装后端依赖：`pip install python-docx==1.1.0 mistune==3.0.2 langdetect==1.0.9 python-multipart==0.0.6`
- [ ] T003 [P] 安装前端依赖：`npm install react-dropzone@14.2.3`
- [ ] T004 [P] 配置环境变量：在 `backend/.env` 添加翻译和文档上传配置
- [ ] T005 创建数据库迁移文件：`backend/app/alembic/versions/xxx_add_translation_tables.py`
- [ ] T006 执行数据库迁移：`alembic upgrade head`

---

## Phase 2: Foundational (阻塞性前置条件)

**Purpose**: 所有用户故事依赖的核心基础设施

**⚠️ CRITICAL**: 此阶段完成前，任何用户故事都无法开始

- [ ] T007 [P] 创建翻译数据模型：`backend/app/models/translation.py` (TranslationCache, TranslationLog)
- [ ] T008 [P] 创建文档上传数据模型：`backend/app/models/document.py` (DocumentUpload)
- [ ] T009 [P] 创建翻译 Pydantic schemas：`backend/app/schemas/translation.py`
- [ ] T010 [P] 创建文档上传 Pydantic schemas：`backend/app/schemas/document.py`
- [ ] T011 扩展 DeepSeek 服务：在 `backend/app/services/deepseek.py` 添加翻译方法
- [ ] T012 更新 schemas 导出：`backend/app/schemas/__init__.py`
- [ ] T013 更新 models 导出：`backend/app/models/__init__.py`

**Checkpoint**: 基础设施就绪 - 用户故事实现可以并行开始

---

## Phase 3: User Story 1 - 智能翻译系统 (Priority: P0) 🎯 MVP

**Goal**: 管理员可以一键翻译文章字段，支持单字段和批量翻译，翻译后可编辑

**Independent Test**: 
1. 在新闻创建表单中输入中文标题
2. 点击"翻译"按钮
3. 验证英文标题自动填充
4. 修改翻译后的文本
5. 保存并验证修改被保留

### Backend Implementation for User Story 1

- [ ] T014 [P] [US1] 创建翻译服务：`backend/app/services/translation.py` (TranslationService 类)
- [ ] T015 [P] [US1] 实现语言检测功能：在 `backend/app/services/translation.py` 添加 `detect_language()` 方法
- [ ] T016 [US1] 实现单字段翻译：在 `backend/app/services/translation.py` 添加 `translate_text()` 方法
- [ ] T017 [US1] 实现批量翻译：在 `backend/app/services/translation.py` 添加 `batch_translate()` 方法
- [ ] T018 [US1] 实现翻译缓存逻辑：在 `backend/app/services/translation.py` 添加缓存读写方法
- [ ] T019 [US1] 创建翻译 API 路由：`backend/app/routers/translation.py`
- [ ] T020 [US1] 实现 `POST /api/v1/translation/translate` 端点
- [ ] T021 [US1] 实现 `POST /api/v1/translation/batch-translate` 端点
- [ ] T022 [US1] 实现 `POST /api/v1/translation/detect-language` 端点
- [ ] T023 [US1] 实现 `GET /api/v1/translation/history` 端点
- [ ] T024 [US1] 注册翻译路由：在 `backend/app/main.py` 添加 `app.include_router(translation.router)`
- [ ] T025 [US1] 添加速率限制：在翻译端点添加 `@limiter.limit()` 装饰器
- [ ] T026 [US1] 更新 services 导出：在 `backend/app/services/__init__.py` 导出 TranslationService

### Frontend Implementation for User Story 1

- [ ] T027 [P] [US1] 创建翻译按钮组件：`src/components/TranslateButton.tsx`
- [ ] T028 [P] [US1] 添加翻译 API 方法：在 `src/services/api.ts` 添加 `translateText()` 和 `batchTranslate()`
- [ ] T029 [US1] 修改新闻创建表单：在 `src/components/NewsCreateForm.tsx` 添加单字段翻译按钮
- [ ] T030 [US1] 添加批量翻译按钮：在 `src/components/NewsCreateForm.tsx` 顶部添加"全部翻译"按钮
- [ ] T031 [US1] 实现翻译状态管理：在 `NewsCreateForm.tsx` 添加 loading 和 error 状态
- [ ] T032 [US1] 实现手动编辑标记：翻译后修改字段时标记为 `manually_edited`
- [ ] T033 [US1] 修改新闻编辑器：在 `src/components/NewsEditor.tsx` 添加翻译按钮
- [ ] T034 [US1] 添加翻译错误处理：显示友好的错误提示

**Checkpoint**: 智能翻译系统完全功能，可独立测试

---

## Phase 4: User Story 2 - 文档智能导入 (Priority: P1)

**Goal**: 管理员可以上传 Markdown/Word 文档，系统自动解析、提取图片、生成元数据并翻译

**Independent Test**:
1. 准备包含 3 张图片的 Word 文档
2. 点击"上传文档"按钮
3. 选择文档并勾选"自动翻译"
4. 验证表单自动填充所有字段
5. 验证所有图片正确显示
6. 验证中英文内容都已生成

### Backend Implementation for User Story 2

- [ ] T035 [P] [US2] 创建文档解析服务：`backend/app/services/document_parser.py` (DocumentParser 类)
- [ ] T036 [P] [US2] 实现 Markdown 解析：在 `DocumentParser` 添加 `parse_markdown()` 方法
- [ ] T037 [P] [US2] 实现 Word 解析：在 `DocumentParser` 添加 `parse_word()` 方法
- [ ] T038 [US2] 实现图片提取：在 `DocumentParser` 添加 `extract_images()` 方法
- [ ] T039 [US2] 实现图片并发上传：在 `DocumentParser` 添加 `upload_images_concurrently()` 方法（最多 5 张）
- [ ] T040 [US2] 实现 ContentBlock 转换：在 `DocumentParser` 添加 `convert_to_content_blocks()` 方法
- [ ] T041 [P] [US2] 创建 AI 元数据生成服务：`backend/app/services/metadata_generator.py`
- [ ] T042 [US2] 实现摘要生成：在 `MetadataGenerator` 添加 `generate_summary()` 方法
- [ ] T043 [US2] 实现分类建议：在 `MetadataGenerator` 添加 `suggest_category()` 方法
- [ ] T044 [US2] 实现标签提取：在 `MetadataGenerator` 添加 `extract_tags()` 方法
- [ ] T045 [US2] 创建文档上传 API 路由：`backend/app/routers/documents.py`
- [ ] T046 [US2] 实现 `POST /api/v1/documents/upload` 端点（包含文件验证）
- [ ] T047 [US2] 实现 `GET /api/v1/documents/history` 端点
- [ ] T048 [US2] 实现 `GET /api/v1/documents/{upload_id}` 端点
- [ ] T049 [US2] 集成翻译服务：在文档上传流程中调用 `batch_translate()`（如果 auto_translate=true）
- [ ] T050 [US2] 注册文档路由：在 `backend/app/main.py` 添加 `app.include_router(documents.router)`
- [ ] T051 [US2] 添加文件大小限制：配置 FastAPI 最大上传大小为 10MB
- [ ] T052 [US2] 实现临时文件清理：上传完成后删除临时文件
- [ ] T053 [US2] 更新 services 导出：在 `backend/app/services/__init__.py` 导出新服务

### Frontend Implementation for User Story 2

- [ ] T054 [P] [US2] 创建文档上传对话框：`src/components/DocumentUploadDialog.tsx`
- [ ] T055 [P] [US2] 创建文档预览面板：`src/components/DocumentPreviewPanel.tsx`
- [ ] T056 [US2] 集成 react-dropzone：在 `DocumentUploadDialog` 中实现拖拽上传
- [ ] T057 [US2] 添加文档上传 API 方法：在 `src/services/api.ts` 添加 `uploadDocument()`
- [ ] T058 [US2] 修改新闻管理页面：在 `src/components/NewsAdminPage.tsx` 添加"上传文档"按钮
- [ ] T059 [US2] 实现文档上传流程：点击按钮 → 打开对话框 → 上传 → 解析 → 填充表单
- [ ] T060 [US2] 实现表单自动填充：将解析结果填充到 `NewsCreateForm`
- [ ] T061 [US2] 实现预览功能：在对话框中显示解析后的内容预览
- [ ] T062 [US2] 添加上传进度显示：显示解析进度和图片上传进度
- [ ] T063 [US2] 添加文件验证：前端验证文件类型和大小
- [ ] T064 [US2] 添加错误处理：显示文件上传和解析错误

### Improvement for Manual Entry (User Story 2)

- [ ] T065 [US2] 改进 textToContentBlocks：在 `src/components/NewsCreateForm.tsx` 中支持 Markdown 图片语法 `![alt](url)`
- [ ] T066 [US2] 支持多级标题：解析 `##`, `###` 等标题
- [ ] T067 [US2] 支持代码块：解析 ` ``` ` 代码块语法
- [ ] T068 [US2] 支持引用：解析 `>` 引用语法

**Checkpoint**: 文档智能导入完全功能，可独立测试，与 US1 翻译功能集成

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: 影响多个用户故事的改进

- [ ] T069 [P] 添加翻译缓存清理任务：创建定时任务每天清理过期缓存
- [ ] T070 [P] 优化翻译性能：实现并发翻译（批量翻译时最多 4 个字段同时）
- [ ] T071 [P] 添加翻译质量监控：记录翻译时间和缓存命中率
- [ ] T072 [P] 优化文档解析性能：使用流式处理大文件
- [ ] T073 [P] 添加安全检查：文档内容扫描防止恶意代码
- [ ] T074 [P] 添加 XSS 防护：Markdown 渲染时过滤危险标签
- [ ] T075 [P] 更新 API 文档：在 FastAPI docs 中添加新端点说明
- [ ] T076 代码审查和重构：优化代码质量
- [ ] T077 性能测试：验证翻译和文档上传性能达标
- [ ] T078 用户验收测试：按照 quickstart.md 进行完整测试
- [ ] T079 更新项目文档：更新 README.md 和用户手册

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 可立即开始
- **Foundational (Phase 2)**: 依赖 Setup 完成 - 阻塞所有用户故事
- **User Stories (Phase 3-4)**: 都依赖 Foundational 完成
  - US1 和 US2 可以并行开发（如果有多人）
  - 或按优先级顺序：US1 → US2
- **Polish (Phase 5)**: 依赖所有用户故事完成

### User Story Dependencies

- **User Story 1 (P0)**: Foundational 完成后可开始 - 无其他故事依赖
- **User Story 2 (P1)**: Foundational 完成后可开始 - 集成 US1 的翻译功能，但可独立测试

### Within Each User Story

- Backend 和 Frontend 任务可并行
- Models → Services → Endpoints (后端)
- Components → API integration → UI integration (前端)
- 核心实现 → 集成 → 错误处理

### Parallel Opportunities

- Phase 1: T002, T003, T004 可并行
- Phase 2: T007, T008, T009, T010 可并行
- US1 Backend: T014, T015 可并行
- US1 Frontend: T027, T028 可并行
- US2 Backend: T035, T036, T037, T041 可并行
- US2 Frontend: T054, T055 可并行
- Phase 5: 所有标记 [P] 的任务可并行

---

## Parallel Example: User Story 1 Backend

```bash
# 并行启动 US1 后端任务:
Task T014: "创建翻译服务：backend/app/services/translation.py"
Task T015: "实现语言检测功能：backend/app/services/translation.py"

# 然后串行:
Task T016: "实现单字段翻译" (依赖 T014)
Task T017: "实现批量翻译" (依赖 T016)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. 完成 Phase 1: Setup (T001-T006)
2. 完成 Phase 2: Foundational (T007-T013) - **关键阻塞点**
3. 完成 Phase 3: User Story 1 (T014-T034)
4. **停止并验证**: 独立测试 US1
5. 如果就绪可部署/演示

### Incremental Delivery

1. Setup + Foundational → 基础就绪
2. 添加 User Story 1 → 独立测试 → 部署/演示 (MVP!)
3. 添加 User Story 2 → 独立测试 → 部署/演示
4. 每个故事都增加价值而不破坏之前的功能

### Parallel Team Strategy

如果有多个开发者:

1. 团队一起完成 Setup + Foundational
2. Foundational 完成后:
   - Developer A: User Story 1 (Backend)
   - Developer B: User Story 1 (Frontend)
   - Developer C: User Story 2 (Backend)
   - Developer D: User Story 2 (Frontend)
3. 故事独立完成和集成

---

## Summary

- **总任务数**: 79
- **User Story 1 任务数**: 21 (T014-T034)
- **User Story 2 任务数**: 34 (T035-T068)
- **并行机会**: 约 30% 的任务可并行执行
- **MVP 范围**: Phase 1 + Phase 2 + Phase 3 (User Story 1) = 34 任务
- **预计时间**: 
  - MVP (US1): 3-4 天
  - 完整功能 (US1 + US2): 7-10 天

---

## Notes

- [P] 任务 = 不同文件，无依赖
- [Story] 标签将任务映射到特定用户故事以便追溯
- 每个用户故事应该可独立完成和测试
- 在每个 checkpoint 停止以独立验证故事
- 避免：模糊任务、同文件冲突、破坏独立性的跨故事依赖

