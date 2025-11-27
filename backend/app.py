from __future__ import annotations

import os
from pathlib import Path

from flask import (
    Flask,
    after_this_request,
    jsonify,
    request,
    send_file,
)
from flask_cors import CORS
from flask_migrate import Migrate

from config import Config
from download_service import DownloadError, VideoDownloadService
from models import ClipHistory, db
from utils import clean_url, detect_platform, parse_formats


def create_app(config_class: type[Config] = Config) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_class)

    Path(app.config["DOWNLOAD_TMP_DIR"]).mkdir(parents=True, exist_ok=True)

    db.init_app(app)
    Migrate(app, db)
    CORS(app)

    download_service = VideoDownloadService(app.config["DOWNLOAD_TMP_DIR"])

    @app.route("/health", methods=["GET"])
    def health():
        return {"status": "ok"}

    @app.post("/api/inspect")
    def inspect():
        data = request.get_json() or {}
        url = clean_url(data.get("url", "").strip())
        if not url:
            return jsonify({"message": "URL is required"}), 400
        try:
            info = download_service.inspect(url)
        except DownloadError as exc:
            return jsonify({"message": str(exc)}), 400

        formats = parse_formats(info.get("formats", []))
        response = {
            "id": info.get("id"),
            "title": info.get("title"),
            "duration": info.get("duration"),
            "thumbnails": info.get("thumbnails", []),
            "bestThumbnail": info.get("thumbnail"),
            "uploader": info.get("uploader"),
            "platform": detect_platform(url),
            "formats": formats,
        }
        return jsonify(response)

    def _parse_timestamp(value):
        if value in (None, ""):
            return None
        try:
            return int(float(value))
        except (TypeError, ValueError) as exc:
            raise ValueError("Invalid timestamp provided") from exc

    @app.post("/api/download")
    def download():
        payload = request.get_json() or {}
        url = clean_url(payload.get("url", ""))
        format_id = payload.get("formatId")
        audio_only = payload.get("audioOnly", False)
        audio_format = payload.get("audioFormat", "mp3")
        file_name = payload.get("fileName")

        if not url or not format_id:
            return jsonify({"message": "url and formatId are required"}), 400

        try:
            start_time = _parse_timestamp(payload.get("startTime"))
            end_time = _parse_timestamp(payload.get("endTime"))
        except ValueError as exc:
            return jsonify({"message": str(exc)}), 400

        if (
            start_time is not None
            and end_time is not None
            and end_time <= start_time
        ):
            return jsonify({"message": "endTime must be greater than startTime"}), 400

        try:
            target_path = download_service.download(
                url=url,
                format_id=format_id,
                start_time=int(start_time) if start_time is not None else None,
                end_time=int(end_time) if end_time is not None else None,
                audio_only=audio_only,
                audio_format=audio_format,
            )
        except DownloadError as exc:
            return jsonify({"message": str(exc)}), 400

        download_name = file_name or target_path.name

        @after_this_request
        def cleanup_file(response):
            try:
                if target_path.exists():
                    os.remove(target_path)
            except OSError:
                pass
            return response

        return send_file(
            target_path,
            as_attachment=True,
            download_name=download_name,
            mimetype="application/octet-stream",
        )

    @app.post("/api/clip")
    def save_clip():
        payload = request.get_json() or {}
        required = ["url", "title", "formatLabel"]
        if any(not payload.get(field) for field in required):
            return jsonify({"message": "Missing required clip fields"}), 400

        clip = ClipHistory(
            url=payload["url"],
            title=payload["title"],
            platform=payload.get("platform"),
            thumbnail_url=payload.get("thumbnailUrl"),
            format_label=payload["formatLabel"],
            start_time=int(payload.get("startTime") or 0),
            end_time=int(payload["endTime"]) if payload.get("endTime") else None,
            duration=int(payload["duration"]) if payload.get("duration") else None,
            file_name=payload.get("fileName"),
        )
        db.session.add(clip)
        db.session.commit()
        return jsonify(clip.as_dict()), 201

    @app.get("/api/clips")
    def get_clips():
        clips = ClipHistory.query.order_by(ClipHistory.created_at.desc()).limit(50)
        return jsonify([clip.as_dict() for clip in clips])

    return app


if __name__ == "__main__":
    application = create_app()
    debug_mode = os.environ.get("FLASK_DEBUG", "").lower() in {"1", "true", "yes"}
    application.run(
        host="0.0.0.0",
        port=5000,
        debug=debug_mode,
        use_reloader=debug_mode,
    )

