const LoadingOverlay = ({ label = "Loading..." }) => (
  <div className="loading-overlay">
    <div className="spinner" />
    <p>{label}</p>
  </div>
);

export default LoadingOverlay;

