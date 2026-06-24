import "../styles/dashboard.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import toast from "react-hot-toast";

import { showNotification } from "../utils/notifications";

const Dashboard = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      showNotification("Reminder", "Check your pending tasks!");
    }, 60000); // every 1 minute

    return () => clearInterval(interval);
  }, []);
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  const [showPending, setShowPending] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showMissed, setShowMissed] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await API.get("/dashboard");
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const pendingTasks = data?.today_pending_tasks || [];
  const completedTasks = data?.today_completed_tasks || [];
  const missedTasks = data?.today_missed_tasks || [];

  const completed = data?.completed_tasks || 0;
  const pending = data?.pending_tasks || 0;
  const missed = data?.missed_tasks || 0;
  const total = data?.total_tasks || 0;
  const bestSlot = data?.best_slot || "N/A";

  const handleComplete = async (taskId) => {
    try{
    await API.post("/update_task", null, {
      params: { task_id: taskId, status: "completed" },
    });
    fetchDashboard();
    toast.success("Task completed ✅");
  }catch{
    toast.error("Failed to update task ❌");
  }
  };

  const handleMissed = async (taskId) => {
    const res = await API.post("/update_task", null, {
      params: { task_id: taskId, status: "missed" },
    });

    const response = res.data;

    if (response.suggested_slot) {
      const confirmMove = window.confirm(
        `${response.suggestion_reason}\n\nMove task to ${response.suggested_slot}?`
      );

      if (confirmMove) {
        await API.post("/accept_suggestion", null, {
          params: {
            task_id: taskId,
            new_slot: response.suggested_slot,
          },
        });
      }
    }

    fetchDashboard();
  };

  const handleRetry = async (taskId) => {
    await API.post("/retry_task", null, {
      params: { task_id: taskId },
    });
    fetchDashboard();
  };

  const handleDelete = async (taskId) => {
    await API.delete(`/delete_task?task_id=${taskId}`);
    fetchDashboard();
  };

  if (!data) return <div className="card">Loading...</div>;

  return (
    <>
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>You have {pending} pending tasks today</p>
        </div>

        <button className="quick-btn" onClick={() => navigate("/goal")}>
          ⚡ Add Goal
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card card">
          <h4>Total Tasks</h4>
          <h2>{total}</h2>
        </div>

        <div className="stat-card card">
          <h4>Completed</h4>
          <h2>{completed}</h2>
        </div>

        <div className="stat-card card">
          <h4>Missed</h4>
          <h2>{missed}</h2>
        </div>

        <div className="stat-card card">
          <h4>Best Slot</h4>
          <h2>{bestSlot}</h2>
        </div>
      </div>

      {/* PENDING */}
      <div className="tasks-section card">
        <div
          className="section-header"
          onClick={() => setShowPending(!showPending)}
        >
          <h3>
            {showPending ? "▼" : "▶"} Pending Tasks ({pendingTasks.length})
          </h3>
        </div>

        <div className={`collapsible ${showPending ? "open" : ""}`}>
          {pendingTasks.map((task) => (
            <div key={task.id} className="task-item fade-in">
              <span>
                {task.title} • {task.slot}
              </span>

              <div className="task-actions">
                <button
                  className="btn btn-success"
                  onClick={() => handleComplete(task.id)}
                >
                  Complete
                </button>

                <button
                  className="btn btn-warning"
                  onClick={() => handleMissed(task.id)}
                >
                  Missed
                </button>

                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(task.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* COMPLETED */}
      <div className="tasks-section card">
        <div
          className="section-header"
          onClick={() => setShowCompleted(!showCompleted)}
        >
          <h3>
            {showCompleted ? "▼" : "▶"} Completed Tasks (
            {completedTasks.length})
          </h3>
        </div>

        <div className={`collapsible ${showCompleted ? "open" : ""}`}>
          {completedTasks.map((task) => (
            <div key={task.id} className="task-item completed fade-in">
              {task.title} • {task.slot}
            </div>
          ))}
        </div>
      </div>

      {/* MISSED */}
      <div className="tasks-section card">
        <div
          className="section-header"
          onClick={() => setShowMissed(!showMissed)}
        >
          <h3>
            {showMissed ? "▼" : "▶"} Missed Tasks ({missedTasks.length})
          </h3>
        </div>

        <div className={`collapsible ${showMissed ? "open" : ""}`}>
          {missedTasks.length === 0 ? (
            <div className="task-item">No missed tasks 🎉</div>
          ) : (
            missedTasks.map((task) => (
              <div key={task.id} className="task-item missed fade-in">
                <span>
                  {task.title} • {task.slot}
                </span>

                <div className="task-actions">
                  <button
                    className="btn btn-warning"
                    onClick={() => handleRetry(task.id)}
                  >
                    Retry
                  </button>

                  <button
                    className="btn btn-success"
                    onClick={() => handleComplete(task.id)}
                  >
                    Complete
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(task.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;