# 🚀 多语言翻译功能增强 - 快速启动指南

## 📋 前置条件检查

在开始之前，请确保：

- [ ] 已安装 Python 3.11+
- [ ] 已安装 Node.js 20+
- [ ] 已安装 PostgreSQL 15+
- [ ] 已配置 DeepSeek API Key
- [ ] 已配置 AWS CLI（用于部署）
- [ ] 已备份生产数据库

## 🎯 第一步：创建功能分支

```bash
# 切换到主分支并拉取最新代码
git checkout main
git pull origin main

# 创建功能分支
git checkout -b 004-multilang-translation

# 推送到远程
git push -u origin 004-multilang-translation
```

## 🔧 第二步：设置开发环境

### 后端设置

```bash
cd backend

# 激活虚拟环境
source venv/bin/activate  # Linux/Mac
# 或
.\venv\Scripts\activate  # Windows

# 安装依赖（如有新增）
pip install -r requirements.txt

# 检查数据库连接
python -c "from app.database import engine; print('✅ Database connected')"
```

### 前端设置

```bash
cd ..  # 回到项目根目录

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 📝 第三步：实施核心功能

### 3.1 后端翻译服务扩展（最重要！）

这是整个功能的基础，必须先完成。

#### 任务 T004-T005：添加语言支持常量

编辑 `backend/app/services/translation.py`：

```python
# 在文件顶部添加
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

# 语言代码映射（前端 → 后端）
LANGUAGE_CODE_MAP = {
    'zh-CN': 'zh',
    'zh-TW': 'zh-tw',
    'en': 'en',
    'ja': 'ja',
    'es': 'es',
    'fr': 'fr',
    'ar': 'ar',
    'hi': 'hi'
}
```

#### 任务 T006：更新语言检测

在 `TranslationService` 类中更新 `detect_language()` 方法：

```python
async def detect_language(self, text: str) -> Tuple[str, float]:
    """检测文本语言，支持8种语言"""
    try:
        detected = detect(text)
        
        # 映射到支持的语言
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
        
        mapped_lang = language_map.get(detected, 'en')
        return (mapped_lang, 0.95)
        
    except Exception as e:
        print(f"⚠️  Language detection failed: {e}")
        return ('en', 0.3)
```

#### 任务 T008：实现批量翻译

在 `TranslationService` 类中添加新方法：

```python
async def translate_to_multiple_languages(
    self,
    text: str,
    source_lang: str,
    target_langs: List[str],
    preserve_markdown_images: bool = True
) -> Dict[str, Any]:
    """
    将文本翻译到多个目标语言（并发处理）
    
    Args:
        text: 要翻译的文本
        source_lang: 源语言代码
        target_langs: 目标语言代码列表
        preserve_markdown_images: 是否保留Markdown图片
    
    Returns:
        Dict，键为语言代码，值为翻译结果
    """
    import asyncio
    
    # 过滤掉源语言
    target_langs = [lang for lang in target_langs if lang != source_lang]
    
    # 创建并发翻译任务
    tasks = []
    for target_lang in target_langs:
        task = self.translate_text(
            text=text,
            source_lang=source_lang,
            target_lang=target_lang,
            preserve_markdown_images=preserve_markdown_images
        )
        tasks.append((target_lang, task))
    
    # 并发执行
    results = {}
    for target_lang, task in tasks:
        try:
            result = await task
            results[target_lang] = {
                'translated_text': result['translated_text'],
                'cached': result.get('cached', False),
                'error': None
            }
            print(f"✅ Translated to {target_lang}: {len(result['translated_text'])} chars")
        except Exception as e:
            print(f"❌ Translation to {target_lang} failed: {e}")
            results[target_lang] = {
                'translated_text': None,
                'cached': False,
                'error': str(e)
            }
    
    return results
```

#### 任务 T011-T012：添加新的API端点

创建 `backend/app/schemas/translation.py`（如果不存在）：

```python
from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class MultiLangTranslateRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000)
    source_lang: Optional[str] = None
    target_langs: List[str] = Field(..., min_items=1)

class MultiLangTranslateResponse(BaseModel):
    results: Dict[str, Dict[str, any]]
    source_lang: str
```

在 `backend/app/routers/translation.py` 添加端点：

```python
from app.schemas.translation import MultiLangTranslateRequest, MultiLangTranslateResponse

@router.post(
    "/translate-multiple",
    response_model=MultiLangTranslateResponse,
    summary="Translate to multiple languages"
)
@limiter.limit("10/minute")
async def translate_to_multiple_languages(
    request: MultiLangTranslateRequest,
    req: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """批量翻译到多个目标语言"""
    translation_service = TranslationService(db)
    
    # 检测源语言（如果未提供）
    source_lang = request.source_lang
    if not source_lang:
        source_lang, _ = await translation_service.detect_language(request.text)
    
    # 翻译到多个语言
    results = await translation_service.translate_to_multiple_languages(
        text=request.text,
        source_lang=source_lang,
        target_langs=request.target_langs
    )
    
    return MultiLangTranslateResponse(
        results=results,
        source_lang=source_lang
    )
```

### 3.2 测试后端翻译服务

创建测试脚本 `backend/test_multilang_translation.py`：

```python
import asyncio
from app.database import get_db
from app.services.translation import TranslationService

async def test_multilang_translation():
    async for db in get_db():
        service = TranslationService(db)
        
        # 测试文本
        text = "这是一个测试文本，用于验证多语言翻译功能。"
        
        # 翻译到多个语言
        results = await service.translate_to_multiple_languages(
            text=text,
            source_lang='zh',
            target_langs=['en', 'ja', 'es', 'fr']
        )
        
        # 打印结果
        for lang, result in results.items():
            if result['error']:
                print(f"❌ {lang}: {result['error']}")
            else:
                print(f"✅ {lang}: {result['translated_text'][:50]}...")
        
        break

if __name__ == "__main__":
    asyncio.run(test_multilang_translation())
```

运行测试：

```bash
cd backend
python test_multilang_translation.py
```

### 3.3 数据库迁移

#### 任务 T014-T016：创建迁移脚本

```bash
cd backend
alembic revision -m "add_multilang_fields_to_articles"
```

编辑生成的迁移文件 `backend/alembic/versions/xxx_add_multilang_fields_to_articles.py`：

```python
def upgrade():
    # 添加新语言字段
    op.add_column('articles', sa.Column('title_zh_tw', sa.String(), nullable=True))
    op.add_column('articles', sa.Column('title_ja', sa.String(), nullable=True))
    op.add_column('articles', sa.Column('title_es', sa.String(), nullable=True))
    op.add_column('articles', sa.Column('title_fr', sa.String(), nullable=True))
    op.add_column('articles', sa.Column('title_ar', sa.String(), nullable=True))
    op.add_column('articles', sa.Column('title_hi', sa.String(), nullable=True))
    
    op.add_column('articles', sa.Column('summary_zh_tw', sa.String(), nullable=True))
    op.add_column('articles', sa.Column('summary_ja', sa.String(), nullable=True))
    op.add_column('articles', sa.Column('summary_es', sa.String(), nullable=True))
    op.add_column('articles', sa.Column('summary_fr', sa.String(), nullable=True))
    op.add_column('articles', sa.Column('summary_ar', sa.String(), nullable=True))
    op.add_column('articles', sa.Column('summary_hi', sa.String(), nullable=True))
    
    op.add_column('articles', sa.Column('content_zh_tw', sa.JSON(), nullable=True))
    op.add_column('articles', sa.Column('content_ja', sa.JSON(), nullable=True))
    op.add_column('articles', sa.Column('content_es', sa.JSON(), nullable=True))
    op.add_column('articles', sa.Column('content_fr', sa.JSON(), nullable=True))
    op.add_column('articles', sa.Column('content_ar', sa.JSON(), nullable=True))
    op.add_column('articles', sa.Column('content_hi', sa.JSON(), nullable=True))

def downgrade():
    # 回滚时删除字段
    for lang in ['zh_tw', 'ja', 'es', 'fr', 'ar', 'hi']:
        op.drop_column('articles', f'title_{lang}')
        op.drop_column('articles', f'summary_{lang}')
        op.drop_column('articles', f'content_{lang}')
```

运行迁移：

```bash
alembic upgrade head
```

## 🧪 第四步：测试核心功能

### 测试翻译API

使用curl或Postman测试：

```bash
# 获取token
TOKEN="your_auth_token_here"

# 测试批量翻译
curl -X POST "http://localhost:8000/api/v1/translation/translate-multiple" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "这是一个测试",
    "source_lang": "zh",
    "target_langs": ["en", "ja", "es"]
  }'
```

## 📦 第五步：前端集成

### 5.1 添加前端API函数

编辑 `src/services/api.ts`：

```typescript
export interface MultiLangTranslateRequest {
  text: string;
  source_lang?: string;
  target_langs: string[];
}

export async function translateToMultipleLanguages(
  request: MultiLangTranslateRequest
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}${API_VERSION}/translation/translate-multiple`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Batch translation failed');
  }

  return response.json();
}
```

### 5.2 测试前端集成

在浏览器控制台测试：

```javascript
// 测试批量翻译
const result = await translateToMultipleLanguages({
  text: "这是一个测试",
  source_lang: "zh",
  target_langs: ["en", "ja", "es"]
});
console.log(result);
```

## ✅ 第六步：验证和提交

### 验证清单

- [ ] 后端翻译服务正常工作
- [ ] 数据库迁移成功
- [ ] API端点返回正确结果
- [ ] 前端可以调用批量翻译API
- [ ] 所有测试通过

### 提交代码

```bash
git add .
git commit -m "feat: add multilang translation service (Phase 1-3)"
git push origin 004-multilang-translation
```

## 🎉 下一步

完成核心功能后，继续实施：

1. **Phase 4**: 文档上传多语言翻译（tasks.md T021-T031）
2. **Phase 5**: 新闻编辑多语言支持（tasks.md T032-T044）
3. **Phase 6**: Latest新闻多语言支持（tasks.md T045-T050）
4. **Phase 7**: 网站模块完整多语言支持（tasks.md T051-T068）

详细步骤请参考 `tasks.md`。

## 🆘 遇到问题？

### 常见问题

**Q: DeepSeek API返回错误**
A: 检查API Key是否正确配置在 `.env` 文件中

**Q: 数据库迁移失败**
A: 先备份数据库，然后检查迁移脚本语法

**Q: 翻译速度太慢**
A: 检查是否使用了并发处理，确保网络连接正常

### 获取帮助

- 查看 `spec.md` 了解详细需求
- 查看 `plan.md` 了解技术方案
- 查看 `tasks.md` 了解任务依赖

---

**祝你实施顺利！** 🚀

