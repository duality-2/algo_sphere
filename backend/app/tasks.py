from celery import Celery
import json

# --- Application-Specific Imports ---
from .backtester import run_simulation
# --- NEW: Import your database session and models ---
from .database import SessionLocal
from . import models

# --- Celery Configuration ---
# This setup remains the same. It tells Celery to use Redis as a message broker.
celery_app = Celery(
    "tasks",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/1"
)


# --- Celery Background Task Definition ---
@celery_app.task(name="run_backtest_task")
def run_backtest_task(job_id: str, strategy_json: dict, ticker: str, start_date: str, end_date: str, owner_id: int):
    """
    The Celery worker executes this function when a backtest job is dispatched.
    It runs the simulation and stores the final report in the PostgreSQL database.
    """
    print(f"Celery worker received job {job_id} for user {owner_id}.")

    # NEW: Create an independent database session for this background task.
    db = SessionLocal()

    try:
        # 1. Execute the potentially long-running simulation (this is unchanged).
        results = run_simulation(strategy_json, ticker, start_date, end_date)

        # 2. NEW: Save the final report to the PostgreSQL database.
        # This replaces the old `results_db.set(...)` line.
        db_result = models.BacktestResult(
            job_id=job_id,
            owner_id=owner_id,  # Links the result to the user who ran it
            result_data=results   # Stores the entire JSON report
        )
        db.add(db_result)
        db.commit()

        print(f"Job {job_id} completed successfully and results saved to database.")
        return {"status": "SUCCESS", "job_id": job_id}

    except Exception as e:
        print(f"Job {job_id} failed. Error: {e}")
        # If an error occurs, roll back any partial database changes.
        db.rollback()

        # You can optionally save the error to the database for debugging.
        error_report = {"status": "FAILURE", "error": str(e)}
        db_result = models.BacktestResult(job_id=job_id, owner_id=owner_id, result_data=error_report)
        db.add(db_result)
        db.commit()

        # Raising the exception ensures Celery marks the task as 'FAILURE'.
        raise e
    finally:
        # 3. NEW: It's crucial to always close the database session.
        db.close()
