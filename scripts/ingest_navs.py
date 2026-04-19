import os, time, requests
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "backend", ".env"))
c = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])

codes = {
    "119598": "SBI Large Cap Fund",
    "120505": "SBI Small Cap Fund",
    "119718": "SBI Flexi Cap Fund",
    "103031": "SBI Long Term Equity Fund",
    "119835": "SBI Contra Fund",
}

for code, name in codes.items():
    try:
        r = requests.get(f"https://api.mfapi.in/mf/{code}", timeout=15).json()
        if r.get("status") == "SUCCESS" and r.get("data"):
            latest = r["data"][0]
            c.table("live_navs").insert({
                "scheme_code": code,
                "scheme_name": r["meta"]["scheme_name"],
                "nav": float(latest["nav"]),
                "valuation_date": latest["date"],
            }).execute()
            print(f"OK {name}: NAV {latest['nav']} ({latest['date']})")
        else:
            print(f"SKIP {name}: no data")
    except Exception as e:
        print(f"ERR {name}: {e}")
    time.sleep(1)

print("DONE")
