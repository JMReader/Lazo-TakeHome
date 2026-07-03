"""Vercel Python Function entrypoint for the backend/app root directory."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from app.main import create_app

app = create_app()
