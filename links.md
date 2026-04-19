# SBI Mutual Fund RAG Assistant — Data Sources & References

> All data used in this project is sourced from publicly available, authoritative financial data providers. No proprietary or paywalled data is used.

---

## Live APIs

| API | URL | Purpose | Auth Required |
|-----|-----|---------|---------------|
| MFAPI.in | `https://api.mfapi.in/mf/search?q=SBI` | Search SBI mutual fund schemes | No |
| MFAPI.in — SBI Large Cap Fund | `https://api.mfapi.in/mf/119598` | Live NAV & historical data | No |
| MFAPI.in — SBI Small Cap Fund | `https://api.mfapi.in/mf/120505` | Live NAV & historical data | No |
| MFAPI.in — SBI Flexi Cap Fund | `https://api.mfapi.in/mf/119718` | Live NAV & historical data | No |
| MFAPI.in — SBI Long Term Equity (ELSS) | `https://api.mfapi.in/mf/103031` | Live NAV & historical data | No |
| MFAPI.in — SBI Contra Fund | `https://api.mfapi.in/mf/119835` | Live NAV & historical data | No |
| AMFI NAV Feed | `https://www.amfiindia.com/spages/NAVAll.txt` | Official daily NAV file (all schemes) | No |

---

## Official Fund Pages (Factsheet Sources)

| Fund | URL |
|------|-----|
| SBI Large Cap Fund (Bluechip) | https://www.sbimf.com/en-us/equity-schemes/sbi-bluechip-fund |
| SBI Small Cap Fund | https://www.sbimf.com/en-us/equity-schemes/sbi-small-cap-fund |
| SBI Flexi Cap Fund | https://www.sbimf.com/en-us/equity-schemes/sbi-flexicap-fund |
| SBI Long Term Equity Fund (ELSS) | https://www.sbimf.com/en-us/equity-schemes/sbi-long-term-equity-fund |
| SBI Contra Fund | https://www.sbimf.com/en-us/equity-schemes/sbi-contra-fund |

---

## Regulatory & Reference Data

| Source | URL | Purpose |
|--------|-----|---------|
| AMFI India | https://www.amfiindia.com | Official mutual fund industry body |
| SEBI MF Classification | https://www.sebi.gov.in/legal/circulars/oct-2017/categorization-and-rationalization-of-mutual-fund-schemes_36199.html | SEBI norms for fund categorization |
| SBI Funds Management | https://www.sbimf.com | Fund house official portal |

---

## AI / Embedding Services

| Service | URL | Purpose |
|---------|-----|---------|
| Groq API | https://api.groq.com | LLM inference (Llama 3.1 8B) — intent classification, CRAG evaluation, response generation |
| Google Gemini (text-embedding-004) | https://ai.google.dev | Vector embeddings for semantic search (when API key is active) |

---

## Database & Infrastructure

| Service | Purpose |
|---------|---------|
| Supabase (PostgreSQL + pgvector) | Vector database for document storage and similarity search |
| Supabase REST API | Data access for `scheme_documents` and `live_navs` tables |

---

## PDFs Referenced (Not currently scraped — behind authentication walls)

> These PDFs were referenced during initial research but could not be programmatically scraped due to CAPTCHA / authentication on SBI MF portal. Factual data was manually verified and ingested from official fund pages listed above.

| Document Type | Typical URL Pattern |
|--------------|---------------------|
| SBI Fund Factsheets | `https://www.sbimf.com/en-us/information-centre/factsheet` |
| SBI SID (Scheme Info Document) | `https://www.sbimf.com/en-us/information-centre/scheme-information-documents` |
| AMFI Daily NAV Report | `https://www.amfiindia.com/spages/NAVAll.txt` |

---

## Scheme Codes Reference

| Scheme | AMFI Code | ISIN (Direct Growth) |
|--------|-----------|---------------------|
| SBI Large Cap Fund | 119598 | INF200K01QX4 |
| SBI Small Cap Fund | 120505 | INF200K01SM8 |
| SBI Flexi Cap Fund | 119718 | INF200K01UR4 |
| SBI Long Term Equity Fund (ELSS) | 103031 | — |
| SBI Contra Fund | 119835 | INF200K01UJ1 |

---

*Last updated: 2026-04-17*
