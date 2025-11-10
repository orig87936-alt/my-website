# Implementation Plan: 新闻上传功能增强 - 智能翻译与文档导入

**Branch**: `002-news-upload-enhancements` | **Date**: 2025-11-09 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `.specify/specs/002-news-upload-enhancements/spec.md`

## Summary

本功能为新闻管理系统添加两个核心增强：

1. **智能翻译系统**：集成 DeepSeek API 实现自动翻译，支持单字段和批量翻译，翻译后允许人工编辑
2. **文档智能导入**：支持上传 Markdown 和 Word 文档，自动解析、提取图片、生成元数据并翻译

**技术方案**：
- 后端：FastAPI + DeepSeek API + python-docx + python-markdown
- 前端：React + TypeScript + react-dropzone
- 数据库：PostgreSQL（新增 3 个表）
- 图片处理：复用现有的图片上传 API

**预期收益**：内容发布时间减少 70%，翻译成本降低 90%，支持文章内插入多张图片

## Technical Context

**Language/Version**: 
- Backend: Python 3.11+
- Frontend: TypeScript 5.x + React 18.3.1

**Primary Dependencies**:
- Backend: FastAPI 0.109+, python-docx 1.1+, python-markdown 3.5+, httpx 0.25+, langdetect 1.0+
- Frontend: react-dropzone 14.x, 现有的 MarkdownRenderer 组件

**Storage**: PostgreSQL 14+ (现有数据库，新增 3 个表)

**Testing**: 
- Backend: pytest + pytest-asyncio
- Frontend: 手动测试 + 集成测试

**Target Platform**: 
- Backend: Linux server (现有部署环境)
- Frontend: Web browsers (Chrome, Firefox, Safari, Edge)

**Project Type**: Web application (frontend + backend)

**Performance Goals**:
- 单字段翻译响应时间 < 3秒 (95%)
- 批量翻译响应时间 < 10秒 (95%)
- 文档上传和解析时间 < 15秒 (< 5MB 文档)
- 图片并发上传：最多 5 张同时

**Constraints**:
- 翻译 API 成本控制在每月 $50 以内
- 文件大小限制：10MB
- 支持格式：.md, .docx
- 向后兼容：不影响现有手动填写功能

**Scale/Scope**:
- 预计每天 10-20 篇文章发布
- 每篇文章平均 2-5 张图片
- 翻译缓存有效期 30 天

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

根据 `.specify/memory/constitution.md` 检查：

| 原则 | 检查项 | 状态 | 说明 |
|------|--------|------|------|
| **I. User Experience First** | 简化上传流程 | ✅ PASS | 文档导入和翻译功能显著简化操作 |
| **I. User Experience First** | 向后兼容 | ✅ PASS | 完全保留现有手动填写方式 |
| **II. Modern Tech Stack** | 使用现代技术 | ✅ PASS | DeepSeek API, python-docx, react-dropzone |
| **II. Modern Tech Stack** | 最小依赖 | ✅ PASS | 复用现有组件（MarkdownRenderer, ImageUploader） |
| **III. Performance & Accessibility** | 性能要求 | ✅ PASS | 响应时间 < 3秒（单字段），< 15秒（文档） |
| **III. Performance & Accessibility** | 可访问性 | ✅ PASS | 所有按钮支持键盘操作，错误提示清晰 |
| **IV. Responsive Design** | 移动端适配 | ✅ PASS | 对话框和表单响应式设计 |
| **V. Code Quality** | 代码质量 | ✅ PASS | TypeScript 类型安全，Python 类型注解 |

**结论**: 所有原则检查通过，无违规项。

## Project Structure

### Documentation (this feature)

```text
.specify/specs/002-news-upload-enhancements/
├── spec.md                          # 功能规格说明（已完成）
├── README.md                        # 概述文档（已完成）
├── IMPLEMENTATION_CHECKLIST.md     # 实施检查清单（已完成）
├── plan.md                          # 本文件（技术实现计划）
├── research.md                      # Phase 0 输出（技术研究）
├── data-model.md                    # Phase 1 输出（数据模型设计）
├── contracts/                       # Phase 1 输出（API 规范）
│   ├── translation-api.md
│   └── document-upload-api.md
├── quickstart.md                    # Phase 1 输出（快速开始指南）
└── tasks.md                         # Phase 2 输出（任务分解）
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── routers/
│   │   ├── translation.py           # 🆕 翻译 API 路由
│   │   ├── documents.py             # 🆕 文档上传 API 路由
│   │   └── upload.py                # ✅ 现有图片上传（复用）
│   ├── services/
│   │   ├── translation.py           # 🆕 翻译服务
│   │   ├── document_parser.py       # 🆕 文档解析服务
│   │   ├── metadata_generator.py    # 🆕 AI 元数据生成
│   │   └── deepseek.py              # ✅ 现有 DeepSeek 服务（扩展）
│   ├── models/
│   │   ├── translation.py           # 🆕 翻译相关模型
│   │   └── document.py              # 🆕 文档上传模型
│   ├── schemas/
│   │   ├── translation.py           # 🆕 翻译 Pydantic schemas
│   │   └── document.py              # 🆕 文档 Pydantic schemas
│   └── alembic/
│       └── versions/
│           └── xxx_add_translation_tables.py  # 🆕 数据库迁移
└── tests/
    ├── test_translation.py          # 🆕 翻译服务测试
    └── test_document_parser.py      # 🆕 文档解析测试

frontend/
├── src/
│   ├── components/
│   │   ├── NewsCreateForm.tsx       # 📝 修改：添加翻译按钮
│   │   ├── NewsEditor.tsx           # 📝 修改：添加翻译按钮
│   │   ├── NewsAdminPage.tsx        # 📝 修改：添加文档上传按钮
│   │   ├── TranslateButton.tsx      # 🆕 翻译按钮组件
│   │   ├── DocumentUploadDialog.tsx # 🆕 文档上传对话框
│   │   ├── DocumentPreviewPanel.tsx # 🆕 文档预览面板
│   │   ├── ImageUploader.tsx        # ✅ 现有组件（复用）
│   │   └── MarkdownRenderer.tsx     # ✅ 现有组件（复用）
│   └── services/
│       ├── api.ts                   # 📝 修改：添加翻译和文档 API
│       └── uploadAPI.ts             # ✅ 现有图片上传（复用）
└── tests/
    └── integration/
        └── document-upload.test.ts  # 🆕 文档上传集成测试
```

**Structure Decision**: 
- 采用 Web application 结构（frontend + backend）
- 复用现有组件和服务，最小化新增代码
- 新增 3 个后端路由、3 个服务、2 个模型
- 新增 3 个前端组件，修改 3 个现有组件

## Complexity Tracking

无违规项，无需填写。

## Phase 0: Research & Technical Decisions

**目标**: 确定技术选型和实现细节

### 0.1 翻译 API 选择

**研究问题**:
- DeepSeek API 是否支持翻译？
- 如果不支持，选择 DeepL 还是 Google Translate？
- 如何实现语言自动检测？

**决策**:
1. **优先方案**: 使用 DeepSeek Chat API 进行翻译
   - 优点：已有 API 密钥，成本低
   - 缺点：翻译质量可能不如专业翻译 API
   - 实现：通过 prompt engineering 优化翻译质量

2. **备选方案**: 集成 DeepL API
   - 优点：翻译质量高，支持多语言
   - 缺点：需要额外 API 密钥，成本较高
   - 触发条件：DeepSeek 翻译质量不达标

3. **语言检测**: 使用 `langdetect` Python 库
   - 轻量级，无需额外 API 调用
   - 准确率高（> 95%）

### 0.2 文档解析技术

**研究问题**:
- 如何解析 Word 文档？
- 如何提取 Word 中的图片？
- 如何处理复杂格式（表格、代码块）？

**决策**:
1. **Markdown 解析**: 使用 `python-markdown` 或 `mistune`
   - 推荐 `mistune`：更快，更现代
   - 支持 GFM（GitHub Flavored Markdown）

2. **Word 解析**: 使用 `python-docx`
   - 成熟稳定，文档完善
   - 支持提取图片（InlineShapes）
   - 支持表格解析

3. **图片提取**:
   - Word: 使用 `python-docx` 提取 InlineShapes
   - Markdown: 正则表达式匹配 `![alt](url)`
   - 并发上传：使用 `asyncio.gather`（最多 5 张）

### 0.3 ContentBlock 转换策略

**研究问题**:
- 如何将文档内容转换为 ContentBlock 格式？
- 如何处理文章内的多张图片？

**决策**:
1. **转换流程**:
   ```
   Word/Markdown → 解析 → 提取元素 → 转换为 ContentBlock[]
   ```

2. **图片处理**:
   ```python
   # 示例 ContentBlock
   {
     "type": "image",
     "url": "https://server.com/uploads/image1.jpg",
     "alt": "图片描述",
     "caption": "图片说明"
   }
   ```

3. **改进手动填写**:
   - 选项 A（推荐）：改进 `textToContentBlocks` 支持 Markdown 图片语法
   - 选项 B（未来）：添加富文本编辑器

**输出**: 创建 `research.md` 文档详细记录研究结果

## Phase 1: Design & Architecture

**目标**: 设计数据模型、API 规范和系统架构

### 1.1 数据模型设计

创建 `data-model.md`，包含：

1. **TranslationCache 表**
   ```sql
   CREATE TABLE translation_cache (
     id UUID PRIMARY KEY,
     source_text_hash VARCHAR(64) NOT NULL,
     source_text TEXT NOT NULL,
     translated_text TEXT NOT NULL,
     source_lang VARCHAR(10) NOT NULL,
     target_lang VARCHAR(10) NOT NULL,
     created_at TIMESTAMP DEFAULT NOW(),
     expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '30 days',
     UNIQUE(source_text_hash, source_lang, target_lang)
   );
   ```

2. **TranslationLog 表**
   ```sql
   CREATE TABLE translation_logs (
     id UUID PRIMARY KEY,
     article_id UUID REFERENCES articles(id),
     field_name VARCHAR(50) NOT NULL,
     source_text TEXT NOT NULL,
     translated_text TEXT NOT NULL,
     source_lang VARCHAR(10) NOT NULL,
     target_lang VARCHAR(10) NOT NULL,
     manually_edited BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

3. **DocumentUpload 表**
   ```sql
   CREATE TABLE document_uploads (
     id UUID PRIMARY KEY,
     filename VARCHAR(255) NOT NULL,
     file_size INTEGER NOT NULL,
     file_type VARCHAR(50) NOT NULL,
     upload_status VARCHAR(20) NOT NULL,
     parse_result JSONB,
     created_by VARCHAR(100),
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

### 1.2 API 规范设计

创建 `contracts/` 目录，包含：

1. **translation-api.md**: 翻译 API 规范
2. **document-upload-api.md**: 文档上传 API 规范

### 1.3 快速开始指南

创建 `quickstart.md`，包含：
- 环境配置（API 密钥）
- 本地开发步骤
- 测试指南

**输出**: `data-model.md`, `contracts/`, `quickstart.md`

## Next Steps

1. ✅ 完成 Phase 0 研究（创建 `research.md`）
2. ✅ 完成 Phase 1 设计（创建 `data-model.md`, `contracts/`, `quickstart.md`）
3. ⏭️ 运行 `/speckit.tasks` 生成详细任务分解
4. ⏭️ 运行 `/speckit.implement` 开始实施

---

**计划版本**: 1.0  
**创建日期**: 2025-11-09  
**最后更新**: 2025-11-09  
**负责人**: [待指定]

