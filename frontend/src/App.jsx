import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import {
  fetchVideoMetadata,
  fetchClips,
  downloadMedia,
  saveClip,
} from "./api/client.js";
import UrlInput from "./components/UrlInput.jsx";
import VideoPlayer from "./components/VideoPlayer.jsx";
import FormatSelector from "./components/FormatSelector.jsx";
import TrimSlider from "./components/TrimSlider.jsx";
import DownloadActions from "./components/DownloadActions.jsx";
import HistorySidebar from "./components/HistorySidebar.jsx";
import LoadingOverlay from "./components/LoadingOverlay.jsx";

dayjs.extend(duration);

function App() {
  const [url, setUrl] = useState("");
  const [metadata, setMetadata] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [clipRange, setClipRange] = useState([0, 0]);
  const [clips, setClips] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [audioOnly, setAudioOnly] = useState(false);
  const [audioFormat, setAudioFormat] = useState("mp3");

  const durationSeconds = metadata?.duration || 0;

  useEffect(() => {
    fetchClips().then(setClips).catch(() => setClips([]));
  }, []);

  const handleInspect = async () => {
    if (!url) return;
    setLoading(true);
    setStatus("Fetching metadata...");
    try {
      const data = await fetchVideoMetadata(url);
      setMetadata(data);
      setClipRange([0, data.duration ?? 0]);
      setSelectedFormat(data.formats.video.at(-1) ?? null);
      setAudioOnly(false);
    } catch (error) {
      setStatus(error.message ?? "Unable to inspect video");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!metadata || (!selectedFormat && !audioOnly)) return;
    setDownloading(true);
    setStatus("Preparing your download...");

    const downloadFormatId = audioOnly
      ? metadata?.formats?.audio?.find((fmt) => fmt.ext === audioFormat)?.id ??
        metadata?.formats?.audio?.[0]?.id ??
        selectedFormat?.id
      : selectedFormat?.id;

    if (!downloadFormatId) {
      setStatus("No format available for download");
      setDownloading(false);
      return;
    }

    try {
      const blob = await downloadMedia({
        url,
        formatId: downloadFormatId,
        startTime: clipRange[0],
        endTime: clipRange[1],
        audioOnly,
        audioFormat,
        fileName: buildFileName(),
      });
      const href = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = buildFileName();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(href);
      setStatus("Download started");
    } catch (error) {
      setStatus(error.message ?? "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  const buildFileName = () => {
    const title = metadata?.title?.replace(/[^\w\d-_]+/g, "_") ?? "vidslicer";
    const suffix = audioOnly
      ? `${clipRange[0]}-${clipRange[1]}`
      : `${selectedFormat?.label ?? "video"}`;
    const ext = audioOnly ? audioFormat : selectedFormat?.ext ?? "mp4";
    return `${title}_${suffix}.${ext}`;
  };

  const handleSaveClip = async () => {
    if (!metadata) return;
    try {
      const payload = {
        url,
        title: metadata.title,
        platform: metadata.platform,
        thumbnailUrl: metadata.bestThumbnail,
        formatLabel: audioOnly ? `Audio • ${audioFormat}` : selectedFormat.label,
        startTime: clipRange[0],
        endTime: clipRange[1],
        duration: clipRange[1] - clipRange[0],
        fileName: buildFileName(),
      };
      const saved = await saveClip(payload);
      setClips((prev) => [saved, ...prev].slice(0, 50));
      setStatus("Clip saved to history");
    } catch (error) {
      setStatus(error.message ?? "Failed to save clip");
    }
  };

  const hasFullVideoSelected = useMemo(() => {
    if (!metadata) return false;
    return clipRange[0] === 0 && clipRange[1] === metadata?.duration;
  }, [clipRange, metadata]);

  return (
    <div className="app-shell">
      <div className="grid">
        <div className="card">
          <UrlInput
            url={url}
            onChange={setUrl}
            onSubmit={handleInspect}
            isLoading={loading}
            status={status}
          />
        </div>

        {metadata && (
          <>
            <div className="card">
              <VideoPlayer metadata={metadata} url={url} />
            </div>

            <div className="card">
              <FormatSelector
                metadata={metadata}
                selectedFormat={selectedFormat}
                setSelectedFormat={setSelectedFormat}
                audioOnly={audioOnly}
                setAudioOnly={setAudioOnly}
                audioFormat={audioFormat}
                setAudioFormat={setAudioFormat}
              />
            </div>

            <div className="card">
              <TrimSlider
                duration={durationSeconds}
                range={clipRange}
                onChange={setClipRange}
                fullVideo={hasFullVideoSelected}
              />
            </div>

            <div className="card">
              <DownloadActions
                onDownload={handleDownload}
                onSaveClip={handleSaveClip}
                downloading={downloading}
                disabled={!metadata || (!selectedFormat && !audioOnly)}
                hasFullVideo={hasFullVideoSelected}
              />
            </div>
          </>
        )}
      </div>

      <HistorySidebar clips={clips} onRefresh={() => fetchClips().then(setClips)} />

      {(loading || downloading) && (
        <LoadingOverlay label={loading ? "Inspecting..." : "Preparing download..."} />
      )}
    </div>
  );
}

export default App;

