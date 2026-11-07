import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Read .env from project root
env_file = BASE_DIR / ".env"
if env_file.exists():
    with open(env_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                os.environ.setdefault(key.strip(), val.strip().strip("'\""))

PORT = int(os.environ.get("PYTHON_PORT", 5001))
DEBUG = os.environ.get("FLASK_DEBUG", "False").lower() in ("true", "1")
GOOGLE_SAFE_BROWSING_API_KEY = os.environ.get("GOOGLE_SAFE_BROWSING_API_KEY", "").strip()
VIRUSTOTAL_API_KEY = os.environ.get("VIRUSTOTAL_API_KEY", "").strip()
