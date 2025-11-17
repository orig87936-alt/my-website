# Tasks: 多语言翻译功能增强

**Feature**: 004-multilang-translation  
**Input**: spec.md, plan.md  
**Organization**: 按用户故事组织，支持独立实现和测试

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行执行（不同文件，无依赖）
- **[Story]**: 用户故事标签（US1, US2, US3, US4, US5）
- 包含具体文件路径

---

## Phase 1: 项目设置和准备

- [ ] T001 创建功能分支 `004-multilang-translation`
- [ ] T002 备份生产数据库到 `backup/db_backup_$(date +%Y%m%d).sql`
- [ ] T003 [P] 更新项目文档 `specs/004-multilang-translation/README.md`，说明功能概述和实现计划

---

## Phase 2: 后端翻译服务扩展 (User Story 1 基础)

### 2.1 语言支持常量和配置

- [ ] T004 [P] [US1] 在 `backend/app/services/translation.py` 添加8种语言支持常量 `SUPPORTED_LANGUAGES` 和 `LANGUAGE_NAMES`
- [ ] T005 [P] [US1] 在 `backend/app/config.py` 添加多语言配置项 `SUPPORTED_TRANSLATION_LANGUAGES`

### 2.2 语言检测增强

- [ ] T006 [US1] 更新 `backend/app/services/translation.py` 的 `detect_language()` 方法，支持检测8种语言
- [ ] T007 [US1] 添加语言检测单元测试到 `backend/tests/test_translation_service.py`

### 2.3 批量多语言翻译

- [ ] T008 [US1] 在 `backend/app/services/translation.py` 实现 `translate_to_multiple_languages()` 方法，支持并发翻译
- [ ] T009 [US1] 在 `backend/app/services/translation.py` 添加翻译错误处理和重试逻辑
- [ ] T010 [US1] 添加批量翻译单元测试到 `backend/tests/test_translation_service.py`

### 2.4 翻译API端点

- [ ] T011 [US1] 创建 `backend/app/schemas/translation.py` 添加 `MultiLangTranslateRequest` 和 `MultiLangTranslateResponse` schema
- [ ] T012 [US1] 在 `backend/app/routers/translation.py` 添加 `POST /api/v1/translation/translate-multiple` 端点
- [ ] T013 [US1] 添加API端点集成测试到 `backend/tests/test_translation_api.py`

---

## Phase 3: 数据库架构扩展 (User Story 1 & 2 基础)

### 3.1 数据库迁移

- [ ] T014 [US1] 创建Alembic迁移脚本 `backend/alembic/versions/xxx_add_multilang_fields.py`，为 `articles` 表添加6种新语言字段（title_ja, title_es, title_fr, title_ar, title_hi, title_zh_tw）
- [ ] T015 [US1] 在迁移脚本中添加 `summary_*` 字段（6种新语言）
- [ ] T016 [US1] 在迁移脚本中添加 `content_*` 字段（6种新语言，JSON类型）
- [ ] T017 [US1] 在开发环境测试数据库迁移 `alembic upgrade head`

### 3.2 模型更新

- [ ] T018 [P] [US1] 更新 `backend/app/models/article.py` 的 `Article` 模型，添加6种新语言字段的映射
- [ ] T019 [P] [US1] 更新 `backend/app/schemas/article.py` 的 `ArticleCreate` 和 `ArticleResponse` schema，包含新语言字段
- [ ] T020 [US1] 更新 `backend/app/services/article_service.py` 的文章创建和更新逻辑，处理多语言字段

---

## Phase 4: 文档上传多语言翻译 (User Story 1)

### 4.1 后端文档上传API

- [ ] T021 [US1] 更新 `backend/app/routers/documents.py` 的 `POST /api/v1/documents/upload` 端点，添加 `target_langs` 参数
- [ ] T022 [US1] 在文档上传逻辑中集成 `translate_to_multiple_languages()` 方法
- [ ] T023 [US1] 实现翻译结果保存到数据库的逻辑，为每种语言创建对应字段
- [ ] T024 [US1] 添加文档上传多语言翻译的集成测试到 `backend/tests/test_documents_api.py`

### 4.2 前端文档上传组件

- [ ] T025 [US1] 更新 `src/components/DocumentUploadDialog.tsx`，添加多语言选择器（多选框）
- [ ] T026 [US1] 在 `src/components/DocumentUploadDialog.tsx` 添加"全选"和"取消全选"按钮
- [ ] T027 [US1] 更新文档上传API调用，传递选择的目标语言列表
- [ ] T028 [US1] 添加翻译进度显示（如"正在翻译到日语... 3/7"）
- [ ] T029 [US1] 添加翻译错误处理和用户提示

### 4.3 前端API服务

- [ ] T030 [P] [US1] 在 `src/services/api.ts` 添加 `translateToMultipleLanguages()` 函数
- [ ] T031 [P] [US1] 更新 `src/services/api.ts` 的 `uploadDocument()` 函数，支持 `target_langs` 参数

---

## Phase 5: 新闻编辑多语言支持 (User Story 2)

### 5.1 焦点新闻编辑

- [ ] T032 [US2] 更新 `src/components/NewsPage.tsx` 的 `FocusPointNews` 接口，扩展到8种语言
- [ ] T033 [US2] 更新 `EditFocusPointModal` 组件，添加8种语言的输入框（可折叠）
- [ ] T034 [US2] 在 `EditFocusPointModal` 添加"翻译到所有语言"按钮
- [ ] T035 [US2] 实现 `handleTranslateAll()` 函数，调用批量翻译API
- [ ] T036 [US2] 添加单个语言的"翻译"按钮，支持选择目标语言
- [ ] T037 [US2] 更新焦点新闻保存逻辑，支持8种语言数据

### 5.2 特色文章编辑

- [ ] T038 [P] [US2] 更新 `src/components/NewsPage.tsx` 的 `FeaturedArticle` 接口，扩展到8种语言
- [ ] T039 [US2] 更新 `EditFeaturedModal` 组件，添加8种语言的输入框
- [ ] T040 [US2] 在 `EditFeaturedModal` 添加批量翻译功能
- [ ] T041 [US2] 更新特色文章保存逻辑，支持8种语言数据

### 5.3 数据存储

- [ ] T042 [US2] 更新 `src/data/newsData.ts` 的焦点新闻数据结构，支持8种语言
- [ ] T043 [US2] 更新 `src/data/newsData.ts` 的特色文章数据结构，支持8种语言
- [ ] T044 [US2] 更新 localStorage 存储逻辑，保存8种语言数据

---

## Phase 6: Latest新闻多语言支持 (User Story 3)

### 6.1 Latest新闻编辑

- [ ] T045 [US3] 更新 `src/components/NewsPage.tsx` 的 `LiveNewsItem` 接口，扩展到8种语言
- [ ] T046 [US3] 更新 `EditNewsModal` 组件，添加8种语言的输入框
- [ ] T047 [US3] 在 `EditNewsModal` 添加批量翻译功能
- [ ] T048 [US3] 更新Latest新闻保存逻辑，支持8种语言数据

### 6.2 前端显示

- [ ] T049 [US3] 更新 `src/components/NewsPage.tsx` 的 `getMultiLangContent()` 函数，支持8种语言回退逻辑
- [ ] T050 [US3] 测试Latest新闻在8种语言下的显示效果

---

## Phase 7: 网站模块完整多语言支持 (User Story 4)

### 7.1 i18n翻译文件补全

- [ ] T051 [P] [US4] 检查 `src/i18n/translations.ts` 的日语翻译，补全缺失的键值对
- [ ] T052 [P] [US4] 检查 `src/i18n/translations.ts` 的西班牙语翻译，补全缺失的键值对
- [ ] T053 [P] [US4] 检查 `src/i18n/translations.ts` 的法语翻译，补全缺失的键值对
- [ ] T054 [P] [US4] 检查 `src/i18n/translations.ts` 的阿拉伯语翻译，补全缺失的键值对
- [ ] T055 [P] [US4] 检查 `src/i18n/translations.ts` 的印地语翻译，补全缺失的键值对
- [ ] T056 [P] [US4] 检查 `src/i18n/translations.ts` 的繁体中文翻译，补全缺失的键值对

### 7.2 页面组件翻译检查

- [ ] T057 [US4] 检查 `src/components/HomePage.tsx`，确保所有文本使用 `t()` 函数
- [ ] T058 [US4] 检查 `src/components/BusinessPage.tsx`，确保所有文本使用 `t()` 函数
- [ ] T059 [US4] 检查 `src/components/NewsPage.tsx`，确保所有文本使用 `t()` 函数
- [ ] T060 [US4] 检查 `src/components/ConsultingPage.tsx`，确保所有文本使用 `t()` 函数
- [ ] T061 [US4] 检查 `src/components/ContactPage.tsx`，确保所有文本使用 `t()` 函数
- [ ] T062 [US4] 检查 `src/components/Navigation.tsx`，确保所有文本使用 `t()` 函数

### 7.3 阿拉伯语RTL支持

- [ ] T063 [US4] 在 `src/App.tsx` 添加语言方向检测逻辑（ar → RTL）
- [ ] T064 [US4] 更新 `src/index.css` 添加RTL样式支持
- [ ] T065 [US4] 测试阿拉伯语下的UI布局，修复错乱问题

### 7.4 语言切换优化

- [ ] T066 [US4] 优化 `src/contexts/LanguageContext.tsx` 的语言切换性能
- [ ] T067 [US4] 添加语言切换动画效果（可选）
- [ ] T068 [US4] 测试语言切换的流畅性（< 200ms）

---

## Phase 8: 部署配置和脚本 (User Story 5)

### 8.1 GitHub Actions工作流

- [ ] T069 [P] [US5] 更新 `.github/workflows/deploy-frontend.yml`，确保构建包含所有语言资源
- [ ] T070 [P] [US5] 更新 `.github/workflows/deploy-backend.yml`，添加数据库迁移步骤
- [ ] T071 [US5] 测试GitHub Actions工作流在测试分支上的运行

### 8.2 部署脚本

- [ ] T072 [US5] 创建 `scripts/deploy-multilang-update.sh` 部署脚本
- [ ] T073 [US5] 在脚本中添加数据库备份步骤
- [ ] T074 [US5] 在脚本中添加后端部署步骤（git pull, pip install, alembic upgrade, systemctl restart）
- [ ] T075 [US5] 在脚本中添加前端部署步骤（npm ci, npm run build, aws s3 sync, cloudfront invalidation）
- [ ] T076 [US5] 测试部署脚本在开发环境的运行

### 8.3 回滚方案

- [ ] T077 [P] [US5] 创建 `scripts/rollback-multilang-update.sh` 回滚脚本
- [ ] T078 [P] [US5] 文档化回滚步骤到 `specs/004-multilang-translation/ROLLBACK.md`

---

## Phase 9: 测试和验证

### 9.1 单元测试

- [ ] T079 运行后端单元测试 `pytest backend/tests/`
- [ ] T080 确保所有翻译服务测试通过
- [ ] T081 确保所有API端点测试通过

### 9.2 集成测试

- [ ] T082 测试文档上传多语言翻译端到端流程
- [ ] T083 测试新闻编辑多语言保存和读取流程
- [ ] T084 测试批量翻译的并发性能（7种语言 < 30秒）

### 9.3 UI测试

- [ ] T085 在开发环境测试所有8种语言的显示效果
- [ ] T086 测试语言切换的流畅性
- [ ] T087 测试阿拉伯语RTL布局
- [ ] T088 测试移动端响应式布局（所有语言）

### 9.4 性能测试

- [ ] T089 测试批量翻译性能（单个文档翻译到7种语言）
- [ ] T090 测试翻译缓存命中率
- [ ] T091 测试前端打包体积（确保 < 5MB）

---

## Phase 10: 生产部署

### 10.1 部署前准备

- [ ] T092 备份生产数据库
- [ ] T093 在测试环境完整测试所有功能
- [ ] T094 准备回滚方案和应急联系人

### 10.2 部署执行

- [ ] T095 合并功能分支到 `main` 分支
- [ ] T096 触发GitHub Actions自动部署或手动运行部署脚本
- [ ] T097 监控部署日志，确保无错误

### 10.3 部署后验证

- [ ] T098 验证前端S3部署成功，CloudFront缓存已刷新
- [ ] T099 验证后端EC2服务正常运行
- [ ] T100 验证数据库迁移成功，新字段已添加
- [ ] T101 在生产环境测试文档上传多语言翻译
- [ ] T102 在生产环境测试新闻编辑多语言功能
- [ ] T103 在生产环境测试所有8种语言的网站浏览
- [ ] T104 检查生产环境性能指标（响应时间、错误率）

---

## Dependencies

### User Story Dependencies
- US1 (文档上传) → 独立，可先实现
- US2 (新闻编辑) → 依赖 US1 的翻译服务
- US3 (Latest新闻) → 依赖 US2 的编辑模式
- US4 (网站模块) → 可并行实现
- US5 (部署) → 依赖所有功能完成

### Task Dependencies
- T014-T020 (数据库) 必须在 T021-T031 (文档上传) 之前完成
- T004-T013 (翻译服务) 必须在 T021-T050 (所有翻译功能) 之前完成
- T051-T068 (i18n) 可以并行实现
- T069-T078 (部署配置) 可以在开发过程中并行准备
- T079-T091 (测试) 在所有开发任务完成后执行
- T092-T104 (生产部署) 在所有测试通过后执行

---

## Parallel Execution Examples

### 可并行执行的任务组

**组1：后端基础设施**
- T004, T005 (语言常量配置)
- T018, T019 (模型和schema更新)
- T030, T031 (前端API服务)

**组2：i18n翻译补全**
- T051, T052, T053, T054, T055, T056 (6种语言翻译检查)

**组3：页面组件检查**
- T057, T058, T059, T060, T061, T062 (6个页面组件)

**组4：部署配置**
- T069, T070 (GitHub Actions)
- T077, T078 (回滚方案)

---

## Implementation Strategy

1. **MVP优先**：先实现US1（文档上传多语言翻译），验证核心翻译服务
2. **增量交付**：每完成一个User Story，立即测试和验证
3. **并行开发**：i18n翻译补全和部署配置可以并行进行
4. **风险控制**：在测试环境充分测试后再部署到生产环境
5. **快速回滚**：准备完善的回滚方案，确保可以快速恢复

---

## Success Criteria

- ✅ 所有104个任务完成
- ✅ 所有单元测试和集成测试通过
- ✅ 所有8种语言在生产环境正常工作
- ✅ 翻译性能满足要求（< 30秒）
- ✅ 部署成功，无数据丢失
- ✅ 用户体验流畅，无明显bug

