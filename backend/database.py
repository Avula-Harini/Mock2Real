
import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client

# Load credentials from backend/.env
load_dotenv(Path(__file__).resolve().parent / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Supabase credentials are missing in backend/.env")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
