# Implementation Plan: 多语言翻译功能增强

**Feature**: 004-multilang-translation  
**Created**: 2025-11-17  
**Tech Stack**: React 18 + TypeScript + Vite (Frontend), FastAPI + Python 3.11 (Backend), PostgreSQL + pgvector (Database)

## Architecture Overview

本功能在现有架构基础上扩展多语言支持，保持DeepSeek AI翻译 + PostgreSQL缓存的核心机制。

### 系统架构

```
Frontend (React + TypeScript)
├── Language Context (8种语言支持)
├── Translation UI Components
│   ├── DocumentUploadDialog (多语言选择)
│   ├── NewsEditModals (8语言输入框 + 自动翻译)
│   └── TranslateButton (多目标语言选择)
└── i18n Translations (完整的8语言翻译文件)

Backend (FastAPI + Python)
├── Translation Service (扩展到8语言)
│   ├── Language Detection (支持8语言)
│   ├── Translation API (DeepSeek多语言对)
│   └── Cache Management (多语言缓存)
├── Document Router (多语言翻译)
└── News API (多语言字段)

Database (PostgreSQL)
├── articles (添加6种新语言字段)
├── translation_cache (支持所有语言对)
└── documents (多语言内容存储)
```

## Technology Stack

### Frontend
- **Framework**: React 18.2 + TypeScript 5.0
- **Build Tool**: Vite 5.0
- **UI Library**: Tailwind CSS 3.3
- **State Management**: React Context API
- **HTTP Client**: Fetch API
- **Language Support**: 8种语言（zh-CN, zh-TW, en, ja, es, fr, ar, hi）

### Backend
- **Framework**: FastAPI 0.104
- **Language**: Python 3.11
- **ORM**: SQLAlchemy 2.0 (async)
- **Database**: PostgreSQL 15 + pgvector
- **Translation**: DeepSeek API
- **Caching**: PostgreSQL (translation_cache表)
- **Language Detection**: langdetect库

### Deployment
- **Frontend**: AWS S3 + CloudFront
- **Backend**: AWS EC2 (Ubuntu)
- **Database**: AWS RDS PostgreSQL
- **CI/CD**: GitHub Actions
- **Process Manager**: systemd (后端服务)

## Implementation Phases

### Phase 1: 后端翻译服务扩展

#### 1.1 扩展语言支持常量
**文件**: `backend/app/services/translation.py`

添加8种语言的支持：
```python
SUPPORTED_LANGUAGES = ['zh', 'zh-tw', 'en', 'ja', 'es', 'fr', 'ar', 'hi']

LANGUAGE_NAMES = {
    'zh': 'Chinese (Simplified)',
    'zh-tw': 'Chinese (Traditional)',
    'en': 'English',
    'ja': 'Japanese',
    'es': 'Spanish',
    'fr': 'French',
    'ar': 'Arabic',
    'hi': 'Hindi'
}
```

#### 1.2 更新语言检测逻辑
**文件**: `backend/app/services/translation.py`

扩展`detect_language()`方法支持8种语言：
```python
async def detect_language(self, text: str) -> Tuple[str, float]:
    detected = detect(text)
    
    # Map to our 8 supported languages
    language_map = {
        'zh-cn': 'zh',
        'zh-tw': 'zh-tw',
        'en': 'en',
        'ja': 'ja',
        'es': 'es',
        'fr': 'fr',
        'ar': 'ar',
        'hi': 'hi'
    }
    
    return (language_map.get(detected, 'en'), 0.95)
```

#### 1.3 实现批量多语言翻译
**文件**: `backend/app/services/translation.py`

添加新方法`translate_to_multiple_languages()`:
```python
async def translate_to_multiple_languages(
    self,
    text: str,
    source_lang: str,
    target_langs: List[str]
) -> Dict[str, str]:
    """
    Translate text to multiple target languages concurrently
    
    Returns:
        Dict mapping language code to translated text
    """
    tasks = []
    for target_lang in target_langs:
        if target_lang != source_lang:
            task = self.translate_text(text, source_lang, target_lang)
            tasks.append((target_lang, task))
    
    results = {}
    for target_lang, task in tasks:
        try:
            result = await task
            results[target_lang] = result['translated_text']
        except Exception as e:
            print(f"Translation to {target_lang} failed: {e}")
            results[target_lang] = None
    
    return results
```

#### 1.4 添加新的翻译API端点
**文件**: `backend/app/routers/translation.py`

添加`POST /api/v1/translation/translate-multiple`端点：
```python
@router.post("/translate-multiple")
async def translate_to_multiple_languages(
    request: MultiLangTranslateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Translate text to multiple target languages
    """
    translation_service = TranslationService(db)
    results = await translation_service.translate_to_multiple_languages(
        text=request.text,
        source_lang=request.source_lang,
        target_langs=request.target_langs
    )
    return results
```

### Phase 2: 数据库架构扩展

#### 2.1 创建数据库迁移
**文件**: `backend/alembic/versions/xxx_add_multilang_fields.py`

为`articles`表添加6种新语言字段：
```python
def upgrade():
    # Add new language fields
    op.add_column('articles', sa.Column('title_ja', sa.String(), nullable=True))
    op.add_column('articles', sa.Column('title_es', sa.String(), nullable=True))
    op.add_column('articles', sa.Column('title_fr', sa.String(), nullable=True))
    op.add_column('articles', sa.Column('title_ar', sa.String(), nullable=True))
    op.add_column('articles', sa.Column('title_hi', sa.String(), nullable=True))
    op.add_column('articles', sa.Column('title_zh_tw', sa.String(), nullable=True))
    
    op.add_column('articles', sa.Column('summary_ja', sa.String(), nullable=True))
    op.add_column('articles', sa.Column('summary_es', sa.String(), nullable=True))
    # ... (其他语言的summary字段)
    
    op.add_column('articles', sa.Column('content_ja', sa.JSON(), nullable=True))
    op.add_column('articles', sa.Column('content_es', sa.JSON(), nullable=True))
    # ... (其他语言的content字段)
```

#### 2.2 更新Article模型
**文件**: `backend/app/models/article.py`

添加新的语言字段：
```python
class Article(Base):
    # Existing fields
    title_zh: Mapped[str] = mapped_column(String, nullable=False)
    title_en: Mapped[str] = mapped_column(String, nullable=False)
    
    # New language fields
    title_zh_tw: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    title_ja: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    title_es: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    title_fr: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    title_ar: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    title_hi: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    # Similar for summary and content fields
```

### Phase 3: 文档上传多语言翻译

#### 3.1 更新文档上传API
**文件**: `backend/app/routers/documents.py`

修改`POST /api/v1/documents/upload`端点：
```python
@router.post("/upload")
async def upload_document(
    file: UploadFile,
    target_langs: str = Form(...),  # Comma-separated language codes
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Parse target languages
    target_lang_list = [lang.strip() for lang in target_langs.split(',')]
    
    # Detect source language
    source_lang, _ = await translation_service.detect_language(content)
    
    # Translate to all target languages
    translations = await translation_service.translate_to_multiple_languages(
        text=content,
        source_lang=source_lang,
        target_langs=target_lang_list
    )
    
    # Save article with all translations
    article_data = {
        f'title_{source_lang}': title,
        f'content_{source_lang}': content_blocks,
    }
    
    for lang, translated_text in translations.items():
        if translated_text:
            article_data[f'title_{lang}'] = f"{title} ({LANGUAGE_NAMES[lang]})"
            article_data[f'content_{lang}'] = text_to_content_blocks(translated_text)
    
    article = await articlesAPI.create(article_data)
    return article
```

#### 3.2 更新前端文档上传组件
**文件**: `src/components/DocumentUploadDialog.tsx`

添加多语言选择器：
```tsx
const [targetLanguages, setTargetLanguages] = useState<Language[]>(['en']);

const languageOptions: Language[] = ['zh-CN', 'zh-TW', 'en', 'ja', 'es', 'fr', 'ar', 'hi'];

// Multi-select for target languages
<div className="space-y-2">
  <label>目标语言 / Target Languages</label>
  {languageOptions.map(lang => (
    <label key={lang} className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={targetLanguages.includes(lang)}
        onChange={(e) => {
          if (e.target.checked) {
            setTargetLanguages([...targetLanguages, lang]);
          } else {
            setTargetLanguages(targetLanguages.filter(l => l !== lang));
          }
        }}
      />
      {getLanguageName(lang)}
    </label>
  ))}
</div>
```

### Phase 4: 新闻编辑多语言支持

#### 4.1 更新焦点新闻编辑模态框
**文件**: `src/components/NewsPage.tsx`

扩展`EditFocusPointModal`支持8种语言：
```tsx
interface FocusPointNews {
  image: string;
  date: MultiLangContent;  // 8种语言
  title: MultiLangContent;
  summary: MultiLangContent;
  fullContent: MultiLangContent;
}

type MultiLangContent = {
  'zh-CN': string;
  'zh-TW': string;
  'en': string;
  'ja': string;
  'es': string;
  'fr': string;
  'ar': string;
  'hi': string;
};

// 添加"翻译到所有语言"按钮
const handleTranslateAll = async (sourceLang: Language, sourceText: string, field: string) => {
  const targetLangs = ['zh-CN', 'zh-TW', 'en', 'ja', 'es', 'fr', 'ar', 'hi']
    .filter(lang => lang !== sourceLang);
  
  const translations = await translateToMultipleLanguages({
    text: sourceText,
    source_lang: sourceLang,
    target_langs: targetLangs
  });
  
  // Update form data with translations
  setFormData(prev => ({
    ...prev,
    [field]: {
      ...prev[field],
      ...translations
    }
  }));
};
```

#### 4.2 更新特色文章编辑模态框
**文件**: `src/components/NewsPage.tsx`

类似地扩展`EditFeaturedModal`支持8种语言。

#### 4.3 更新Latest新闻编辑模态框
**文件**: `src/components/NewsPage.tsx`

扩展`EditNewsModal`支持8种语言。

### Phase 5: 完善i18n翻译文件

#### 5.1 补全缺失的翻译
**文件**: `src/i18n/translations.ts`

检查并补全所有8种语言的翻译键值对，确保没有遗漏。特别关注：
- 导航栏（Navigation）
- 首页（HomePage）
- 业务页面（BusinessPage）
- 新闻页面（NewsPage）
- 咨询页面（ConsultingPage）
- 联系页面（ContactPage）
- 表单验证消息
- 错误提示消息

### Phase 6: 部署配置

#### 6.1 更新前端部署工作流
**文件**: `.github/workflows/deploy-frontend.yml`

确保构建包含所有语言资源：
```yaml
- name: Build frontend
  env:
    VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
  run: |
    npm ci
    npm run build
    echo "✅ Build completed with 8 language support"
```

#### 6.2 更新后端部署工作流
**文件**: `.github/workflows/deploy-backend.yml`

添加数据库迁移步骤：
```yaml
- name: Run database migrations
  run: |
    cd backend
    source venv/bin/activate
    alembic upgrade head
    echo "✅ Database migrations completed"
```

#### 6.3 创建部署脚本
**文件**: `scripts/deploy-multilang-update.sh`

```bash
#!/bin/bash
# Deploy multilang translation update to AWS

echo "🚀 Deploying multilang translation update..."

# 1. Backup database
echo "📦 Backing up database..."
# ... backup commands

# 2. Deploy backend
echo "🔧 Deploying backend..."
git pull origin main
cd backend
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
sudo systemctl restart sl-news-backend

# 3. Deploy frontend
echo "🎨 Deploying frontend..."
cd ..
npm ci
npm run build
aws s3 sync build/ s3://$S3_BUCKET/ --delete
aws cloudfront create-invalidation --distribution-id $CF_DIST_ID --paths "/*"

echo "✅ Deployment completed!"
```

## Testing Strategy

### Unit Tests
- 翻译服务的多语言支持测试
- 语言检测准确性测试
- 批量翻译并发处理测试

### Integration Tests
- 文档上传多语言翻译端到端测试
- 新闻编辑多语言保存和读取测试
- API端点的多语言参数验证测试

### UI Tests
- 语言切换流畅性测试
- 所有页面的8种语言显示测试
- 阿拉伯语RTL布局测试

### Performance Tests
- 批量翻译性能测试（7种语言并发）
- 缓存命中率测试
- 前端打包体积测试

## Deployment Checklist

- [ ] 数据库备份完成
- [ ] Alembic迁移脚本测试通过
- [ ] 后端单元测试通过
- [ ] 前端构建成功
- [ ] 所有8种语言在开发环境测试通过
- [ ] API文档更新
- [ ] 部署脚本测试通过
- [ ] 回滚方案准备就绪
- [ ] 监控和日志配置完成
- [ ] 生产环境部署
- [ ] 部署后验证测试
- [ ] CloudFront缓存刷新

## Rollback Plan

如果部署后发现严重问题：

1. **前端回滚**：
   ```bash
   # 恢复上一个S3版本
   aws s3 sync s3://$S3_BUCKET-backup/ s3://$S3_BUCKET/ --delete
   aws cloudfront create-invalidation --distribution-id $CF_DIST_ID --paths "/*"
   ```

2. **后端回滚**：
   ```bash
   git checkout <previous-commit>
   cd backend
   alembic downgrade -1  # 回滚数据库迁移
   sudo systemctl restart sl-news-backend
   ```

3. **数据库回滚**：
   ```bash
   # 从备份恢复
   psql -h $DB_HOST -U $DB_USER -d $DB_NAME < backup.sql
   ```

## Success Criteria

- ✅ 所有8种语言在文档上传、新闻编辑、网站浏览中正常工作
- ✅ 翻译准确性抽样检查通过（至少90%语义正确）
- ✅ 单个文档翻译到7种语言总时间 < 30秒
- ✅ 语言切换无明显延迟（< 200ms）
- ✅ 部署成功，无数据丢失
- ✅ 生产环境所有功能正常

