# Document Upload API Contract

**Version**: 1.0  
**Date**: 2025-11-09  
**Base URL**: `/api/v1/documents`

## Overview

文档上传 API 支持上传 Markdown 和 Word 文档，自动解析内容、提取图片、生成元数据，并可选自动翻译。

## Authentication

所有文档上传 API 需要管理员认证。

```http
Authorization: Bearer <JWT_TOKEN>
```

## Endpoints

### 1. 上传文档

**Endpoint**: `POST /api/v1/documents/upload`

**Description**: 上传并解析文档

**Request**: `multipart/form-data`

```
POST /api/v1/documents/upload
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="file"; filename="article.docx"
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document

[binary data]
--boundary
Content-Disposition: form-data; name="category"

headline
--boundary
Content-Disposition: form-data; name="auto_translate"

true
--boundary--
```

**Form Fields**:
```typescript
interface UploadDocumentRequest {
  file: File;                    // 文档文件（.md 或 .docx）
  category?: string;             // 文章分类（可选）
  auto_translate?: boolean;      // 是否自动翻译（默认 false）
  target_lang?: string;          // 目标语言（默认 en）
}
```

**Validation**:
- 文件大小：最大 10MB
- 文件类型：`.md`, `.docx`
- 文件名：最大 255 字符

**Response** (200 OK):
```json
{
  "upload_id": "uuid",
  "filename": "article.docx",
  "file_type": "docx",
  "file_size": 1024000,
  "parse_result": {
    "title": "文章标题",
    "summary": "自动生成的摘要（50-80字符）",
    "category": "headline",
    "tags": ["AI", "技术", "创新"],
    "content_zh": [
      {
        "type": "heading",
        "text": "第一章",
        "level": 1
      },
      {
        "type": "paragraph",
        "text": "这是第一段内容..."
      },
      {
        "type": "image",
        "url": "https://server.com/uploads/image1.jpg",
        "alt": "图片描述",
        "caption": "图片说明"
      }
    ],
    "content_en": [
      {
        "type": "heading",
        "text": "Chapter 1",
        "level": 1
      },
      {
        "type": "paragraph",
        "text": "This is the first paragraph..."
      },
      {
        "type": "image",
        "url": "https://server.com/uploads/image1.jpg",
        "alt": "Image description",
        "caption": "Image caption"
      }
    ],
    "images_uploaded": [
      {
        "original_name": "image1.png",
        "uploaded_url": "https://server.com/uploads/image1.jpg",
        "size": 102400
      }
    ],
    "metadata": {
      "word_count": 1500,
      "paragraph_count": 10,
      "image_count": 3,
      "parse_time": 2.5,
      "translation_time": 3.2
    }
  },
  "status": "success",
  "created_at": "2025-11-09T12:00:00Z"
}
```

**Response Schema**:
```typescript
interface ContentBlock {
  type: 'paragraph' | 'heading' | 'list' | 'image' | 'code' | 'quote';
  text?: string;
  level?: number;      // For headings
  url?: string;        // For images
  alt?: string;        // For images
  caption?: string;    // For images
  language?: string;   // For code blocks
  items?: string[];    // For lists
}

interface UploadedImage {
  original_name: string;
  uploaded_url: string;
  size: number;
}

interface ParseMetadata {
  word_count: number;
  paragraph_count: number;
  image_count: number;
  parse_time: number;
  translation_time?: number;
}

interface ParseResult {
  title: string;
  summary: string;
  category: string;
  tags: string[];
  content_zh: ContentBlock[];
  content_en?: ContentBlock[];  // Only if auto_translate=true
  images_uploaded: UploadedImage[];
  metadata: ParseMetadata;
}

interface UploadDocumentResponse {
  upload_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  parse_result: ParseResult;
  status: 'success' | 'failed';
  created_at: string;
}
```

**Error Responses**:

- **400 Bad Request**: 文件验证失败
  ```json
  {
    "detail": "File size exceeds 10MB limit"
  }
  ```
  
  ```json
  {
    "detail": "Unsupported file type. Only .md and .docx are allowed"
  }
  ```

- **401 Unauthorized**: 未认证

- **413 Payload Too Large**: 文件过大
  ```json
  {
    "detail": "File size exceeds maximum allowed size of 10MB"
  }
  ```

- **422 Unprocessable Entity**: 文档解析失败
  ```json
  {
    "detail": "Failed to parse document: Invalid Word document format"
  }
  ```

- **500 Internal Server Error**: 服务器错误
  ```json
  {
    "detail": "Image upload failed: Connection timeout"
  }
  ```

**Rate Limit**: 5 uploads/minute per user

**Example**:
```bash
curl -X POST "http://localhost:8000/api/v1/documents/upload" \
  -H "Authorization: Bearer <token>" \
  -F "file=@article.docx" \
  -F "category=headline" \
  -F "auto_translate=true"
```

---

### 2. 获取上传历史

**Endpoint**: `GET /api/v1/documents/history`

**Description**: 获取文档上传历史记录

**Query Parameters**:
- `limit` (optional): 返回数量（默认 20，最大 100）
- `offset` (optional): 偏移量（默认 0）
- `status` (optional): 过滤状态（success/failed）

**Response** (200 OK):
```json
{
  "items": [
    {
      "id": "uuid",
      "filename": "article.docx",
      "file_type": "docx",
      "file_size": 1024000,
      "upload_status": "success",
      "created_at": "2025-11-09T12:00:00Z"
    }
  ],
  "total": 50,
  "limit": 20,
  "offset": 0
}
```

**Response Schema**:
```typescript
interface DocumentUploadHistoryItem {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  upload_status: 'success' | 'failed';
  created_at: string;
}

interface DocumentUploadHistoryResponse {
  items: DocumentUploadHistoryItem[];
  total: number;
  limit: number;
  offset: number;
}
```

**Rate Limit**: 30 requests/minute per user

---

### 3. 获取上传详情

**Endpoint**: `GET /api/v1/documents/{upload_id}`

**Description**: 获取特定上传的详细信息

**Path Parameters**:
- `upload_id`: 上传 ID

**Response** (200 OK):
```json
{
  "id": "uuid",
  "filename": "article.docx",
  "file_type": "docx",
  "file_size": 1024000,
  "upload_status": "success",
  "parse_result": { ... },
  "error_message": null,
  "created_at": "2025-11-09T12:00:00Z"
}
```

**Response Schema**:
```typescript
interface DocumentUploadDetail {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  upload_status: 'success' | 'failed';
  parse_result: ParseResult | null;
  error_message: string | null;
  created_at: string;
}
```

**Error Responses**:

- **404 Not Found**: 上传记录不存在
  ```json
  {
    "detail": "Upload not found"
  }
  ```

**Rate Limit**: 60 requests/minute per user

---

## Data Models

### Pydantic Schemas

```python
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Literal
from datetime import datetime
from fastapi import UploadFile

class ContentBlock(BaseModel):
    type: Literal['paragraph', 'heading', 'list', 'image', 'code', 'quote']
    text: Optional[str] = None
    level: Optional[int] = Field(None, ge=1, le=6)
    url: Optional[str] = None
    alt: Optional[str] = None
    caption: Optional[str] = None
    language: Optional[str] = None
    items: Optional[List[str]] = None

class UploadedImage(BaseModel):
    original_name: str
    uploaded_url: str
    size: int

class ParseMetadata(BaseModel):
    word_count: int
    paragraph_count: int
    image_count: int
    parse_time: float
    translation_time: Optional[float] = None

class ParseResult(BaseModel):
    title: str
    summary: str
    category: str
    tags: List[str]
    content_zh: List[ContentBlock]
    content_en: Optional[List[ContentBlock]] = None
    images_uploaded: List[UploadedImage]
    metadata: ParseMetadata

class UploadDocumentResponse(BaseModel):
    upload_id: str
    filename: str
    file_type: str
    file_size: int
    parse_result: ParseResult
    status: Literal['success', 'failed']
    created_at: datetime

class DocumentUploadHistoryItem(BaseModel):
    id: str
    filename: str
    file_type: str
    file_size: int
    upload_status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class DocumentUploadHistoryResponse(BaseModel):
    items: List[DocumentUploadHistoryItem]
    total: int
    limit: int
    offset: int

class DocumentUploadDetail(BaseModel):
    id: str
    filename: str
    file_type: str
    file_size: int
    upload_status: str
    parse_result: Optional[ParseResult]
    error_message: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
```

## File Processing Pipeline

```
1. 文件上传
   ↓
2. 文件验证（类型、大小）
   ↓
3. 保存临时文件
   ↓
4. 文档解析
   ├─ Markdown: mistune 解析
   └─ Word: python-docx 解析
   ↓
5. 提取图片
   ├─ 并发上传（最多 5 张）
   └─ 替换图片 URL
   ↓
6. AI 元数据生成
   ├─ 摘要生成
   ├─ 分类建议
   └─ 标签提取
   ↓
7. 可选：自动翻译
   ├─ 批量翻译所有字段
   └─ 使用缓存加速
   ↓
8. 返回结果
   ↓
9. 清理临时文件
```

## Performance Requirements

| Operation | Target Time (p95) |
|-----------|------------------|
| 文件上传 | < 2 seconds |
| 文档解析 | < 5 seconds |
| 图片上传（5张） | < 4 seconds |
| AI 元数据生成 | < 3 seconds |
| 自动翻译 | < 10 seconds |
| **总计** | **< 15 seconds** |

## File Size Limits

| File Type | Max Size |
|-----------|----------|
| Markdown (.md) | 10 MB |
| Word (.docx) | 10 MB |

## Supported Features

### Markdown
- ✅ 标题（H1-H6）
- ✅ 段落
- ✅ 列表（有序、无序）
- ✅ 图片
- ✅ 代码块
- ✅ 引用
- ✅ 表格（转换为 Markdown）

### Word (.docx)
- ✅ 标题（Heading 1-6）
- ✅ 段落
- ✅ 列表
- ✅ 图片（InlineShapes）
- ✅ 表格（转换为 Markdown）
- ⚠️ 不支持：嵌入对象、SmartArt、图表

## Error Handling

所有错误响应遵循统一格式：

```json
{
  "detail": "Error message"
}
```

HTTP 状态码：
- `400`: 客户端错误（文件验证失败）
- `401`: 未认证
- `413`: 文件过大
- `422`: 文档解析失败
- `429`: 超过速率限制
- `500`: 服务器错误

