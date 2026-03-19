import { useState } from "react";

const GoalForm = ({ onCreate }) => {
  const [goal, setGoal] = useState("");

  return (
    <div className="card">
      <h3>AI Goal Decomposition</h3>
      <input
        type="text"
        placeholder="Enter your goal..."
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
      />
      <button onClick={() => onCreate(goal)}>Decompose</button>
    </div>
  );
};

export default GoalForm;