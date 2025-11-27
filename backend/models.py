from datetime import datetime
from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()


class ClipHistory(db.Model):
    __tablename__ = "clips"

    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String(2048), nullable=False)
    title = db.Column(db.String(512), nullable=False)
    platform = db.Column(db.String(64), nullable=True)
    thumbnail_url = db.Column(db.String(1024), nullable=True)
    format_label = db.Column(db.String(64), nullable=False)
    start_time = db.Column(db.Integer, nullable=False, default=0)
    end_time = db.Column(db.Integer, nullable=True)
    duration = db.Column(db.Integer, nullable=True)
    file_name = db.Column(db.String(255), nullable=True)
    created_at = db.Column(
        db.DateTime, nullable=False, default=datetime.utcnow, index=True
    )

    def as_dict(self):
        return {
            "id": self.id,
            "url": self.url,
            "title": self.title,
            "platform": self.platform,
            "thumbnailUrl": self.thumbnail_url,
            "formatLabel": self.format_label,
            "startTime": self.start_time,
            "endTime": self.end_time,
            "duration": self.duration,
            "fileName": self.file_name,
            "createdAt": self.created_at.isoformat(),
        }

