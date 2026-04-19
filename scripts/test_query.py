import requests, json, sys

query = sys.argv[1] if len(sys.argv) > 1 else "What is the exit load for SBI Long Term Equity Fund?"
r = requests.post("http://localhost:8000/chat", json={"query": query}, timeout=30)
print(json.dumps(r.json(), indent=2))
