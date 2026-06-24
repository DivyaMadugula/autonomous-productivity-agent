import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Goals from "./pages/Goals";
import Schedule from "./pages/Schedule";
import Assistant from "./pages/Assistant";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Goal from "./pages/Goal";
import GoalDetail from "./pages/GoalDetail";
import { Toaster } from "react-hot-toast";
import Landing from "./pages/Landing";
// PrivateRoute component

const PrivateRoute = ({ children }) => {
  const isAuth = localStorage.getItem("auth");
  return isAuth ? children : <Navigate to="/login" />;
};
const isAuthenticated = () => {
  return localStorage.getItem("token") !== null;
};
export const showNotification = (title, body) => {
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification(title, { body });
      }
    });
  }
};
function App() {
  return (
    <>
    <Toaster position="top-right" />
    
     
    <BrowserRouter>
      <Routes>

        {/* Default → Redirect */}
        <Route path="/" element={<Landing />} />
        {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Protected Goal Page */}
        <Route
          path="/goal"
          element={
            <PrivateRoute>
              <Layout>
                <Goal />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Other Protected Pages */}
        <Route
          path="/goals"
          element={
            <PrivateRoute>
              <Layout>
                <Goals />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route path="/goal/:goalId" element={<GoalDetail />} />

        <Route
          path="/schedule"
          element={
            <PrivateRoute>
              <Layout>
                <Schedule />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/assistant"
          element={
            <PrivateRoute>
              <Layout>
                <Assistant />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <PrivateRoute>
              <Layout>
                <Analytics />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Layout>
                <Settings />
              </Layout>
            </PrivateRoute>
          }
        />

      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;