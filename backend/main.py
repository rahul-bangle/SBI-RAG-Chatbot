import os
import logging
import time
from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from apscheduler.schedulers.background import BackgroundScheduler
from supabase import create_client, Client

# Relative imports from the backend package
from backend.agent.live_scraper import fetch_live_navs
from backend.agent.router import Router
from backend.agent.chat import ChatController

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] [%(name)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger("SBI-MF-Backend")

# Load .env from backend directory
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# Initialize State
scheduler = BackgroundScheduler()
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
router_agent = Router()
chat_agent = ChatController()

class ChatRequest(BaseModel):
    query: str

class StatusResponse(BaseModel):
    status: str
    timestamp: str
    scheduler_active: bool
    database_connected: bool

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    logger.info("Initializing SBI Mutual Fund RAG Backend...")
    try:
        scheduler.add_job(fetch_live_navs, 'cron', hour=9, minute=15, args=[supabase])
        scheduler.start()
        logger.info("Daily Scheduler started for 09:15 AM IST.")
        
        # Initial data sync trigger (optional, depending on DB state)
        # fetch_live_navs(supabase)
        
    except Exception as e:
        logger.error(f"Startup initialization failed: {e}")
    
    yield
    # Shutdown logic
    logger.info("Shutting down backend...")
    scheduler.shutdown()

app = FastAPI(
    title="SBI Mutual Fund RAG Assistant",
    description="Resilient RAG backend architected for the SBI MF HUD.",
    version="2.0.0",
    lifespan=lifespan
)

# Middleware for tracing and performance profiling
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    response.headers["X-Trace-ID"] = datetime.now().strftime("%Y%m%d%H%M%S")
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """Liveness probe for the API."""
    return {"status": "healthy", "service": "sbi-mf-rag"}

@app.get("/status", response_model=StatusResponse)
async def system_status():
    """Detailed readiness and subsystem status."""
    db_connected = False
    try:
        # Simple ping to check Supabase connection
        supabase.table("live_navs").select("id").limit(1).execute()
        db_connected = True
    except Exception:
        db_connected = False

    return {
        "status": "online" if db_connected else "degraded",
        "timestamp": datetime.now().isoformat(),
        "scheduler_active": scheduler.running,
        "database_connected": db_connected
    }

@app.post("/chat")
async def chat_endpoint(payload: ChatRequest):
    logger.info(f"Processing query: {payload.query}")
    try:
        intent = await router_agent.classify_intent(payload.query)
        logger.info(f"Classified Intent: {intent}")

        if intent == "ADVISORY":
            response = chat_agent.generate_refusal()
        elif intent == "LIVE_NAV":
            # Logic for direct DB lookup would go here
            data = supabase.table("live_navs").select("*").order("timestamp", desc=True).limit(5).execute()
            response = await chat_agent.generate_nav_response(payload.query, data.data)
        else:
            response = await chat_agent.generate_response(payload.query)
            
        return {"response": response, "intent": intent}
    
    except Exception as e:
        logger.error(f"Chat execution failed: {e}")
        raise HTTPException(status_code=500, detail="The RAG engine encountered an internal error. Check logs.")

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
