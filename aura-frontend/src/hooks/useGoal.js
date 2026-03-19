import { useContext } from "react";
import { GoalContext } from "../context/GoalContext";

export const useGoal = () => {
  return useContext(GoalContext);
};