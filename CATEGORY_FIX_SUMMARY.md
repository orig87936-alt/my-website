# 相关文章类别修复总结

**修复日期**: 2025-11-08  
**问题**: 六个新闻模块的相关文章是共用的，应该各自显示自己类别的相关文章

---

## 🔍 问题诊断

### 原始问题
用户报告：点击不同类别的文章（如"天才法案"、"AI幻觉"等），底部显示的相关文章都是相同的，没有按照文章类别进行过滤。

### 根本原因
1. **缺少 category 字段**: `defaultNewsArticles` 中的 6 篇文章没有 `category` 字段
2. **类别提取错误**: NewsDetailPage 使用 `article.id.split('-')[0]` 提取类别，但这对于非 UUID 的 ID 不准确
3. **回退机制**: 当 API 调用失败时，前端回退到默认文章，但默认文章没有类别信息

---

## ✅ 修复方案

### 1. 添加 category 字段到 NewsArticle 接口

**文件**: `src/data/newsData.ts`

```typescript
export interface NewsArticle {
  id: string;
  titleZh: string;
  titleEn: string;
  dateZh: string;
  dateEn: string;
  author: string;
  category?: string; // ✅ 新增字段
  image: string;
  // ... 其他字段
}
```

---

### 2. 为所有默认文章添加 category

**文件**: `src/data/newsData.ts`

根据后端的类别定义和前端的文章分类，为 6 篇默认文章添加了正确的 category：

| 文章 ID | 标题 | 类别 (中文) | 类别 (英文) | category 值 |
|---------|------|------------|------------|-------------|
| news-insights | 特朗普和习近平同意一年贸易休战 | 头条新闻 | HEADLINE | `headline` |
| genius-act | 特朗普总统签署GENIUS法案 | 监管法案 | REGULATORY BILLS | `regulatory` |
| ai-hallucination | OpenAI：AI模型产生"幻觉" | 分析报告 | ANALYSIS REPORTS | `analysis` |
| state-of-crypto-2025 | State of Crypto 2025 | 商业变革 | BUSINESS CHANGE | `business` |
| manus-ai | Manus AI分析报告 | 核心企业 | CORE ENTERPRISE | `enterprise` |
| global-economy-2025 | 2025年全球经济展望 | 未来展望 | FUTURE OUTLOOK | `outlook` |

---

### 3. 更新数据转换函数

**文件**: `src/data/newsData.ts`

在 `convertApiToLocal()` 函数中添加 category 字段的转换：

```typescript
function convertApiToLocal(apiArticle: Article): NewsArticle {
  // ... 其他转换逻辑
  
  return {
    id: apiArticle.id,
    titleZh: apiArticle.title_zh,
    titleEn: apiArticle.title_en,
    // ... 其他字段
    category: apiArticle.category, // ✅ 包含 category
    // ... 其他字段
  };
}
```

---

### 4. 修复 NewsDetailPage 的类别提取

**文件**: `src/components/NewsDetailPage.tsx`

**修改前**:
```typescript
<RelatedArticles
  currentArticleId={articleId}
  category={article.id.split('-')[0] || 'news'} // ❌ 错误的提取方式
  onNavigateToArticle={onNavigateToArticle}
/>
```

**修改后**:
```typescript
<RelatedArticles
  currentArticleId={articleId}
  category={article.category || 'analysis'} // ✅ 直接使用 category 字段
  onNavigateToArticle={onNavigateToArticle}
/>
```

---

## 🧪 测试验证

### 测试步骤

1. **访问前端**: http://localhost:3000/
2. **导航到新闻页面**
3. **点击不同类别的文章**，验证相关文章是否正确过滤

### 预期结果

| 点击的文章 | 类别 | 相关文章应该显示 |
|-----------|------|-----------------|
| 特朗普和习近平同意一年贸易休战 | headline | 其他 headline 类别的文章 |
| 特朗普总统签署GENIUS法案 | regulatory | 其他 regulatory 类别的文章 |
| OpenAI：AI模型产生"幻觉" | analysis | 其他 analysis 类别的文章（后端有 8 篇） |
| State of Crypto 2025 | business | 其他 business 类别的文章（后端有 2 篇） |
| Manus AI分析报告 | enterprise | 其他 enterprise 类别的文章 |
| 2025年全球经济展望 | outlook | 其他 outlook 类别的文章 |

### 特别注意

- **analysis 类别**: 后端数据库有 8 篇测试文章，应该能看到相关文章
- **business 类别**: 后端数据库有 2 篇测试文章，应该能看到 1 篇相关文章（排除当前文章）
- **其他类别**: 如果后端没有同类别的其他文章，会显示"暂无相关文章"

---

## 📊 后端类别定义

后端支持的 6 个类别（定义在 `backend/app/models/article.py`）:

```python
CheckConstraint(
    "category IN ('headline', 'regulatory', 'analysis', 'business', 'enterprise', 'outlook')",
    name="valid_category"
)
```

---

## 🔄 数据流程

### 完整的数据流

1. **用户点击文章** → 触发 `onNavigateToArticle(articleId)`
2. **NewsDetailPage 加载** → 调用 `getNewsArticle(articleId)`
3. **API 调用** → `articlesAPI.get(id)` 获取文章数据
4. **数据转换** → `convertApiToLocal()` 转换为本地格式（包含 category）
5. **显示文章** → 文章内容显示在页面上
6. **加载相关文章** → `RelatedArticles` 组件使用 `article.category` 调用 API
7. **过滤相关文章** → 后端根据 category 过滤，排除当前文章
8. **显示相关文章** → 最多显示 6 篇同类别文章

### API 调用示例

**获取文章详情**:
```
GET /api/v1/articles/{id}
```

**获取相关文章**:
```
GET /api/v1/articles?page=1&page_size=6&category=analysis&status=published&exclude_id={current_id}
```

---

## ✅ 修复完成

### 修改的文件

1. ✅ `src/data/newsData.ts`
   - 添加 `category?` 字段到 NewsArticle 接口
   - 为 6 篇默认文章添加 category 值
   - 更新 `convertApiToLocal()` 包含 category

2. ✅ `src/components/NewsDetailPage.tsx`
   - 修改 RelatedArticles 的 category 属性，使用 `article.category`

### 影响范围

- ✅ 不影响现有功能
- ✅ 向后兼容（category 是可选字段）
- ✅ 提升用户体验（相关文章更精准）

---

## 🎯 下一步

现在你可以：

1. **测试功能** - 在浏览器中测试不同类别的文章
2. **继续 T035** - 完成端到端测试
3. **进入下一个 Phase** - Phase 5: 文章自动排版

---

**修复状态**: ✅ 完成  
**测试状态**: ⏳ 待用户验证

请在浏览器中测试，确认每个类别的文章都显示正确的相关文章！

