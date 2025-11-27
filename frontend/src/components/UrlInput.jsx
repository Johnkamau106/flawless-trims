const UrlInput = ({ url, onChange, onSubmit, isLoading, status }) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Paste any video link</h2>
      <p>Supports YouTube, Instagram, TikTok, Facebook, Twitter/X and more.</p>
      <div className="input-row">
        <input
          placeholder="https://youtube.com/watch?v=..."
          value={url}
          onChange={(event) => onChange(event.target.value)}
          disabled={isLoading}
        />
        <button className="primary" type="submit" disabled={!url || isLoading}>
          {isLoading ? "Inspecting..." : "Inspect"}
        </button>
      </div>
      {status && <small style={{ opacity: 0.75 }}>{status}</small>}
    </form>
  );
};

export default UrlInput;

