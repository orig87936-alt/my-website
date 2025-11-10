# Phase 4 前端测试指南

**更新时间**: 2025-11-08  
**状态**: 5/7 任务完成 (T029-T033 ✅)

---

## ✅ 已完成的任务

### T029 & T030: API 客户端 ✅
- ✅ 创建了 `src/services/api.ts`
- ✅ 实现了完整的 articlesAPI
- ✅ 包含错误处理和认证支持
- ✅ 支持分页、过滤、搜索

### T031 & T032: RelatedArticles 组件 ✅
- ✅ 创建了 `src/components/RelatedArticles.tsx`
- ✅ 响应式网格布局 (3列桌面, 2列平板, 1列移动)
- ✅ "加载更多" 按钮功能
- ✅ 加载状态和错误处理
- ✅ 动画效果

### T033: NewsDetailPage 集成 ✅
- ✅ 导入 RelatedArticles 组件
- ✅ 在文章底部添加相关文章区域
- ✅ 传递必要的 props

---

## ⏳ 待完成的任务

### T034: 更新 newsData.ts
**目标**: 将 localStorage 替换为 API 调用

**当前状态**: 
- `src/data/newsData.ts` 仍在使用 localStorage
- 需要重构为使用 `articlesAPI`

**实施步骤**:
1. 修改 `getNewsArticle()` 函数调用 `articlesAPI.get()`
2. 修改 `saveNewsArticle()` 函数调用 `articlesAPI.update()`
3. 添加数据转换函数 (API 格式 ↔ 本地格式)
4. 保留 localStorage 作为缓存层（可选）

### T035: 端到端测试
**目标**: 验证完整的文章导航流程

**测试步骤**: 见下方测试计划

---

## 🧪 测试计划

### 前置条件

#### 1. 启动后端服务器
```bash
cd backend
.\venv\Scripts\activate.ps1
uvicorn app.main:app --reload
```

验证后端运行:
- 访问 http://localhost:8000/api/docs
- 应该看到 Swagger UI 文档

#### 2. 创建测试数据

使用 Swagger UI 创建一些测试文章:

**示例文章 1** (Technology 类别):
```json
{
  "title_zh": "人工智能的未来发展趋势",
  "title_en": "Future Trends in Artificial Intelligence",
  "summary_zh": "探讨人工智能技术的最新发展和未来趋势",
  "summary_en": "Exploring the latest developments and future trends in AI technology",
  "content_zh": [
    {"type": "paragraph", "text": "人工智能正在改变我们的世界..."}
  ],
  "content_en": [
    {"type": "paragraph", "text": "Artificial Intelligence is transforming our world..."}
  ],
  "category": "Technology",
  "author": "Tech Expert",
  "image_url": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200",
  "tags": ["AI", "Technology", "Future"],
  "status": "published"
}
```

**示例文章 2-7** (同样的 Technology 类别):
- 创建至少 6-7 篇同类别文章用于测试 "加载更多" 功能
- 可以使用不同的标题和内容

**示例文章 8** (Business 类别):
- 创建一篇不同类别的文章，验证过滤功能

#### 3. 启动前端开发服务器
```bash
npm run dev
```

访问 http://localhost:5173

---

### 测试用例

#### 测试 1: API 连接测试
**步骤**:
1. 打开浏览器开发者工具 (F12)
2. 切换到 Console 标签
3. 在控制台输入:
```javascript
import { articlesAPI } from './src/services/api.ts';
const articles = await articlesAPI.list({ page: 1, page_size: 10 });
console.log(articles);
```

**预期结果**:
- 应该看到文章列表数据
- 包含 `items`, `total`, `page`, `page_size`, `total_pages` 字段

---

#### 测试 2: 相关文章显示
**步骤**:
1. 在前端导航到新闻页面
2. 点击任意一篇文章进入详情页
3. 滚动到页面底部

**预期结果**:
- ✅ 应该看到 "相关文章" (Related Articles) 区域
- ✅ 显示最多 6 篇同类别的文章
- ✅ 每篇文章显示:
  - 图片
  - 类别标签
  - 发布日期
  - 标题
  - 摘要
  - "阅读更多" 链接
- ✅ 响应式布局:
  - 桌面: 3 列
  - 平板: 2 列
  - 移动: 1 列

---

#### 测试 3: "加载更多" 功能
**步骤**:
1. 在文章详情页滚动到相关文章区域
2. 如果有超过 6 篇相关文章，应该看到 "加载更多" 按钮
3. 点击 "加载更多" 按钮

**预期结果**:
- ✅ 按钮显示加载状态 (Loading...)
- ✅ 加载下一页的 6 篇文章
- ✅ 新文章添加到现有列表下方
- ✅ 如果没有更多文章，按钮消失
- ✅ 显示 "已显示所有相关文章" 消息

---

#### 测试 4: 文章导航
**步骤**:
1. 在相关文章区域点击任意一篇文章

**预期结果**:
- ✅ 页面导航到新文章的详情页
- ✅ URL 更新
- ✅ 显示新文章的内容
- ✅ 底部显示新文章的相关文章

---

#### 测试 5: 错误处理
**步骤**:
1. 停止后端服务器
2. 刷新前端页面
3. 尝试查看文章详情

**预期结果**:
- ✅ 显示友好的错误消息
- ✅ 不会崩溃或显示白屏
- ✅ 提供重试选项（如果实现）

---

#### 测试 6: 加载状态
**步骤**:
1. 打开浏览器开发者工具
2. 切换到 Network 标签
3. 设置网络节流 (Throttling) 为 "Slow 3G"
4. 访问文章详情页

**预期结果**:
- ✅ 显示加载指示器 (Loader)
- ✅ 加载完成后显示内容
- ✅ 用户体验流畅

---

#### 测试 7: 多语言支持
**步骤**:
1. 访问文章详情页 (中文模式)
2. 切换到英文
3. 观察相关文章区域

**预期结果**:
- ✅ 标题显示为 "Related Articles"
- ✅ 文章标题和摘要显示英文版本
- ✅ "加载更多" 按钮显示 "Load More"
- ✅ 日期格式切换为英文格式

---

## 🐛 已知问题和限制

### 当前限制
1. **数据转换**: `newsData.ts` 仍在使用 localStorage，需要完成 T034
2. **类别映射**: 当前使用 `article.id.split('-')[0]` 获取类别，可能不准确
3. **缓存**: 没有实现客户端缓存，每次都从 API 获取

### 待优化
1. 添加图片懒加载优化
2. 实现无限滚动替代 "加载更多" 按钮
3. 添加骨架屏 (Skeleton) 加载状态
4. 实现文章收藏功能

---

## 📝 下一步

完成 Phase 4 前端任务后，建议的顺序:

1. **T034**: 更新 `newsData.ts` 使用 API
2. **T035**: 完整的端到端测试
3. **Phase 6**: 预约系统前端集成
4. **Phase 7**: AI 聊天机器人前端
5. **Phase 8**: 集成与优化

---

## 🆘 故障排除

### 问题: CORS 错误
**症状**: 浏览器控制台显示 CORS 错误

**解决方案**:
1. 检查后端 `main.py` 的 CORS 配置
2. 确保允许 `http://localhost:5173`
3. 重启后端服务器

### 问题: 404 Not Found
**症状**: API 请求返回 404

**解决方案**:
1. 检查 `.env` 文件中的 `VITE_API_BASE_URL`
2. 确认后端服务器正在运行
3. 检查 API 端点路径是否正确

### 问题: 文章不显示
**症状**: 相关文章区域为空

**解决方案**:
1. 确认数据库中有足够的测试数据
2. 检查文章的 `status` 是否为 `published`
3. 检查文章的 `category` 是否匹配
4. 查看浏览器控制台的错误信息

---

**准备好测试了吗？按照上面的步骤开始吧！** 🚀

