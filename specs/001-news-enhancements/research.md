# Research: 新闻页面增强与智能功能

**Date**: 2025-11-07  
**Feature**: 001-news-enhancements

## 1. FastAPI Async Best Practices

### Decision
Use async/await throughout the application with asyncpg for PostgreSQL connections.

### Rationale
- FastAPI is built on Starlette (async framework), performs best with async operations
- asyncpg is 3x faster than psycopg2 for PostgreSQL
- Allows handling multiple concurrent requests efficiently

### Implementation
```python
# Use async database sessions
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

# Use async route handlers
@router.get("/articles")
async def list_articles(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Article))
    return result.scalars().all()
```

### Alternatives Considered
- Sync operations with psycopg2: Rejected due to lower performance
- Threading: Rejected due to Python GIL limitations

---

## 2. pgvector Performance & Indexing

### Decision
Use HNSW (Hierarchical Navigable Small World) index for vector similarity search.

### Rationale
- HNSW provides best balance of speed and accuracy for <10K vectors
- Query time: ~10-50ms for top-10 results from 1000 articles
- Index build time: ~1-2 seconds for 1000 vectors

### Implementation
```sql
CREATE INDEX idx_article_embeddings_vector 
ON article_embeddings 
USING hnsw (embedding vector_cosine_ops);
```

### Configuration
- Vector dimension: 1536 (OpenAI text-embedding-3-small)
- Distance metric: Cosine similarity
- HNSW parameters: m=16, ef_construction=64 (defaults are optimal for our scale)

### Alternatives Considered
- IVFFlat index: Faster build, slower query (not suitable for <10K vectors)
- No index: Too slow for production (>500ms per query)

---

## 3. DeepSeek API Integration

### Decision
Use DeepSeek Chat API (deepseek-chat model) with streaming disabled for simplicity.

### Rationale
- Cost-effective: $0.14 per 1M input tokens, $0.28 per 1M output tokens
- Good Chinese language support (critical for this project)
- 32K context window (sufficient for RAG with 3-5 article chunks)

### Rate Limits & Error Handling
- Rate limit: 60 requests/minute (free tier)
- Implement exponential backoff retry (max 3 attempts)
- Timeout: 10 seconds per request
- Fallback: Return FAQ-only results if API fails

### Implementation
```python
import httpx

async def call_deepseek(messages: list, max_retries=3):
    for attempt in range(max_retries):
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    "https://api.deepseek.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {API_KEY}"},
                    json={"model": "deepseek-chat", "messages": messages}
                )
                return response.json()
        except httpx.TimeoutException:
            if attempt == max_retries - 1:
                raise
            await asyncio.sleep(2 ** attempt)  # Exponential backoff
```

### Alternatives Considered
- OpenAI GPT-4: 10x more expensive, overkill for this use case
- Local LLM (Llama): Requires GPU, complex deployment

---

## 4. Embedding Service

### Decision
Use OpenAI text-embedding-3-small API for generating article embeddings.

### Rationale
- High quality embeddings at low cost ($0.02 per 1M tokens)
- 1536 dimensions (good balance of quality and storage)
- Batch processing support (up to 2048 texts per request)

### Cost Estimate
- 1000 articles × ~500 tokens/article = 500K tokens
- Cost: $0.01 for initial indexing
- Ongoing: ~$0.10/month for new articles

### Implementation
```python
import openai

async def generate_embedding(text: str) -> list[float]:
    response = await openai.Embedding.acreate(
        model="text-embedding-3-small",
        input=text
    )
    return response['data'][0]['embedding']
```

### Alternatives Considered
- DeepSeek embeddings: Not yet available in API
- Sentence Transformers (local): Requires GPU, lower quality for Chinese text

---

## 5. Email Notification Service

### Decision
Use Resend API for email notifications.

### Rationale
- Simple REST API, easy integration
- Free tier: 100 emails/day (sufficient for appointment notifications)
- Good deliverability rates
- No SMTP configuration needed

### Implementation
```python
import httpx

async def send_appointment_confirmation(email: str, appointment_data: dict):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {RESEND_API_KEY}"},
            json={
                "from": "noreply@yourdomain.com",
                "to": email,
                "subject": "预约确认",
                "html": render_template("appointment_confirmation.html", appointment_data)
            }
        )
        return response.status_code == 200
```

### Retry Strategy
- Max retries: 3
- Retry delays: 1min, 5min, 30min
- Store retry state in `appointments.notification_retry_count`

### Alternatives Considered
- SendGrid: More complex API, overkill for our needs
- AWS SES: Requires AWS account setup, more configuration
- SMTP directly: Requires email server, deliverability issues

---

## 6. JWT Token Management

### Decision
Use python-jose for JWT token generation and validation with HS256 algorithm.

### Rationale
- Lightweight, no external dependencies
- HS256 is sufficient for single-server deployment
- 7-day expiration balances security and UX

### Implementation
```python
from jose import jwt
from datetime import datetime, timedelta

def create_access_token(data: dict, expires_delta: timedelta = timedelta(days=7)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.JWTError:
        return None
```

### Security Considerations
- SECRET_KEY: 32+ character random string, stored in environment variable
- Token storage: Frontend stores in localStorage (acceptable for non-sensitive data)
- HTTPS only in production

### Alternatives Considered
- RS256 (asymmetric): Overkill for single-server deployment
- Session cookies: Requires server-side session storage

---

## 7. Database Migration Strategy

### Decision
Use Alembic for database schema migrations.

### Rationale
- Official SQLAlchemy migration tool
- Version-controlled schema changes
- Supports auto-generation from models
- Rollback capability

### Workflow
```bash
# Generate migration from model changes
alembic revision --autogenerate -m "Add appointments table"

# Apply migrations
alembic upgrade head

# Rollback if needed
alembic downgrade -1
```

### Production Strategy
- Test migrations on staging database first
- Backup database before applying migrations
- Use `alembic upgrade head` in deployment script

### Alternatives Considered
- Manual SQL scripts: Error-prone, no version control
- Django migrations: Requires Django framework

---

## 8. Connection Pooling

### Decision
Use SQLAlchemy's built-in connection pooling with QueuePool.

### Configuration
```python
engine = create_async_engine(
    DATABASE_URL,
    pool_size=10,          # Max 10 persistent connections
    max_overflow=20,       # Allow 20 additional connections under load
    pool_pre_ping=True,    # Verify connections before use
    pool_recycle=3600      # Recycle connections every hour
)
```

### Rationale
- pool_size=10: Sufficient for 100 concurrent users (10:1 ratio)
- max_overflow=20: Handle traffic spikes
- pool_pre_ping: Prevent "connection lost" errors
- pool_recycle: Avoid stale connections

---

## Summary

All technical decisions align with project constitution:
- ✅ Modern tech stack (FastAPI, PostgreSQL, async operations)
- ✅ Performance-focused (HNSW indexing, connection pooling, async)
- ✅ Cost-effective (DeepSeek + OpenAI embeddings < $1/month)
- ✅ Maintainable (Alembic migrations, clear error handling)

**Next Steps**: Proceed to Phase 1 (data-model.md, contracts/, quickstart.md)

