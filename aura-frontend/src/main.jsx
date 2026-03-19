import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./styles/global.css";

import { AuthProvider } from "./context/AuthContext";
import { GoalProvider } from "./context/GoalContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <GoalProvider>
        <App />
      </GoalProvider>
    </AuthProvider>
  </React.StrictMode>
);