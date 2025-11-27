import ClipCard from "./ClipCard.jsx";

const HistorySidebar = ({ clips, onRefresh }) => (
  <aside className="card" style={{ position: "sticky", top: "1.5rem", alignSelf: "flex-start" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <h2 style={{ marginBottom: 0 }}>Saved clips</h2>
      <button className="secondary" type="button" onClick={onRefresh}>
        Refresh
      </button>
    </div>
    <p style={{ opacity: 0.7 }}>
      Up to 50 recent downloads are stored locally in the database.
    </p>
    <div className="clip-stack">
      {clips.map((clip) => (
        <ClipCard key={clip.id} clip={clip} />
      ))}
      {!clips.length && <p>No history yet. Download a clip to see it here.</p>}
    </div>
  </aside>
);

export default HistorySidebar;

