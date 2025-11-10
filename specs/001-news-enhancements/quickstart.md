# Quick Start Guide: 新闻页面增强与智能功能

**Feature**: 001-news-enhancements  
**Last Updated**: 2025-11-07

## Prerequisites

### Required Software
- **Python**: 3.11 or higher
- **PostgreSQL**: 14 or higher
- **Node.js**: 18 or higher (for frontend)
- **Git**: For version control

### API Keys (Required)
- **DeepSeek API Key**: Get from https://platform.deepseek.com/
- **OpenAI API Key**: Get from https://platform.openai.com/ (for embeddings)
- **Resend API Key**: Get from https://resend.com/ (for email notifications)

---

## Local Development Setup

### Step 1: Clone Repository

```bash
cd d:\主页设计
git checkout 001-news-enhancements
```

### Step 2: Set Up PostgreSQL Database

#### Option A: Using Docker (Recommended)

```bash
# Pull PostgreSQL image with pgvector
docker pull ankane/pgvector

# Run PostgreSQL container
docker run -d \
  --name news-postgres \
  -e POSTGRES_USER=newsuser \
  -e POSTGRES_PASSWORD=newspass \
  -e POSTGRES_DB=newsdb \
  -p 5432:5432 \
  ankane/pgvector
```

#### Option B: Local PostgreSQL Installation

```bash
# Install PostgreSQL 14+ on your system
# Then install pgvector extension

# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE newsdb;
CREATE USER newsuser WITH PASSWORD 'newspass';
GRANT ALL PRIVILEGES ON DATABASE newsdb TO newsuser;

# Connect to newsdb and enable extensions
\c newsdb
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
```

### Step 3: Set Up Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# Database
DATABASE_URL=postgresql+asyncpg://newsuser:newspass@localhost:5432/newsdb

# JWT Secret (generate with: python -c "import secrets; print(secrets.token_urlsafe(32))")
SECRET_KEY=your-secret-key-here-min-32-characters

# API Keys
DEEPSEEK_API_KEY=sk-your-deepseek-api-key
OPENAI_API_KEY=sk-your-openai-api-key
RESEND_API_KEY=re_your-resend-api-key

# Email Configuration
EMAIL_FROM=noreply@yourdomain.com

# Admin Credentials (for initial setup)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme123

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Environment
ENVIRONMENT=development
```

### Step 5: Run Database Migrations

```bash
# Initialize Alembic (first time only)
alembic upgrade head
```

### Step 6: Seed Initial Data (Optional)

```bash
# Run seed script to create sample data
python -m app.scripts.seed_data
```

### Step 7: Start Backend Server

```bash
# Start FastAPI server with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API Base URL**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs (Swagger UI)
- **Alternative Docs**: http://localhost:8000/redoc (ReDoc)

### Step 8: Set Up Frontend

```bash
# Open a new terminal
cd d:\主页设计

# Install dependencies (if not already done)
npm install

# Create .env.local file
echo "VITE_API_URL=http://localhost:8000" > .env.local

# Start development server
npm run dev
```

The frontend will be available at: http://localhost:5173

---

## Testing the Setup

### 1. Test Backend API

```bash
# Test health check
curl http://localhost:8000/health

# Test article listing
curl http://localhost:8000/api/v1/articles

# Test admin login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"changeme123"}'
```

### 2. Test Frontend Integration

1. Open http://localhost:5173 in your browser
2. Navigate to a news article
3. Scroll to bottom to see "Related Articles" section
4. Click "Load More" to test pagination
5. Navigate to Consulting page
6. Test appointment booking form
7. Test chatbot widget

### 3. Test Database Connection

```bash
# Connect to database
psql -U newsuser -d newsdb -h localhost

# Check tables
\dt

# Check article count
SELECT COUNT(*) FROM articles;

# Check pgvector extension
SELECT * FROM pg_extension WHERE extname = 'vector';
```

---

## Common Development Tasks

### Create a New Database Migration

```bash
# After modifying models in app/models/
alembic revision --autogenerate -m "Description of changes"

# Review the generated migration file in alembic/versions/
# Then apply it
alembic upgrade head
```

### Rollback a Migration

```bash
# Rollback last migration
alembic downgrade -1

# Rollback to specific version
alembic downgrade <revision_id>
```

### Generate Article Embeddings

```bash
# Run embedding generation script
python -m app.scripts.generate_embeddings

# Or generate for specific article
python -m app.scripts.generate_embeddings --article-id <uuid>
```

### Test Email Notifications

```bash
# Send test email
python -m app.scripts.test_email --to your@email.com
```

### Run Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_articles.py

# Run specific test
pytest tests/test_articles.py::test_create_article
```

---

## Troubleshooting

### Database Connection Issues

**Error**: `could not connect to server`

**Solution**:
```bash
# Check if PostgreSQL is running
docker ps  # If using Docker
# or
sudo systemctl status postgresql  # If using system PostgreSQL

# Check connection parameters in .env file
# Ensure DATABASE_URL matches your setup
```

### pgvector Extension Not Found

**Error**: `extension "vector" does not exist`

**Solution**:
```bash
# Connect to database
psql -U newsuser -d newsdb

# Install extension
CREATE EXTENSION IF NOT EXISTS vector;
```

### Import Errors in Python

**Error**: `ModuleNotFoundError: No module named 'app'`

**Solution**:
```bash
# Ensure virtual environment is activated
# Reinstall dependencies
pip install -r requirements.txt

# Run from backend/ directory
cd backend
python -m app.main
```

### CORS Errors in Frontend

**Error**: `Access to fetch at 'http://localhost:8000' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Solution**:
- Check `CORS_ORIGINS` in backend `.env` file
- Ensure it includes `http://localhost:5173`
- Restart backend server after changing `.env`

### API Key Errors

**Error**: `401 Unauthorized` when calling DeepSeek/OpenAI

**Solution**:
- Verify API keys in `.env` file
- Check API key validity on provider websites
- Ensure no extra spaces or quotes in `.env` values

---

## Next Steps

After completing the quick start:

1. **Review API Documentation**: Visit http://localhost:8000/docs
2. **Read Data Model**: See `data-model.md` for database schema details
3. **Review API Contracts**: See `contracts/api-spec.yaml` for endpoint specifications
4. **Run Tests**: Execute `pytest` to ensure everything works
5. **Start Implementation**: Follow `tasks.md` for step-by-step implementation guide

---

## Useful Commands Reference

```bash
# Backend
uvicorn app.main:app --reload              # Start dev server
alembic upgrade head                       # Apply migrations
alembic downgrade -1                       # Rollback migration
pytest                                     # Run tests
python -m app.scripts.seed_data           # Seed database

# Frontend
npm run dev                                # Start dev server
npm run build                              # Build for production
npm run preview                            # Preview production build

# Database
psql -U newsuser -d newsdb                # Connect to database
docker exec -it news-postgres psql -U newsuser -d newsdb  # Connect via Docker

# Docker
docker start news-postgres                 # Start container
docker stop news-postgres                  # Stop container
docker logs news-postgres                  # View logs
```

---

## Support

For issues or questions:
- Check `research.md` for technical decisions and rationale
- Review `spec.md` for feature requirements
- Consult API documentation at http://localhost:8000/docs

