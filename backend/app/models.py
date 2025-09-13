from pydantic import BaseModel, Field
from typing import List, Dict, Any, Literal
from sqlalchemy import Column, Integer, String, ForeignKey, JSON
from .database import Base

# --- Pydantic Model for API Data ---
class StrategyDefinition(BaseModel):
    strategyName: str = Field(..., example="My Volatility Breakout Strategy")
    ticker: str = Field(..., example="TSLA")
    strategyType: Literal["TrendFollowing", "MeanReversion", "Volatility"] = Field(..., example="Volatility")
    ml_model_set: Literal["SetA", "SetB"] | None = Field(default=None, example="SetA")
    ml_model: Literal["RandomForest", "GradientBoosting", "Ensemble"] | None = Field(default=None, example="Ensemble")
    rules: List[Dict[str, Any]] = Field(default_factory=list)

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class StrategyCreate(BaseModel):
    name: str
    description: str
    category: str

# --- SQLAlchemy Models for Database Tables ---
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class BacktestResult(Base):
    __tablename__ = "backtest_results"
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(String, unique=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    result_data = Column(JSON)

class Strategy(Base):
    __tablename__ = "strategies"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    category = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))
