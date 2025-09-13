# app/main.py

# --- Core FastAPI and Celery Imports ---
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import uuid
import json

# --- Application-Specific Imports ---
from . import models, auth
from .database import SessionLocal, engine
from .tasks import run_backtest_task, celery_app
from .models import StrategyDefinition, UserCreate, StrategyCreate # Explicitly import the Pydantic models

# --- Create Database Tables on Startup ---
models.Base.metadata.create_all(bind=engine)

# --- FastAPI App Initialization ---
app = FastAPI(title="AlgoSphere Backend")

# --- Database Dependency ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# =============================================================================
# AUTHENTICATION ENDPOINTS
# =============================================================================

@app.post("/api/register", tags=["Authentication"])
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    auth.create_user(db=db, user=user)
    return {"message": "User created successfully"}

@app.post("/token", tags=["Authentication"])
async def login_for_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


# =============================================================================
# STRATEGY ENDPOINTS
# =============================================================================
@app.get("/api/strategies", tags=["Strategies"])
async def get_strategies(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Strategy).filter(models.Strategy.owner_id == current_user.id).all()

@app.post("/api/strategies", tags=["Strategies"])
async def create_strategy(strategy: StrategyCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_strategy = models.Strategy(**strategy.dict(), owner_id=current_user.id)
    db.add(db_strategy)
    db.commit()
    db.refresh(db_strategy)
    return db_strategy

# =============================================================================
# BACKTESTING ENDPOINTS
# =============================================================================

@app.post("/api/backtest", tags=["Backtesting"])
async def start_backtest(
    strategy: StrategyDefinition,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    job_id = str(uuid.uuid4())
    
    run_backtest_task.delay(
        job_id=job_id,
        strategy_json=strategy.dict(),
        ticker=strategy.ticker,
        start_date="2020-01-01",
        end_date="2023-12-31",
        owner_id=current_user.id
    )
    
    return {"message": "Backtest started", "job_id": job_id}


@app.get("/api/backtest/status/{job_id}", tags=["Backtesting"])
async def get_backtest_status(job_id: str):
    task = celery_app.AsyncResult(job_id)
    if task.state == 'PENDING' or task.state == 'STARTED':
        return {"status": "RUNNING"}
    elif task.state == 'SUCCESS':
        return {"status": "SUCCESS"}
    return {"status": "FAILURE", "info": str(task.info)}


@app.get("/api/backtest/results/{job_id}", tags=["Backtesting"])
async def get_backtest_results(job_id: str, db: Session = Depends(get_db)):
    result_from_db = db.query(models.BacktestResult).filter(models.BacktestResult.job_id == job_id).first()
    
    if not result_from_db:
        return {"error": "Results not found or backtest is still running."}
    
    return result_from_db.result_data

# =============================================================================
# MOCK DATA ENDPOINTS (For UI Components)
# =============================================================================

@app.get("/api/market-overview", tags=["UI Data"])
async def get_market_overview():
    return [
        {"symbol": "SPY", "price": 438.52, "change": 2.34, "changePercent": 0.54, "volume": "89.2M"},
        {"symbol": "QQQ", "price": 367.89, "change": -1.23, "changePercent": -0.33, "volume": "52.1M"},
    ]

@app.get("/api/dashboard-stats", tags=["UI Data"])
async def get_dashboard_stats(current_user: models.User = Depends(auth.get_current_user)):
    return {
        "portfolioValue": 102800,
        "todayPnl": 2800,
        "winRate": 72,
        "activeStrategiesCount": 3,
    }

@app.get("/api/strategy-library", tags=["UI Data"])
async def get_strategy_library():
    return [
      {"id": 1, "name": "Golden Cross Strategy", "description": "Buy when 50-day MA crosses above 200-day MA", "category": "Trend Following"},
      {"id": 2, "name": "RSI Divergence", "description": "Trade based on RSI divergence patterns", "category": "Momentum"},
    ]
