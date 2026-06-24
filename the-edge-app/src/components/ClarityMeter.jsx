export default function ClarityMeter({ percent }) {
  return (
    <div className="clarity-meter">
      <div className="clarity-meter-row">
        <span className="clarity-meter-label">Progress</span>
        <span className="clarity-meter-value">{Math.round(percent)}%</span>
      </div>
      <div className="clarity-meter-track">
        <div className="clarity-meter-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
