import os
import logging
from .resilience import retry_with_backoff

class Router:
    def __init__(self, api_key=None):
        from groq import Groq  # Local import to avoid circular dependencies if any
        self.api_key = api_key or os.getenv("GROQ_API_KEY")
        self.client = Groq(api_key=self.api_key)
        self.model = "llama-3.3-70b-versatile" # High reasoning capability for routing

    @retry_with_backoff(retries=3, initial_delay=0.5)
    async def classify_intent(self, query):
        """
        Hardened classification for the SBI MF Assistant.
        Strictly separates factual inquiries from advisory traps.
        """
        prompt = f"""
        ROUTING PROTOCOL: SBI Mutual Fund RAG Assistant.
        
        Analyze the query and categorize it into EXACTLY ONE of these labels:
        
        1. 'ADVISORY' (HIGH RISK): 
           - Asking for opinions, recommendations, or qualitative judgements.
           - Examples: "Is this fund good?", "Best fund for SIP", "Small cap vs Large cap?", "Which is growing faster?", "Should I invest?".
           - ANY comparison for the purpose of picking one is ADVISORY.
        
        2. 'LIVE_NAV': 
           - Specifically requesting real-time Net Asset Value or today's price.
           - Examples: "Latest NAV of Bluechip?", "What is the price of Small Cap fund today?".
        
        3. 'FACTUAL': 
           - Requesting objective, verified data points from official documents.
           - Examples: "Exit load for Bluechip?", "ELSS lock-in period", "Expense ratio", "Who is the fund manager?".
        
        4. 'GENERAL': 
           - Greetings, bot capabilities, or unrelated small talk.

        Query: "{query}"

        Return ONLY the uppercase label string.
        """
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
        )
        
        return response.choices[0].message.content.strip()
