import os
import shutil
import subprocess
from pathlib import Path
from typing import Optional

from yt_dlp import YoutubeDL


class DownloadError(RuntimeError):
    pass


class VideoDownloadService:
    def __init__(self, tmp_root: str):
        self.tmp_root = tmp_root
        Path(tmp_root).mkdir(parents=True, exist_ok=True)

    def inspect(self, url: str) -> dict:
        options = {
            "quiet": True,
            "no_warnings": True,
            "skip_download": True,
        }
        with YoutubeDL(options) as ydl:
            try:
                info = ydl.extract_info(url, download=False)
            except Exception as exc:  # noqa: BLE001
                raise DownloadError(f"Failed to inspect URL: {exc}") from exc
        return info

    def download(
        self,
        url: str,
        format_id: str,
        start_time: Optional[int] = None,
        end_time: Optional[int] = None,
        audio_only: bool = False,
        audio_format: str = "mp3",
    ) -> Path:
        temp_dir = Path(self.tmp_root) / "downloads"
        temp_dir.mkdir(parents=True, exist_ok=True)

        ydl_opts = {
            "format": format_id,
            "outtmpl": f"{temp_dir}/%(title)s.%(ext)s",
            "quiet": True,
            "no_warnings": True,
        }

        with YoutubeDL(ydl_opts) as ydl:
            try:
                info = ydl.extract_info(url, download=True)
                downloaded_path = Path(ydl.prepare_filename(info))
            except Exception as exc:  # noqa: BLE001
                raise DownloadError(f"Download failed: {exc}") from exc

        target_path = downloaded_path

        if start_time is not None or end_time is not None or audio_only:
            target_path = self._process_media(
                downloaded_path,
                start_time,
                end_time,
                audio_only,
                audio_format,
            )
            if downloaded_path.exists():
                downloaded_path.unlink()

        return target_path

    def _process_media(
        self,
        source: Path,
        start_time: Optional[int],
        end_time: Optional[int],
        audio_only: bool,
        audio_format: str,
    ) -> Path:
        processed_dir = Path(self.tmp_root) / "processed"
        processed_dir.mkdir(parents=True, exist_ok=True)

        extension = audio_format if audio_only else source.suffix.lstrip(".")
        target = processed_dir / f"{source.stem}-processed.{extension}"

        ffmpeg_cmd = ["ffmpeg", "-y", "-i", str(source)]

        if start_time is not None:
            ffmpeg_cmd += ["-ss", str(start_time)]
        if end_time is not None and start_time is not None:
            ffmpeg_cmd += ["-to", str(end_time - start_time)]
        elif end_time is not None:
            ffmpeg_cmd += ["-to", str(end_time)]

        if audio_only:
            codec_args = ["-vn", "-acodec", "libmp3lame" if audio_format == "mp3" else "aac"]
        else:
            codec_args = ["-c", "copy"]

        ffmpeg_cmd += codec_args + [str(target)]

        try:
            subprocess.run(  # noqa: S603
                ffmpeg_cmd,
                check=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
        except subprocess.CalledProcessError as exc:
            if target.exists():
                target.unlink()
            raise DownloadError("ffmpeg processing failed") from exc

        return target

    def cleanup(self):
        if os.path.exists(self.tmp_root):
            shutil.rmtree(self.tmp_root, ignore_errors=True)

