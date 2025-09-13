# app/main.py

# --- Core FastAPI and Celery Imports ---
from fastapi import FastAPI, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import uuid
import json

# --- Application-Specific Imports ---
from . import models, auth
from .database import SessionLocal, engine
from .tasks import run_backtest_task, celery_app
from .models import StrategyDefinition # Explicitly import the Pydantic model

# --- Create Database Tables on Startup ---
# This line ensures that all tables defined in models.py are created in your database
# the first time the application runs.
models.Base.metadata.create_all(bind=engine)

# --- FastAPI App Initialization ---
app = FastAPI(title="AlgoSphere Backend")

# --- Database Dependency ---
# This helper function handles the creation and closing of database sessions for each API request.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# =============================================================================
# AUTHENTICATION ENDPOINTS
# =============================================================================

@app.post("/token", tags=["Authentication"])
async def login_for_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Provides a JWT token for a user to authenticate with.
    In a real app, you would verify the user against the database.
    """
    # Dummy user for demonstration. Replace with database lookup.
    user = {"username": form_data.username, "hashed_password": auth.get_password_hash("testpassword")}
    
    if not auth.verify_password(form_data.password, user["hashed_password"]):
        raise auth.HTTPException(status_code=400, detail="Incorrect username or password")
    
    access_token = auth.create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}

# =============================================================================
# BACKTESTING ENDPOINTS
# =============================================================================

@app.post("/api/backtest", tags=["Backtesting"])
async def start_backtest(
    strategy: StrategyDefinition,
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user)
):
    """
    Receives a strategy, creates a background job, and links it to the current user.
    """
    job_id = str(uuid.uuid4())
    
    # In a real app, you'd look up the user's ID from the database.
    # For now, we'll use a dummy ID.
    owner_id = 1 
    
    # Start the backtest in the background using Celery
    run_backtest_task.delay(
        job_id=job_id,
        strategy_json=strategy.dict(),
        ticker=strategy.ticker,
        start_date="2020-01-01",
        end_date="2023-12-31",
        owner_id=owner_id # Pass the user's ID to the task
    )
    
    return {"message": "Backtest started", "job_id": job_id}


@app.get("/api/backtest/status/{job_id}", tags=["Backtesting"])
async def get_backtest_status(job_id: str):
    """
    Allows the frontend to poll for the status of a running backtest.
    """
    task = celery_app.AsyncResult(job_id)
    if task.state == 'PENDING' or task.state == 'STARTED':
        return {"status": "RUNNING"}
    elif task.state == 'SUCCESS':
        return {"status": "SUCCESS"}
    return {"status": "FAILURE", "info": str(task.info)}


@app.get("/api/backtest/results/{job_id}", tags=["Backtesting"])
async def get_backtest_results(job_id: str, db: Session = Depends(get_db)):
    """
    Provides the final report by querying the PostgreSQL database.
    """
    result_from_db = db.query(models.BacktestResult).filter(models.BacktestResult.job_id == job_id).first()
    
    if not result_from_db:
        return {"error": "Results not found or backtest is still running."}
    
    return result_from_db.result_data

# =============================================================================
# MOCK DATA ENDPOINTS (For UI Components)
# =============================================================================

@app.get("/api/market-overview", tags=["UI Data"])
async def get_market_overview():
    """Provides mock data for the MarketOverview.tsx component."""
    return [
        {"symbol": "SPY", "price": 438.52, "change": 2.34, "changePercent": 0.54, "volume": "89.2M"},
        {"symbol": "QQQ", "price": 367.89, "change": -1.23, "changePercent": -0.33, "volume": "52.1M"},
    ]

@app.get("/api/dashboard-stats", tags=["UI Data"])
async def get_dashboard_stats(current_user: dict = Depends(auth.get_current_user)):
    """Provides mock data for the Dashboard.tsx component."""
    return {
        "portfolioValue": 102800,
        "todayPnl": 2800,
        "winRate": 72,
        "activeStrategiesCount": 3,
    }

@app.get("/api/strategy-library", tags=["UI Data"])
async def get_strategy_library():
    """Provides mock data for the StrategyLibrary.tsx component."""
    return [
      {"id": 1, "name": "Golden Cross Strategy", "description": "Buy when 50-day MA crosses above 200-day MA", "category": "Trend Following"},
      {"id": 2, "name": "RSI Divergence", "description": "Trade based on RSI divergence patterns", "category": "Momentum"},
    ]