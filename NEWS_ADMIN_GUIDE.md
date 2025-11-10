# 新闻管理功能使用指南 / News Admin Guide

## 功能概述 / Overview

为新闻页面的所有模块添加了完整的管理员编辑功能，包括：
1. **焦点新闻（Focus Point News）** - 页面顶部的大新闻
2. **特色文章（Featured Articles）** - 6个卡片式文章
3. **实时新闻（Latest News）** - 滚动新闻列表

管理员可以对所有模块进行编辑、添加和删除操作，支持图片管理和多语言内容编辑。

## 使用方法 / How to Use

### 1. 管理员登录 / Admin Login

使用管理员账号登录系统：
- **用户名 / Username**: `admin`
- **密码 / Password**: `admin123`

### 2. 访问新闻页面 / Access News Page

登录后，导航到新闻页面（News Page）。

### 3. 管理员功能 / Admin Features

#### A. 焦点新闻管理 / Focus Point News Management

**编辑焦点新闻 / Edit Focus Point:**
1. 在焦点新闻模块的右上角，点击蓝色的"编辑"按钮
2. 在弹出的对话框中编辑以下内容：
   - **图片URL / Image URL**: 输入图片链接（支持预览）
   - **日期 / Date**: 三种语言的日期
   - **标题 / Title**: 三种语言的标题
   - **摘要 / Summary**: 三种语言的摘要
   - **完整内容 / Full Content**: 三种语言的完整新闻内容
3. 点击"保存"完成编辑

#### B. 特色文章管理 / Featured Articles Management

**添加文章 / Add Article:**
1. 在特色文章部分的右上角，点击"添加文章"按钮
2. 填写以下信息：
   - **图片URL / Image URL**: 输入图片链接（必填，支持预览）
   - **链接 / Link**: 文章链接（必填，可以是内部链接或外部URL）
   - **日期 / Date**: 三种语言的日期
   - **标题 / Title**: 三种语言的标题
   - **描述 / Description**: 三种语言的描述
3. 点击"保存"完成添加

**编辑文章 / Edit Article:**
1. 在每篇文章卡片的右上角，点击蓝色的编辑按钮（铅笔图标）
2. 修改需要更改的内容
3. 点击"保存"完成编辑

**删除文章 / Delete Article:**
1. 在每篇文章卡片的右上角，点击红色的删除按钮（垃圾桶图标）
2. 确认删除操作

#### C. 实时新闻管理 / Latest News Management

**添加新闻 / Add News:**
1. 在实时新闻部分的右上角，点击"添加新闻"按钮
2. 填写以下信息：
   - **时间 / Time**: 新闻发布时间（格式：HH:MM，如 17:44）
   - **分类 / Category**: 选择新闻分类（Business, Technology, Finance, Research）
   - **阅读时间 / Read Time**: 三种语言的阅读时间
   - **标题 / Title**: 三种语言的新闻标题（至少填写一种）
   - **摘要 / Summary**: 三种语言的新闻摘要
3. 点击"保存"完成添加

**删除新闻 / Delete News:**
1. 在每条新闻的右侧，点击红色的删除按钮（垃圾桶图标）
2. 确认删除操作

### 4. 图片管理 / Image Management

**图片URL输入 / Image URL Input:**
- 所有模块都支持通过URL添加图片
- 输入图片URL后会显示实时预览
- 支持的图片来源：
  - 外部图片链接（如 Unsplash, Imgur 等）
  - 自己服务器上的图片
  - 任何可公开访问的图片URL

**图片建议 / Image Recommendations:**
- 焦点新闻：建议使用 1200x675 像素（16:9 比例）
- 特色文章：建议使用 800x450 像素（16:9 比例）
- 确保图片URL可公开访问

### 5. 数据持久化 / Data Persistence

- 所有的修改（编辑/添加/删除）都会自动保存到浏览器的 localStorage 中
- 刷新页面后，修改的内容会保持不变
- 数据存储键名：
  - 焦点新闻：`focusPointNews`
  - 特色文章：`featuredArticles`
  - 实时新闻：`liveNewsList`
- 如需恢复到初始数据，可以清除浏览器的 localStorage

### 6. 普通用户视图 / Regular User View

- 普通用户（visitor）登录后看不到任何编辑按钮
- 普通用户只能查看新闻内容，无法进行任何修改
- 所有编辑控件（编辑、删除、添加按钮）仅对管理员可见

## 技术实现 / Technical Implementation

### 权限控制 / Permission Control

- 使用 `useAuth()` hook 中的 `isAdmin()` 方法检查用户权限
- 只有管理员角色（role: 'admin'）才能看到和使用编辑功能

### 数据存储 / Data Storage

- 使用 localStorage 存储修改后的新闻列表
- 键名：`liveNewsList`
- 数据格式：JSON 字符串

### 多语言支持 / Multi-language Support

新闻内容支持三种语言：
- 简体中文 (zh-CN)
- 繁体中文 (zh-TW)
- 英文 (en)

## 注意事项 / Notes

1. **数据备份**: 建议在进行大量修改前备份原始数据
2. **浏览器兼容性**: 功能依赖 localStorage，请确保浏览器支持
3. **权限管理**: 只有管理员账号可以进行编辑操作
4. **数据验证**:
   - 实时新闻：至少需要填写一种语言的标题
   - 特色文章：必须填写图片URL和链接
5. **图片URL**: 确保图片URL可公开访问，否则图片无法显示
6. **多语言支持**: 建议为所有三种语言（简体中文、繁体中文、英文）填写内容，以提供最佳用户体验
7. **对话框关闭**: 可以通过以下方式关闭编辑对话框：
   - 点击对话框外部的黑色背景
   - 点击右上角的 X 按钮
   - 点击底部的"取消"按钮

## 测试账号 / Test Accounts

### 管理员账号 / Admin Account
- 用户名: `admin`
- 密码: `admin123`
- 权限: 可以添加和删除新闻

### 访客账号 / Visitor Account
- 用户名: `visitor`
- 密码: `visitor123`
- 权限: 只能查看新闻，无编辑权限

