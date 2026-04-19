import os
import json
import time
import requests
from supabase import create_client, Client
from dotenv import load_dotenv

# Load config
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Try to initialize Gemini embeddings
ai_client = None
try:
    if GEMINI_API_KEY:
        from google import genai
        ai_client = genai.Client(api_key=GEMINI_API_KEY)
        print("Gemini AI client initialized for real embeddings.")
    else:
        print("Warning: GEMINI_API_KEY not set. Using deterministic dummy embeddings.")
except Exception as e:
    print(f"Warning: Could not initialize Gemini client: {e}. Using dummy embeddings.")

# Initialize Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ============================================
# REAL SBI Mutual Fund Data
# Source: AMFI India, SBI MF Official Website, SEBI Disclosures
# ============================================

SBI_FUND_DATA = [
    {
        "scheme_code": "119598",
        "scheme_name": "SBI Large Cap Fund",
        "source_url": "https://www.sbimf.com/en-us/equity-schemes/sbi-bluechip-fund",
        "mfapi_code": 119598,
        "facts": [
            "SBI Large Cap Fund (formerly SBI Bluechip Fund) is an open-ended equity scheme predominantly investing in large cap stocks. It is categorized as a Large Cap Fund under SEBI norms. The fund aims to provide long-term capital appreciation by investing in a diversified portfolio of equity and equity-related securities of large cap companies. Fund Manager: Sohini Andani. The benchmark index is S&P BSE 100 TRI. Minimum investment amount is Rs. 5,000 for lump sum and Rs. 500 for SIP.",
            "SBI Large Cap Fund has an exit load of 1% if redeemed within 1 year from the date of allotment. No exit load is charged if redeemed after 1 year. The expense ratio for the Direct Plan is approximately 0.89% and for the Regular Plan is approximately 1.62%. The fund was launched on February 14, 2006. ISIN for Growth option (Direct): INF200K01QX4. The fund house is SBI Funds Management Limited.",
            "SBI Large Cap Fund's investment strategy focuses on large-cap companies with strong fundamentals, good management quality, and sustainable competitive advantages. The fund typically holds 40-60 stocks in its portfolio. As per SEBI classification, a minimum of 80% of total assets must be invested in large cap stocks (top 100 companies by market capitalization). The fund follows a bottom-up stock-picking approach with emphasis on quality and valuation.",
        ]
    },
    {
        "scheme_code": "120505",
        "scheme_name": "SBI Small Cap Fund",
        "source_url": "https://www.sbimf.com/en-us/equity-schemes/sbi-small-cap-fund",
        "mfapi_code": 120505,
        "facts": [
            "SBI Small Cap Fund is an open-ended equity scheme predominantly investing in small cap stocks. Fund Manager: R. Srinivasan. The fund aims to provide investors with opportunities of long-term capital appreciation by investing in a diversified portfolio of equity and equity-related securities of small cap companies. The benchmark index is S&P BSE 250 SmallCap TRI. Minimum investment is Rs. 5,000 for lump sum and Rs. 500 for SIP.",
            "SBI Small Cap Fund has an exit load of 1% if redeemed within 1 year from the date of allotment. No exit load after 1 year. The expense ratio for the Direct Plan is approximately 0.71% and Regular Plan is approximately 1.72%. The fund was launched on September 9, 2009. The fund has consistently been one of the top-performing small cap funds in India. ISIN (Direct Growth): INF200K01SM8.",
            "SBI Small Cap Fund invests at least 65% of its total assets in equity and equity-related instruments of small cap companies (companies ranked 251st and beyond in terms of market capitalization). The fund follows a bottom-up approach focusing on companies with strong growth potential, clean management, and reasonable valuations. Lock-in period: None (except ELSS). The fund has delivered strong long-term returns compared to its benchmark.",
        ]
    },
    {
        "scheme_code": "119718",
        "scheme_name": "SBI Flexi Cap Fund",
        "source_url": "https://www.sbimf.com/en-us/equity-schemes/sbi-flexicap-fund",
        "mfapi_code": 119718,
        "facts": [
            "SBI Flexi Cap Fund (formerly SBI Magnum Multicap Fund) is an open-ended dynamic equity scheme investing across large cap, mid cap, and small cap stocks. Fund Manager: R. Srinivasan and Mohit Jain. The fund aims to generate long-term capital appreciation by investing in a well-diversified portfolio. Benchmark: S&P BSE 500 TRI. Minimum investment: Rs. 5,000 lump sum, Rs. 500 SIP.",
            "SBI Flexi Cap Fund has an exit load of 0.1% if redeemed within 30 days from the date of allotment. No exit load after 30 days. The expense ratio for the Direct Plan is approximately 0.61% and Regular Plan is approximately 1.57%. The fund was originally launched on September 29, 2005. ISIN (Direct Growth): INF200K01UR4.",
            "SBI Flexi Cap Fund has the flexibility to invest across market capitalizations without any restrictions. As per SEBI norms, a minimum of 65% of total assets must be invested in equity and equity-related instruments. The fund can dynamically shift allocation between large, mid, and small caps based on market conditions. This provides diversification benefits and reduces concentration risk.",
        ]
    },
    {
        "scheme_code": "103031",
        "scheme_name": "SBI Long Term Equity Fund (ELSS)",
        "source_url": "https://www.sbimf.com/en-us/equity-schemes/sbi-long-term-equity-fund",
        "mfapi_code": 103031,
        "facts": [
            "SBI Long Term Equity Fund is an open-ended Equity Linked Savings Scheme (ELSS) with a statutory lock-in of 3 years and tax benefit under Section 80C of the Income Tax Act. Fund Manager: Dinesh Balachandran. The full name of scheme code 103031 is 'SBI Long Term Equity Fund - Regular Plan - Growth'. Benchmark: S&P BSE 500 TRI. Minimum investment: Rs. 500.",
            "SBI Long Term Equity Fund (ELSS) has NO exit load as it comes with a mandatory lock-in period of 3 years from the date of allotment. The 3-year lock-in is the shortest among all tax-saving instruments under Section 80C. The expense ratio for Direct Plan is approximately 1.07% and Regular Plan is approximately 1.83%. The fund provides tax deduction of up to Rs. 1.5 lakh per financial year under Section 80C.",
            "SBI Long Term Equity Fund invests predominantly in equity and equity-related securities with at least 80% allocation to equities. Being an ELSS fund, it offers the dual benefit of wealth creation and tax saving. The fund follows a diversified multi-cap strategy. Units cannot be redeemed, transferred, or pledged during the lock-in period of 3 years. After the lock-in period, there is no exit load on redemption.",
        ]
    },
    {
        "scheme_code": "119835",
        "scheme_name": "SBI Contra Fund",
        "source_url": "https://www.sbimf.com/en-us/equity-schemes/sbi-contra-fund",
        "mfapi_code": 119835,
        "facts": [
            "SBI Contra Fund is an open-ended equity scheme following a contrarian investment strategy. Fund Manager: Dinesh Balachandran and Mohit Jain. The fund aims to generate long-term capital appreciation by investing in stocks that are currently undervalued or out of favor. Benchmark: S&P BSE 500 TRI. Minimum investment: Rs. 5,000 lump sum and Rs. 500 for SIP.",
            "SBI Contra Fund has an exit load of 1% if redeemed within 1 year from the date of allotment. No exit load after 1 year. The expense ratio for the Direct Plan is approximately 0.70% and Regular Plan is approximately 1.71%. ISIN (Direct Growth): INF200K01UJ1. The fund was launched in May 1999.",
            "SBI Contra Fund follows a contrarian investment strategy, which means it invests in stocks that are currently unpopular or undervalued by the market. The fund looks for companies trading at a discount to their intrinsic value. As per SEBI classification, a Contra Fund must invest at least 65% of total assets in equity and equity-related instruments following a contrarian investment strategy. The fund identifies sectors and stocks that are out of favor due to temporary setbacks but have strong long-term potential.",
        ]
    },
]

# ============================================
# Embedding Generation
# ============================================

def generate_embedding(text):
    """Generate embedding using Gemini API or fallback to deterministic dummy."""
    if ai_client:
        try:
            emb_response = ai_client.models.embed_content(
                model="models/text-embedding-004",
                contents=text
            )
            return emb_response.embeddings[0].values
        except Exception as e:
            print(f"  Gemini embedding failed: {e}. Using dummy embedding.")
    
    # Deterministic dummy embedding based on text hash (consistent for same text)
    import hashlib
    text_hash = hashlib.sha256(text.encode()).hexdigest()
    # Generate 768-dimension vector from hash
    embedding = []
    for i in range(0, min(len(text_hash), 64), 1):
        val = int(text_hash[i], 16) / 15.0  # Normalize 0-1
        embedding.append(val)
    # Pad to 768 dimensions with variations
    while len(embedding) < 768:
        idx = len(embedding)
        base_val = embedding[idx % 64] * 0.8
        embedding.append(base_val + (idx % 7) * 0.02)
    return embedding[:768]


# ============================================
# Live NAV Ingestion from MFAPI.in
# ============================================

def ingest_live_navs():
    """Fetch real-time NAV data from api.mfapi.in for each fund."""
    print("\n📈 Fetching live NAV data from api.mfapi.in...")
    
    for fund in SBI_FUND_DATA:
        code = fund["mfapi_code"]
        url = f"https://api.mfapi.in/mf/{code}"
        try:
            resp = requests.get(url, timeout=15)
            data = resp.json()
            
            if data.get("status") == "SUCCESS" and data.get("data"):
                latest = data["data"][0]  # Most recent NAV
                nav_entry = {
                    "scheme_code": str(code),
                    "scheme_name": data["meta"]["scheme_name"],
                    "nav": float(latest["nav"]),
                    "valuation_date": latest["date"],
                }
                supabase.table("live_navs").insert(nav_entry).execute()
                print(f"  ✅ {fund['scheme_name']}: NAV ₹{latest['nav']} ({latest['date']})")
            else:
                print(f"  ⚠️ {fund['scheme_name']}: No data returned from API")
                
        except Exception as e:
            print(f"  ❌ {fund['scheme_name']}: Error fetching NAV: {e}")
        
        time.sleep(1)  # Rate limit


# ============================================
# Document Embedding Ingestion
# ============================================

def ingest_fund_documents():
    """Embed and store real SBI fund factual data."""
    print("\n📚 Ingesting SBI Mutual Fund factual documents...")
    
    for fund in SBI_FUND_DATA:
        print(f"\nProcessing: {fund['scheme_name']}...")
        
        updates = []
        for i, fact_chunk in enumerate(fund["facts"]):
            embedding = generate_embedding(fact_chunk)
            
            updates.append({
                "scheme_code": fund["scheme_code"],
                "scheme_name": fund["scheme_name"],
                "document_type": "factsheet",
                "source_url": fund["source_url"],
                "content": fact_chunk,
                "embedding": embedding
            })
            
            print(f"  Chunk {i+1}/{len(fund['facts'])} embedded.")
            time.sleep(1)  # Rate limit for Gemini API
        
        if updates:
            res = supabase.table("scheme_documents").insert(updates).execute()
            print(f"  ✅ Upserted {len(updates)} records for {fund['scheme_name']}")


# ============================================
# Main Execution
# ============================================

if __name__ == "__main__":
    print("=" * 60)
    print("SBI Mutual Fund RAG - Data Ingestion Pipeline")
    print("=" * 60)
    
    ingest_fund_documents()
    ingest_live_navs()
    
    print("\n" + "=" * 60)
    print("✅ Ingestion Complete!")
    print("=" * 60)
