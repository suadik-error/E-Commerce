import { useState } from "react";

const Security = () => {
  const [settings, setSettings] = useState({
    twoFactor: false,
    emailAlerts: true,
    loginDeviceCheck: true,
    sessionTimeout: "30",
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleToggle = (e) => {
    const { name, checked } = e.target;
    setSettings((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSessionChange = (e) => {
    setSettings((prev) => ({ ...prev, sessionTimeout: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert("Security settings saved");
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("New password and confirmation do not match");
      return;
    }
    alert("Password update request sent");
    setPasswords({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="security-page">
      <div className="page-header">
        <h1>Security</h1>
      </div>

      <div className="settings-container">
        <div className="settings-card">
          <h2>Account Protection</h2>
          <form onSubmit={handleSave} className="form-grid">
            <label className="checkbox-label">
              <input type="checkbox" name="twoFactor" checked={settings.twoFactor} onChange={handleToggle} />
              Enable Two-Factor Authentication
            </label>

            <label className="checkbox-label">
              <input type="checkbox" name="emailAlerts" checked={settings.emailAlerts} onChange={handleToggle} />
              Email alerts for suspicious login
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="loginDeviceCheck"
                checked={settings.loginDeviceCheck}
                onChange={handleToggle}
              />
              Require verification for new devices
            </label>

            <div className="form-group">
              <label htmlFor="sessionTimeout">Session Timeout (minutes)</label>
              <select id="sessionTimeout" value={settings.sessionTimeout} onChange={handleSessionChange}>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">60 minutes</option>
                <option value="120">120 minutes</option>
              </select>
            </div>

            <div className="settings-actions">
              <button className="primary-btn" type="submit">
                Save Security Settings
              </button>
            </div>
          </form>
        </div>

        <div className="settings-card">
          <h2>Change Password</h2>
          <form onSubmit={handlePasswordSave} className="form-grid">
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={passwords.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                minLength={8}
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                minLength={8}
                value={passwords.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className="settings-actions">
              <button className="primary-btn" type="submit">
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Security;
