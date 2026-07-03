"""Vercel Python Function entrypoint for the FastAPI backend."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.main import create_app

app = create_app()
