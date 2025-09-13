from pydantic import BaseModel, Field
from typing import List, Dict, Any, Literal
from sqlalchemy import Column, Integer, String, ForeignKey, JSON
from .database import Base

# --- Pydantic Model for API Data ---
# This defines the structure of the strategy sent from the frontend.
class StrategyDefinition(BaseModel):
    strategyName: str = Field(..., example="My Volatility Breakout Strategy")
    ticker: str = Field(..., example="TSLA")
    strategyType: Literal["TrendFollowing", "MeanReversion", "Volatility"] = Field(..., example="Volatility")
    
    # Field to select the model set (your rf/gb pair vs. your rf1/gb1 pair)
    ml_model_set: Literal["SetA", "SetB"] | None = Field(default=None, example="SetA")
    
    # Field to select the specific model type within the set
    ml_model: Literal["RandomForest", "GradientBoosting", "Ensemble"] | None = Field(default=None, example="Ensemble")
    
    # Reserved for a more advanced custom rule builder
    rules: List[Dict[str, Any]] = Field(default_factory=list)


# --- SQLAlchemy Models for Database Tables ---
# These define the tables in your PostgreSQL database.

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class BacktestResult(Base):
    __tablename__ = "backtest_results"
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(String, unique=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    result_data = Column(JSON)