# Phase 2: Content & RAG Accuracy - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning
**Source:** System diagnostics + analysis (conversation 19ea8432)

<domain>
## Phase Boundary

This phase delivers a fully operational RAG pipeline — from database schema creation through document ingestion, embedding generation, vector search, and CRAG evaluation — so the chatbot answers FACTUAL queries from real SBI Mutual Fund documents (not LLM training data). It also wires up the live NAV scraper to an actual database table and validates refusal logic + citation footers.

</domain>

<decisions>
## Implementation Decisions

### Database Foundation (Critical — Everything Depends On This)
- Apply `backend/db/schema.sql` to Supabase to create `live_navs`, `scheme_documents`, and `chat_history` tables
- Create a Supabase RPC function `match_documents` for cosine similarity vector search on `scheme_documents.embedding`
- Verify `pgvector` extension is active (768 dimensions for Gemini embeddings)

### SBI Corpus Ingestion Pipeline
- Target 5 SBI schemes: Large Cap (103031), Flexi Cap (103135), ELSS (103051), Small Cap (102885), Contra (150116)
- Source documents: Official SBI MF factsheets, SID, KIM from https://www.sbimf.com
- Pipeline: Download PDFs → Extract text (PyPDF2/pdfplumber) → Chunk (500-token chunks, 50-token overlap) → Embed via Gemini (768-dim) → Upsert to `scheme_documents`
- Create a reusable `ingest.py` script in `backend/` for repeatable ingestion

### Vector Search Integration
- Create Supabase RPC function for cosine similarity search
- Wire FACTUAL path in `chat.py` to query `scheme_documents` via vector search instead of hardcoded "RAG Ingestion Pending" string
- Return top-3 relevant chunks as context to the Generator

### CRAG Evaluator Integration
- Wire `crag.py` (Evaluator) into the FACTUAL query path
- Flow: Retrieve chunks → Evaluate relevance → If RELEVANT, generate answer; if IRRELEVANT, respond with "I do not have factual records"
- Use existing `Evaluator.evaluate_relevance()` method (already coded, just not called)

### Live NAV Scraper Activation
- Ensure `live_navs` table exists before scraper runs
- Test `fetch_live_navs()` manually to confirm AMFI data flows correctly
- Verify the APScheduler daily 09:15 AM job writes data successfully

### Facts-Only & Refusal Verification
- ADVISORY queries must return the standard refusal with SEBI/AMFI educational link
- FACTUAL responses must be ≤3 sentences, facts-only from retrieved context
- Every response must include `Source: <url>` and `Last updated from sources: <date>` footer

### Agent's Discretion
- Choice of PDF extraction library (PyPDF2 vs pdfplumber)
- Chunk size tuning (500 tokens is starting point)
- Number of top-K results for vector search (start with 3)
- Whether to add a fallback web search for IRRELEVANT evaluations

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Backend Core
- `backend/main.py` — FastAPI entry, chat endpoint, scheduler setup
- `backend/agent/chat.py` — ChatController orchestrating Router → Generator
- `backend/agent/generator.py` — Facts-only response generator (Groq/Llama 3.3)
- `backend/agent/router.py` — Intent classification (ADVISORY/LIVE_NAV/FACTUAL/GENERAL)
- `backend/agent/crag.py` — CRAG evaluator (exists but NOT wired in)
- `backend/agent/live_scraper.py` — AMFI NAV fetcher with circuit breaker
- `backend/agent/resilience.py` — Circuit breaker + retry patterns

### Database
- `backend/db/schema.sql` — Full schema definition (NOT yet applied to Supabase)

### Configuration
- `backend/.env` — Supabase URL/Key, Groq API Key

### Project Guidelines
- `Projectguildlne.md` — Facts-only constraints, citation requirements, disclaimer rules
- `problem_statement.md` — Original project scope

</canonical_refs>

<specifics>
## Specific Technical Details

### Current Supabase State (Project ID: vlqypkeuaasiomyuvzpn)
- Only `public.documents` table exists (0 rows, uuid/content/metadata/embedding columns)
- `live_navs`, `scheme_documents`, `chat_history` tables are MISSING
- `pgvector` extension IS enabled

### AMFI Data URL
- `https://www.amfiindia.com/spages/NAVAll.txt` — semicolon-delimited, updated daily

### Current Chat Endpoint Flow (what needs to change)
- `POST /chat` → Router classifies → For FACTUAL: passes `"No context available yet (RAG Ingestion Pending)"` as context
- This must change to: query Supabase for relevant chunks → CRAG evaluate → generate from real context

### Frontend Connection
- `FloatingAssistant.jsx` calls `http://localhost:8000/chat` via axios POST
- No frontend changes needed for this phase

</specifics>

<deferred>
## Deferred Ideas

- Full-text hybrid search (combining vector + BM25)
- Chat history persistence to `chat_history` table
- Multi-turn conversation context
- Automatic PDF re-ingestion on schedule

</deferred>

---

*Phase: 02-content-rag-accuracy*
*Context gathered: 2026-04-17 via system diagnostic analysis*
