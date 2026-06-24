import "../styles/GoalDetail.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/api";

const GoalDetails = () => {
  const { goalId } = useParams();   // ✅ FIX (was id before)
  const [goal, setGoal] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchGoalTasks();
  }, [goalId]);

  const fetchGoalTasks = async () => {
    try {
      const res = await API.get(`/goal/${goalId}`);

      console.log("API RESPONSE:", res.data); // 🔍 debug

      setGoal(res.data.goal);     // ✅ IMPORTANT
      setTasks(res.data.tasks);   // ✅ IMPORTANT
    } catch (err) {
      console.error(err);
    }
  };

  if (!goal) return <div className="goal-container">Loading...</div>;

  // categorize
  const completed = tasks.filter(t => t.status === "completed");
  const missed = tasks.filter(t => t.status === "missed");
  const pending = tasks.filter(t => t.status === "pending");

  return (
    <div className="goal-container">
      <h1 className="goal-title">{goal.title}</h1>

      {/* SUMMARY */}
      <div className="goal-summary">
        <div className="summary-box">
          <h3>{completed.length}</h3>
          <p>Completed</p>
        </div>

        <div className="summary-box warning">
          <h3>{missed.length}</h3>
          <p>Needs Attention</p>
        </div>

        <div className="summary-box">
          <h3>{pending.length}</h3>
          <p>Upcoming</p>
        </div>
      </div>

      {/* COMPLETED */}
      <Section title="Completed ✅" tasks={completed} type="completed" />

      {/* MISSED */}
      <Section title="Needs Attention ⚠️" tasks={missed} type="missed" />

      {/* PENDING */}
      <Section title="Upcoming 📅" tasks={pending} type="pending" />
    </div>
  );
};

const Section = ({ title, tasks, type }) => {
  return (
    <div className="task-section">
      <h2>{title}</h2>

      {tasks.length === 0 ? (
        <p className="empty">No tasks here</p>
      ) : (
        tasks.map((task) => (
          <div key={task.id} className={`task-card ${type}`}>
            <div>
              <h4>{task.title}</h4>
              <span>{task.slot}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default GoalDetails;