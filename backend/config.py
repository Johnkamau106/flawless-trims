import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key")
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        f"sqlite:///{BASE_DIR / 'vidslicer.db'}",
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_SORT_KEYS = False
    MAX_CONTENT_LENGTH = 3 * 1024 * 1024 * 1024  # 3 GB safety limit
    DOWNLOAD_TMP_DIR = os.environ.get("DOWNLOAD_TMP_DIR", str(BASE_DIR / "tmp"))
    ALLOWED_AUDIO_FORMATS = {"mp3", "m4a"}


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"

