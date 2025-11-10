# Implementation Plan: 新闻页面增强与智能功能

**Branch**: `001-news-enhancements` | **Date**: 2025-11-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-news-enhancements/spec.md`

**Note**: This plan implements a complete backend system for news enhancements, appointment booking, and AI-powered chatbot.

## Summary

This feature adds four major enhancements to the news website:
1. **Article Navigation**: Display related articles at the bottom of each article page with "Load More" functionality
2. **Auto-formatting**: Markdown-based article rendering with automatic layout and styling
3. **Appointment Backend**: Complete RESTful API for appointment booking with time slot management and email notifications
4. **AI Chatbot**: RAG-based intelligent Q&A system using DeepSeek API with FAQ knowledge base and article vector search

**Technical Approach**: Build a FastAPI backend with PostgreSQL + pgvector for vector search, integrate with DeepSeek for AI responses, deploy on AWS EC2 with Nginx reverse proxy.

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: FastAPI 0.109+, SQLAlchemy 2.0, Pydantic 2.5+, pgvector 0.5+, httpx (async), python-jose (JWT), passlib (bcrypt)
**Storage**: PostgreSQL 14+ with pgvector extension (AWS RDS or EC2 self-hosted)
**Testing**: pytest with pytest-asyncio for async tests
**Target Platform**: AWS EC2 (Ubuntu 22.04 LTS) with Nginx reverse proxy
**Project Type**: Web (backend API + existing React frontend)
**Performance Goals**:
- API response time < 200ms (p95) for CRUD operations
- AI chatbot response time < 3 seconds (p95)
- Support 100+ concurrent users
- Vector search < 500ms for top-10 results

**Constraints**:
- JWT token expiration: 7 days
- Email notification retry: max 3 attempts
- Time slot duration: 30 minutes (fixed)
- Article summary: 50-80 characters (strict)
- Related articles: 6 per page load

**Scale/Scope**:
- ~1000 articles with embeddings
- ~100 appointments per month
- ~500 chat sessions per month
- 5 database tables
- 18 API endpoints

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Check (Phase 0)

| Principle | Status | Notes |
|-----------|--------|-------|
| **User Experience First** | ✅ PASS | All features enhance UX: article navigation improves content discovery, chatbot provides instant help, appointment system streamlines booking |
| **Modern Tech Stack** | ✅ PASS | FastAPI (modern Python framework), PostgreSQL (proven database), React frontend (already in use), minimal new dependencies |
| **Performance & Accessibility** | ⚠️ VERIFY | Need to ensure API response times meet <200ms target, chatbot <3s. Accessibility handled by existing frontend |
| **Responsive Design** | ✅ PASS | Backend API is device-agnostic, frontend already responsive |
| **Code Quality** | ✅ PASS | Will use type hints (Pydantic), clear API contracts, comprehensive error handling |

**Action Items for Phase 0**:
- Research FastAPI best practices for async operations
- Research pgvector performance optimization for 1000+ articles
- Research DeepSeek API rate limits and error handling

### Post-Design Check (Phase 1)

*To be completed after data-model.md and contracts/ are generated*

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/                          # New FastAPI backend
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI application entry point
│   ├── config.py                # Configuration and environment variables
│   ├── database.py              # Database connection and session management
│   ├── models/                  # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── article.py           # Article model
│   │   ├── appointment.py       # Appointment model
│   │   ├── chat.py              # ChatMessage model
│   │   ├── faq.py               # FAQ model
│   │   └── embedding.py         # ArticleEmbedding model
│   ├── schemas/                 # Pydantic schemas for request/response
│   │   ├── __init__.py
│   │   ├── article.py
│   │   ├── appointment.py
│   │   ├── chat.py
│   │   ├── faq.py
│   │   └── auth.py
│   ├── routers/                 # API route handlers
│   │   ├── __init__.py
│   │   ├── auth.py              # Authentication endpoints
│   │   ├── articles.py          # Article CRUD endpoints
│   │   ├── appointments.py      # Appointment endpoints
│   │   ├── chat.py              # Chat endpoints
│   │   └── faqs.py              # FAQ management endpoints
│   ├── services/                # Business logic layer
│   │   ├── __init__.py
│   │   ├── auth_service.py      # JWT token generation/validation
│   │   ├── article_service.py   # Article operations
│   │   ├── appointment_service.py # Appointment logic + notifications
│   │   ├── chat_service.py      # RAG implementation
│   │   ├── embedding_service.py # Vector embedding generation
│   │   └── email_service.py     # Email notification service
│   ├── utils/                   # Utility functions
│   │   ├── __init__.py
│   │   ├── security.py          # Password hashing, JWT utilities
│   │   └── validators.py        # Custom validators
│   └── dependencies.py          # FastAPI dependencies (auth, db session)
├── alembic/                     # Database migrations
│   ├── versions/
│   └── env.py
├── tests/                       # Test suite
│   ├── __init__.py
│   ├── conftest.py              # Pytest fixtures
│   ├── test_auth.py
│   ├── test_articles.py
│   ├── test_appointments.py
│   ├── test_chat.py
│   └── test_faqs.py
├── requirements.txt             # Python dependencies
├── .env.example                 # Environment variable template
├── alembic.ini                  # Alembic configuration
└── README.md                    # Backend setup instructions

src/                             # Existing React frontend
├── services/
│   └── api.ts                   # NEW: API client for backend
├── components/
│   ├── NewsDetailPage.tsx       # MODIFIED: Add RelatedArticles component
│   └── ConsultingPage.tsx       # MODIFIED: Integrate appointment + chat APIs
├── contexts/
│   └── AuthContext.tsx          # MODIFIED: Add JWT authentication
└── data/
    └── newsData.ts              # MODIFIED: Replace localStorage with API calls
```

**Structure Decision**: Web application with separate backend and frontend. Backend is a new FastAPI application in `backend/` directory. Frontend modifications are minimal, adding API integration layer in `src/services/api.ts` and updating existing components to use backend APIs instead of localStorage.

## Complexity Tracking

No constitution violations detected. All design decisions align with project principles:
- Modern tech stack (FastAPI, PostgreSQL, React)
- Performance-focused (async operations, vector indexing, connection pooling)
- Maintainable code structure (clear separation of concerns: models, schemas, routers, services)
- Minimal dependencies (only essential libraries)

## Implementation Phases

### Phase 0: Research & Technology Validation

**Objective**: Resolve all technical unknowns and validate technology choices

**Research Tasks**:
1. FastAPI async best practices for database operations
2. pgvector performance characteristics and indexing strategies
3. DeepSeek API integration (rate limits, error handling, token costs)
4. OpenAI embedding API alternatives (cost comparison)
5. Email service options (Resend vs SendGrid vs AWS SES)
6. JWT token management best practices
7. Alembic migration strategies for production

**Output**: `research.md` with decisions, rationale, and alternatives considered

### Phase 1: Design & Contracts

**Objective**: Define data models and API contracts

**Tasks**:
1. **Data Model Design** (`data-model.md`):
   - Define 5 database tables with fields, types, constraints
   - Document relationships and foreign keys
   - Define indexes for performance
   - Document state transitions (appointment status, notification status)

2. **API Contract Design** (`contracts/`):
   - OpenAPI 3.0 specification for all 18 endpoints
   - Request/response schemas
   - Error response formats
   - Authentication requirements per endpoint

3. **Quick Start Guide** (`quickstart.md`):
   - Local development setup instructions
   - Database initialization steps
   - Environment variable configuration
   - Testing procedures

**Output**: `data-model.md`, `contracts/api-spec.yaml`, `quickstart.md`

### Phase 2: Task Breakdown

**Objective**: Create actionable task list for implementation

**Process**: Run `/speckit.tasks` to generate `tasks.md` based on:
- User stories from spec.md (US1-US4)
- Data models from data-model.md
- API contracts from contracts/
- Dependencies and parallel execution opportunities

**Output**: `tasks.md` with ordered, executable tasks
