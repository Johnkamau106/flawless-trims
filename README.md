# VidSlicer

VidSlicer is a full-stack video utility that inspects any social media video link (YouTube, TikTok, Instagram, Facebook, Twitter/X, etc.), previews the stream, lets users trim the exact range they need, and downloads either the full video or audio-only in the desired quality. Every download can be saved to a local history with thumbnails for quick recall.

## Tech Stack

- **Frontend:** React + Vite, ReactPlayer, rc-slider, Axios
- **Backend:** Flask, Flask-CORS, Flask-SQLAlchemy, Flask-Migrate
- **Media layer:** yt-dlp for source retrieval, ffmpeg for trimming/transcoding
- **Database:** SQLite (default) via SQLAlchemy, easily swappable with PostgreSQL

## Project Structure

```
backend/
  app.py              # Flask app + routes
  config.py
  models.py
  download_service.py
  migrations/         # Alembic migrations
frontend/
  src/                # React UI
  vite.config.js
README.md
```

## Prerequisites

- Python 3.11+
- Node.js 18+
- ffmpeg installed and on your PATH

## Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt

# Create database
flask db upgrade

# Run API locally
flask --app app run
```

Environment variables (optional):

| Variable | Description | Default |
| --- | --- | --- |
| `SECRET_KEY` | Flask secret | `dev-secret-key` |
| `DATABASE_URL` | SQLAlchemy URI | SQLite file |
| `DOWNLOAD_TMP_DIR` | Temp workspace for downloads | `backend/tmp` |

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Vite dev server proxies `/api/*` requests to `http://localhost:5000`.

## Core API Endpoints

- `POST /api/inspect` → returns metadata (title, duration, thumbnails) and available formats
- `POST /api/download` → streams the selected media (applies trimming + audio transcoding)
- `POST /api/clip` → saves clip metadata into `clips` table
- `GET /api/clips` → fetches the last 50 saved clips

## Database Schema

`clips` table stores:

- `url`, `title`, `platform`, `thumbnail_url`
- `format_label`, `start_time`, `end_time`, `duration`
- `file_name`, `created_at`

Extend the schema by creating new Alembic migrations (`flask db migrate`).

## Production Notes

- Configure `DATABASE_URL` for PostgreSQL in production (e.g. Supabase, RDS).
- Serve the frontend build (Vite `npm run build`) via any static host or behind the Flask app.
- Run the API using Gunicorn/Uvicorn with a process manager (systemd, Supervisor, Docker).
- Ensure ffmpeg and yt-dlp stay up-to-date for best platform compatibility.

## Stretch Ideas

- Batch download queue + progress tracking
- User auth with hosted history sync
- Usage-based billing (e.g. M-PESA, Stripe)
- Electron wrapper for cross-platform desktop downloads

