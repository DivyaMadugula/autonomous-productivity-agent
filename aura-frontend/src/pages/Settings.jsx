import "../styles/settings.css"
import { useState } from "react";

const Settings = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [name, setName] = useState("Divya Madugula");
  const [email, setEmail] = useState("divya@gmail.com");
  const [theme, setTheme] = useState("light");
  const [fontSize, setFontSize] = useState("small");
  const [emailNotif, setEmailNotif] = useState(true);
  const [dailySummary, setDailySummary] = useState(false);

  const handleProfilePicChange = (e) => {
    setProfilePic(URL.createObjectURL(e.target.files[0]));
  };

  const handleSaveChanges = () => {
    // Save changes to local storage or manage state as needed
    localStorage.setItem("profile", JSON.stringify({ name, email, theme, fontSize }));
    alert("Changes saved!");
  };

  return (
    <div>
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account and preferences</p>
      </div>

      <div className="settings-layout">
        {/* Profile Section */}
        <div className="card settings-card">
          <h3>Profile</h3>

          <label>Profile Picture</label>
          <input type="file" onChange={handleProfilePicChange} />
          {profilePic && <img src={profilePic} alt="Profile" className="profile-pic" />}

          <label>Full Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />

          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

          <label>Change Password</label>
          <input type="password" placeholder="••••••••" />

          <button className="save-btn" onClick={handleSaveChanges}>Save Changes</button>
        </div>

        {/* Appearance Section */}
        <div className="card settings-card">
          <h3>Appearance</h3>

          <div className="toggle-row">
            <span>Theme</span>
            <select value={theme} onChange={(e) => setTheme(e.target.value)}>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>

          <div className="toggle-row">
            <span>Font Size</span>
            <select value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>

        {/* Notification Preferences Section */}
        <div className="card settings-card">
          <h3>Notification Preferences</h3>

          <div className="toggle-row">
            <span>Email Notifications</span>
            <input
              type="checkbox"
              checked={emailNotif}
              onChange={() => setEmailNotif(!emailNotif)}
            />
          </div>

          <div className="toggle-row">
            <span>Daily Summary Report</span>
            <input
              type="checkbox"
              checked={dailySummary}
              onChange={() => setDailySummary(!dailySummary)}
            />
          </div>
        </div>

        {/* Backup & Data Management Section */}
        <div className="card settings-card">
          <h3>Backup & Data Management</h3>
          <button className="backup-btn">Export Data</button>
          <button className="reset-btn">Reset All Data</button>
        </div>

      </div>
    </div>
  );
};

export default Settings;