import logging
from .resilience import retry_with_backoff

logger = logging.getLogger("SBI-MF-Evaluator")

class Evaluator:
    def __init__(self, api_key):
        from groq import Groq
        self.client = Groq(api_key=api_key)
        self.model = "llama-3.1-8b-instant" # Fast model for evaluation

    @retry_with_backoff(retries=3, initial_delay=0.5)
    async def evaluate_relevance(self, query, context):
        prompt = f"""
        Task: RAG Relevance Evaluation.
        
        Does the provided context contain enough factual information to answer the query?
        The context may contain information about multiple funds — that is fine.
        Focus only on whether the answer to the specific query can be found somewhere in the context.
        
        Query: "{query}"
        Context: "{context}"

        Judgment:
        - If the context contains the factual answer to the query (even among other info): 'RELEVANT'
        - If the context does NOT contain the answer at all: 'IRRELEVANT'

        Return ONLY the single word 'RELEVANT' or 'IRRELEVANT'.
        """
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
        )
        
        return response.choices[0].message.content.strip().upper()
