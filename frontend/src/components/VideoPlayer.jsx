import ReactPlayer from "react-player";

const VideoPlayer = ({ metadata, url }) => {
  return (
    <>
      <h2>Preview & scrub</h2>
      <div
        style={{
          position: "relative",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <ReactPlayer
          url={url}
          controls
          width="100%"
          height="360px"
          style={{ background: "#000" }}
        />
      </div>
      <div style={{ marginTop: "0.75rem" }}>
        <strong>{metadata.title}</strong>
        <p style={{ opacity: 0.7, margin: "0.25rem 0" }}>
          {metadata.uploader} · {formatDuration(metadata.duration)}
        </p>
      </div>
    </>
  );
};

function formatDuration(totalSeconds = 0) {
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const ss = String(Math.floor(totalSeconds % 60)).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default VideoPlayer;

