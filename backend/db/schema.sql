-- SBI Mutual Fund RAG Assistant - Database Schema
-- Supabase PostgreSQL with pgvector extension

-- ============================================
-- live_navs table for real-time NAV data
-- (Used by backend/agent/live_scraper.py)
-- ============================================
CREATE TABLE IF NOT EXISTS live_navs (
    id BIGSERIAL PRIMARY KEY,
    scheme_code TEXT NOT NULL,
    scheme_name TEXT NOT NULL,
    nav REAL NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    valuation_date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for scheme lookup
CREATE INDEX IF NOT EXISTS idx_live_navs_scheme_code ON live_navs(scheme_code);

-- Index for latest NAV per scheme (descending for "most recent first")
CREATE INDEX IF NOT EXISTS idx_live_navs_timestamp ON live_navs(timestamp DESC);

-- ============================================
-- scheme_documents table for RAG embeddings
-- ============================================
CREATE TABLE IF NOT EXISTS scheme_documents (
    id BIGSERIAL PRIMARY KEY,
    scheme_code TEXT,
    scheme_name TEXT NOT NULL,
    document_type TEXT,  -- 'factsheet', 'sid', 'kim', 'amfi'
    source_url TEXT,
    content TEXT NOT NULL,
    embedding VECTOR(768),  -- Gemini embeddings dimension
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Full-text search index on content
CREATE INDEX IF NOT EXISTS idx_scheme_docs_content ON scheme_documents USING GIN (to_tsvector('english', content));

-- Vector similarity search index
CREATE INDEX IF NOT EXISTS idx_scheme_docs_embedding ON scheme_documents USING IVFFlat (embedding vector_cosine_ops);

-- ============================================
-- chat_history table for conversation tracking
-- ============================================
CREATE TABLE IF NOT EXISTS chat_history (
    id BIGSERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_query TEXT NOT NULL,
    intent TEXT,  -- 'ADVISORY', 'LIVE_NAV', 'FACTUAL', 'GENERAL'
    bot_response TEXT NOT NULL,
    source_documents TEXT[],  -- Array of document IDs used
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for session-based queries
CREATE INDEX IF NOT EXISTS idx_chat_history_session ON chat_history(session_id, created_at DESC);

-- ============================================
-- Enable pgvector extension
-- ============================================
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify: SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';

-- ============================================
-- RPC for Cosine Similarity Vector Search
-- ============================================
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id bigint,
  content text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    content,
    1 - (scheme_documents.embedding <=> query_embedding) AS similarity
  FROM scheme_documents
  WHERE 1 - (scheme_documents.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;
