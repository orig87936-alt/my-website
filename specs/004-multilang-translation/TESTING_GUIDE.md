# 多语言翻译功能 - 测试指南

**功能分支**: `004-multilang-translation`  
**测试日期**: 2025-11-17

---

## 📋 测试前准备

### 1. 数据库迁移

在测试前，需要先运行数据库迁移以添加新的多语言字段：

```bash
cd backend
alembic upgrade head
```

**预期结果**:
- 成功添加30个新字段到 `articles` 表
- 迁移版本: `216e2efd0bde_add_multilang_fields_to_articles`

### 2. 启动后端服务

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**验证**:
- 访问 http://localhost:8000/docs
- 检查 `/api/v1/translation/translate-multiple` 端点是否存在

### 3. 启动前端服务

```bash
npm run dev
```

**验证**:
- 访问 http://localhost:5173
- 登录管理员账号

---

## 🧪 测试用例

### Phase 2: 后端翻译服务测试

#### Test 1: 运行翻译服务测试脚本

```bash
cd backend
python test_multilang_translation.py
```

**预期结果**:
```
🧪 Testing Multi-Language Translation Service
================================================

Test 1: Language Detection
✅ Detected Chinese: zh
✅ Detected English: en
✅ Detected Japanese: ja
✅ Detected Spanish: es
✅ Detected French: fr
✅ Detected Arabic: ar
✅ Detected Hindi: hi

Test 2: Single Translation (zh → en)
✅ Translation successful
   Source: 这是一个测试文本
   Target: This is a test text
   Cached: False

Test 3: Multi-Language Translation (zh → 7 languages)
✅ Multi-language translation successful
   Total languages: 7
   Success count: 7
   Failed count: 0

Results:
   en: This is a test text
   zh-tw: 這是一個測試文本
   ja: これはテストテキストです
   es: Este es un texto de prueba
   fr: Ceci est un texte de test
   ar: هذا نص اختبار
   hi: यह एक परीक्षण पाठ है

Test 4: Markdown Image Preservation
✅ Images preserved correctly
   Original images: 2
   Translated images: 2

All tests passed! ✅
```

#### Test 2: API端点测试

使用 Swagger UI (http://localhost:8000/docs) 测试 `/api/v1/translation/translate-multiple`:

**请求**:
```json
{
  "text": "比特币价格突破10万美元大关",
  "source_lang": "zh",
  "target_langs": ["en", "ja", "es", "fr"]
}
```

**预期响应**:
```json
{
  "results": {
    "en": {
      "translated_text": "Bitcoin price breaks through $100,000 mark",
      "cached": false,
      "images_count": 0,
      "error": null
    },
    "ja": {
      "translated_text": "ビットコイン価格が10万ドルの大台を突破",
      "cached": false,
      "images_count": 0,
      "error": null
    },
    ...
  },
  "source_lang": "zh",
  "total_langs": 4,
  "success_count": 4,
  "failed_count": 0
}
```

---

### Phase 3: 数据库架构测试

#### Test 3: 验证数据库字段

```sql
-- 连接到PostgreSQL数据库
psql -U postgres -d your_database_name

-- 查看articles表结构
\d articles

-- 验证新字段存在
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'articles' 
  AND column_name LIKE '%_zh_tw'
  OR column_name LIKE '%_ja'
  OR column_name LIKE '%_es'
  OR column_name LIKE '%_fr'
  OR column_name LIKE '%_ar'
  OR column_name LIKE '%_hi';
```

**预期结果**:
- 应该看到30个新字段（title_*, summary_*, lead_*, content_*, image_caption_*）

---

### Phase 5-6: 新闻编辑多语言支持测试

#### Test 4: 焦点新闻编辑（EditFocusPointModalV2）

**步骤**:
1. 访问新闻页面 (http://localhost:5173/news)
2. 以管理员身份登录
3. 点击焦点新闻右上角的"编辑"按钮
4. 在编辑模态框中：
   - 输入简体中文标题
   - 点击"翻译到其他 7 种语言"按钮
   - 观察翻译进度指示器
   - 点击"展开其他 7 种语言"查看所有翻译结果
   - 点击"保存"

**预期结果**:
- ✅ 模态框正确打开
- ✅ 批量翻译按钮可见
- ✅ 点击后显示翻译进度（简、繁、EN、日、ES、FR、AR、HI）
- ✅ 翻译成功后所有语言字段自动填充
- ✅ 阿拉伯语字段显示为RTL（从右到左）
- ✅ 保存后数据正确存储到localStorage
- ✅ 刷新页面后数据保持不变

#### Test 5: 特色文章编辑（EditFeaturedModalV2）

**步骤**:
1. 在新闻页面滚动到特色文章区域
2. 点击任意文章的"编辑"按钮
3. 在编辑模态框中：
   - 修改简体中文标题
   - 点击"翻译到其他 7 种语言"
   - 验证所有语言字段
   - 点击"保存"

**预期结果**:
- ✅ 编辑模态框正确显示
- ✅ 批量翻译功能正常工作
- ✅ 所有8种语言字段可编辑
- ✅ 保存后文章列表更新

#### Test 6: Latest新闻编辑（AddNewsModalV2）

**步骤**:
1. 在新闻页面点击"添加新闻"按钮
2. 在添加模态框中：
   - 填写时间、分类
   - 输入简体中文标题和摘要
   - 点击批量翻译按钮
   - 验证翻译结果
   - 点击"保存"

**预期结果**:
- ✅ 添加模态框正确打开
- ✅ 批量翻译到7种语言
- ✅ 新闻成功添加到列表
- ✅ 切换语言后显示对应翻译

#### Test 7: 单个语言翻译按钮

**步骤**:
1. 打开任意编辑模态框
2. 输入简体中文内容
3. 点击"展开其他 7 种语言"
4. 在英文字段旁边点击单独的翻译按钮
5. 验证只有英文字段被翻译

**预期结果**:
- ✅ 单个翻译按钮正常工作
- ✅ 只翻译目标语言
- ✅ 显示翻译成功提示（带语言名称）

---

### Phase 4: 前端API集成测试

#### Test 8: 多语言翻译API调用

在浏览器控制台执行：

```javascript
// 导入API函数
const { translateToMultipleLanguages } = await import('/src/services/api.ts');

// 测试多语言翻译
const result = await translateToMultipleLanguages({
  text: '区块链技术正在改变金融行业',
  source_lang: 'zh',
  target_langs: ['en', 'ja', 'es', 'fr', 'ar', 'hi']
});

console.log('Translation results:', result);
```

**预期结果**:
```javascript
{
  results: {
    en: { translated_text: "Blockchain technology is changing the financial industry", ... },
    ja: { translated_text: "ブロックチェーン技術が金融業界を変えている", ... },
    es: { translated_text: "La tecnología blockchain está cambiando la industria financiera", ... },
    fr: { translated_text: "La technologie blockchain transforme l'industrie financière", ... },
    ar: { translated_text: "تقنية البلوكشين تغير صناعة التمويل", ... },
    hi: { translated_text: "ब्लॉकचेन तकनीक वित्तीय उद्योग को बदल रही है", ... }
  },
  source_lang: "zh",
  total_langs: 6,
  success_count: 6,
  failed_count: 0
}
```

---

## 🐛 常见问题排查

### 问题 1: 数据库迁移失败

**症状**: `alembic upgrade head` 报错

**解决方案**:
```bash
# 检查当前迁移版本
alembic current

# 如果需要回滚
alembic downgrade -1

# 重新升级
alembic upgrade head
```

### 问题 2: 翻译API返回401错误

**症状**: 前端调用翻译API时返回401 Unauthorized

**解决方案**:
- 确保已登录管理员账号
- 检查localStorage中的token是否有效
- 重新登录

### 问题 3: 批量翻译按钮不显示

**症状**: 在编辑模态框中看不到"翻译到其他X种语言"按钮

**原因**: 主语言字段为空

**解决方案**:
- 先输入简体中文或英文内容
- 批量翻译按钮会自动显示

### 问题 4: 阿拉伯语显示异常

**症状**: 阿拉伯语文本显示方向错误

**解决方案**:
- 检查 `MultiLangInput.tsx` 中的 `dir="rtl"` 属性
- 确保阿拉伯语字段有 `text-right` 类名

---

## ✅ 测试检查清单

### 后端测试
- [ ] 数据库迁移成功
- [ ] 翻译服务测试脚本全部通过
- [ ] `/api/v1/translation/translate-multiple` 端点正常工作
- [ ] 支持8种语言翻译
- [ ] 并发翻译正常（最多4个并发）
- [ ] 缓存机制正常工作

### 前端测试
- [ ] 焦点新闻编辑支持8种语言
- [ ] 特色文章编辑支持8种语言
- [ ] Latest新闻编辑支持8种语言
- [ ] 批量翻译按钮正常工作
- [ ] 单个翻译按钮正常工作
- [ ] 翻译进度指示器正常显示
- [ ] 语言字段展开/收起功能正常
- [ ] 阿拉伯语RTL布局正确
- [ ] 必填语言验证正常
- [ ] 保存后数据正确存储

### 用户体验测试
- [ ] 翻译速度可接受（<5秒）
- [ ] 翻译质量良好
- [ ] UI响应流畅
- [ ] 错误提示清晰
- [ ] 成功提示友好

---

## 📊 性能基准

### 翻译性能
- **单语言翻译**: <2秒
- **批量翻译（7种语言）**: <10秒
- **并发限制**: 4个并发请求

### 数据库性能
- **文章创建（8种语言）**: <500ms
- **文章查询**: <100ms
- **迁移时间**: <5秒

---

## 🎯 下一步测试

完成以上测试后，继续测试：

1. **Phase 4**: 文档上传多语言翻译
2. **Phase 7**: 网站模块完整i18n
3. **Phase 8**: 部署配置
4. **Phase 9**: 集成测试和性能测试
5. **Phase 10**: 生产环境部署

---

**测试负责人**: AI Assistant  
**最后更新**: 2025-11-17

