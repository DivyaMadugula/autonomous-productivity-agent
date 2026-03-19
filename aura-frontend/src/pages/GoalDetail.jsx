import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/api";

const GoalDetail = () => {
  const { goalId } = useParams();
  const [goal, setGoal] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchGoal = async () => {
      const res = await API.get(`/goal/${goalId}`);
      setGoal(res.data.goal);
      setTasks(res.data.tasks);
    };

    fetchGoal();
  }, [goalId]);

  if (!goal) return <div>Loading...</div>;

  return (
    <div className="card">
      <h2>{goal.title}</h2>
      <p>{goal.description}</p>

      <h3>Tasks</h3>

      {tasks.map(task => (
        <div key={task.id} className="task-item">
          {task.title} • {task.slot} • {task.status}
        </div>
      ))}
    </div>
  );
};

export default GoalDetail;