import json
import requests
import time
from typing import List, Dict

BACKEND_URL = "http://localhost:8000/chat"
GROUND_TRUTH_PATH = ".planning/verification/ground_truth.json"

def run_benchmarks():
    print("Starting SBI MF RAG Benchmark Engine...")
    
    with open(GROUND_TRUTH_PATH, 'r') as f:
        data = json.load(f)
        ground_truth: List[Dict] = data['ground_truth']

    total = len(ground_truth)
    passed_intent = 0
    passed_content = 0
    start_time = time.time()

    print(f"Loaded {total} ground truth queries.\n")
    print(f"{'#':<3} | {'Intent':<12} | {'S':<2} | {'Query':<50}")
    print("-" * 75)

    results = []

    for i, item in enumerate(ground_truth):
        query = item['query']
        expected_intent = item['expected_intent']
        
        try:
            response = requests.post(BACKEND_URL, json={"query": query}, timeout=10)
            res_data = response.json()
            actual_intent = res_data.get("intent")
            actual_response = res_data.get("response", "")

            # Validation 1: Intent Matching
            intent_match = (actual_intent == expected_intent)
            if intent_match:
                passed_intent += 1

            # Validation 2: Content logic
            content_match = False
            if expected_intent == "ADVISORY":
                if "not authorized to provide personalized investment advice" in actual_response:
                    content_match = True
            elif expected_intent == "LIVE_NAV":
                 if "Source: https://www.amfiindia.com/spages/NAVAll.txt" in actual_response or "I do not have factual records" not in actual_response:
                     content_match = True
            elif expected_intent == "FACTUAL":
                if "Source: https://www.sbimf.com" in actual_response or "I do not have factual records" not in actual_response:
                    content_match = True
            
            if content_match:
                passed_content += 1

            status_char = "[OK]" if (intent_match and content_match) else "[FAIL]"
            print(f"{i+1:<3} | {actual_intent:<12} | {status_char} | {query[:50]}...")
            
            results.append({
                "query": query,
                "expected": expected_intent,
                "actual": actual_intent,
                "status": "PASS" if (intent_match and content_match) else "FAIL"
            })

        except Exception as e:
            print(f"{i+1:<3} | ERROR        | [FAIL] | {query[:50]}... (Error: {e})")

    duration = time.time() - start_time
    print("-" * 75)
    print("BENCHMARK COMPLETE (in {duration:.2f}s)")
    print(f"Intent Accuracy: {passed_intent/total:.2%}")
    print(f"Content Compliance: {passed_content/total:.2%}")
    print(f"Total Passed: {passed_content}/{total}")

if __name__ == "__main__":
    run_benchmarks()
