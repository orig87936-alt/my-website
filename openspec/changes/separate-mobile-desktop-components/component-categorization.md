# Component Categorization Plan

## 📊 Component Analysis

### Total Components: 38 TSX files + 2 directories (Auth, ui, figma)

---

## 🎯 Category 1: Page Components (需要分离为 Desktop + Mobile)

这些组件需要创建桌面端和移动端两个版本：

### Public Pages (公开页面)
1. **HomePage.tsx** - 首页
2. **NewsPage.tsx** - 新闻列表页
3. **NewsDetailPage.tsx** - 新闻详情页
4. **BusinessPage.tsx** - 业务页面
5. **ConsultingPage.tsx** - 咨询页面
6. **ContactPage.tsx** - 联系页面
7. **AboutPage.tsx** - 关于页面
8. **ServicesPage.tsx** - 服务页面
9. **ProjectsPage.tsx** - 项目页面
10. **TeamPage.tsx** - 团队页面

### Admin Pages (管理页面)
11. **NewsAdminPage.tsx** - 新闻管理页面
12. **AppointmentsAdminPage.tsx** - 预约管理页面
13. **SubscriptionAdminPage.tsx** - 订阅管理页面
14. **LoginPage.tsx** - 登录页面

### Navigation (导航)
15. **Navigation.tsx** - 导航栏（桌面端和移动端差异很大）

**Total: 15 components** → 需要创建 15 个 desktop 版本 + 15 个 mobile 版本

---

## 🔄 Category 2: Shared Components (共享组件 - 移到 shared/)

这些组件在桌面端和移动端都可以使用，不需要分离：

### UI Components (已在 ui/ 目录)
- ✅ All components in `src/components/ui/` (50+ components)
- ✅ Keep in current location: `src/components/shared/ui/`

### Auth Components (已在 Auth/ 目录)
- ✅ `Auth/LoginModal.tsx`
- ✅ `Auth/RegisterModal.tsx`
- ✅ `Auth/UserMenu.tsx`
- ✅ Move to: `src/components/shared/Auth/`

### Utility Components (工具组件)
1. **Logo.tsx** - Logo 组件
2. **MarkdownRenderer.tsx** - Markdown 渲染器
3. **CategoryBadge.tsx** - 分类徽章
4. **ArticleStatusBadge.tsx** - 文章状态徽章
5. **RelatedArticles.tsx** - 相关文章
6. **ImageWithFallback.tsx** (in figma/) - 图片回退
7. **DataExporter.tsx** - 数据导出器

### Form Components (表单组件)
8. **MultiLangInput.tsx** - 多语言输入
9. **MultiLangTranslateButton.tsx** - 多语言翻译按钮
10. **TranslateButton.tsx** - 翻译按钮
11. **ImageUploader.tsx** - 图片上传器
12. **ResizableImage.tsx** - 可调整大小的图片

### Editor Components (编辑器组件)
13. **TipTapEditor.tsx** + **TipTapEditor.css** - 富文本编辑器
14. **NewsEditor.tsx** - 新闻编辑器
15. **NewsEditorV2.tsx** - 新闻编辑器 V2
16. **NewsCreateForm.tsx** - 新闻创建表单
17. **NewsCreateFormV2.tsx** - 新闻创建表单 V2

### Modal/Dialog Components (弹窗组件)
18. **AddNewsModalV2.tsx** - 添加新闻弹窗
19. **EditFeaturedModalV2.tsx** - 编辑精选弹窗
20. **EditFocusPointModalV2.tsx** - 编辑焦点弹窗
21. **EditBusinessCategoryModal.tsx** - 编辑业务分类弹窗
22. **DocumentUploadDialog.tsx** - 文档上传对话框
23. **DocumentPreviewPanel.tsx** - 文档预览面板

**Total: ~73 components** → 移到 `src/components/shared/`

---

## ❌ Category 3: Components to Remove (移除的组件)

这些组件在新架构中不再需要：

1. **MobileScaleToggle.tsx** - 移动端缩放切换（不再需要 CSS 缩放）

**Total: 1 component** → 删除

---

## 📁 Final Directory Structure

```
src/components/
├── desktop/                    # 15 桌面端页面组件
│   ├── HomePage.tsx
│   ├── NewsPage.tsx
│   ├── NewsDetailPage.tsx
│   ├── BusinessPage.tsx
│   ├── ConsultingPage.tsx
│   ├── ContactPage.tsx
│   ├── AboutPage.tsx
│   ├── ServicesPage.tsx
│   ├── ProjectsPage.tsx
│   ├── TeamPage.tsx
│   ├── NewsAdminPage.tsx
│   ├── AppointmentsAdminPage.tsx
│   ├── SubscriptionAdminPage.tsx
│   ├── LoginPage.tsx
│   └── Navigation.tsx
│
├── mobile/                     # 15 移动端页面组件
│   ├── HomePage.tsx
│   ├── NewsPage.tsx
│   ├── NewsDetailPage.tsx
│   ├── BusinessPage.tsx
│   ├── ConsultingPage.tsx
│   ├── ContactPage.tsx
│   ├── AboutPage.tsx
│   ├── ServicesPage.tsx
│   ├── ProjectsPage.tsx
│   ├── TeamPage.tsx
│   ├── NewsAdminPage.tsx
│   ├── AppointmentsAdminPage.tsx
│   ├── SubscriptionAdminPage.tsx
│   ├── LoginPage.tsx
│   └── Navigation.tsx
│
└── shared/                     # ~73 共享组件
    ├── ui/                     # UI 组件库 (50+ components)
    │   ├── button.tsx
    │   ├── input.tsx
    │   ├── dialog.tsx
    │   └── ...
    │
    ├── Auth/                   # 认证组件
    │   ├── LoginModal.tsx
    │   ├── RegisterModal.tsx
    │   └── UserMenu.tsx
    │
    ├── editors/                # 编辑器组件
    │   ├── TipTapEditor.tsx
    │   ├── TipTapEditor.css
    │   ├── NewsEditor.tsx
    │   ├── NewsEditorV2.tsx
    │   ├── NewsCreateForm.tsx
    │   └── NewsCreateFormV2.tsx
    │
    ├── modals/                 # 弹窗组件
    │   ├── AddNewsModalV2.tsx
    │   ├── EditFeaturedModalV2.tsx
    │   ├── EditFocusPointModalV2.tsx
    │   ├── EditBusinessCategoryModal.tsx
    │   ├── DocumentUploadDialog.tsx
    │   └── DocumentPreviewPanel.tsx
    │
    ├── forms/                  # 表单组件
    │   ├── MultiLangInput.tsx
    │   ├── MultiLangTranslateButton.tsx
    │   ├── TranslateButton.tsx
    │   ├── ImageUploader.tsx
    │   └── ResizableImage.tsx
    │
    └── common/                 # 通用组件
        ├── Logo.tsx
        ├── MarkdownRenderer.tsx
        ├── CategoryBadge.tsx
        ├── ArticleStatusBadge.tsx
        ├── RelatedArticles.tsx
        ├── ImageWithFallback.tsx
        └── DataExporter.tsx
```

---

## 📊 Summary

| Category | Count | Action |
|----------|-------|--------|
| Page Components (Desktop) | 15 | Create in `desktop/` |
| Page Components (Mobile) | 15 | Create in `mobile/` |
| Shared Components | ~73 | Move to `shared/` |
| Components to Remove | 1 | Delete |
| **Total** | **104** | |

---

## 🎯 Implementation Priority

### Priority 1: Core Pages (优先实现)
1. HomePage
2. NewsPage
3. NewsDetailPage
4. Navigation

### Priority 2: Business Pages
5. BusinessPage
6. ConsultingPage
7. ContactPage

### Priority 3: Other Pages
8. AboutPage
9. ServicesPage
10. ProjectsPage
11. TeamPage

### Priority 4: Admin Pages
12. NewsAdminPage
13. AppointmentsAdminPage
14. SubscriptionAdminPage
15. LoginPage

