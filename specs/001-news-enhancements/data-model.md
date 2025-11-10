# Data Model: 新闻页面增强与智能功能

**Date**: 2025-11-07  
**Feature**: 001-news-enhancements

## Overview

This feature requires 5 database tables:
1. **articles** - News articles with multilingual content
2. **appointments** - User appointment bookings with time slots
3. **chat_messages** - Chat conversation history
4. **faqs** - FAQ knowledge base for chatbot
5. **article_embeddings** - Vector embeddings for semantic search

## Entity Relationship Diagram

```
┌─────────────┐
│  articles   │
└──────┬──────┘
       │ 1
       │
       │ N
┌──────▼──────────────┐
│ article_embeddings  │
└─────────────────────┘

┌──────────────┐
│ appointments │  (independent)
└──────────────┘

┌───────────────┐
│ chat_messages │  (independent, grouped by session_id)
└───────────────┘

┌──────┐
│ faqs │  (independent)
└──────┘
```

---

## 1. articles

**Purpose**: Store news articles with bilingual content (Chinese + English)

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique article identifier |
| category | VARCHAR(50) | NOT NULL, CHECK constraint | Article category: 'headline', 'regulatory', 'analysis', 'business', 'enterprise', 'outlook' |
| status | VARCHAR(20) | DEFAULT 'published', CHECK constraint | Publication status: 'draft', 'published', 'archived' |
| title_zh | TEXT | NOT NULL | Chinese title |
| title_en | TEXT | NOT NULL | English title |
| summary_zh | VARCHAR(80) | NOT NULL | Chinese summary (50-80 chars) |
| summary_en | VARCHAR(80) | NOT NULL | English summary (50-80 chars) |
| lead_zh | TEXT | NULL | Chinese lead paragraph |
| lead_en | TEXT | NULL | English lead paragraph |
| content_zh | JSONB | NOT NULL | Chinese content blocks (array of {type, content}) |
| content_en | JSONB | NOT NULL | English content blocks |
| image_url | TEXT | NULL | Article thumbnail image URL |
| image_caption_zh | TEXT | NULL | Chinese image caption |
| image_caption_en | TEXT | NULL | English image caption |
| author | VARCHAR(100) | NULL | Article author name |
| published_at | TIMESTAMPTZ | DEFAULT NOW() | Publication timestamp |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### Indexes

```sql
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_category_published ON articles(category, published_at DESC) 
  WHERE status = 'published';
```

### Validation Rules

- `summary_zh` and `summary_en` must be 50-80 characters (enforced in application layer)
- `category` must be one of the 6 valid categories
- `status` must be one of: 'draft', 'published', 'archived'
- `content_zh` and `content_en` must be valid JSON arrays

### Sample Data

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "category": "headline",
  "status": "published",
  "title_zh": "2024年金融科技发展趋势",
  "title_en": "FinTech Development Trends in 2024",
  "summary_zh": "本文分析了2024年金融科技行业的主要发展趋势，包括AI应用、区块链创新等。",
  "summary_en": "This article analyzes major FinTech trends in 2024, including AI applications and blockchain innovations.",
  "content_zh": [
    {"type": "paragraph", "content": "金融科技行业正在经历快速变革..."},
    {"type": "heading", "level": 2, "content": "AI在金融领域的应用"},
    {"type": "paragraph", "content": "人工智能技术正在改变..."}
  ],
  "image_url": "https://example.com/images/fintech-2024.jpg",
  "author": "张三",
  "published_at": "2024-01-15T10:00:00Z"
}
```

---

## 2. appointments

**Purpose**: Store user appointment bookings with fixed time slots

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique appointment identifier |
| name | VARCHAR(100) | NOT NULL | User's full name |
| email | VARCHAR(255) | NOT NULL | User's email address |
| phone | VARCHAR(50) | NULL | User's phone number |
| appointment_date | DATE | NOT NULL | Appointment date |
| time_slot | VARCHAR(10) | NOT NULL, CHECK regex | Time slot (e.g., '09:00', '09:30') |
| service_type | VARCHAR(100) | NULL | Type of service requested |
| notes | TEXT | NULL | Additional notes from user |
| status | VARCHAR(20) | DEFAULT 'pending', CHECK constraint | Appointment status: 'pending', 'confirmed', 'completed', 'cancelled' |
| notification_status | VARCHAR(20) | DEFAULT 'pending' | Email notification status: 'pending', 'sent', 'failed' |
| notification_retry_count | INT | DEFAULT 0 | Number of notification retry attempts |
| notification_last_attempt | TIMESTAMPTZ | NULL | Timestamp of last notification attempt |
| confirmation_number | VARCHAR(20) | UNIQUE | Unique confirmation code (e.g., 'APT-20240115-A3F9') |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### Constraints

```sql
-- Ensure time_slot format is HH:MM
CONSTRAINT valid_time_slot CHECK (time_slot ~ '^\d{2}:\d{2}$')

-- Prevent double-booking (unique date+time combination for non-cancelled appointments)
UNIQUE(appointment_date, time_slot) WHERE status NOT IN ('cancelled')
```

### Indexes

```sql
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_notification ON appointments(notification_status, notification_retry_count)
  WHERE notification_status = 'failed' AND notification_retry_count < 3;
```

### State Transitions

```
pending → confirmed → completed
   ↓
cancelled (terminal state)
```

### Notification Retry Logic

- Initial attempt: Immediately after appointment creation
- Retry 1: 1 minute after failure
- Retry 2: 5 minutes after failure
- Retry 3: 30 minutes after failure
- After 3 failures: Mark as 'failed', stop retrying

---

## 3. chat_messages

**Purpose**: Store chat conversation history between users and AI chatbot

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique message identifier |
| session_id | UUID | NOT NULL | Chat session identifier (groups messages) |
| role | VARCHAR(20) | NOT NULL, CHECK constraint | Message sender: 'user', 'assistant', 'system' |
| content | TEXT | NOT NULL | Message content |
| metadata | JSONB | NULL | Additional metadata (sources, tokens, etc.) |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Message timestamp |

### Constraints

```sql
CONSTRAINT valid_role CHECK (role IN ('user', 'assistant', 'system'))
```

### Indexes

```sql
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id, created_at);
```

### Metadata Structure

```json
{
  "sources": [
    {"type": "faq", "id": "uuid", "title": "如何预约？"},
    {"type": "article", "id": "uuid", "title": "预约流程说明", "similarity": 0.85}
  ],
  "tokens_used": 450,
  "response_time_ms": 1250
}
```

---

## 4. faqs

**Purpose**: FAQ knowledge base for chatbot responses

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique FAQ identifier |
| question | TEXT | NOT NULL | FAQ question |
| answer | TEXT | NOT NULL | FAQ answer |
| keywords | TEXT[] | NOT NULL | Search keywords (array) |
| category | VARCHAR(50) | NULL | FAQ category |
| priority | INT | DEFAULT 0 | Display priority (higher = more important) |
| is_active | BOOLEAN | DEFAULT true | Whether FAQ is active |
| usage_count | INT | DEFAULT 0 | Number of times FAQ was used |
| last_used_at | TIMESTAMPTZ | NULL | Last time FAQ was used |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### Indexes

```sql
CREATE INDEX idx_faqs_keywords ON faqs USING GIN(keywords);
CREATE INDEX idx_faqs_priority ON faqs(priority DESC) WHERE is_active = true;
```

### Sample Data

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "question": "如何预约咨询服务？",
  "answer": "您可以访问咨询页面，选择日期和时间，填写您的联系信息，然后提交预约。我们会在24小时内确认您的预约。",
  "keywords": ["预约", "咨询", "服务", "时间", "流程"],
  "category": "appointment",
  "priority": 10,
  "is_active": true,
  "usage_count": 45
}
```

---

## 5. article_embeddings

**Purpose**: Store vector embeddings for article semantic search

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique embedding identifier |
| article_id | UUID | NOT NULL, FOREIGN KEY → articles(id) ON DELETE CASCADE | Reference to article |
| embedding | vector(1536) | NOT NULL | 1536-dimensional vector (OpenAI text-embedding-3-small) |
| content_text | TEXT | NULL | Extracted text used for embedding |
| language | VARCHAR(10) | NOT NULL | Language: 'zh' or 'en' |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

### Constraints

```sql
UNIQUE(article_id, language)  -- One embedding per article per language
```

### Indexes

```sql
-- HNSW index for fast vector similarity search
CREATE INDEX idx_article_embeddings_vector ON article_embeddings
  USING hnsw (embedding vector_cosine_ops);
```

### Vector Search Query Example

```sql
-- Find top 5 most similar articles to a query embedding
SELECT 
  ae.article_id,
  a.title_zh,
  1 - (ae.embedding <=> $1::vector) AS similarity
FROM article_embeddings ae
JOIN articles a ON ae.article_id = a.id
WHERE ae.language = 'zh' AND a.status = 'published'
ORDER BY ae.embedding <=> $1::vector
LIMIT 5;
```

---

## Database Setup

### Required Extensions

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- For gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "vector";      -- For pgvector
```

### Initialization Order

1. Create extensions
2. Create `articles` table
3. Create `article_embeddings` table (depends on articles)
4. Create `appointments` table
5. Create `chat_messages` table
6. Create `faqs` table
7. Create all indexes

---

## Performance Considerations

- **articles**: Composite index on (category, published_at) for efficient filtering
- **appointments**: Partial index on failed notifications for retry processing
- **chat_messages**: Index on (session_id, created_at) for conversation retrieval
- **faqs**: GIN index on keywords array for fast text search
- **article_embeddings**: HNSW index for sub-100ms vector search

**Estimated Storage**:
- 1000 articles: ~50 MB
- 1000 embeddings: ~6 MB (1536 floats × 4 bytes × 1000)
- 1000 appointments: ~1 MB
- 10000 chat messages: ~10 MB
- 100 FAQs: <1 MB

**Total**: ~70 MB for initial dataset

