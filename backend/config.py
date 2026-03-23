import os
from pathlib import Path

from dotenv import load_dotenv


def _load_local_env() -> None:
    backend_dir = Path(__file__).resolve().parent
    local_env = backend_dir / ".env"
    root_env = backend_dir.parent / ".env"

    # Do not override environment variables already provided by Docker/system.
    if local_env.exists():
        load_dotenv(dotenv_path=local_env, override=False)
    elif root_env.exists():
        load_dotenv(dotenv_path=root_env, override=False)


def _require_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"{name} environment variable is not set")
    return value


_load_local_env()

DATABASE_URL = _require_env("DATABASE_URL")
SECRET_KEY = _require_env("SECRET_KEY")
