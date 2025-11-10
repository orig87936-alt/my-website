# 🚀 下一步行动计划

**更新时间**: 2025-11-08
**当前进度**: 52/95 任务完成 (54.7%)
**最新完成**: Phase 4 前端 (T029-T033) ✅

---

## 📊 当前状态总结

### ✅ 已完成的工作

#### 后端 API (81% 完成)
- ✅ **认证系统**: JWT 认证、管理员权限控制
- ✅ **文章管理**: CRUD 操作、分页、搜索、相关文章推荐
- ✅ **预约系统**: 时间槽管理、邮件通知、冲突检测
- ✅ **AI 聊天**: RAG 架构、DeepSeek 集成、FAQ 管理
- ✅ **数据库**: 5 个表的完整模型和迁移

#### 前端界面 (基础完成)
- ✅ **页面结构**: 首页、新闻、预约、联系等页面
- ✅ **多语言**: 中英文切换
- ✅ **认证**: 登录页面和 AuthContext
- ✅ **UI 组件**: 导航、动画效果
- ✅ **API 客户端**: 完整的 API 集成层 (T029-T030) 🆕
- ✅ **相关文章**: RelatedArticles 组件 (T031-T033) 🆕

### ⏳ 待完成的工作

#### 前端集成 (13.5% 完成)
- 🔄 **文章功能**: 完成 newsData.ts 重构 (T034-T035)
- ⏳ **预约系统**: 预约表单和时间槽选择
- ⏳ **AI 聊天**: 聊天机器人 UI 组件
- ⏳ **错误处理**: 统一的错误提示和加载状态
- ⏳ **测试**: 端到端功能测试

---

## 🎯 推荐的实施路径

### 路径 A: 前后端集成 (推荐) 🔗

**目标**: 让现有前端调用后端 API，实现完整的功能闭环

**优先级**: ⭐⭐⭐⭐⭐ (最高)

**预计时间**: 2-3 天

#### 第一步: 创建 API 客户端 (T029, T053, T072) ✅ 部分完成
```typescript
// src/services/api.ts
- ✅ 配置 fetch 客户端
- ✅ 设置 base URL (http://localhost:8000)
- ✅ 添加认证 token 拦截器
- ✅ 统一错误处理
```

**任务列表**:
- [x] T029: 创建 `src/services/api.ts` 基础文件 ✅
- [x] T030: 添加 articlesAPI (list, get, create, update, delete) ✅
- [ ] T053: 添加 appointmentsAPI (create, list, get, update, getAvailableSlots)
- [ ] T072: 添加 chatAPI (send, getHistory)
- [ ] T073: 添加 faqsAPI (list, create, update, delete)

#### 第二步: 集成文章功能 (T031-T035) ✅ 大部分完成
```typescript
// 替换 localStorage 为 API 调用
- ✅ RelatedArticles: 新组件，显示相关文章
- ✅ NewsDetailPage: 集成相关文章组件
- ⏳ NewsPage: 从 API 获取文章列表 (待完成)
- ⏳ newsData.ts: 重构为使用 API (待完成)
```

**任务列表**:
- [x] T031: 创建 `src/components/RelatedArticles.tsx` ✅
- [x] T032: 实现 "加载更多" 功能 ✅
- [x] T033: 修改 `NewsDetailPage.tsx` 添加相关文章 ✅
- [ ] T034: 更新 `newsData.ts` 使用 API ⏳
- [ ] T035: 测试文章导航功能 ⏳

#### 第三步: 集成预约功能 (T054-T058)
```typescript
// 连接预约表单到后端
- ConsultingPage: 调用 API 创建预约
- 显示确认信息和预约编号
- 获取可用时间槽
```

**任务列表**:
- [ ] T054: 修改 `ConsultingPage.tsx` 使用 API
- [ ] T055: 添加预约确认模态框
- [ ] T056: 获取可用时间槽
- [ ] T057: 禁用不可用时间槽
- [ ] T058: 测试预约流程

#### 第四步: 实现 AI 聊天机器人 (T074-T082)
```typescript
// 创建聊天组件
- ChatWidget: 浮动聊天按钮和窗口
- 消息列表、输入框、发送功能
- 显示来源链接
```

**任务列表**:
- [ ] T074: 创建 `src/components/ChatWidget.tsx`
- [ ] T075: 实现聊天 UI
- [ ] T076: 添加欢迎消息和快捷问题
- [ ] T077: 实现消息发送
- [ ] T078: 显示来源链接
- [ ] T079: 添加加载指示器
- [ ] T080: 持久化聊天会话
- [ ] T081: 添加到 App.tsx
- [ ] T082: 测试聊天功能

#### 第五步: 集成与优化 (T083-T095)
```typescript
// 完善整体体验
- 统一错误处理
- 添加加载状态
- 性能优化
- 文档更新
```

**任务列表**:
- [ ] T083: 更新 AuthContext 使用 JWT
- [ ] T084: 实现 API 登录
- [ ] T085: 全局错误处理
- [ ] T086: 添加加载状态
- [ ] T087: API 重试逻辑
- [ ] T088-T095: 后端优化和文档

---

### 路径 B: PostgreSQL 迁移 🗄️

**目标**: 从 SQLite 迁移到 PostgreSQL，启用向量搜索

**优先级**: ⭐⭐⭐ (中等)

**预计时间**: 1 天

**步骤**:
1. 安装 PostgreSQL (本地或使用 Supabase)
2. 启用 pgvector 扩展
3. 更新 `.env` 配置
4. 运行数据库迁移
5. 实现向量嵌入生成 (T059-T061)
6. 测试向量搜索功能

**参考文档**:
- `backend/QUICK_START_SUPABASE.md`
- `backend/DOCKER_SETUP.md`
- `backend/POSTGRESQL_MIGRATION_COMPLETE.md`

---

### 路径 C: 文章自动排版 📝

**目标**: 实现 Markdown 渲染和自动排版

**优先级**: ⭐⭐ (较低)

**预计时间**: 1 天

**任务列表**:
- [ ] T038: 安装 react-markdown
- [ ] T039: 创建 MarkdownRenderer 组件
- [ ] T040: 添加语法高亮
- [ ] T041: 实现图片懒加载
- [ ] T042: 生成目录
- [ ] T043: 集成到 NewsDetailPage
- [ ] T044: 测试

---

## 💡 我的建议

### 立即开始: 路径 A - 前后端集成

**理由**:
1. ✅ 后端 API 已经完全可用
2. ✅ 前端页面结构已经存在
3. ✅ 可以快速看到完整功能
4. ✅ 用户可以立即使用系统

**第一个任务**: 创建 API 客户端 (T029)

```bash
# 建议的命令
/speckit.implement T029-T035  # 先完成文章功能集成
```

---

## 🛠️ 开发环境准备

### 启动后端服务器
```bash
cd backend
.\venv\Scripts\activate.ps1
uvicorn app.main:app --reload
```

访问: http://localhost:8000/api/docs

### 启动前端开发服务器
```bash
npm run dev
```

访问: http://localhost:5173

---

## 📝 使用 Spec-Kit 工作流

### 方式 1: 使用 /speckit.implement 命令

```bash
# 实现特定任务范围
/speckit.implement T029-T035

# 或实现整个 Phase
/speckit.implement Phase 4 Frontend Tasks
```

### 方式 2: 手动实现并更新进度

每完成一个任务后:
1. 在 `specs/001-news-enhancements/tasks.md` 中标记为 `[x]`
2. 测试功能是否正常
3. 提交代码

---

## 🎯 成功标准

### MVP (最小可行产品)
- ✅ 用户可以浏览文章
- ✅ 用户可以预约咨询
- ✅ 管理员可以登录管理

### 完整版本
- ✅ AI 聊天机器人可用
- ✅ 相关文章推荐
- ✅ 文章自动排版
- ✅ 向量搜索

---

## ❓ 你想如何继续？

请选择一个选项:

**A) 开始前后端集成** (推荐)
- 我会帮你创建 API 客户端
- 逐步集成各个功能

**B) 迁移到 PostgreSQL**
- 启用向量搜索
- 提升性能

**C) 实现文章自动排版**
- Markdown 渲染
- 美化文章显示

**D) 其他想法**
- 告诉我你的优先级

---

**准备好了吗？告诉我你的选择，我们立即开始！** 🚀

