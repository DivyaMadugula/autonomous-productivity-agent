const TimeBlocks = ({ schedule }) => {
  return (
    <div className="card">
      <h3>Time Blocks</h3>
      <pre>{schedule}</pre>
    </div>
  );
};

export default TimeBlocks;