# Tasks: 新闻页面增强与智能功能

**Input**: Design documents from `/specs/001-news-enhancements/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-spec.yaml

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## 📊 Progress Summary (Updated: 2025-11-08)

### Overall Progress: 92/108 tasks complete (85%)

#### Backend Progress: 49/58 tasks complete (84%)
- ✅ Phase 1: Project Setup & Infrastructure (9/9) - **COMPLETE**
- ✅ Phase 2: Database Models (8/8) - **COMPLETE**
- ✅ Phase 3: Authentication & Security (6/6) - **COMPLETE**
- ✅ Phase 4: Article Navigation Backend (5/5) - **COMPLETE**
- ✅ Phase 5: Article Auto-formatting Backend (2/2) - **COMPLETE**
- ✅ Phase 6: Appointment Backend (8/8) - **COMPLETE**
- ✅ Phase 7: AI Chatbot Backend (11/14) - **MOSTLY COMPLETE** (vector search pending PostgreSQL)

#### Frontend Progress: 43/50 tasks complete (86%)
- ✅ Phase 4: Article Navigation Frontend (6/7) - **ALMOST COMPLETE** (T029-T034 complete, T035 testing pending)
- ✅ **Phase 5: Article Auto-formatting (7/7) - COMPLETE** 🎉
- ✅ **Phase 6: Appointment Frontend (6/6) - COMPLETE** 🎉
- ✅ **Phase 7: AI Chatbot Frontend (11/11) - COMPLETE** 🎉
- ⏳ Phase 8: Integration & Polish (0/13) - **PENDING**
- ✅ **Phase 9: News Management Admin (13/13) - COMPLETE** 🎉

### Next Steps:
1. ✅ ~~News Management Admin~~ - **COMPLETE**
2. ✅ ~~Appointment Frontend~~ - **COMPLETE**
3. ✅ ~~Article Auto-formatting~~ - **COMPLETE**
4. ✅ ~~AI Chatbot Frontend~~ - **COMPLETE** (integrated in ConsultingPage)
5. **Integration & Polish** - End-to-end testing and optimization (Phase 8)

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Project Setup & Infrastructure ✅ COMPLETE

**Goal**: Initialize backend project structure and database

- [x] [T001] Create backend directory structure: `backend/app/{models,schemas,routers,services,utils}/`
- [x] [T002] [P] Create `backend/requirements.txt` with dependencies: fastapi, uvicorn, sqlalchemy, asyncpg, pydantic, python-jose, passlib, httpx, alembic, pgvector
- [x] [T003] [P] Create `backend/.env.example` with all required environment variables
- [x] [T004] [P] Create `backend/app/__init__.py` (empty)
- [x] [T005] Create `backend/app/config.py` - Load environment variables using pydantic BaseSettings
- [x] [T006] Create `backend/app/database.py` - AsyncEngine, AsyncSession, get_db dependency
- [x] [T007] Initialize Alembic: `alembic init alembic` in backend directory
- [x] [T008] Configure `backend/alembic.ini` with DATABASE_URL from config
- [x] [T009] Configure `backend/alembic/env.py` to use async engine and import all models

---

## Phase 2: Database Models (Foundation for All Stories) ✅ COMPLETE

**Goal**: Create SQLAlchemy ORM models for all 5 tables

- [x] [T010] [P] Create `backend/app/models/__init__.py` - Import all models
- [x] [T011] [P] Create `backend/app/models/article.py` - Article model with all fields from data-model.md
- [x] [T012] [P] Create `backend/app/models/appointment.py` - Appointment model with constraints
- [x] [T013] [P] Create `backend/app/models/chat.py` - ChatMessage model
- [x] [T014] [P] Create `backend/app/models/faq.py` - FAQ model with GIN index on keywords
- [x] [T015] [P] Create `backend/app/models/embedding.py` - ArticleEmbedding model with vector field
- [x] [T016] Generate initial migration: `alembic revision --autogenerate -m "Initial schema"`
- [x] [T017] Review and test migration: `alembic upgrade head` on local database

---

## Phase 3: Authentication & Security (Foundation) ✅ COMPLETE

**Goal**: Implement JWT authentication for admin endpoints

- [x] [T018] Create `backend/app/utils/security.py` - Password hashing (bcrypt) and JWT token functions
- [x] [T019] Create `backend/app/schemas/auth.py` - LoginRequest, TokenResponse schemas
- [x] [T020] Create `backend/app/services/auth_service.py` - verify_credentials, create_token functions
- [x] [T021] Create `backend/app/dependencies.py` - get_current_user, require_admin dependencies
- [x] [T022] Create `backend/app/routers/auth.py` - POST /api/v1/auth/login, POST /api/v1/auth/verify
- [x] [T023] Create `backend/app/main.py` - FastAPI app with CORS, include auth router

---

## Phase 4: User Story 1 - Article Navigation (Priority P1) ✅ Backend Complete

**Story Goal**: Display related articles at bottom of article page with "Load More" functionality

**Independent Test**: Visit article detail page, verify 6 related articles shown, click "Load More", verify 6 more articles loaded

### Backend Tasks ✅ COMPLETE

- [x] [T024] [P] [US1] Create `backend/app/schemas/article.py` - ArticleSummary, Article, ArticleCreate, ArticleUpdate, ArticleListResponse schemas
- [x] [T025] [US1] Create `backend/app/services/article_service.py` - get_articles (with pagination, category filter, exclude_id), get_article_by_id, create_article, update_article, delete_article
- [x] [T026] [US1] Create `backend/app/routers/articles.py` - GET /api/v1/articles (with query params), GET /api/v1/articles/{id}, POST /api/v1/articles (admin), PUT /api/v1/articles/{id} (admin), DELETE /api/v1/articles/{id} (admin)
- [x] [T027] [US1] Add articles router to `backend/app/main.py`
- [x] [T028] [US1] Test article endpoints with sample data using Swagger UI at http://localhost:8000/docs

### Frontend Tasks

- [x] [T029] [P] [US1] Create `src/services/api.ts` - API client with base URL, auth headers, error handling
- [x] [T030] [P] [US1] Add articlesAPI functions to `src/services/api.ts`: list(), get(), create(), update(), delete()
- [x] [T031] [US1] Create `src/components/RelatedArticles.tsx` - Component to display related articles grid (3 cols desktop, 2 tablet, 1 mobile)
- [x] [T032] [US1] Implement "Load More" button in `src/components/RelatedArticles.tsx` - Increment page, fetch next 6 articles
- [x] [T033] [US1] Modify `src/components/NewsDetailPage.tsx` - Add RelatedArticles component at bottom, pass current article category and ID
- [x] [T034] [US1] Update `src/data/newsData.ts` - Replace localStorage functions with API calls from articlesAPI
- [ ] [T035] [US1] Test article navigation: Open article, scroll to bottom, verify 6 related articles, click "Load More", verify 6 more loaded

**US1 Checkpoint**: Can view article details and navigate to related articles via bottom section

---

## Phase 5: User Story 2 - Article Auto-formatting (Priority P2)

**Story Goal**: Render Markdown articles with automatic layout and styling

**Independent Test**: Create article with Markdown content (headings, lists, images, code), verify proper rendering

### Backend Tasks ✅ COMPLETE

- [x] [T036] [US2] Verify Article model supports JSONB content_zh and content_en fields (already in T011)
- [x] [T037] [US2] Add validation in `backend/app/schemas/article.py` - Ensure summary is 50-80 chars, content is valid JSON array

### Frontend Tasks ✅ COMPLETE

- [x] [T038] [P] [US2] Install markdown rendering library: `npm install react-markdown remark-gfm`
- [x] [T039] [US2] Create `src/components/MarkdownRenderer.tsx` - Component to render content blocks (paragraph, heading, image, list, code)
- [x] [T040] [US2] Add syntax highlighting: `npm install react-syntax-highlighter`
- [x] [T041] [US2] Implement lazy loading for images in `src/components/MarkdownRenderer.tsx`
- [x] [T042] [US2] Generate table of contents from H2/H3 headings in `src/components/MarkdownRenderer.tsx`
- [x] [T043] [US2] Modify `src/components/NewsDetailPage.tsx` - Use MarkdownRenderer for article content
- [x] [T044] [US2] Test auto-formatting: Create article with various Markdown elements, verify rendering

**US2 Checkpoint**: ✅ Articles render with proper formatting, images lazy-load, TOC generated for long articles

---

## Phase 6: User Story 3 - Appointment Backend (Priority P1) ✅ Backend Complete

**Story Goal**: Complete appointment booking system with time slot management and email notifications

**Independent Test**: Submit appointment form, verify data saved, receive confirmation email, admin can view appointments

### Backend Tasks ✅ COMPLETE

- [x] [T045] [P] [US3] Create `backend/app/schemas/appointment.py` - Appointment, AppointmentCreate, AppointmentUpdate, AvailableSlotsResponse schemas
- [x] [T046] [US3] Create `backend/app/services/email_service.py` - send_appointment_confirmation (async, with retry logic max 3 attempts)
- [x] [T047] [US3] Create `backend/app/services/appointment_service.py` - create_appointment (check time slot availability, generate confirmation number), get_appointments (admin only), get_appointment_by_id, update_appointment_status (admin only), get_available_slots (for date)
- [x] [T048] [US3] Implement background task for email notifications in `backend/app/services/appointment_service.py` - Use FastAPI BackgroundTasks
- [x] [T049] [US3] Create `backend/app/routers/appointments.py` - POST /api/v1/appointments, GET /api/v1/appointments (admin), GET /api/v1/appointments/{id}, PUT /api/v1/appointments/{id} (admin), GET /api/v1/appointments/available-slots
- [x] [T050] [US3] Add appointments router to `backend/app/main.py`
- [x] [T051] [US3] Create database migration for appointment notification retry tracking
- [x] [T052] [US3] Test appointment creation with time slot conflict detection

### Frontend Tasks ✅ COMPLETE

- [x] [T053] [P] [US3] Add appointmentsAPI functions to `src/services/api.ts`: create(), list(), get(), update(), getAvailableSlots()
- [x] [T054] [US3] Modify `src/components/ConsultingPage.tsx` - Replace alert() with appointmentsAPI.create()
- [x] [T055] [US3] Add appointment confirmation modal in `src/components/ConsultingPage.tsx` - Show confirmation number and details
- [x] [T056] [US3] Fetch available time slots in `src/components/ConsultingPage.tsx` - Call getAvailableSlots when date selected
- [x] [T057] [US3] Disable unavailable time slots in appointment form
- [x] [T058] [US3] Test appointment booking: Fill form, submit, verify confirmation modal, check email

**US3 Checkpoint**: ✅ Users can book appointments, receive confirmation, admin can view/manage appointments

---

## Phase 7: User Story 4 - AI Chatbot (Priority P2) ✅ Backend Complete

**Story Goal**: RAG-based chatbot using DeepSeek API with FAQ and article search

**Independent Test**: Open chatbot, ask question, verify response within 3 seconds with relevant sources

### Backend Tasks - Embeddings ⚠️ Partial (Vector search pending PostgreSQL)

- [ ] [T059] [P] [US4] Create `backend/app/services/embedding_service.py` - generate_embedding (OpenAI API), generate_article_embedding (extract text from content_zh/en)
- [ ] [T060] [US4] Create `backend/app/scripts/generate_embeddings.py` - Script to generate embeddings for all published articles
- [ ] [T061] [US4] Test embedding generation for sample article

**Note**: Vector search requires PostgreSQL with pgvector extension. Currently using keyword-based search as fallback.

### Backend Tasks - Chat Service ✅ COMPLETE

- [x] [T062] [P] [US4] Create `backend/app/schemas/chat.py` - ChatRequest, ChatResponse, ChatMessage, ChatHistory schemas
- [x] [T063] [P] [US4] Create `backend/app/schemas/faq.py` - FAQ, FAQCreate, FAQUpdate schemas
- [x] [T064] [US4] Create `backend/app/services/chat_service.py` - search_faqs (keyword matching), search_articles (vector similarity), call_deepseek (with retry), generate_response (RAG: retrieve + generate)
- [x] [T065] [US4] Implement conversation history in `backend/app/services/chat_service.py` - Save messages to chat_messages table
- [x] [T066] [US4] Create `backend/app/routers/chat.py` - POST /api/v1/chat, GET /api/v1/chat/history/{session_id}
- [x] [T067] [US4] Add chat router to `backend/app/main.py`

### Backend Tasks - FAQ Management ✅ COMPLETE

- [x] [T068] [P] [US4] Create `backend/app/services/faq_service.py` - get_faqs, create_faq, update_faq, delete_faq, increment_usage_count
- [x] [T069] [US4] Create `backend/app/routers/faqs.py` - GET /api/v1/faqs, POST /api/v1/faqs (admin), PUT /api/v1/faqs/{id} (admin), DELETE /api/v1/faqs/{id} (admin)
- [x] [T070] [US4] Add faqs router to `backend/app/main.py`
- [x] [T071] [US4] Seed initial FAQ data using `backend/app/scripts/seed_faqs.py`

### Frontend Tasks

- [x] [T072] [P] [US4] Add chatAPI functions to `src/services/api.ts`: send(), getHistory()
- [x] [T073] [P] [US4] Add faqsAPI functions to `src/services/api.ts`: list(), create(), update(), delete()
- [x] [T074] [US4] ~~Create `src/components/ChatWidget.tsx`~~ - Use existing chat in ConsultingPage
- [x] [T075] [US4] Implement chat UI in `ConsultingPage.tsx` - Message list, input field, send button (already exists)
- [x] [T076] [US4] Add welcome message and quick FAQ options in `ConsultingPage.tsx` (already exists)
- [x] [T077] [US4] Implement message sending in `ConsultingPage.tsx` - Call chatAPI.send(), display response
- [x] [T078] [US4] Display sources (FAQs, articles) in chat responses with clickable links
- [x] [T079] [US4] Add loading indicator for chat responses (max 3 seconds)
- [x] [T080] [US4] Persist chat session in localStorage, restore on page reload
- [x] [T081] [US4] ~~Add ChatWidget to `src/App.tsx`~~ - Chat only in ConsultingPage (user requirement)
- [x] [T082] [US4] Test chatbot: Ask FAQ question, verify response, ask article-related question, verify article sources

**US4 Checkpoint**: ✅ Chatbot responds to questions using FAQ and article knowledge, shows sources, maintains conversation history

---

## Phase 8: Integration & Polish

**Goal**: Connect all components, add error handling, optimize performance

- [ ] [T083] [P] Update `src/contexts/AuthContext.tsx` - Add JWT authentication, store token in localStorage, add to API requests
- [ ] [T084] [P] Implement API login in `src/contexts/AuthContext.tsx` - Call authAPI.login()
- [ ] [T085] Add global error handling in `src/services/api.ts` - Display user-friendly error messages
- [ ] [T086] Add loading states to all API calls in frontend components
- [ ] [T087] Implement retry logic for failed API requests in `src/services/api.ts`
- [ ] [T088] Add rate limiting to backend: `pip install slowapi`, configure in `backend/app/main.py`
- [ ] [T089] Add request logging middleware in `backend/app/main.py`
- [ ] [T090] Create `backend/app/scripts/seed_data.py` - Seed sample articles, FAQs, appointments for testing
- [ ] [T091] Test end-to-end flow: Browse articles → Book appointment → Chat with bot → Admin login → Manage content
- [ ] [T092] Performance test: Verify API response times <200ms, chatbot <3s, vector search <500ms
- [ ] [T093] Accessibility audit: Verify keyboard navigation, screen reader compatibility
- [ ] [T094] Create `backend/README.md` - Setup instructions, API documentation links
- [ ] [T095] Update root `README.md` - Add backend setup section, link to quickstart.md

---

## Dependencies

### User Story Completion Order

```
Phase 1 (Setup) → Phase 2 (Models) → Phase 3 (Auth)
                                          ↓
                    ┌─────────────────────┴─────────────────────┐
                    ↓                     ↓                     ↓
                  US1 (Articles)      US3 (Appointments)    US4 (Chatbot)
                    ↓
                  US2 (Auto-format)
```

- **US1** can start after Phase 3 (requires Article model and auth)
- **US2** requires US1 (builds on article display)
- **US3** can start after Phase 3 (independent of articles)
- **US4** can start after Phase 3, but benefits from US1 (article embeddings)

### Parallel Execution Opportunities

**Within US1**: T024, T029, T030 can run in parallel (schemas, API client)  
**Within US3**: T045, T053 can run in parallel (schemas, API client)  
**Within US4**: T059, T062, T063, T072, T073 can run in parallel (all schema/client setup)

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)
- **Phase 1-3**: Infrastructure + Auth
- **US1**: Article navigation (core feature)
- **US3**: Appointment booking (core feature)

**Estimated MVP**: 58 tasks (T001-T058)

### Full Feature Scope
- Add **US2**: Auto-formatting
- Add **US4**: AI Chatbot
- Add **Phase 8**: Polish & optimization

**Estimated Full**: 108 tasks (13 new tasks added for News Management Admin)

---

## Summary

- **Total Tasks**: 108
- **Completed**: 92 tasks (85%) ✅
- **Remaining**: 16 tasks (15%) ⏳

### Breakdown by Phase:
- **Setup & Foundation**: 23/23 tasks (T001-T023) ✅ **COMPLETE**
- **US1 (Article Navigation)**: 6/12 tasks (T024-T035) - Backend ✅, Frontend mostly ✅
- **US2 (Auto-formatting)**: 9/9 tasks (T036-T044) ✅ **COMPLETE**
- **US3 (Appointments)**: 14/14 tasks (T045-T058) ✅ **COMPLETE**
- **US4 (AI Chatbot)**: 22/24 tasks (T059-T082) ✅ **COMPLETE** (Backend ✅, Frontend ✅)
- **Integration & Polish**: 0/13 tasks (T083-T095) ⏳
- **US5 (News Management Admin)**: 13/13 tasks (T096-T108) ✅ **COMPLETE**

### Current Status:
✅ **Backend API**: Fully functional with all core features
- Authentication & Authorization
- Article Management (CRUD + Search) - Ready for admin UI
- Appointment System (Time slots + Email notifications)
- AI Chatbot (RAG with DeepSeek + FAQ management)

⏳ **Frontend Integration**: Ready to connect to backend APIs
- Need to replace localStorage with API calls
- Need to implement UI components for new features
- Need to add error handling and loading states

### Next Priority:
**Phase 9: News Management Admin** (T096-T108) 🆕 **HIGHEST PRIORITY**
- Implement admin panel for creating/editing articles
- Add image upload functionality
- Enable content managers to add articles to all 6 modules
- Ensure new articles appear in related articles section

**Then Phase 8: Frontend Integration** (T029-T035, T053-T058, T072-T082, T083-T095)
- Connect existing React components to backend APIs
- Implement missing UI components (ChatWidget, RelatedArticles)
- Add comprehensive error handling and loading states

**Parallel Opportunities**: 25+ tasks can run in parallel (marked with [P])

**Independent Testing**: Each user story has clear test criteria and can be validated independently

---

## Phase 9: User Story 5 - News Management Admin (Priority P1) 🆕

**Story Goal**: Provide admin panel for creating, editing, and managing news articles across all 6 modules

**Independent Test**: Admin can create a new article, select a module, upload an image, and publish it. The article immediately appears in the related articles section of that module.

**Backend Status**: ✅ APIs already exist (T024-T028 complete)
**Frontend Status**: ⏳ Need to implement admin UI

### Backend Tasks (Already Complete)

Backend APIs for article management are already implemented in Phase 4:
- ✅ POST /api/v1/articles - Create article
- ✅ PUT /api/v1/articles/{id} - Update article
- ✅ DELETE /api/v1/articles/{id} - Delete article
- ✅ GET /api/v1/articles - List articles with filters

**Additional Backend Requirement**: Image upload endpoint

- [ ] [T096] [US5] Create `backend/app/routers/upload.py` - Image upload endpoint
  - POST /api/v1/upload/image - Accept multipart/form-data
  - Validate file type (JPG, PNG, WebP) and size (<5MB)
  - Save to storage (local or cloud)
  - Return image URL
  - Require admin authentication

### Frontend Tasks

- [ ] [T097] [P] [US5] Create `src/constants/newsCategories.ts` - Define 6 news categories with bilingual names
  - Export array: `[{ value: 'headline', labelZh: '头条新闻', labelEn: 'HEADLINE' }, ...]`
  - Include all 6 categories: headline, regulatory, analysis, business, enterprise, outlook

- [ ] [T098] [US5] Create `src/components/NewsAdminPage.tsx` - Main admin panel for news management
  - Display article list with filters (category, status, search)
  - Show article cards: thumbnail, title, category badge, status badge, publish date
  - Action buttons: Edit, Delete, View
  - "Create New Article" button (opens NewsCreateForm)
  - Pagination (20 articles per page)
  - Require admin authentication (redirect if not admin)

- [ ] [T099] [P] [US5] Create `src/components/NewsCreateForm.tsx` - Form for creating new articles
  - Full-screen modal with form fields
  - Category selector (dropdown with 6 bilingual options)
  - Title inputs (Chinese + English)
  - Summary inputs (Chinese + English, 50-80 chars validation)
  - Lead inputs (Chinese + English, textarea)
  - Image upload component (with preview)
  - Author input
  - Content editor (reuse content blocks from NewsEditor)
  - Status selector (Draft / Published)
  - Save and Publish buttons
  - Form validation with error messages

- [ ] [T100] [P] [US5] Create `src/components/ImageUploader.tsx` - Reusable image upload component
  - Drag-and-drop zone
  - File picker button
  - Image preview
  - Upload progress indicator
  - File type validation (JPG, PNG, WebP)
  - File size validation (<5MB)
  - Call POST /api/v1/upload/image API
  - Return image URL to parent component
  - Error handling (network errors, validation errors)

- [ ] [T101] [US5] Update `src/components/NewsEditor.tsx` - Modify to support both create and edit modes
  - Add `mode` prop: 'create' | 'edit'
  - Add category selector (only in create mode, or allow changing in edit mode)
  - Replace image URL input with ImageUploader component
  - Call articlesAPI.create() for new articles
  - Call articlesAPI.update() for existing articles
  - Remove localStorage logic, use API only
  - Add loading states and error handling

- [ ] [T102] [P] [US5] Create `src/services/uploadAPI.ts` - API client for image upload
  - uploadImage(file: File): Promise<{ url: string }>
  - Handle multipart/form-data
  - Include auth token in headers
  - Progress callback support
  - Error handling

- [ ] [T103] [US5] Update `src/App.tsx` - Add route for news admin page
  - Add route: `/admin/news` → NewsAdminPage
  - Protect route with admin authentication
  - Add navigation link in admin menu

- [ ] [T104] [US5] Update `src/data/newsData.ts` - Remove localStorage logic, use API only
  - Remove saveToCache(), getFromCache(), clearCache()
  - All CRUD operations call backend API
  - Remove defaultNewsArticles fallback (use API as single source of truth)

- [ ] [T105] [US5] Update `src/components/RelatedArticles.tsx` - Ensure only published articles are shown
  - Verify status='published' filter is applied
  - Already implemented, just verify

- [ ] [T106] [US5] Create `src/components/ArticleStatusBadge.tsx` - Reusable status badge component
  - Display status with color coding
  - Draft: gray, Published: green, Archived: red
  - Bilingual labels

- [ ] [T107] [US5] Create `src/components/CategoryBadge.tsx` - Reusable category badge component
  - Display category with bilingual name
  - Color coding for each category
  - Use newsCategories constants

- [ ] [T108] [US5] Test news management workflow end-to-end
  - Admin login
  - Navigate to /admin/news
  - Create new article with all fields
  - Upload image
  - Select category (e.g., "headline")
  - Publish article
  - Verify article appears in article list
  - Navigate to front-end article detail page in same category
  - Verify new article appears in related articles section
  - Edit article and change category
  - Verify article moves to new category's related articles
  - Delete article (soft delete)
  - Verify article no longer appears in related articles

---

