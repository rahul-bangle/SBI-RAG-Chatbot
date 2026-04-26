import os
import csv
import json
import logging
from typing import List, Dict
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "backend", ".env"))

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger("Insights-Agent")

class InsightsAgent:
    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = "llama-3.3-70b-versatile"

    def process_reviews(self, csv_path: str) -> str:
        reviews_data = []
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                reviews_data.append(f"Rating: {row['rating']} | Text: {row['text']}")

        reviews_context = "\n".join(reviews_data)
        
        prompt = f"""
        Analyze the following app reviews for a Mutual Fund app.
        Group them into exactly 5 themes max.
        Generate a one-page weekly pulse note containing:
        1. Top 3 Themes (with a brief summary)
        2. 3 Real User Quotes (select the most representative ones)
        3. 3 Action Ideas (specific, actionable items for the product team)

        Constraints:
        - TOTAL WORD COUNT: Max 250 words.
        - NO PII (No names, IDs, or emails).
        - Format: Scannable Markdown.
        - Tone: Professional and data-driven.

        Reviews:
        {reviews_context}
        """

        logger.info("Generating insights using Groq...")
        chat_completion = self.client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a senior Product Manager specializing in user feedback analysis."},
                {"role": "user", "content": prompt}
            ],
            model=self.model,
            temperature=0.2,
        )

        return chat_completion.choices[0].message.content

    def generate_email_draft(self, note: str) -> str:
        prompt = f"""
        Convert the following product insights note into a professional email draft.
        The email is intended for the Product and Growth teams.
        Subject line should be catchy and informative.
        Keep it concise.

        Note:
        {note}
        """

        chat_completion = self.client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a professional assistant drafting an internal weekly update email."},
                {"role": "user", "content": prompt}
            ],
            model=self.model,
            temperature=0.5,
        )

        return chat_completion.choices[0].message.content

if __name__ == "__main__":
    agent = InsightsAgent()
    data_path = os.path.join(os.path.dirname(__file__), "data", "sample_reviews.csv")
    
    if os.path.exists(data_path):
        report = agent.process_reviews(data_path)
        print("\n--- WEEKLY PULSE NOTE ---")
        print(report)
        
        email = agent.generate_email_draft(report)
        print("\n--- EMAIL DRAFT ---")
        print(email)
        
        # Save results
        output_dir = os.path.join(os.path.dirname(__file__), "output")
        os.makedirs(output_dir, exist_ok=True)
        
        with open(os.path.join(output_dir, "weekly_note.md"), "w", encoding="utf-8") as f:
            f.write(report)
            
        with open(os.path.join(output_dir, "email_draft.txt"), "w", encoding="utf-8") as f:
            f.write(email)
    else:
        logger.error(f"Data file not found at {data_path}")
