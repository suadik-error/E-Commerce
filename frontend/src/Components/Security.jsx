import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";
const MIN_SESSION_TIMEOUT = 15;
const MAX_SESSION_TIMEOUT = 60;

const Security = () => {
  const [settings, setSettings] = useState({
    twoFactor: false,
    sessionTimeout: MIN_SESSION_TIMEOUT,
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
          withCredentials: true,
        });
        setSettings((prev) => ({
          ...prev,
          twoFactor: Boolean(res.data?.twoFactor),
          sessionTimeout: Math.min(
            MAX_SESSION_TIMEOUT,
            Math.max(MIN_SESSION_TIMEOUT, Number(res.data?.sessionTimeout) || MIN_SESSION_TIMEOUT)
          ),
        }));
      } catch (error) {
        console.error("Failed to fetch security settings");
      }
    };

    fetchProfile();
  }, []);

  const handleToggle = (e) => {
    const { name, checked } = e.target;
    setSettings((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSessionChange = (e) => {
    setSettings((prev) => ({
      ...prev,
      sessionTimeout: Math.min(
        MAX_SESSION_TIMEOUT,
        Math.max(MIN_SESSION_TIMEOUT, Number(e.target.value) || MIN_SESSION_TIMEOUT)
      ),
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = new FormData();
      payload.append("twoFactor", String(settings.twoFactor));
      payload.append("sessionTimeout", String(settings.sessionTimeout));

      const res = await axios.put(`${API_BASE_URL}/api/auth/profile`, payload, {
        withCredentials: true,
      });

      if (res.data?.accessToken) {
        window.dispatchEvent(
          new CustomEvent("auth:token", { detail: { accessToken: res.data.accessToken } })
        );
      }

      alert("Security settings saved");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save security settings");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("New password and confirmation do not match");
      return;
    }

    setSaving(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/change-password`,
        {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        },
        { withCredentials: true }
      );

      alert(res.data?.message || "Password updated");
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update password");
    } finally {
      setSaving(false);
    }
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

            <div className="form-group">
              <label htmlFor="sessionTimeout">Session Timeout (minutes)</label>
              <select
                id="sessionTimeout"
                value={settings.sessionTimeout}
                onChange={handleSessionChange}
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
              </select>
              <p className="field-description">
                Choose 15 minutes, 30 minutes, or 1 hour. Default is 15 minutes.
              </p>
            </div>

            <div className="settings-actions">
              <button className="primary-btn" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Security Settings"}
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
              <button className="primary-btn" type="submit" disabled={saving}>
                {saving ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Security;
