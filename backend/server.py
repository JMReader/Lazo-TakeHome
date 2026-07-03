"""Vercel ASGI entrypoint for the compliance obligations backend."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.main import create_app

app = create_app()
