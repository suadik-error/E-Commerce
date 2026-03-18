import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { User, Mail, Shield, Key, Camera } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";


const Settings = () => {
  const location = useLocation();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
    notifications: true,
    theme: "light",
  });
  const [profilePictureFile, setProfilePictureFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab && ["profile", "security"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
        withCredentials: true,
      });
      setProfile({ ...profile, ...res.data });
    } catch (error) {
      console.error("Failed to fetch profile");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = new FormData();
      payload.append("name", profile.name);
      payload.append("email", profile.email);
      payload.append("notifications", String(profile.notifications));
      payload.append("theme", profile.theme || "light");
      if (profile.language) payload.append("language", profile.language);
      if (profile.timezone) payload.append("timezone", profile.timezone);
      if (typeof profile.twoFactor === "boolean") {
        payload.append("twoFactor", String(profile.twoFactor));
      }
      if (profilePictureFile) {
        payload.append("profilePicture", profilePictureFile);
      }

      await axios.put(`${API_BASE_URL}/api/auth/profile`, payload, {
        withCredentials: true,
      });
      alert("Profile updated successfully!");
      setProfilePictureFile(null);
    } catch (error) {
      console.error("Failed to update profile");
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "file") {
      setProfilePictureFile(e.target.files?.[0] || null);
      return;
    }
    setProfile({
      ...profile,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New password and confirm password do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        { withCredentials: true }
      );
      alert(res.data?.message || "Password changed successfully");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      alert(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      <div className="settings-container">
        <div className="settings-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit}>
          {activeTab === "profile" && (
            <div className="settings-card">
              <h2>
                <User size={20} />
                Profile Information
              </h2>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="profilePicture">
                    <Camera size={16} />
                    Profile Picture
                  </label>
                  <input
                    type="file"
                    id="profilePicture"
                    name="profilePicture"
                    accept="image/*"
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="name">
                    <User size={16} />
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    <Mail size={16} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role">
                    <Shield size={16} />
                    Role
                  </label>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    value={profile.role}
                    onChange={handleChange}
                    readOnly
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="settings-card">
              <h2>
                <Shield size={20} />
                Security Settings
              </h2>

              <div className="form-grid">
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="twoFactor"
                      checked={profile.twoFactor}
                      onChange={handleChange}
                    />
                    <Shield size={16} />
                    Two-Factor Authentication
                  </label>
                  <p className="field-description">
                    Add an extra layer of security to your account
                  </p>
                </div>

                <div className="form-group">
                  <label htmlFor="currentPassword">
                    <Key size={16} />
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    placeholder="Enter current password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">
                    <Key size={16} />
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    placeholder="Enter new password"
                    minLength={8}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">
                    <Key size={16} />
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    minLength={8}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                </div>
                <div className="form-group full-width">
                  <button type="button" className="primary-btn" onClick={handlePasswordChange} disabled={loading}>
                    {loading ? "Updating..." : "Change Password"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="settings-actions">
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
