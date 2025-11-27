from __future__ import annotations

import re
import tempfile
from pathlib import Path
from typing import Dict, List, Optional

YOUTUBE_SHORTS_SI = re.compile(r"([?&])si=[^&#]+")

URL_PATTERNS = {
    "youtube": re.compile(r"(youtube\.com|youtu\.be)"),
    "instagram": re.compile(r"instagram\.com"),
    "facebook": re.compile(r"(facebook\.com|fb\.watch)"),
    "tiktok": re.compile(r"(tiktok\.com)"),
    "twitter": re.compile(r"(twitter\.com|x\.com)"),
}


def clean_url(url: str) -> str:
    """Remove noisy params such as YouTube Shorts ?si= tokens."""
    if not url:
        return url
    return YOUTUBE_SHORTS_SI.sub(r"\1", url)


def detect_platform(url: str) -> Optional[str]:
    if not url:
        return None
    for platform, pattern in URL_PATTERNS.items():
        if pattern.search(url.lower()):
            return platform
    return "other"


def create_tmp_dir(base_dir: str) -> tempfile.TemporaryDirectory:
    Path(base_dir).mkdir(parents=True, exist_ok=True)
    return tempfile.TemporaryDirectory(dir=base_dir)


def parse_formats(formats: List[Dict]) -> Dict[str, List[Dict]]:
    video_formats, audio_formats = [], []
    seen_labels = set()

    for fmt in formats or []:
        if not fmt.get("filesize") and not fmt.get("filesize_approx"):
            continue
        if fmt.get("acodec") != "none" and fmt.get("vcodec") == "none":
            audio_formats.append(
                {
                    "id": fmt.get("format_id"),
                    "ext": fmt.get("ext"),
                    "bitrate": fmt.get("abr"),
                    "filesize": fmt.get("filesize_approx") or fmt.get("filesize"),
                    "container": fmt.get("container"),
                }
            )
            continue

        height = fmt.get("height")
        if not height:
            continue

        label = f"{height}p"
        if label in seen_labels and fmt.get("format_note") != "HDR":
            continue
        seen_labels.add(label)
        video_formats.append(
            {
                "id": fmt.get("format_id"),
                "label": label,
                "fps": fmt.get("fps"),
                "ext": fmt.get("ext"),
                "filesize": fmt.get("filesize_approx") or fmt.get("filesize"),
            }
        )

    video_formats.sort(key=lambda x: int(x["label"].rstrip("p")))

    return {"video": video_formats, "audio": audio_formats}

