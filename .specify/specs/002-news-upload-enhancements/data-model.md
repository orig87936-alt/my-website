# Data Model Design: 新闻上传功能增强

**Date**: 2025-11-09  
**Feature**: 002-news-upload-enhancements  
**Database**: PostgreSQL 14+

## 概述

本功能需要新增 3 个数据库表：

1. **translation_cache** - 翻译缓存表
2. **translation_logs** - 翻译日志表
3. **document_uploads** - 文档上传记录表

## 1. TranslationCache 表

### 1.1 用途

缓存翻译结果，减少 API 调用，提高性能。

### 1.2 表结构

```sql
CREATE TABLE translation_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_text_hash VARCHAR(64) NOT NULL,
    source_text TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    source_lang VARCHAR(10) NOT NULL,
    target_lang VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days',
    
    -- 唯一约束：相同的源文本、源语言、目标语言只缓存一次
    CONSTRAINT unique_translation UNIQUE (source_text_hash, source_lang, target_lang)
);

-- 索引
CREATE INDEX idx_translation_cache_hash ON translation_cache(source_text_hash);
CREATE INDEX idx_translation_cache_expires ON translation_cache(expires_at);
```

### 1.3 字段说明

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | UUID | 主键 | PRIMARY KEY |
| source_text_hash | VARCHAR(64) | 源文本的 SHA-256 哈希 | NOT NULL |
| source_text | TEXT | 源文本内容 | NOT NULL |
| translated_text | TEXT | 翻译后的文本 | NOT NULL |
| source_lang | VARCHAR(10) | 源语言（zh/en） | NOT NULL |
| target_lang | VARCHAR(10) | 目标语言（zh/en） | NOT NULL |
| created_at | TIMESTAMP | 创建时间 | DEFAULT NOW() |
| expires_at | TIMESTAMP | 过期时间 | DEFAULT NOW() + 30 days |

### 1.4 SQLAlchemy 模型

```python
from sqlalchemy import Column, String, Text, DateTime, Index
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timedelta
import uuid

class TranslationCache(Base):
    __tablename__ = "translation_cache"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_text_hash = Column(String(64), nullable=False)
    source_text = Column(Text, nullable=False)
    translated_text = Column(Text, nullable=False)
    source_lang = Column(String(10), nullable=False)
    target_lang = Column(String(10), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    expires_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.utcnow() + timedelta(days=30)
    )
    
    __table_args__ = (
        Index('idx_translation_cache_hash', 'source_text_hash'),
        Index('idx_translation_cache_expires', 'expires_at'),
        UniqueConstraint('source_text_hash', 'source_lang', 'target_lang', name='unique_translation')
    )
```

### 1.5 使用示例

```python
# 查询缓存
async def get_cached_translation(
    db: AsyncSession,
    text: str,
    source_lang: str,
    target_lang: str
) -> Optional[str]:
    text_hash = hashlib.sha256(f"{text}|{source_lang}|{target_lang}".encode()).hexdigest()
    
    result = await db.execute(
        select(TranslationCache)
        .where(TranslationCache.source_text_hash == text_hash)
        .where(TranslationCache.expires_at > datetime.utcnow())
    )
    cache = result.scalar_one_or_none()
    return cache.translated_text if cache else None

# 保存缓存
async def save_translation_cache(
    db: AsyncSession,
    text: str,
    translated: str,
    source_lang: str,
    target_lang: str
):
    text_hash = hashlib.sha256(f"{text}|{source_lang}|{target_lang}".encode()).hexdigest()
    
    cache = TranslationCache(
        source_text_hash=text_hash,
        source_text=text,
        translated_text=translated,
        source_lang=source_lang,
        target_lang=target_lang
    )
    db.add(cache)
    await db.commit()
```

## 2. TranslationLog 表

### 2.1 用途

记录所有翻译操作，用于审计和质量跟踪。

### 2.2 表结构

```sql
CREATE TABLE translation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    field_name VARCHAR(50) NOT NULL,
    source_text TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    source_lang VARCHAR(10) NOT NULL,
    target_lang VARCHAR(10) NOT NULL,
    manually_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_translation_logs_article ON translation_logs(article_id);
CREATE INDEX idx_translation_logs_created ON translation_logs(created_at);
```

### 2.3 字段说明

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | UUID | 主键 | PRIMARY KEY |
| article_id | UUID | 关联的文章 ID | FOREIGN KEY, NULL（草稿时可为空） |
| field_name | VARCHAR(50) | 字段名称（title/summary/lead/content） | NOT NULL |
| source_text | TEXT | 源文本 | NOT NULL |
| translated_text | TEXT | 翻译后的文本 | NOT NULL |
| source_lang | VARCHAR(10) | 源语言 | NOT NULL |
| target_lang | VARCHAR(10) | 目标语言 | NOT NULL |
| manually_edited | BOOLEAN | 是否被手动编辑 | DEFAULT FALSE |
| edited_at | TIMESTAMP | 编辑时间 | NULL |
| created_at | TIMESTAMP | 创建时间 | DEFAULT NOW() |

### 2.4 SQLAlchemy 模型

```python
class TranslationLog(Base):
    __tablename__ = "translation_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    article_id = Column(UUID(as_uuid=True), ForeignKey('articles.id', ondelete='CASCADE'), nullable=True)
    field_name = Column(String(50), nullable=False)
    source_text = Column(Text, nullable=False)
    translated_text = Column(Text, nullable=False)
    source_lang = Column(String(10), nullable=False)
    target_lang = Column(String(10), nullable=False)
    manually_edited = Column(Boolean, default=False)
    edited_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    
    # 关系
    article = relationship("Article", back_populates="translation_logs")
    
    __table_args__ = (
        Index('idx_translation_logs_article', 'article_id'),
        Index('idx_translation_logs_created', 'created_at'),
    )
```

### 2.5 使用示例

```python
# 记录翻译
async def log_translation(
    db: AsyncSession,
    article_id: Optional[UUID],
    field_name: str,
    source_text: str,
    translated_text: str,
    source_lang: str,
    target_lang: str
):
    log = TranslationLog(
        article_id=article_id,
        field_name=field_name,
        source_text=source_text,
        translated_text=translated_text,
        source_lang=source_lang,
        target_lang=target_lang
    )
    db.add(log)
    await db.commit()

# 标记为手动编辑
async def mark_as_manually_edited(db: AsyncSession, log_id: UUID):
    result = await db.execute(
        select(TranslationLog).where(TranslationLog.id == log_id)
    )
    log = result.scalar_one()
    log.manually_edited = True
    log.edited_at = datetime.utcnow()
    await db.commit()
```

## 3. DocumentUpload 表

### 3.1 用途

记录文档上传历史，用于审计和故障排查。

### 3.2 表结构

```sql
CREATE TABLE document_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    upload_status VARCHAR(20) NOT NULL,
    parse_result JSONB,
    error_message TEXT,
    created_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_document_uploads_created ON document_uploads(created_at);
CREATE INDEX idx_document_uploads_status ON document_uploads(upload_status);
```

### 3.3 字段说明

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | UUID | 主键 | PRIMARY KEY |
| filename | VARCHAR(255) | 文件名 | NOT NULL |
| file_size | INTEGER | 文件大小（字节） | NOT NULL |
| file_type | VARCHAR(50) | 文件类型（markdown/docx） | NOT NULL |
| upload_status | VARCHAR(20) | 上传状态（pending/success/failed） | NOT NULL |
| parse_result | JSONB | 解析结果（JSON 格式） | NULL |
| error_message | TEXT | 错误信息 | NULL |
| created_by | VARCHAR(100) | 上传者 | NULL |
| created_at | TIMESTAMP | 创建时间 | DEFAULT NOW() |

### 3.4 SQLAlchemy 模型

```python
from sqlalchemy.dialects.postgresql import JSONB

class DocumentUpload(Base):
    __tablename__ = "document_uploads"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False)
    file_type = Column(String(50), nullable=False)
    upload_status = Column(String(20), nullable=False)
    parse_result = Column(JSONB, nullable=True)
    error_message = Column(Text, nullable=True)
    created_by = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    
    __table_args__ = (
        Index('idx_document_uploads_created', 'created_at'),
        Index('idx_document_uploads_status', 'upload_status'),
    )
```

### 3.5 parse_result JSON 结构

```json
{
  "title": "文章标题",
  "summary": "自动生成的摘要",
  "category": "headline",
  "tags": ["标签1", "标签2"],
  "content_blocks": [
    {
      "type": "heading",
      "text": "标题",
      "level": 1
    },
    {
      "type": "paragraph",
      "text": "段落内容"
    },
    {
      "type": "image",
      "url": "https://server.com/uploads/image1.jpg",
      "alt": "图片描述"
    }
  ],
  "images_uploaded": [
    {
      "original_name": "image1.png",
      "uploaded_url": "https://server.com/uploads/image1.jpg"
    }
  ],
  "parse_time": 2.5,
  "translation_time": 3.2
}
```

## 4. 数据库迁移

### 4.1 Alembic 迁移脚本

```python
"""Add translation and document upload tables

Revision ID: xxx_add_translation_tables
Revises: previous_revision
Create Date: 2025-11-09

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = 'xxx_add_translation_tables'
down_revision = 'previous_revision'
branch_labels = None
depends_on = None


def upgrade():
    # 创建 translation_cache 表
    op.create_table(
        'translation_cache',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('source_text_hash', sa.String(64), nullable=False),
        sa.Column('source_text', sa.Text(), nullable=False),
        sa.Column('translated_text', sa.Text(), nullable=False),
        sa.Column('source_lang', sa.String(10), nullable=False),
        sa.Column('target_lang', sa.String(10), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('expires_at', sa.DateTime(timezone=True), server_default=sa.text("now() + interval '30 days'")),
        sa.UniqueConstraint('source_text_hash', 'source_lang', 'target_lang', name='unique_translation')
    )
    op.create_index('idx_translation_cache_hash', 'translation_cache', ['source_text_hash'])
    op.create_index('idx_translation_cache_expires', 'translation_cache', ['expires_at'])
    
    # 创建 translation_logs 表
    op.create_table(
        'translation_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('article_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('articles.id', ondelete='CASCADE'), nullable=True),
        sa.Column('field_name', sa.String(50), nullable=False),
        sa.Column('source_text', sa.Text(), nullable=False),
        sa.Column('translated_text', sa.Text(), nullable=False),
        sa.Column('source_lang', sa.String(10), nullable=False),
        sa.Column('target_lang', sa.String(10), nullable=False),
        sa.Column('manually_edited', sa.Boolean(), default=False),
        sa.Column('edited_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'))
    )
    op.create_index('idx_translation_logs_article', 'translation_logs', ['article_id'])
    op.create_index('idx_translation_logs_created', 'translation_logs', ['created_at'])
    
    # 创建 document_uploads 表
    op.create_table(
        'document_uploads',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('filename', sa.String(255), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=False),
        sa.Column('file_type', sa.String(50), nullable=False),
        sa.Column('upload_status', sa.String(20), nullable=False),
        sa.Column('parse_result', postgresql.JSONB(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_by', sa.String(100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'))
    )
    op.create_index('idx_document_uploads_created', 'document_uploads', ['created_at'])
    op.create_index('idx_document_uploads_status', 'document_uploads', ['upload_status'])


def downgrade():
    op.drop_table('document_uploads')
    op.drop_table('translation_logs')
    op.drop_table('translation_cache')
```

## 5. 数据清理策略

### 5.1 过期缓存清理

```python
async def cleanup_expired_cache(db: AsyncSession):
    """清理过期的翻译缓存"""
    await db.execute(
        delete(TranslationCache)
        .where(TranslationCache.expires_at < datetime.utcnow())
    )
    await db.commit()
```

### 5.2 定时任务

使用 APScheduler 或 Celery 定时清理：

```python
from apscheduler.schedulers.asyncio import AsyncIOScheduler

scheduler = AsyncIOScheduler()

@scheduler.scheduled_job('cron', hour=2, minute=0)
async def scheduled_cleanup():
    """每天凌晨 2 点清理过期缓存"""
    async with get_db() as db:
        await cleanup_expired_cache(db)
```

## 总结

| 表名 | 用途 | 预计行数 | 存储空间 |
|------|------|---------|---------|
| translation_cache | 翻译缓存 | ~10,000 | ~50MB |
| translation_logs | 翻译日志 | ~100,000/年 | ~500MB/年 |
| document_uploads | 文档上传记录 | ~1,000/年 | ~10MB/年 |

**总计**: 第一年约 560MB 存储空间

