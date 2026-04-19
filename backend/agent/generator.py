import datetime
import logging
from .resilience import retry_with_backoff

logger = logging.getLogger("SBI-MF-Generator")

class Generator:
    def __init__(self, api_key):
        from groq import Groq
        self.client = Groq(api_key=api_key)
        self.model = "llama-3.3-70b-versatile"

    @retry_with_backoff(retries=3, initial_delay=0.5)
    async def generate_facts_only(self, query, context, source_url):
        prompt = f"""
        Task: Fact-Only Mutual Fund Assistant.
        Constraint: Respond in EXACTLY 3 sentences or less. No investment advice.
        
        Context: {context}
        Query: {query}
        
        Rules:
        1. Only use facts from the context.
        2. If data is missing, say "I do not have factual records for this inquiry."
        3. Do NOT provide recommendations or comparison advice.
        
        Response Format:
        [Answer (max 3 sentences)]
        
        Source: {source_url}
        """
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
        )
        
        ans = response.choices[0].message.content.strip()
        last_updated = datetime.datetime.now().strftime("%Y-%m-%d")
        footer = f"\n\nLast updated from sources: {last_updated}"
        
        return ans + footer

    def generate_refusal(self):
        refusal = (
            "I am a facts-only assistant and am not authorized to provide personalized investment advice or recommendations. "
            "For guidance on mutual fund investing, please refer to the official investor education resources from SEBI or AMFI. "
            "\n\nReference: https://www.amfiindia.com/investor-corner/knowledge-center/what-are-mutual-funds.html"
        )
        last_updated = datetime.datetime.now().strftime("%Y-%m-%d")
        footer = f"\n\nLast updated from sources: {last_updated}"
        return refusal + footer
