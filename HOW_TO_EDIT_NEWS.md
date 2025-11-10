# 如何修改新闻内容 / How to Edit News Content

## 📝 方法一：通过网页界面编辑（推荐）

### 步骤：

1. **登录管理员账号**
   - 用户名：`admin`
   - 密码：`admin123`

2. **进入新闻页面**
   - 点击导航栏的"新闻"（News）

3. **选择要编辑的新闻**
   - 点击任意一个新闻模块（例如：NEWS AND INSIGHTS）

4. **点击编辑按钮**
   - 在新闻详情页面右上角，你会看到一个蓝色的"编辑"（Edit）按钮
   - **注意**：只有管理员登录后才能看到此按钮

5. **修改内容**
   - 在弹出的编辑器中，你可以修改：
     - 中文标题 / 英文标题
     - 中文日期 / 英文日期
     - 作者
     - 图片URL
     - 中文导语 / 英文导语
     - 正文内容（段落和标题）

6. **保存修改**
   - 点击右上角的"保存"（Save）按钮
   - 看到"保存成功"提示后，关闭编辑器
   - 刷新页面即可看到更新后的内容

### 💡 提示：
- 修改后的内容会保存在浏览器的本地存储（localStorage）中
- 刷新页面后修改仍然有效
- 如果清除浏览器缓存，内容会恢复到默认值

---

## 📝 方法二：直接修改代码文件

如果你想永久修改默认内容，可以编辑以下文件：

### 文件位置：
```
src/data/newsData.ts
```

### 修改步骤：

1. **打开文件**
   ```
   src/data/newsData.ts
   ```

2. **找到对应的新闻ID**
   - `news-insights` - 第一个模块（NEWS AND INSIGHTS）
   - `regulatory-bills` - 第二个模块（REGULATORY BILLS）
   - `analysis-reports` - 第三个模块（ANALYSIS REPORTS）
   - `business-change` - 第四个模块（BUSINESS CHANGE）
   - `core-enterprise` - 第五个模块（CORE ENTERPRISE）
   - `future-outlook` - 第六个模块（FUTURE OUTLOOK）

3. **修改内容**
   例如，修改第一个模块的标题：
   ```typescript
   'news-insights': {
     id: 'news-insights',
     titleZh: '你的中文标题',  // 修改这里
     titleEn: 'Your English Title',  // 修改这里
     // ... 其他字段
   }
   ```

4. **保存文件**
   - 保存后，开发服务器会自动重新加载
   - 刷新浏览器即可看到更新

---

## 🔧 当前支持的新闻模块

目前系统中有6个新闻模块：

1. **NEWS AND INSIGHTS** (`news-insights`)
   - 特朗普和习近平贸易休战

2. **REGULATORY BILLS** (`regulatory-bills`)
   - GENIUS法案

3. **ANALYSIS REPORTS** (`analysis-reports`)
   - AI模型幻觉问题

4. **BUSINESS CHANGE** (`business-change`)
   - State of Crypto 2025

5. **CORE ENTERPRISE** (`core-enterprise`)
   - Manus AI分析

6. **FUTURE OUTLOOK** (`future-outlook`)
   - 2025年全球经济展望

---

## ⚠️ 注意事项

1. **权限要求**
   - 只有使用管理员账号（admin）登录后才能编辑新闻
   - 访客账号（visitor）只能查看，无法编辑

2. **数据存储**
   - 通过网页编辑的内容保存在浏览器本地存储中
   - 清除浏览器缓存会导致修改丢失
   - 如需永久保存，建议直接修改代码文件

3. **图片URL**
   - 确保图片URL是有效的
   - 推荐使用Unsplash等免费图片服务

4. **内容格式**
   - 正文内容支持段落（paragraph）和标题（heading）两种类型
   - 每个内容块都是独立的，可以添加或删除

---

## 🆘 常见问题

**Q: 我修改了内容，但刷新后又恢复了？**
A: 确保点击了"保存"按钮。如果清除了浏览器缓存，需要重新编辑。

**Q: 我看不到编辑按钮？**
A: 确保使用管理员账号（admin/admin123）登录。

**Q: 如何添加新的新闻模块？**
A: 目前需要修改代码文件。在 `src/data/newsData.ts` 中添加新的新闻对象，并在 `NewsPage.tsx` 中添加对应的卡片。

**Q: 如何恢复默认内容？**
A: 清除浏览器的localStorage，或者在浏览器控制台运行：
```javascript
localStorage.removeItem('newsArticles');
```
然后刷新页面。

---

## 📞 需要帮助？

如果遇到问题，请检查：
1. 是否使用管理员账号登录
2. 浏览器控制台是否有错误信息
3. 是否正确保存了修改

