import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiTarget,
  FiCalendar,
  FiMessageSquare,
  FiBarChart2,
  FiSettings,
  FiMenu,
} from "react-icons/fi";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
  localStorage.removeItem("token");
  navigate("/login");
};

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="mobile-toggle" onClick={() => setCollapsed(!collapsed)}>
        <FiMenu />
      </div>

      <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <h2 className="logo">{collapsed ? "A" : "Aura"}</h2>

        <nav>
          {/* Dashboard */}
          <NavLink to="/dashboard" className="nav-item">
            <FiHome />
            {!collapsed && <span>Dashboard</span>}
          </NavLink>

          {/* Goals */}
          <NavLink to="/goals" className="nav-item">
            <FiTarget />
            {!collapsed && <span>Goals</span>}
          </NavLink>

          {/* Schedule */}
          <NavLink to="/schedule" className="nav-item">
            <FiCalendar />
            {!collapsed && <span>Schedule</span>}
          </NavLink>

          {/* AI Assistant */}
          <NavLink to="/assistant" className="nav-item">
            <FiMessageSquare />
            {!collapsed && <span>AI Assistant</span>}
          </NavLink>

          {/* Analytics */}
          <NavLink to="/analytics" className="nav-item">
            <FiBarChart2 />
            {!collapsed && <span>Analytics</span>}
          </NavLink>

          {/* Settings */}
          <NavLink to="/settings" className="nav-item">
            <FiSettings />
            {!collapsed && <span>Settings</span>}
          </NavLink>
        </nav>

        {/* Logout Button */}
        <button onClick={handleLogout} className="logout-btn">
  Logout
</button>
      </div>
    </>
  );
};

export default Sidebar;