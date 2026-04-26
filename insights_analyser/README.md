# App Review Insights Analyser

Turn raw user feedback into actionable product intelligence. This tool automates the process of extracting, categorizing, and summarizing App Store and Play Store reviews to provide a weekly pulse for product and growth teams.

## The Problem
Product teams are often overwhelmed by the volume of raw reviews across multiple platforms. Manually grouping these into actionable themes is time-consuming and prone to bias. The **Insights Analyser** solves this by using LLM-powered thematic analysis to identify exactly what users are struggling with right now.

## How It Works
The system follows a three-stage automated workflow:

1.  **Extraction**: The `pipeline.py` script uses `google-play-scraper` to pull the last 12 weeks of public reviews for any app ID (default: `com.sbimf.invest`). It adheres to the "Public Data" constraint by avoiding any login-restricted scraping.
2.  **Thematic Analysis**: The `agent.py` uses **Groq (Llama-3.3-70b-versatile)** to process the reviews. It categorizes feedback into exactly 5 themes, redacts all PII, and identifies the most representative user quotes.
3.  **Synthesis**: The agent generates a scannable **Weekly Pulse Note** (≤250 words) and a professional **Email Draft** ready for internal distribution.

## Theme Legend
We track five core dimensions of the user experience:
- **Onboarding/KYC**: First-time user experience and regulatory verification flows.
- **Payments/UPI**: Transaction reliability and gateway performance.
- **Portfolio Tracking**: Accuracy and speed of investment visibility.
- **Withdrawal/Redemption**: Efficiency of the fund exit process.
- **App Performance**: Technical stability, login speed, and UI responsiveness.

## How to Run for a New Week
1.  **Extract Data**:
    ```bash
    python pipeline.py
    ```
    This updates `data/reviews_export.csv` with the latest public feedback.
2.  **Generate Insights**:
    ```bash
    python agent.py
    ```
    This processes the CSV and refreshes the files in the `output/` directory.

## Outputs
- `output/weekly_note.md`: The scannable one-page summary for leadership.
- `output/email_draft.txt`: A pre-written internal update for the Product/Growth Slack or email threads.

## Tech Stack
- **Python 3.14**
- **Groq SDK** (Llama-3.3-70b-versatile)
- **google-play-scraper**
- **python-dotenv**
