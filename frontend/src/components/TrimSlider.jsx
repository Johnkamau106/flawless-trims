import "rc-slider/assets/index.css";
import Slider from "rc-slider";

const TrimSlider = ({ duration, range, onChange, fullVideo }) => {
  if (!duration) {
    return <p>Video duration unavailable.</p>;
  }

  return (
    <>
      <h2>Trim range</h2>
      <p style={{ opacity: 0.75, marginTop: 0 }}>
        {formatTime(range[0])} – {formatTime(range[1])}{" "}
        {fullVideo && <span>(full video)</span>}
      </p>
      <Slider
        range
        min={0}
        max={duration}
        step={1}
        allowCross={false}
        value={range}
        onChange={(value) => onChange(value)}
        trackStyle={[{ backgroundColor: "#00eaff" }]}
        handleStyle={[
          { borderColor: "#00eaff", backgroundColor: "#05080f" },
          { borderColor: "#00eaff", backgroundColor: "#05080f" },
        ]}
        railStyle={{ backgroundColor: "rgba(255,255,255,0.2)" }}
      />
    </>
  );
};

function formatTime(seconds) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(Math.floor(seconds % 60)).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default TrimSlider;

