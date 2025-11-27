const ClipCard = ({ clip }) => (
  <div className="clip-card">
    {clip.thumbnailUrl ? (
      <img src={clip.thumbnailUrl} alt={clip.title} />
    ) : (
      <div className="thumbnail-fallback" />
    )}
    <div>
      <strong>{clip.title}</strong>
      <p>
        {clip.formatLabel} · {formatTimeRange(clip.startTime, clip.endTime)}
      </p>
      <small>{clip.platform?.toUpperCase()}</small>
    </div>
  </div>
);

function formatTimeRange(start, end) {
  const format = (value) => {
    const mm = String(Math.floor((value ?? 0) / 60)).padStart(2, "0");
    const ss = String(Math.floor((value ?? 0) % 60)).padStart(2, "0");
    return `${mm}:${ss}`;
  };
  return `${format(start)} — ${format(end ?? start)}`;
}

export default ClipCard;

