const InsightsCard = ({ insights }) => {
  return (
    <div className="card">
      <h3>AI Insights</h3>
      <p>{insights}</p>
    </div>
  );
};

export default InsightsCard;