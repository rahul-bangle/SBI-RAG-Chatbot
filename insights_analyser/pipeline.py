import os
import csv
import logging
from datetime import datetime, timedelta
from google_play_scraper import reviews, Sort

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger("Insights-Analyser")

class ReviewExtractor:
    def __init__(self, app_id: str):
        self.app_id = app_id
        self.data_dir = os.path.join(os.path.dirname(__file__), "data")
        os.makedirs(self.data_dir, exist_ok=True)

    def fetch_reviews(self, weeks: int = 12):
        logger.info(f"Fetching reviews for {self.app_id} from last {weeks} weeks...")
        
        # Calculate the cutoff date
        cutoff_date = datetime.now() - timedelta(weeks=weeks)
        
        all_reviews = []
        continuation_token = None
        
        # We fetch in batches to respect public limits and avoid timeout
        for _ in range(5):  # Max 5 batches of 200
            result, continuation_token = reviews(
                self.app_id,
                lang='en',
                country='in',
                sort=Sort.NEWEST,
                count=200,
                continuation_token=continuation_token
            )
            
            for r in result:
                # google-play-scraper returns datetime objects
                review_date = r['at']
                if review_date < cutoff_date:
                    break
                all_reviews.append({
                    'rating': r['score'],
                    'title': '', # Play Store reviews don't always have separate titles
                    'text': r['content'],
                    'date': review_date.strftime('%Y-%m-%d')
                })
            
            if not continuation_token or (result and result[-1]['at'] < cutoff_date):
                break
                
        return all_reviews

    def save_to_csv(self, reviews_list, filename: str = "reviews_export.csv"):
        filepath = os.path.join(self.data_dir, filename)
        keys = reviews_list[0].keys() if reviews_list else ['rating', 'title', 'text', 'date']
        
        with open(filepath, 'w', newline='', encoding='utf-8') as output_file:
            dict_writer = csv.DictWriter(output_file, fieldnames=keys)
            dict_writer.writeheader()
            dict_writer.writerows(reviews_list)
        
        logger.info(f"Successfully saved {len(reviews_list)} reviews to {filepath}")
        return filepath

if __name__ == "__main__":
    # SBI Mutual Fund App ID
    extractor = ReviewExtractor("com.sbimf.invest")
    data = extractor.fetch_reviews(weeks=12)
    if data:
        extractor.save_to_csv(data)
    else:
        logger.warning("No reviews found for the specified period.")
