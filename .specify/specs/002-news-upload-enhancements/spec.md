# Feature Specification: 新闻上传功能增强 - 智能翻译与文档导入

**Feature Branch**: `002-news-upload-enhancements`  
**Created**: 2025-11-09  
**Status**: Draft  
**Priority**: High  
**Input**: 增强新闻上传体验：自动翻译功能 + 文档智能导入（Markdown/Word）

---

## Executive Summary

本规格说明定义了新闻管理系统的两个核心增强功能：

1. **智能翻译系统**：管理员只需输入一种语言（中文或英文），系统自动翻译所有字段，支持单字段翻译和批量翻译，翻译后允许人工编辑和审核。

2. **文档智能导入**：支持上传 Markdown 和 Word 文档，自动解析文档结构、提取图片、生成元数据，并自动翻译成多语言版本，大幅提升内容发布效率。

**预期收益**：
- 内容发布时间减少 70%（从平均 30 分钟降至 10 分钟）
- 翻译成本降低 90%（无需人工翻译）
- 内容质量提升（AI 辅助优化 + 人工审核）
- 用户体验改善（简化上传流程）
- **解决当前限制**：支持文章内插入多张图片（当前只能上传一张标题图）

**重要说明**：
- ✅ **完全向后兼容**：现有的手动填写方式100%保留
- ✅ **可选增强**：翻译和文档导入都是可选功能，不强制使用
- ✅ **灵活组合**：可以混合使用手动填写、翻译、文档导入
- ✅ **用户控制**：所有自动生成的内容都可以手动编辑

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 智能翻译系统 (Priority: P0 - Critical)

**作为**内容管理员，**当我**创建或编辑新闻文章时，**我希望**只需输入中文或英文内容，系统能够自动翻译成其他语言，**以便**我能够快速发布多语言内容，而不需要手动翻译或等待翻译团队。

**Why this priority**: 这是最高优先级功能，因为它直接解决了当前最大的痛点（手动翻译耗时），且是文档导入功能的基础依赖。

**Independent Test**: 可以通过在新闻创建表单中输入中文标题，点击"翻译"按钮，验证是否自动生成英文翻译，且翻译结果可编辑。

**Acceptance Scenarios**:

1. **Given** 管理员在新闻创建表单中输入了中文标题，**When** 点击标题字段旁的"翻译"按钮，**Then** 系统调用翻译API，在英文标题字段中显示翻译结果，并显示"翻译中..."加载状态
   
2. **Given** 管理员已填写所有中文字段（标题、摘要、引言、正文），**When** 点击表单顶部的"全部翻译"按钮，**Then** 系统批量翻译所有空白的英文字段，显示翻译进度条

3. **Given** 系统已自动翻译某个字段，**When** 管理员手动修改翻译结果，**Then** 系统保存修改后的内容，不再覆盖该字段（标记为"已人工编辑"）

4. **Given** 翻译API调用失败（网络错误、API限额等），**When** 用户点击翻译按钮，**Then** 系统显示友好的错误提示，并提供"重试"按钮

5. **Given** 管理员输入了英文内容，**When** 点击"翻译"按钮，**Then** 系统自动检测源语言为英文，翻译成中文

6. **Given** 管理员完成翻译并提交表单，**When** 选择"保存为草稿"，**Then** 文章保存为草稿状态，可以稍后继续编辑

7. **Given** 某个字段的翻译质量不佳，**When** 管理员点击"重新翻译"按钮，**Then** 系统重新调用API生成新的翻译结果

---

### User Story 2 - 文档智能导入 (Priority: P1 - High)

**作为**内容管理员，**当我**已经在 Word 或 Markdown 中编写好文章时，**我希望**能够直接上传文档，系统自动解析内容、提取图片、生成元数据并翻译，**以便**我能够一键发布文章，而不需要复制粘贴和手动格式化。

**Why this priority**: 这是第二优先级功能，能够显著提升内容发布效率，特别是对于长文章和包含大量图片的内容。

**Independent Test**: 可以通过上传一个包含标题、段落、图片、列表的 Word 文档，验证系统是否正确解析所有内容并生成预览。

**Acceptance Scenarios**:

1. **Given** 管理员在新闻创建页面，**When** 点击"上传文档"按钮并选择 .docx 或 .md 文件，**Then** 系统显示文件上传进度条，上传完成后显示"解析中..."状态

2. **Given** 系统成功解析文档，**When** 解析完成，**Then** 系统自动填充表单字段（标题、正文），并在右侧显示预览面板，展示解析后的文章效果

3. **Given** 文档中包含图片，**When** 系统解析文档，**Then** 自动提取所有图片，上传到服务器，并在正文中插入图片链接（Markdown 格式）

4. **Given** 上传的是中文文档，**When** 解析完成后，**Then** 系统弹出对话框询问"是否自动翻译成英文？"，用户确认后自动翻译所有字段

5. **Given** 系统解析文档后，**When** 显示元数据建议（分类、摘要、标签），**Then** 管理员可以选择接受AI建议或手动修改

6. **Given** 管理员上传文档时，**When** 在上传对话框中选择"所属模块"（头条/分析/观点等），**Then** 系统自动将文章分类设置为选定的模块

7. **Given** 文档格式不支持或解析失败，**When** 上传文档，**Then** 系统显示错误提示，说明支持的格式和文件大小限制（最大 10MB）

8. **Given** 文档中包含复杂格式（表格、代码块、引用），**When** 系统解析文档，**Then** 自动转换为 Markdown 格式，保留基本结构和样式

---

## Clarifications

### Session 2025-11-09

**翻译功能相关：**

- **Q**: 使用哪种翻译服务？  
  **A**: 混合方案 - 优先使用 DeepSeek API（已有密钥），如果不支持翻译则集成专业翻译API（DeepL 或 Google Translate），翻译后允许人工编辑

- **Q**: 翻译触发时机？  
  **A**: 点击按钮翻译 - 每个字段旁边有独立的"翻译"按钮，表单顶部有"全部翻译"按钮

- **Q**: 翻译哪些字段？  
  **A**: 全部字段都支持翻译（标题、摘要、引言、正文），但允许单独翻译每个字段

- **Q**: 翻译质量控制？  
  **A**: 翻译后保存为草稿状态，允许编辑。管理员可以修改翻译结果，修改后的字段不会被自动覆盖

**文档导入相关：**

- **Q**: 支持哪些文档格式？
  **A**: 优先支持 Markdown (.md) 和 Word (.docx)，这两种最实用

- **Q**: 文档解析策略？
  **A**: 转换为 Markdown 格式并用 AI 优化。自动识别标题、段落、列表、图片、代码块等结构

- **Q**: 图片处理方式？
  **A**: 自动提取文档中的**所有图片**并上传到服务器，替换文档中的图片引用为服务器URL。转换为 ContentBlock 格式（type: 'image', url, alt, caption）。这解决了当前手动上传只能添加一张标题图的限制。

- **Q**: 多语言文档处理？
  **A**: 上传中文文档后自动翻译成英文，一步到位。上传时弹窗询问是否翻译

- **Q**: 元数据提取？
  **A**: AI 辅助生成摘要、分类、标签建议，管理员确认或修改。上传时可选择所属模块

- **Q**: 文档上传时的模块选择？
  **A**: 在上传对话框中提供下拉菜单，让用户选择文章所属模块（头条/分析/观点/市场/公司/政策）

- **Q**: 文档上传后是否可以手动编辑？
  **A**: 是的！文档上传后会自动填充表单，但所有字段都可以手动编辑。这是可选的增强功能，不替代手动填写方式。

- **Q**: 如何处理文章内的多张图片？
  **A**: 文档解析器会提取所有图片，并发上传（最多5张同时），然后在 content_zh/content_en 中插入对应的 ContentBlock（type: 'image'）。MarkdownRenderer 会正确渲染这些图片。

---

## Requirements *(mandatory)*

### Functional Requirements

#### 智能翻译系统

- **FR-001**: 系统必须在每个可翻译字段（标题、摘要、引言、正文）旁边显示"翻译"按钮图标
- **FR-002**: 系统必须在表单顶部提供"全部翻译"按钮，支持批量翻译所有空白字段
- **FR-003**: 点击"翻译"按钮时，系统必须自动检测源语言（中文或英文）
- **FR-004**: 系统必须调用翻译API（优先 DeepSeek，备选 DeepL/Google Translate）
- **FR-005**: 翻译过程中必须显示加载状态（"翻译中..."或进度条）
- **FR-006**: 翻译完成后，系统必须在目标语言字段中填充翻译结果
- **FR-007**: 用户手动修改翻译结果后，系统必须标记该字段为"已人工编辑"，不再自动覆盖
- **FR-008**: 系统必须提供"重新翻译"功能，允许用户重新生成翻译
- **FR-009**: 翻译失败时，系统必须显示友好的错误提示和"重试"按钮
- **FR-010**: 系统必须支持双向翻译（中文→英文、英文→中文）
- **FR-011**: 翻译后的文章默认保存为"草稿"状态，需要管理员审核后发布
- **FR-012**: 系统必须记录翻译历史（原文、译文、翻译时间、是否人工修改）

#### 文档智能导入

- **FR-013**: 系统必须在新闻创建页面提供"上传文档"按钮
- **FR-014**: 系统必须支持上传 .md（Markdown）和 .docx（Word）格式文件
- **FR-015**: 文件大小限制为 10MB，超出时显示错误提示
- **FR-016**: 上传时必须显示文件上传进度条
- **FR-017**: 上传对话框必须提供"所属模块"下拉菜单（头条/分析/观点/市场/公司/政策）
- **FR-018**: 系统必须解析文档结构，识别标题、段落、列表、图片、代码块、引用等元素
- **FR-019**: 系统必须将文档内容转换为 Markdown 格式存储
- **FR-020**: 系统必须自动提取文档中的图片，上传到服务器（使用现有的图片上传API）
- **FR-021**: 系统必须将文档中的图片引用替换为服务器URL
- **FR-022**: 解析完成后，系统必须自动填充表单字段（标题、正文、分类）
- **FR-023**: 系统必须在右侧显示预览面板，展示解析后的文章效果（使用 MarkdownRenderer）
- **FR-024**: 系统必须使用 AI 生成文章摘要建议（50-80字符）
- **FR-025**: 系统必须使用 AI 分析文章内容，建议分类和标签
- **FR-026**: 解析完成后，系统必须弹出对话框询问"是否自动翻译成其他语言？"
- **FR-027**: 用户确认翻译后，系统必须自动翻译所有字段（调用翻译功能）
- **FR-028**: 系统必须支持解析 Word 文档中的表格，转换为 Markdown 表格格式
- **FR-029**: 系统必须支持解析代码块，保留语言标识（如 ```python）
- **FR-030**: 文档解析失败时，系统必须显示详细的错误信息和支持的格式说明

### Non-Functional Requirements

- **NFR-001**: 单字段翻译响应时间 < 3秒（95%情况）
- **NFR-002**: 全文翻译（4个字段）响应时间 < 10秒（95%情况）
- **NFR-003**: 文档上传和解析总时间 < 15秒（对于 < 5MB 的文档）
- **NFR-004**: 图片提取和上传并发处理，最多同时上传 5 张图片
- **NFR-005**: 翻译API调用失败时，系统必须自动重试最多 3 次
- **NFR-006**: 系统必须缓存翻译结果，相同内容不重复调用API
- **NFR-007**: 文档解析必须支持中文、英文、日文等多语言内容
- **NFR-008**: 系统必须记录所有翻译和文档导入操作日志，用于审计和调试

### Key Entities

- **TranslationRequest（翻译请求）**: 包含源文本、源语言、目标语言、翻译结果、状态、创建时间
- **TranslationCache（翻译缓存）**: 包含源文本哈希、翻译结果、语言对、创建时间、过期时间
- **DocumentUpload（文档上传）**: 包含文件名、文件大小、文件类型、上传状态、解析结果、创建时间
- **DocumentParseResult（文档解析结果）**: 包含提取的标题、正文、图片列表、元数据建议、解析状态
- **ImageExtraction（图片提取）**: 包含原始图片路径、服务器URL、上传状态、文件大小

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 内容发布时间减少 70%（从平均 30 分钟降至 10 分钟以内）
- **SC-002**: 翻译准确率达到 85% 以上（基于人工抽样评估）
- **SC-003**: 文档导入成功率达到 95% 以上（排除格式错误的文档）
- **SC-004**: 管理员对翻译功能的满意度评分达到 4.0/5.0 以上
- **SC-005**: 80% 的新闻文章通过文档导入功能发布（而非手动输入）
- **SC-006**: AI 生成的摘要和分类建议采纳率达到 60% 以上
- **SC-007**: 翻译API调用成本控制在每月 $50 以内
- **SC-008**: 图片自动提取和上传成功率达到 98% 以上

---

## Technical Architecture *(mandatory)*

### Technology Stack

**前端**:
- React 18.3.1 + TypeScript
- 文档上传：react-dropzone 或原生 File API
- Markdown 预览：现有的 MarkdownRenderer 组件
- 进度条：自定义或使用 nprogress

**后端**:
- FastAPI 0.109+
- 文档解析：
  - Markdown: python-markdown 或 mistune
  - Word: python-docx
- 翻译API集成：
  - DeepSeek API（优先）
  - DeepL API（备选）
  - Google Cloud Translation API（备选）
- 图片处理：Pillow（压缩和优化）
- AI 元数据生成：DeepSeek Chat API

**数据库**:
- PostgreSQL 14+
- 新增表：translation_cache, document_uploads, translation_logs

**第三方服务**:
- 翻译API（DeepSeek/DeepL/Google）
- 图片存储（现有的上传服务）

---

## Implementation Plan *(mandatory)*

### Phase 1: 智能翻译系统（第1-3天）

#### 1.1 后端API开发
- 创建 `/api/v1/translate` 端点
- 集成 DeepSeek API 翻译功能
- 实现语言自动检测
- 实现翻译缓存机制
- 添加翻译日志记录

#### 1.2 前端UI开发
- 在表单字段旁添加"翻译"按钮
- 添加"全部翻译"按钮
- 实现翻译加载状态
- 实现翻译结果编辑和标记
- 添加"重新翻译"功能

#### 1.3 测试
- 单元测试：翻译API调用
- 集成测试：前后端翻译流程
- 用户测试：翻译质量评估

---

### Phase 2: 文档智能导入（第4-7天）

#### 2.1 后端文档解析
- 创建 `/api/v1/documents/upload` 端点
- 实现 Markdown 解析器（支持图片语法 `![alt](url)`）
- 实现 Word 文档解析器（python-docx）
- 实现图片提取和上传（支持多张图片并发上传）
- 实现 AI 元数据生成（摘要、分类）
- 实现 ContentBlock 转换（将图片转换为 type: 'image' 的 ContentBlock）

#### 2.2 前端上传界面
- 创建文档上传对话框
- 添加文件拖拽上传功能
- 添加上传进度显示
- 添加模块选择下拉菜单
- 实现预览面板（使用 MarkdownRenderer 渲染多图片）

#### 2.3 改进手动填写方式（可选增强）
- **选项A**：改进 `textToContentBlocks` 函数，支持解析 Markdown 图片语法
  - 识别 `![alt](url)` 语法
  - 转换为 `{ type: 'image', url, alt }` ContentBlock
  - 用户可以在内容中手动插入图片 Markdown 语法
- **选项B**：添加富文本编辑器（如 TipTap 或 Slate）
  - 提供可视化的图片插入按钮
  - 自动上传图片并插入到内容中
  - 更好的用户体验，但实现复杂度更高
- **推荐**：先实现选项A（简单快速），后续可升级到选项B

#### 2.4 集成翻译功能
- 文档解析后自动调用翻译API
- 实现翻译确认对话框
- 批量翻译所有字段

#### 2.5 测试
- 测试 Markdown 文档导入（包含多张图片）
- 测试 Word 文档导入（包含多张图片）
- 测试图片提取和上传（并发上传）
- 测试 AI 元数据生成
- 测试手动填写方式的图片插入（如果实现了选项A）
- 端到端测试：上传→解析→翻译→发布

---

### Phase 3: 优化和完善（第8-10天）

#### 3.1 性能优化
- 实现翻译结果缓存
- 优化图片并发上传
- 添加请求限流

#### 3.2 用户体验优化
- 添加翻译质量评分
- 优化错误提示信息
- 添加操作撤销功能

#### 3.3 文档和培训
- 编写用户使用手册
- 录制操作演示视频
- 培训内容管理员

---

## Development Workflow *(mandatory)*

### 开发规范

#### 1. Git 工作流
```bash
# 创建功能分支
git checkout -b 002-news-upload-enhancements

# 子功能分支
git checkout -b 002-translation-api
git checkout -b 002-document-upload
git checkout -b 002-ui-enhancements
```

#### 2. 提交规范
```
feat(translation): 添加翻译API集成
feat(upload): 实现Word文档解析
fix(translation): 修复翻译缓存失效问题
docs(spec): 更新功能规格说明
test(upload): 添加文档上传单元测试
```

#### 3. 代码审查检查清单
- [ ] 代码符合 TypeScript/Python 规范
- [ ] 所有函数都有类型注解和文档字符串
- [ ] 错误处理完善（try-catch、错误提示）
- [ ] 添加了单元测试（覆盖率 > 80%）
- [ ] UI 响应式设计（移动端适配）
- [ ] 性能优化（避免不必要的API调用）
- [ ] 安全检查（文件上传验证、XSS防护）

#### 4. 测试流程
1. **单元测试**：每个函数独立测试
2. **集成测试**：API端到端测试
3. **用户测试**：管理员试用并反馈
4. **性能测试**：压力测试和响应时间测试
5. **安全测试**：文件上传安全性测试

#### 5. 发布流程
1. 在开发环境完成所有功能
2. 代码审查通过
3. 所有测试通过（单元测试 + 集成测试）
4. 部署到测试环境，进行用户验收测试（UAT）
5. 修复UAT发现的问题
6. 合并到主分支
7. 部署到生产环境
8. 监控日志和性能指标

---

## Risk Management

### 潜在风险

1. **翻译API成本超预算**
   - 缓解措施：实现翻译缓存，避免重复翻译
   - 备选方案：设置每日翻译配额限制

2. **翻译质量不达标**
   - 缓解措施：翻译后保存为草稿，人工审核
   - 备选方案：提供多个翻译API选项，用户可切换

3. **文档解析失败率高**
   - 缓解措施：详细的错误提示和格式说明
   - 备选方案：提供文档格式转换工具

4. **图片上传失败**
   - 缓解措施：自动重试机制
   - 备选方案：允许用户手动上传失败的图片

5. **性能问题（大文档处理慢）**
   - 缓解措施：异步处理，显示进度条
   - 备选方案：限制文档大小（10MB）

---

## Appendix

### API Endpoints

#### 翻译API
```
POST /api/v1/translate
Request: {
  "text": "要翻译的文本",
  "source_lang": "zh",  // 可选，自动检测
  "target_lang": "en"
}
Response: {
  "translated_text": "Translated text",
  "source_lang": "zh",
  "target_lang": "en",
  "confidence": 0.95
}
```

#### 文档上传API
```
POST /api/v1/documents/upload
Request: multipart/form-data
  - file: 文档文件
  - category: 所属模块
Response: {
  "title": "提取的标题",
  "content": "Markdown格式正文",
  "images": ["url1", "url2"],
  "metadata": {
    "summary": "AI生成的摘要",
    "suggested_category": "analysis",
    "tags": ["tag1", "tag2"]
  }
}
```

### Database Schema

```sql
-- 翻译缓存表
CREATE TABLE translation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_text_hash VARCHAR(64) NOT NULL,
  source_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  source_lang VARCHAR(10) NOT NULL,
  target_lang VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '30 days',
  UNIQUE(source_text_hash, source_lang, target_lang)
);

-- 文档上传记录表
CREATE TABLE document_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  upload_status VARCHAR(20) NOT NULL,
  parse_result JSONB,
  created_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 翻译日志表
CREATE TABLE translation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

---

**End of Specification**

