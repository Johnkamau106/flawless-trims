const DownloadActions = ({
  onDownload,
  onSaveClip,
  downloading,
  disabled,
  hasFullVideo,
}) => (
  <>
    <h2>Download</h2>
    <p style={{ opacity: 0.75 }}>
      {hasFullVideo
        ? "Full video selected"
        : "Custom trim active · clipping preserves exact timestamps"}
    </p>
    <div className="input-row">
      <button className="primary" disabled={disabled || downloading} onClick={onDownload}>
        {downloading ? "Processing..." : "Download"}
      </button>
      <button className="secondary" type="button" onClick={onSaveClip}>
        Save to history
      </button>
    </div>
  </>
);

export default DownloadActions;

