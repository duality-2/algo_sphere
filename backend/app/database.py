from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# --- Security Best Practice: Load environment variables from a .env file ---
# This line looks for a file named .env in your project root and loads it.
load_dotenv()

# --- Database Configuration ---
# Get the database URL from the environment variable.
# This is much more secure than writing the password directly in the code.
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("No DATABASE_URL found. Please set it in your .env file.")

# The connect_args is important for cloud databases like Neon that may pool connections.
engine = create_engine(
    DATABASE_URL,
    connect_args={"options": "-c timezone=utc"} # Recommended for consistency
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

