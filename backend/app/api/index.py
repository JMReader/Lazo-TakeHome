"""Vercel Python Function entrypoint for the backend/app root directory."""

import sys
import types
from pathlib import Path

APP_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(APP_ROOT))

app_package = types.ModuleType("app")
app_package.__path__ = [str(APP_ROOT)]
sys.modules.setdefault("app", app_package)

from app.main import create_app  # noqa: E402

app = create_app()
