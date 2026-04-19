# How It Works — SBI Mutual Fund RAG Assistant

> A complete technical deep-dive into the architecture, data pipeline, retrieval engine, and production readiness of the SBI Mutual Fund RAG Chatbot.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Data Pipeline — How Data Is Fetched](#4-data-pipeline--how-data-is-fetched)
5. [Data Storage — Where & How It's Stored](#5-data-storage--where--how-its-stored)
6. [Retrieval — How Data Is Retrieved](#6-retrieval--how-data-is-retrieved)
7. [The Agent Pipeline — From Query to Answer](#7-the-agent-pipeline--from-query-to-answer)
8. [Scheduler — How Automated Jobs Work](#8-scheduler--how-automated-jobs-work)
9. [Resilience Patterns](#9-resilience-patterns)
10. [Frontend — How Data Is Displayed](#10-frontend--how-data-is-displayed)
11. [Production Readiness Assessment](#11-production-readiness-assessment)

---

## 1. System Overview

```
┌──────────────┐     HTTP POST /chat       ┌───────────────────────────────────┐
│              │ ─────────────────────────► │         FastAPI Backend           │
│   React UI   │                            │         (Port 8000)              │
│  (Vite +     │ ◄───────────────────────── │                                  │
│  TailwindCSS)│     JSON Response          │  ┌─────────┐  ┌──────────────┐  │
│  Port 5173   │                            │  │ Router  │  │ ChatController│  │
└──────────────┘                            │  │ (Groq)  │  │  (Groq + DB) │  │
                                            │  └────┬────┘  └──────┬───────┘  │
                                            │       │              │          │
                                            │  ┌────▼──────────────▼───────┐  │
                                            │  │    Supabase (pgvector)    │  │
                                            │  │  ┌────────────────────┐   │  │
                                            │  │  │ scheme_documents   │   │  │
                                            │  │  │ live_navs          │   │  │
                                            │  │  │ chat_history       │   │  │
                                            │  │  └────────────────────┘   │  │
                                            │  └───────────────────────────┘  │
                                            └───────────────────────────────────┘
                                                          ▲
                                                          │ Scheduled Job
                                                          │ (09:15 AM IST daily)
                                                ┌─────────┴─────────┐
                                                │  AMFI Portal      │
                                                │  api.mfapi.in     │
                                                └───────────────────┘
```

The system is a **Retrieval-Augmented Generation (RAG)** chatbot that answers factual questions about SBI Mutual Funds. It **refuses** to give investment advice (SEBI compliance). It retrieves real data from a vector database and uses an LLM to generate concise, citation-backed answers.

---

## 2. Tech Stack

### Backend
| Layer | Tool | Version / Details |
|-------|------|-------------------|
| **Web Framework** | FastAPI | Async Python web framework with auto-generated OpenAPI docs |
| **ASGI Server** | Uvicorn | Lightning-fast ASGI server with hot-reload in dev |
| **LLM Inference** | Groq API | Llama 3.3 70B Versatile (routing & generation), Llama 3.1 8B Instant (CRAG evaluation) |
| **Embeddings** | Google Gemini | `text-embedding-004` model, 768-dimension vectors |
| **Database** | Supabase PostgreSQL | Managed Postgres with pgvector extension for similarity search |
| **Scheduler** | APScheduler | BackgroundScheduler for cron-based daily NAV sync |
| **Web Scraping** | Scrapling | High-performance scraper for AMFI portal data |
| **HTTP Client** | Requests | For REST API calls to mfapi.in |
| **Resilience** | Custom | Circuit Breaker + Exponential Backoff Retry (hand-rolled) |

### Frontend
| Layer | Tool |
|-------|------|
| **UI Framework** | React 18 |
| **Build Tool** | Vite |
| **Styling** | TailwindCSS |
| **Design** | Groww-inspired light theme |

### Infrastructure
| Layer | Tool |
|-------|------|
| **Database** | Supabase Cloud (PostgreSQL 15 + pgvector) |
| **API Hosting** | Local dev server (Uvicorn) |
| **Environment** | Python 3.14, Node.js |

---

## 3. Project Structure

```
RAG_Chatbot/
├── backend/
│   ├── .env                    # API keys (Groq, Gemini, Supabase)
│   ├── main.py                 # FastAPI app, lifespan, endpoints, scheduler
│   ├── ingest.py               # Data ingestion pipeline (funds → embeddings → DB)
│   ├── requirements.txt        # Python dependencies
│   ├── agent/
│   │   ├── router.py           # Intent classification (FACTUAL/LIVE_NAV/ADVISORY/GENERAL)
│   │   ├── chat.py             # RAG controller (retrieve → evaluate → generate)
│   │   ├── crag.py             # CRAG evaluator (relevance gating)
│   │   ├── generator.py        # Facts-only response generator
│   │   ├── live_scraper.py     # Scheduled AMFI NAV scraper
│   │   └── resilience.py       # Circuit breaker + retry decorators
│   └── db/
│       └── schema.sql          # Full database DDL (tables, indexes, RPC functions)
├── frontend/
│   └── frontend/
│       ├── src/                # React components
│       ├── index.html          # Entry point
│       ├── vite.config.js      # Vite configuration
│       └── tailwind.config.js  # TailwindCSS theme
├── scripts/
│   ├── verify_rag.py           # Automated RAG verification benchmark
│   ├── test_query.py           # Quick query tester
│   └── ingest_navs.py          # Standalone NAV ingestion
├── links.md                    # All data source URLs and references
├── howitworks.md               # This file
└── problem_statement.md        # Original project requirements
```

---

## 4. Data Pipeline — How Data Is Fetched

There are **two** data pipelines — one for static fund facts and one for live NAV prices.

### 4.1 Static Fund Data (One-time Ingestion)

**File:** `backend/ingest.py`

**What it does:** Takes curated, verified factual data about 5 SBI mutual funds and stores it as searchable document chunks with vector embeddings.

**Step-by-step flow:**

```
1. DEFINE fund data in code
   ├── 5 SBI funds (Large Cap, Small Cap, Flexi Cap, ELSS, Contra)
   ├── 3 factual chunks per fund (15 total)
   └── Each chunk = 2-4 sentences of verified data

2. GENERATE embeddings
   ├── Primary: Gemini text-embedding-004 API (768-D vectors)
   └── Fallback: Deterministic SHA-256 hash-based dummy vectors
       (consistent — same text always produces same vector)

3. STORE in Supabase
   ├── Table: scheme_documents
   ├── Fields: scheme_code, scheme_name, content, embedding, source_url
   └── Result: 15 rows (5 funds × 3 chunks)
```

**Data Source for facts:**
| Source | What we get |
|--------|------------|
| [api.mfapi.in](https://api.mfapi.in) | Scheme names, NAV history, metadata |
| [sbimf.com](https://www.sbimf.com) | Fund objectives, exit loads, expense ratios, fund managers |
| [AMFI India](https://www.amfiindia.com) | Official scheme codes, ISIN numbers |
| [SEBI Circulars](https://www.sebi.gov.in) | Classification norms (large cap ≥ 80%, etc.) |

**Tool used:** `requests` library for HTTP calls to `api.mfapi.in`. No scraping involved — the source is a free, open REST API.

### 4.2 Live NAV Data (Scheduled + On-Demand)

**File:** `backend/agent/live_scraper.py`

**What it does:** Fetches the latest NAV prices daily at 09:15 AM IST from the AMFI portal.

**Step-by-step flow:**

```
1. TRIGGER
   ├── APScheduler fires at 09:15 AM IST daily
   └── Calls fetch_live_navs(supabase)

2. FETCH
   ├── Primary: Scrapes https://www.amfiindia.com/spages/NAVAll.txt
   │   (plain text file, semicolon-delimited, ~50,000 lines)
   └── Fallback: Uses hardcoded sample data if portal is down

3. PARSE
   ├── Splits response by newlines
   ├── Filters for SBI scheme codes only (5 funds)
   └── Extracts: scheme_code, nav, valuation_date

4. STORE
   ├── Table: live_navs
   └── INSERT new row per scheme (historical tracking)
```

**Also for the initial seed data**, we used the standalone `scripts/ingest_navs.py` which calls `api.mfapi.in/mf/{code}` directly for each fund.

---

## 5. Data Storage — Where & How It's Stored

### Database: Supabase (Cloud PostgreSQL + pgvector)

**Location:** Supabase Cloud (project: `vlqypkeuaasiomyuvzpn`)

### Table: `scheme_documents` (RAG Knowledge Base)

| Column | Type | Purpose |
|--------|------|---------|
| `id` | BIGSERIAL PK | Auto-increment ID |
| `scheme_code` | TEXT | AMFI scheme code (e.g., `119598`) |
| `scheme_name` | TEXT | Human-readable name |
| `document_type` | TEXT | Category: `factsheet`, `sid`, `kim`, `amfi` |
| `source_url` | TEXT | Source URL for citation |
| `content` | TEXT | The actual factual text chunk |
| `embedding` | VECTOR(768) | 768-D vector embedding for similarity search |
| `created_at` | TIMESTAMPTZ | Insertion timestamp |

**Indexes:**
- `GIN` index on content using `to_tsvector('english', content)` — full-text search
- `IVFFlat` index on embedding using `vector_cosine_ops` — vector similarity search

### Table: `live_navs` (Real-Time NAV Prices)

| Column | Type | Purpose |
|--------|------|---------|
| `id` | BIGSERIAL PK | Auto-increment ID |
| `scheme_code` | TEXT | AMFI scheme code |
| `scheme_name` | TEXT | Fund name |
| `nav` | REAL | Net Asset Value (₹) |
| `valuation_date` | TEXT | Date of the NAV |
| `timestamp` | TIMESTAMPTZ | When we fetched it |

### Table: `chat_history` (Conversation Logs)

| Column | Type | Purpose |
|--------|------|---------|
| `session_id` | TEXT | Tracks a user session |
| `user_query` | TEXT | What the user asked |
| `intent` | TEXT | Classified intent |
| `bot_response` | TEXT | What we answered |
| `source_documents` | TEXT[] | Which documents we used |

### Stored Function: `match_documents()` (Vector Search RPC)

```sql
-- Performs cosine similarity search against the embedding column
-- Returns documents ranked by similarity above the threshold
SELECT id, content, 1 - (embedding <=> query_embedding) AS similarity
FROM scheme_documents
WHERE similarity > match_threshold
ORDER BY similarity DESC
LIMIT match_count;
```

---

## 6. Retrieval — How Data Is Retrieved

### The Hybrid Retrieval Strategy

Since the Gemini embedding API key was revoked (dummy embeddings are in the DB), we use a **hybrid approach**:

```
┌─────────────────────────────────────────┐
│  User Query: "Exit load of SBI ELSS?"   │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  STEP 1: Fetch ALL 15 documents         │
│  (SELECT * FROM scheme_documents)       │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  STEP 2: In-Memory Keyword Scoring      │
│                                         │
│  For each document:                     │
│   • +20 pts if fund name matches query  │
│     (bidirectional partial matching)    │
│   • +3 pts per scheme word match        │
│   • +1 pt per keyword found in content  │
│                                         │
│  Sort by score DESC, take top 3         │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  STEP 3: CRAG Relevance Gate            │
│  (Groq Llama 3.1 8B evaluates if       │
│   the context actually answers query)   │
│                                         │
│  RELEVANT → Generate answer             │
│  IRRELEVANT → Refuse politely           │
└─────────────────────────────────────────┘
```

**Why this approach?**
- With only 15 documents, full-table scan + in-memory scoring is **faster** than vector search
- Keyword scoring is **deterministic** — no embedding quality dependency
- The CRAG layer acts as a safety net against false positives

**When real embeddings are active** (with a valid Gemini API key), the system falls back to the `match_documents()` RPC for cosine similarity search with a configurable threshold.

---

## 7. The Agent Pipeline — From Query to Answer

This is the complete journey of a user query through the system:

```
User: "What is the exit load for SBI Small Cap Fund?"
│
▼
┌──────────────────────────────────────────────────────┐
│  1. FRONTEND (React)                                  │
│     POST http://localhost:8000/chat                   │
│     Body: { "query": "What is the exit load..." }    │
└──────────────────┬───────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────┐
│  2. FastAPI /chat ENDPOINT (main.py:112)              │
│     Receives request, logs query, starts processing  │
└──────────────────┬───────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────┐
│  3. ROUTER AGENT (router.py)                          │
│     Model: Llama 3.3 70B Versatile (Groq)            │
│     Prompt: Classify into FACTUAL/LIVE_NAV/          │
│             ADVISORY/GENERAL                          │
│     Result: "FACTUAL"                                │
│     Resilience: retry_with_backoff (3 retries)       │
└──────────────────┬───────────────────────────────────┘
                   │
                   ▼ (branches based on intent)
         ┌─────────┼──────────┐
         │         │          │
    ADVISORY   LIVE_NAV   FACTUAL
         │         │          │
    Refuse    DB lookup   RAG Pipeline
    (hardcoded) (live_navs)   │
                              ▼
┌──────────────────────────────────────────────────────┐
│  4. CHAT CONTROLLER — RETRIEVAL (chat.py)             │
│     • Fetch all 15 docs from scheme_documents        │
│     • Extract keywords from query (remove stopwords) │
│     • Score each doc (scheme name match + keywords)  │
│     • Return top 3 most relevant documents           │
└──────────────────┬───────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────┐
│  5. CRAG EVALUATOR (crag.py)                          │
│     Model: Llama 3.1 8B Instant (Groq) — fast        │
│     Input: query + retrieved context                  │
│     Output: "RELEVANT" or "IRRELEVANT"               │
│     Purpose: Prevents hallucination — if context     │
│     doesn't contain the answer, refuse gracefully    │
└──────────────────┬───────────────────────────────────┘
                   │
          ┌────────┴────────┐
      RELEVANT         IRRELEVANT
          │                 │
          ▼                 ▼
┌─────────────────┐  ┌─────────────────────────────┐
│ 6. GENERATOR    │  │ "I do not have factual      │
│  (generator.py) │  │  records for this inquiry." │
│  Llama 3.3 70B  │  └─────────────────────────────┘
│  Facts-only     │
│  Max 3 sentences│
│  + source URL   │
│  + timestamp    │
└────────┬────────┘
         │
         ▼
┌──────────────────────────────────────────────────────┐
│  7. RESPONSE to Frontend                              │
│  {                                                    │
│    "response": "SBI Small Cap Fund has an exit load  │
│     of 1% if redeemed within 1 year...",             │
│    "intent": "FACTUAL"                               │
│  }                                                    │
└──────────────────────────────────────────────────────┘
```

### Intent-Based Routing Summary

| Intent | Handler | Data Source | LLM Used |
|--------|---------|-------------|----------|
| `FACTUAL` | `chat_agent.generate_response()` | `scheme_documents` table | Llama 3.3 70B (generate) + Llama 3.1 8B (evaluate) |
| `LIVE_NAV` | `chat_agent.generate_nav_response()` | `live_navs` table | Llama 3.3 70B |
| `ADVISORY` | `chat_agent.generate_refusal()` | None (hardcoded refusal) | None |
| `GENERAL` | `chat_agent.generate_response()` | `scheme_documents` table | Same as FACTUAL |

---

## 8. Scheduler — How Automated Jobs Work

### APScheduler Configuration

**File:** `backend/main.py` (line 49)

```python
scheduler = BackgroundScheduler()
scheduler.add_job(fetch_live_navs, 'cron', hour=9, minute=15, args=[supabase])
scheduler.start()
```

### How it works:

```
┌─────────────────────────────────────────────┐
│  APScheduler (BackgroundScheduler)           │
│                                              │
│  • Runs in a background thread               │
│  • Does NOT block the FastAPI event loop     │
│  • Persists across request lifecycles        │
│                                              │
│  Schedule: Every day at 09:15 AM IST        │
│  (After markets open + NAVs are published)  │
│                                              │
│  Job: fetch_live_navs(supabase)             │
│   1. GET amfiindia.com/spages/NAVAll.txt    │
│   2. Parse semicolon-delimited text         │
│   3. Filter for 5 SBI scheme codes          │
│   4. INSERT into live_navs table            │
│                                              │
│  Lifecycle:                                  │
│   • Started in FastAPI lifespan (startup)   │
│   • Shut down in FastAPI lifespan (shutdown)│
└─────────────────────────────────────────────┘
```

### Why 09:15 AM IST?

Mutual fund NAVs in India are published by AMFI after the market closes (3:30 PM) and are typically available by the next morning. The 09:15 AM slot ensures:
- The latest NAV from the previous trading day is available
- Markets are opening (useful for same-day queries)
- Single daily sync is sufficient (NAVs only change once per day)

---

## 9. Resilience Patterns

### 9.1 Circuit Breaker (`resilience.py`)

```
State Machine:
                          
  CLOSED ──[3 failures]──► OPEN ──[5 min timeout]──► HALF_OPEN
    ▲                                                      │
    └──────────────[success]───────────────────────────────┘
```

| State | Behavior |
|-------|----------|
| **CLOSED** | Normal operation. Requests pass through. Failures are counted. |
| **OPEN** | All requests are immediately rejected. No external calls made. Prevents cascade failures. |
| **HALF_OPEN** | After recovery timeout (300s), allows ONE test request. Success → CLOSED. Failure → OPEN. |

**Used for:** AMFI portal scraping (protects against portal downtime).

### 9.2 Retry with Exponential Backoff (`resilience.py`)

```python
@retry_with_backoff(retries=3, initial_delay=0.5, factor=2.0)
```

```
Attempt 1 → fails → wait 0.5s
Attempt 2 → fails → wait 1.0s
Attempt 3 → fails → raise exception
```

**Used for:** All Groq LLM calls (Router, CRAG Evaluator, Generator) — protects against transient API errors and rate limits.

---

## 10. Frontend — How Data Is Displayed

### Stack: React + Vite + TailwindCSS

```
User types query
       │
       ▼
┌────────────────────────┐
│  Chat Input Component  │
│  (text field + send)   │
└──────────┬─────────────┘
           │ fetch('http://localhost:8000/chat', { query })
           ▼
┌────────────────────────┐
│  Chat Bubble Component │
│                        │
│  User message (right)  │
│  Bot response (left)   │
│                        │
│  • Groww teal theme    │
│  • Minimalist design   │
│  • Smooth animations   │
└────────────────────────┘
```

**Design:** Groww-inspired light theme with teal (`#00D09C`) accents, clean card-based layout, and responsive mobile support.

**How it triggers:**
1. User types a question in the chat input
2. Frontend sends `POST /chat` to `localhost:8000`
3. Backend processes through the full agent pipeline
4. JSON response `{ response, intent }` is returned
5. Frontend renders the response as a chat bubble

---

## 11. Production Readiness Assessment

### ✅ What IS Production-Ready

| Feature | Status | Details |
|---------|--------|---------|
| **Multi-agent architecture** | ✅ Ready | Router → Retriever → Evaluator → Generator pipeline |
| **Intent classification** | ✅ Ready | 4-way routing with Llama 3.3 70B |
| **CRAG evaluation** | ✅ Ready | Prevents hallucination with relevance gating |
| **Advisory refusal** | ✅ Ready | SEBI-compliant — never gives investment advice |
| **Circuit breaker** | ✅ Ready | Protects against cascade failures |
| **Retry with backoff** | ✅ Ready | Handles transient API errors gracefully |
| **Structured logging** | ✅ Ready | Timestamped, service-tagged logs for debugging |
| **Performance headers** | ✅ Ready | X-Process-Time and X-Trace-ID on every response |
| **CORS middleware** | ✅ Ready | Cross-origin requests enabled |
| **Health + Status endpoints** | ✅ Ready | `/health` (liveness) and `/status` (readiness) probes |
| **Scheduled data sync** | ✅ Ready | APScheduler cron job for daily NAV updates |
| **Database schema** | ✅ Ready | Proper indexes, constraints, and RPC functions |
| **Factual data integrity** | ✅ Ready | Real verified data from AMFI/SEBI/SBI MF sources |

### ⚠️ What NEEDS Work for Full Production

| Gap | Severity | What's Needed |
|-----|----------|---------------|
| **Gemini API key revoked** | 🔴 High | Embeddings use deterministic hash fallback. Need a new key from Google AI Studio for real semantic search. |
| **CORS allows all origins** | 🟡 Medium | `allow_origins=["*"]` should be restricted to the frontend domain in prod. |
| **No authentication** | 🔴 High | No user auth on `/chat` endpoint. Needs JWT or API key protection. |
| **No rate limiting** | 🟡 Medium | No per-user or per-IP rate limiting. Vulnerable to abuse. |
| **Chat history not saved** | 🟡 Medium | `chat_history` table exists but responses aren't being inserted. |
| **Only 5 funds** | 🟡 Medium | Only covers 5 SBI schemes. SBI MF has 50+ schemes. Need broader ingestion. |
| **No HTTPS** | 🔴 High | Running on HTTP. Production needs TLS termination (nginx/Cloudflare). |
| **No Docker** | 🟡 Medium | No containerization. Should add Dockerfile + docker-compose for deployment. |
| **APScheduler in-process** | 🟡 Medium | Scheduler runs in the same process. For horizontal scaling, use Redis-backed Celery or a standalone job runner. |
| **No monitoring/alerting** | 🟡 Medium | No Prometheus metrics, no Sentry error tracking, no PagerDuty alerts. |
| **Environment secrets** | 🟡 Medium | Keys in `.env` file. Production should use Vault, AWS SSM, or K8s Secrets. |

### Verdict

> **This is a solid MVP / proof-of-concept** with production-grade architectural patterns (CRAG, circuit breakers, multi-agent routing). It is **NOT production-ready** for public deployment due to missing authentication, HTTPS, and the revoked embedding API key. Estimated effort to make it production-ready: **2-3 days** of focused work.

### Priority Fixes for Production

```
1. [CRITICAL] Generate new Gemini API key → real semantic search
2. [CRITICAL] Add JWT authentication to /chat endpoint
3. [CRITICAL] Enable HTTPS (nginx reverse proxy or Cloudflare)
4. [HIGH]     Restrict CORS to frontend domain only
5. [HIGH]     Add rate limiting (e.g., slowapi)
6. [MEDIUM]   Add Dockerfile + docker-compose
7. [MEDIUM]   Wire up chat_history saving
8. [MEDIUM]   Expand to all 50+ SBI schemes
```

---

*Last updated: 2026-04-17*
*Author: AI-assisted documentation*
