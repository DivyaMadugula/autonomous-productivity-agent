const ProgressCircle = ({ percentage }) => {
  return (
    <div className="card">
      <h3>Today's Progress</h3>
      <div className="progress-circle">
        {percentage}%
      </div>
    </div>
  );
};

export default ProgressCircle;