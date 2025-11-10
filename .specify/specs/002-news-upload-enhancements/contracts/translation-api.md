# Translation API Contract

**Version**: 1.0  
**Date**: 2025-11-09  
**Base URL**: `/api/v1/translation`

## Overview

翻译 API 提供单字段翻译和批量翻译功能，支持中英互译，使用缓存机制提高性能。

## Authentication

所有翻译 API 需要管理员认证。

```http
Authorization: Bearer <JWT_TOKEN>
```

## Endpoints

### 1. 单字段翻译

**Endpoint**: `POST /api/v1/translation/translate`

**Description**: 翻译单个文本字段

**Request**:
```json
{
  "text": "这是一段需要翻译的文本",
  "source_lang": "zh",
  "target_lang": "en"
}
```

**Request Schema**:
```typescript
interface TranslateRequest {
  text: string;           // 要翻译的文本（1-5000 字符）
  source_lang?: string;   // 源语言（可选，自动检测）
  target_lang: string;    // 目标语言（zh/en）
}
```

**Response** (200 OK):
```json
{
  "translated_text": "This is a text that needs to be translated",
  "source_lang": "zh",
  "target_lang": "en",
  "cached": false,
  "translation_time": 2.3
}
```

**Response Schema**:
```typescript
interface TranslateResponse {
  translated_text: string;  // 翻译后的文本
  source_lang: string;      // 检测到的源语言
  target_lang: string;      // 目标语言
  cached: boolean;          // 是否来自缓存
  translation_time: number; // 翻译耗时（秒）
}
```

**Error Responses**:

- **400 Bad Request**: 参数错误
  ```json
  {
    "detail": "Text is required and must be between 1 and 5000 characters"
  }
  ```

- **401 Unauthorized**: 未认证
  ```json
  {
    "detail": "Not authenticated"
  }
  ```

- **429 Too Many Requests**: 超过速率限制
  ```json
  {
    "detail": "Rate limit exceeded. Try again in 60 seconds."
  }
  ```

- **500 Internal Server Error**: 翻译服务错误
  ```json
  {
    "detail": "Translation service error: API timeout"
  }
  ```

**Rate Limit**: 30 requests/minute per user

**Example**:
```bash
curl -X POST "http://localhost:8000/api/v1/translation/translate" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "人工智能正在改变世界",
    "target_lang": "en"
  }'
```

---

### 2. 批量翻译

**Endpoint**: `POST /api/v1/translation/batch-translate`

**Description**: 批量翻译多个字段

**Request**:
```json
{
  "fields": [
    {
      "field_name": "title",
      "text": "人工智能的未来"
    },
    {
      "field_name": "summary",
      "text": "探讨人工智能技术的发展趋势和应用前景"
    },
    {
      "field_name": "content",
      "text": "人工智能（AI）正在快速发展..."
    }
  ],
  "source_lang": "zh",
  "target_lang": "en"
}
```

**Request Schema**:
```typescript
interface BatchTranslateRequest {
  fields: Array<{
    field_name: string;  // 字段名称
    text: string;        // 要翻译的文本
  }>;
  source_lang?: string;  // 源语言（可选，自动检测）
  target_lang: string;   // 目标语言
}
```

**Response** (200 OK):
```json
{
  "results": [
    {
      "field_name": "title",
      "translated_text": "The Future of Artificial Intelligence",
      "cached": false
    },
    {
      "field_name": "summary",
      "translated_text": "Exploring the development trends and application prospects of AI technology",
      "cached": true
    },
    {
      "field_name": "content",
      "translated_text": "Artificial Intelligence (AI) is rapidly developing...",
      "cached": false
    }
  ],
  "source_lang": "zh",
  "target_lang": "en",
  "total_time": 8.5,
  "cache_hit_rate": 0.33
}
```

**Response Schema**:
```typescript
interface BatchTranslateResponse {
  results: Array<{
    field_name: string;      // 字段名称
    translated_text: string; // 翻译后的文本
    cached: boolean;         // 是否来自缓存
  }>;
  source_lang: string;       // 源语言
  target_lang: string;       // 目标语言
  total_time: number;        // 总耗时（秒）
  cache_hit_rate: number;    // 缓存命中率（0-1）
}
```

**Error Responses**:

- **400 Bad Request**: 参数错误
  ```json
  {
    "detail": "Fields array is required and must contain 1-10 items"
  }
  ```

- **401 Unauthorized**: 未认证

- **429 Too Many Requests**: 超过速率限制

- **500 Internal Server Error**: 翻译服务错误

**Rate Limit**: 10 requests/minute per user

**Example**:
```bash
curl -X POST "http://localhost:8000/api/v1/translation/batch-translate" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": [
      {"field_name": "title", "text": "新闻标题"},
      {"field_name": "summary", "text": "新闻摘要"}
    ],
    "target_lang": "en"
  }'
```

---

### 3. 语言检测

**Endpoint**: `POST /api/v1/translation/detect-language`

**Description**: 检测文本的语言

**Request**:
```json
{
  "text": "这是一段中文文本"
}
```

**Request Schema**:
```typescript
interface DetectLanguageRequest {
  text: string;  // 要检测的文本（1-1000 字符）
}
```

**Response** (200 OK):
```json
{
  "detected_lang": "zh",
  "confidence": 0.99
}
```

**Response Schema**:
```typescript
interface DetectLanguageResponse {
  detected_lang: string;  // 检测到的语言代码（zh/en/unknown）
  confidence: number;     // 置信度（0-1）
}
```

**Error Responses**:

- **400 Bad Request**: 参数错误
  ```json
  {
    "detail": "Text is required and must be between 1 and 1000 characters"
  }
  ```

**Rate Limit**: 60 requests/minute per user

**Example**:
```bash
curl -X POST "http://localhost:8000/api/v1/translation/detect-language" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, world!"
  }'
```

---

### 4. 翻译历史

**Endpoint**: `GET /api/v1/translation/history`

**Description**: 获取翻译历史记录

**Query Parameters**:
- `article_id` (optional): 文章 ID
- `limit` (optional): 返回数量（默认 20，最大 100）
- `offset` (optional): 偏移量（默认 0）

**Response** (200 OK):
```json
{
  "items": [
    {
      "id": "uuid",
      "article_id": "uuid",
      "field_name": "title",
      "source_text": "原文",
      "translated_text": "Translation",
      "source_lang": "zh",
      "target_lang": "en",
      "manually_edited": false,
      "created_at": "2025-11-09T12:00:00Z"
    }
  ],
  "total": 100,
  "limit": 20,
  "offset": 0
}
```

**Response Schema**:
```typescript
interface TranslationHistoryResponse {
  items: Array<{
    id: string;
    article_id: string | null;
    field_name: string;
    source_text: string;
    translated_text: string;
    source_lang: string;
    target_lang: string;
    manually_edited: boolean;
    created_at: string;
  }>;
  total: number;
  limit: number;
  offset: number;
}
```

**Rate Limit**: 30 requests/minute per user

---

## Data Models

### Pydantic Schemas

```python
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime

class TranslateRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    source_lang: Optional[str] = Field(None, regex="^(zh|en)$")
    target_lang: str = Field(..., regex="^(zh|en)$")
    
    @validator('text')
    def text_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Text cannot be empty')
        return v

class TranslateResponse(BaseModel):
    translated_text: str
    source_lang: str
    target_lang: str
    cached: bool
    translation_time: float

class BatchTranslateField(BaseModel):
    field_name: str = Field(..., min_length=1, max_length=50)
    text: str = Field(..., min_length=1, max_length=5000)

class BatchTranslateRequest(BaseModel):
    fields: List[BatchTranslateField] = Field(..., min_items=1, max_items=10)
    source_lang: Optional[str] = Field(None, regex="^(zh|en)$")
    target_lang: str = Field(..., regex="^(zh|en)$")

class BatchTranslateResult(BaseModel):
    field_name: str
    translated_text: str
    cached: bool

class BatchTranslateResponse(BaseModel):
    results: List[BatchTranslateResult]
    source_lang: str
    target_lang: str
    total_time: float
    cache_hit_rate: float

class DetectLanguageRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=1000)

class DetectLanguageResponse(BaseModel):
    detected_lang: str
    confidence: float

class TranslationLogItem(BaseModel):
    id: str
    article_id: Optional[str]
    field_name: str
    source_text: str
    translated_text: str
    source_lang: str
    target_lang: str
    manually_edited: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class TranslationHistoryResponse(BaseModel):
    items: List[TranslationLogItem]
    total: int
    limit: int
    offset: int
```

## Performance Requirements

| Endpoint | Target Response Time (p95) | Rate Limit |
|----------|---------------------------|------------|
| `/translate` | < 3 seconds | 30/min |
| `/batch-translate` | < 10 seconds | 10/min |
| `/detect-language` | < 500ms | 60/min |
| `/history` | < 1 second | 30/min |

## Caching Strategy

- 缓存键：`SHA256(text + source_lang + target_lang)`
- 缓存有效期：30 天
- 缓存命中率目标：> 60%

## Error Handling

所有错误响应遵循统一格式：

```json
{
  "detail": "Error message"
}
```

HTTP 状态码：
- `400`: 客户端错误（参数错误）
- `401`: 未认证
- `403`: 无权限
- `429`: 超过速率限制
- `500`: 服务器错误

