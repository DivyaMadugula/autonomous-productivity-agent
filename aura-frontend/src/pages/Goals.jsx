import "../styles/goals.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [goalText, setGoalText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await API.get("/goals");
      setGoals(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDecompose = async () => {
    if (!goalText.trim()) return;

    try {
      await API.post("/goal", null, {
        params: { goal: goalText },
      });

      setGoalText("");
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {/* AI Banner */}
      <div className="goal-banner card">
        <div className="goal-banner-left">
          <div className="goal-icon">⚡</div>
          <div>
            <h3>AI Goal Decomposition</h3>
            <p>
              Describe your goal and I'll break it down into actionable tasks
              with smart scheduling.
            </p>
          </div>
        </div>

        <div className="goal-input-section">
          <input
            type="text"
            placeholder="e.g., Learn Python in 30 days"
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
          />
          <button className="decompose-btn" onClick={handleDecompose}>
            ⚡ Decompose
          </button>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="goals-grid">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="goal-card card clickable"
            onClick={() => navigate(`/goal/${goal.id}`)}
          >
            <div className="goal-header">
              <h4>{goal.title}</h4>
              <span className="goal-percentage">
                {goal.progress}%
              </span>
            </div>

            <p className="goal-desc">{goal.description}</p>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${goal.progress}%` }}
              />
            </div>

            <p className="goal-progress">
              {goal.completed_tasks}/{goal.total_tasks} tasks completed
            </p>
          </div>
        ))}

        {/* Add New Goal Card */}
        <div
          className="goal-card add-goal card"
          onClick={() => document.querySelector("input").focus()}
        >
          <div className="add-icon">+</div>
          <p>Add New Goal</p>
        </div>
      </div>
    </>
  );
};

export default Goals;