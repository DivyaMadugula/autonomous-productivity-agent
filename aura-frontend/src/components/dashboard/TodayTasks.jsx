const TodayTasks = ({ tasks }) => {
  return (
    <div className="card">
      <h3>Today's Tasks</h3>
      {tasks?.map((task, index) => (
        <div key={index} className="task-item">
          <span>{task.title}</span>
          <span>{task.status}</span>
        </div>
      ))}
    </div>
  );
};

export default TodayTasks;