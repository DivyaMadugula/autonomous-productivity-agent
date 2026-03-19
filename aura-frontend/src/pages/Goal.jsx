import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

const Goal = () => {
  const [goal, setGoal] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!goal.trim()) return;

    try {
      setLoading(true);

      const res = await API.post("/goal", null, {
        params: { goal },
      });

      // show generated schedule directly
      const schedule = res.data.schedule;

      // flatten morning/afternoon/evening
      const allTasks = [
        ...(schedule.morning || []),
        ...(schedule.afternoon || []),
        ...(schedule.evening || []),
      ];

      setTasks(allTasks);
      setLoading(false);

    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card card">
        <h2>Create New Goal</h2>

        <textarea
          placeholder="Enter your goal..."
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          style={{
            width: "100%",
            height: "100px",
            padding: "10px",
            marginBottom: "20px",
          }}
        />

        <button onClick={handleSubmit}>
          {loading ? "Generating..." : "Generate Tasks"}
        </button>

        {/* 🔥 SHOW GENERATED TASKS */}
        {tasks.length > 0 && (
          <div style={{ marginTop: "20px", textAlign: "left" }}>
            <h3>Generated Tasks:</h3>
            {tasks.map((task) => (
              <div key={task.id} style={{
                background: "#111",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "8px"
              }}>
                {task.title} • {task.priority} • {task.estimated_duration} min
              </div>
            ))}

            <button
              style={{ marginTop: "15px" }}
              onClick={() => navigate("/dashboard")}
            >
              Go to Dashboard
            </button>
          </div>
        )}

        <p
          style={{ marginTop: "15px", cursor: "pointer" }}
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </p>
      </div>
    </div>
  );
};

export default Goal;