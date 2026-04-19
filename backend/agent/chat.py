import os
import logging
import hashlib
from backend.agent.generator import Generator
from backend.agent.crag import Evaluator

logger = logging.getLogger("SBI-MF-ChatController")

class ChatController:
    def __init__(self):
        # Initialize sub-agents with the Groq API key
        api_key = os.getenv("GROQ_API_KEY")
        self.generator = Generator(api_key=api_key)
        self.evaluator = Evaluator(api_key=api_key)
        
        # Initialize Google GenAI for embeddings
        self.ai_client = None
        try:
            from google import genai
            gemini_key = os.getenv("GEMINI_API_KEY")
            if gemini_key:
                self.ai_client = genai.Client(api_key=gemini_key)
                logger.info("Gemini AI client initialized.")
            else:
                logger.warning("GEMINI_API_KEY not found. Using text-based search fallback.")
        except Exception as e:
            logger.warning(f"Could not init Gemini: {e}. Using text-based search fallback.")
        
        # Need supabase client for the RPC call
        from backend.main import supabase
        self.supabase = supabase
        
        logger.info("ChatController initialized with Generator and Evaluator agents.")

    def _generate_embedding(self, text):
        """Generate embedding using Gemini API or deterministic hash-based fallback."""
        if self.ai_client:
            try:
                emb_response = self.ai_client.models.embed_content(
                    model="models/text-embedding-004",
                    contents=text
                )
                return emb_response.embeddings[0].values
            except Exception as e:
                logger.warning(f"Gemini embedding failed: {e}. Using hash-based fallback.")
        
        # Same deterministic hash-based embedding as ingest.py
        text_hash = hashlib.sha256(text.encode()).hexdigest()
        embedding = []
        for i in range(0, min(len(text_hash), 64), 1):
            val = int(text_hash[i], 16) / 15.0
            embedding.append(val)
        while len(embedding) < 768:
            idx = len(embedding)
            base_val = embedding[idx % 64] * 0.8
            embedding.append(base_val + (idx % 7) * 0.02)
        return embedding[:768]

    async def generate_response(self, query):
        """Standard RAG response for general queries using CRAG evaluate-generate loop."""
        try:
            # 1. Retrieve all documents and do in-memory keyword scoring
            docs_res = self.supabase.table("scheme_documents").select("*").execute()
            all_docs = docs_res.data or []
            
            # Extract meaningful keywords from query
            stop_words = {'what', 'when', 'where', 'why', 'how', 'who', 'the', 'for', 'with', 'and', 'this', 'that', 'are', 'is', 'does', 'did'}
            keywords = [w.strip('?.!,') for w in query.lower().split() if len(w) > 2 and w.strip('?.!,') not in stop_words]
            
            for doc in all_docs:
                content_lower = doc['content'].lower()
                scheme_lower = doc['scheme_name'].lower()
                query_lower = query.lower()
                
                doc['score'] = 0
                
                # Bidirectional scheme name matching:
                # "SBI Long Term Equity Fund" should match "SBI Long Term Equity Fund (ELSS)"
                if scheme_lower in query_lower or query_lower in scheme_lower:
                    doc['score'] += 20
                else:
                    # Partial: count how many words of scheme name appear in query
                    scheme_words = [w for w in scheme_lower.split() if len(w) > 2 and w not in ('fund', 'sbi')]
                    matches = sum(1 for w in scheme_words if w in query_lower)
                    if matches >= 2:
                        doc['score'] += matches * 3
                
                for kw in keywords:
                    if kw in content_lower:
                        doc['score'] += 1
            
            # Sort by score descending
            all_docs.sort(key=lambda x: x.get('score', 0), reverse=True)
            
            # Filter to docs with at least SOME match, take top 3
            docs = [d for d in all_docs if d.get('score', 0) > 0][:3]
            
            if not docs:
                return "I do not have factual records for this inquiry. No documents found."
                
            context = "\n\n".join([d['content'] for d in docs])
            source_url = docs[0].get('source_url', 'https://www.sbimf.com') if docs else 'https://www.sbimf.com'
            
            # 2. Evaluate context relevance (CRAG)
            judgment = await self.evaluator.evaluate_relevance(query, context)
            logger.info(f"CRAG Evaluator Judgment: {judgment}")
            
            # 4. Generate conditional response
            if judgment == "RELEVANT":
                return await self.generator.generate_facts_only(query, context, source_url)
            else:
                return "I do not have factual records for this inquiry based on the retrieved documents."
            
        except Exception as e:
            logger.error(f"Error in RAG generation: {e}")
            return "An internal error occurred retrieving factual records."

    async def generate_nav_response(self, query, live_data):
        """Specialized response for LIVE_NAV intent with real-time data."""
        if not live_data:
            return "No live NAV data is currently available. Please try again later."
        data_str = "\n".join([f"- {d['scheme_name']}: NAV Rs. {d['nav']} (as of {d.get('valuation_date', 'N/A')})" for d in live_data])
        context = f"The following is real-time NAV data from AMFI India:\n{data_str}"
        return await self.generator.generate_facts_only(query, context, "https://api.mfapi.in")

    def generate_refusal(self):
        """Standard refusal for ADVISORY queries."""
        return self.generator.generate_refusal()
