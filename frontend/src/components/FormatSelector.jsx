const FormatSelector = ({
  metadata,
  selectedFormat,
  setSelectedFormat,
  audioOnly,
  setAudioOnly,
  audioFormat,
  setAudioFormat,
}) => {
  const videoFormats = metadata?.formats?.video ?? [];
  const audioFormats = metadata?.formats?.audio ?? [];

  return (
    <>
      <h2>Format & quality</h2>
      <div className="input-row" style={{ marginBottom: "1rem" }}>
        <button
          type="button"
          className={audioOnly ? "secondary" : "primary"}
          onClick={() => setAudioOnly(false)}
        >
          Video
        </button>
        <button
          type="button"
          className={audioOnly ? "primary" : "secondary"}
          onClick={() => setAudioOnly(true)}
        >
          Audio only
        </button>
      </div>

      {!audioOnly && (
        <div className="format-grid">
          {videoFormats.map((fmt) => (
            <button
              type="button"
              key={fmt.id}
              className={`format-pill ${selectedFormat?.id === fmt.id ? "selected" : ""}`}
              onClick={() => setSelectedFormat(fmt)}
            >
              <span>{fmt.label}</span>
              <small>{fmt.ext?.toUpperCase()}</small>
            </button>
          ))}
          {!videoFormats.length && <p>No downloadable video formats found.</p>}
        </div>
      )}

      {audioOnly && (
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {audioFormats.map((fmt) => (
            <button
              key={fmt.id}
              type="button"
              className={`format-pill ${audioFormat === fmt.ext ? "selected" : ""}`}
              onClick={() => setAudioFormat(fmt.ext)}
            >
              <span>{fmt.ext?.toUpperCase()}</span>
              <small>{fmt.bitrate ? `${fmt.bitrate}kbps` : "source"}</small>
            </button>
          ))}
          {!audioFormats.length && (
            <p>Only video streams detected, defaulting to MP3 transcode.</p>
          )}
        </div>
      )}
    </>
  );
};

export default FormatSelector;

