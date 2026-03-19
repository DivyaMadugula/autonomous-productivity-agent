const GoalCard = ({ title, tasks }) => {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>{tasks?.length} Tasks</p>
    </div>
  );
};

export default GoalCard;