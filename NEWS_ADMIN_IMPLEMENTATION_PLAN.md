# 新闻管理后台实现计划

**创建日期**: 2025-11-08  
**状态**: Ready to Implement  
**优先级**: P1 (最高优先级)

## 📋 背景

### 问题描述
当前系统有 6 个新闻模块，但管理员无法通过界面为各个模块添加新文章，导致：
1. 某些模块下文章数量不足
2. 相关文章区域显示内容有限
3. 内容更新依赖手动修改代码

### 解决方案
实现完整的新闻管理后台，支持：
- ✅ 创建新文章（选择模块、上传图片、填写内容）
- ✅ 编辑现有文章（修改所有字段包括模块）
- ✅ 删除文章（软删除）
- ✅ 发布状态管理（草稿/已发布/已归档）
- ✅ 图片上传功能
- ✅ 前后端完全集成

---

## 🎯 功能需求

### 1. 六个新闻模块（中英文显示）

| 后端值 | 中文名称 | 英文名称 |
|--------|---------|---------|
| `headline` | 头条新闻 | HEADLINE |
| `regulatory` | 监管法规 | REGULATORY BILLS |
| `analysis` | 分析报告 | ANALYSIS REPORTS |
| `business` | 商业动态 | BUSINESS CHANGE |
| `enterprise` | 核心企业 | CORE ENTERPRISE |
| `outlook` | 未来展望 | FUTURE OUTLOOK |

### 2. 文章字段

**必填字段**：
- 模块分类（category）- 6选1
- 中文标题（title_zh）
- 英文标题（title_en）
- 中文摘要（summary_zh）- 50-80字
- 英文摘要（summary_en）- 50-80字
- 中文内容（content_zh）- 内容块数组
- 英文内容（content_en）- 内容块数组

**可选字段**：
- 中文导语（lead_zh）
- 英文导语（lead_en）
- 图片 URL（image_url）- 通过上传获得
- 图片说明（image_caption_zh/en）
- 作者（author）
- 发布状态（status）- draft/published/archived

### 3. 图片上传

**技术要求**：
- 支持格式：JPG, PNG, WebP
- 文件大小限制：5MB
- 上传方式：multipart/form-data
- 存储位置：待定（本地存储或云存储）
- 返回：图片 URL

**用户体验**：
- 拖拽上传
- 点击选择文件
- 实时预览
- 上传进度显示
- 错误提示

---

## 🏗️ 技术架构

### 后端 API（已完成 ✅）

现有 API 已支持所有 CRUD 操作：

```
✅ POST   /api/v1/articles          - 创建文章（需要 admin 权限）
✅ GET    /api/v1/articles          - 获取文章列表（支持筛选）
✅ GET    /api/v1/articles/{id}     - 获取单篇文章
✅ PUT    /api/v1/articles/{id}     - 更新文章（需要 admin 权限）
✅ DELETE /api/v1/articles/{id}     - 删除文章（需要 admin 权限）
```

**需要新增**：
```
🆕 POST   /api/v1/upload/image      - 上传图片（需要 admin 权限）
```

### 前端组件（待实现 ⏳）

**新建组件**：
1. `NewsAdminPage.tsx` - 新闻管理主页面
2. `NewsCreateForm.tsx` - 创建文章表单
3. `ImageUploader.tsx` - 图片上传组件
4. `ArticleStatusBadge.tsx` - 状态徽章
5. `CategoryBadge.tsx` - 模块徽章
6. `newsCategories.ts` - 模块常量定义
7. `uploadAPI.ts` - 上传 API 客户端

**修改组件**：
1. `NewsEditor.tsx` - 支持创建和编辑模式
2. `newsData.ts` - 移除 localStorage，使用 API
3. `App.tsx` - 添加管理页面路由

---

## 📝 实现任务清单

### Phase 9: News Management Admin (13 tasks)

#### 后端任务 (1 task)

- [ ] **T096** - 创建图片上传 API
  - 文件：`backend/app/routers/upload.py`
  - 功能：接收图片文件，验证格式和大小，保存到存储，返回 URL
  - 认证：需要 admin 权限

#### 前端任务 (12 tasks)

**基础设施** (3 tasks)：
- [ ] **T097** - 创建 `newsCategories.ts` 常量文件
- [ ] **T102** - 创建 `uploadAPI.ts` 上传 API 客户端
- [ ] **T103** - 更新 `App.tsx` 添加管理页面路由

**核心组件** (5 tasks)：
- [ ] **T098** - 创建 `NewsAdminPage.tsx` 管理主页面
- [ ] **T099** - 创建 `NewsCreateForm.tsx` 创建表单
- [ ] **T100** - 创建 `ImageUploader.tsx` 图片上传组件
- [ ] **T106** - 创建 `ArticleStatusBadge.tsx` 状态徽章
- [ ] **T107** - 创建 `CategoryBadge.tsx` 模块徽章

**集成修改** (3 tasks)：
- [ ] **T101** - 更新 `NewsEditor.tsx` 支持创建/编辑模式
- [ ] **T104** - 更新 `newsData.ts` 移除 localStorage
- [ ] **T105** - 验证 `RelatedArticles.tsx` 只显示已发布文章

**测试** (1 task)：
- [ ] **T108** - 端到端测试完整工作流

---

## 🚀 实现步骤

### Step 1: 后端图片上传 API (T096)

**优先级**: 高（其他功能依赖此 API）

**实现**：
```python
# backend/app/routers/upload.py
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from ..utils.dependencies import require_admin
import os
import uuid
from pathlib import Path

router = APIRouter(prefix="/api/v1/upload", tags=["upload"])

UPLOAD_DIR = Path("uploads/images")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(require_admin)
):
    # 验证文件类型
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, "Invalid file type")
    
    # 验证文件大小
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(400, "File too large")
    
    # 生成唯一文件名
    filename = f"{uuid.uuid4()}{ext}"
    filepath = UPLOAD_DIR / filename
    
    # 保存文件
    with open(filepath, "wb") as f:
        f.write(contents)
    
    # 返回 URL（需要配置静态文件服务）
    url = f"/uploads/images/{filename}"
    return {"url": url}
```

**配置静态文件服务**：
```python
# backend/app/main.py
from fastapi.staticfiles import StaticFiles

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
```

### Step 2: 前端常量和工具 (T097, T102)

**T097 - newsCategories.ts**：
```typescript
// src/constants/newsCategories.ts
export interface NewsCategory {
  value: string;
  labelZh: string;
  labelEn: string;
  color: string;
}

export const NEWS_CATEGORIES: NewsCategory[] = [
  { value: 'headline', labelZh: '头条新闻', labelEn: 'HEADLINE', color: '#00a4e4' },
  { value: 'regulatory', labelZh: '监管法规', labelEn: 'REGULATORY BILLS', color: '#3b5bdb' },
  { value: 'analysis', labelZh: '分析报告', labelEn: 'ANALYSIS REPORTS', color: '#7950f2' },
  { value: 'business', labelZh: '商业动态', labelEn: 'BUSINESS CHANGE', color: '#f59f00' },
  { value: 'enterprise', labelZh: '核心企业', labelEn: 'CORE ENTERPRISE', color: '#20c997' },
  { value: 'outlook', labelZh: '未来展望', labelEn: 'FUTURE OUTLOOK', color: '#ff6b6b' },
];
```

**T102 - uploadAPI.ts**：
```typescript
// src/services/uploadAPI.ts
import { API_BASE_URL } from './api';

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${API_BASE_URL}/upload/image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Image upload failed');
  }

  const data = await response.json();
  return data.url;
}
```

### Step 3: 图片上传组件 (T100)

**优先级**: 高（创建表单依赖此组件）

**实现**: 见下一步详细代码

### Step 4: 创建表单 (T099)

**优先级**: 高（核心功能）

**实现**: 见下一步详细代码

### Step 5: 管理主页面 (T098)

**优先级**: 高（入口页面）

**实现**: 见下一步详细代码

### Step 6: 更新现有组件 (T101, T104, T105)

**优先级**: 中（集成工作）

### Step 7: 添加路由和徽章组件 (T103, T106, T107)

**优先级**: 中（辅助功能）

### Step 8: 端到端测试 (T108)

**优先级**: 高（验证功能）

---

## ✅ 验收标准

### 功能验收

1. ✅ 管理员可以访问 `/admin/news` 页面
2. ✅ 管理员可以看到所有文章列表（包括草稿和已发布）
3. ✅ 管理员可以按模块筛选文章
4. ✅ 管理员可以按状态筛选文章
5. ✅ 管理员可以搜索文章（按标题）
6. ✅ 管理员可以点击"创建新文章"打开表单
7. ✅ 表单中可以选择 6 个模块之一（显示中英文名称）
8. ✅ 管理员可以上传图片（拖拽或选择文件）
9. ✅ 图片上传后显示预览和 URL
10. ✅ 管理员可以填写所有必填字段
11. ✅ 表单验证正确（摘要长度、必填字段等）
12. ✅ 管理员可以保存为草稿或直接发布
13. ✅ 发布后，文章立即出现在对应模块的相关文章中
14. ✅ 管理员可以编辑现有文章
15. ✅ 管理员可以删除文章（软删除）
16. ✅ 前台用户只能看到已发布的文章

### 性能验收

1. ✅ 文章列表加载时间 < 1秒（100篇文章以内）
2. ✅ 图片上传时间 < 5秒（5MB以内）
3. ✅ 创建文章总时间 < 5分钟（包括填写和上传）

### 用户体验验收

1. ✅ 界面美观，符合现有设计风格
2. ✅ 表单验证提示清晰
3. ✅ 上传进度可见
4. ✅ 操作成功/失败有明确反馈
5. ✅ 移动端响应式适配

---

## 📅 时间估算

| 任务 | 预计时间 | 优先级 |
|------|---------|--------|
| T096 - 图片上传 API | 30分钟 | P0 |
| T097 - 常量定义 | 10分钟 | P0 |
| T102 - 上传 API 客户端 | 15分钟 | P0 |
| T100 - 图片上传组件 | 1小时 | P1 |
| T099 - 创建表单 | 2小时 | P1 |
| T098 - 管理主页面 | 2小时 | P1 |
| T106, T107 - 徽章组件 | 30分钟 | P2 |
| T101 - 更新编辑器 | 1小时 | P2 |
| T104 - 更新 newsData | 30分钟 | P2 |
| T103 - 添加路由 | 15分钟 | P2 |
| T105 - 验证相关文章 | 15分钟 | P3 |
| T108 - 端到端测试 | 1小时 | P1 |

**总计**: 约 9-10 小时

---

## 🎯 下一步行动

1. **立即开始**: 实现 T096（图片上传 API）
2. **并行开发**: T097, T102（常量和工具）
3. **核心功能**: T100, T099, T098（上传、表单、主页面）
4. **集成测试**: T108（端到端测试）

准备好开始实现了吗？🚀

