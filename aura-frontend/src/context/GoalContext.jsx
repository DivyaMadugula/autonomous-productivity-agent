import { createContext, useState } from "react";

export const GoalContext = createContext();

export const GoalProvider = ({ children }) => {
  const [goalId, setGoalId] = useState(
    localStorage.getItem("goalId") || ""
  );

  const saveGoalId = (id) => {
    localStorage.setItem("goalId", id);
    setGoalId(id);
  };

  return (
    <GoalContext.Provider value={{ goalId, saveGoalId }}>
      {children}
    </GoalContext.Provider>
  );
};