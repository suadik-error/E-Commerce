import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {
  Camera,
  Key,
  LayoutTemplate,
  Mail,
  Palette,
  Shield,
  User,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";
const MIN_SESSION_TIMEOUT = 15;
const MAX_SESSION_TIMEOUT = 60;

const Settings = () => {
  const location = useLocation();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
    notifications: true,
    theme: "light",
    companyName: "",
    companyLogo: "",
    primaryColor: "#12b76a",
    accentColor: "#3154ff",
    sidebarPlacement: "left",
    navbarPlacement: "top",
    sessionTimeout: MIN_SESSION_TIMEOUT,
  });
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [companyLogoFile, setCompanyLogoFile] = useState(null);
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
    if (tab && ["profile", "workspace", "security"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
        withCredentials: true,
      });
      setProfile((prev) => ({ ...prev, ...res.data }));
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
      payload.append("companyName", profile.companyName || "");
      payload.append("primaryColor", profile.primaryColor || "#12b76a");
      payload.append("accentColor", profile.accentColor || "#3154ff");
      payload.append("sidebarPlacement", profile.sidebarPlacement || "left");
      payload.append("navbarPlacement", profile.navbarPlacement || "top");
      if (profile.language) payload.append("language", profile.language);
      if (profile.timezone) payload.append("timezone", profile.timezone);
      if (typeof profile.twoFactor === "boolean") {
        payload.append("twoFactor", String(profile.twoFactor));
      }
      payload.append(
        "sessionTimeout",
        String(
          Math.min(
            MAX_SESSION_TIMEOUT,
            Math.max(
              MIN_SESSION_TIMEOUT,
              Number(profile.sessionTimeout) || MIN_SESSION_TIMEOUT
            )
          )
        )
      );
      if (profilePictureFile) {
        payload.append("profilePicture", profilePictureFile);
      }
      if (companyLogoFile) {
        payload.append("companyLogo", companyLogoFile);
      }

      const res = await axios.put(`${API_BASE_URL}/api/auth/profile`, payload, {
        withCredentials: true,
      });
      if (res.data?.accessToken) {
        window.dispatchEvent(
          new CustomEvent("auth:token", { detail: { accessToken: res.data.accessToken } })
        );
      }
      alert("Profile updated successfully!");
      setProfilePictureFile(null);
      setCompanyLogoFile(null);
      setProfile((prev) => ({ ...prev, ...res.data }));
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
      const nextFile = e.target.files?.[0] || null;
      if (name === "companyLogo") {
        setCompanyLogoFile(nextFile);
      } else {
        setProfilePictureFile(nextFile);
      }
      return;
    }

    setProfile((prev) => ({
      ...prev,
      [name]:
        name === "sessionTimeout"
          ? Math.min(
              MAX_SESSION_TIMEOUT,
              Math.max(MIN_SESSION_TIMEOUT, Number(value) || MIN_SESSION_TIMEOUT)
            )
          : type === "checkbox"
            ? checked
            : value,
    }));
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
    { id: "workspace", label: "Workspace", icon: LayoutTemplate },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your profile, workspace branding, and account security</p>
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
            <>
              <div className="settings-card">
                <h2>
                  <User size={20} />
                  Account Profile
                </h2>

                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      <User size={16} />
                      Full Name
                    </label>
                    <input type="text" value={profile.name} readOnly />
                  </div>

                  <div className="form-group">
                    <label>
                      <Mail size={16} />
                      Email Address
                    </label>
                    <input type="text" value={profile.email} readOnly />
                  </div>

                  <div className="form-group">
                    <label>
                      <Shield size={16} />
                      Role
                    </label>
                    <input type="text" value={profile.role} readOnly />
                  </div>
                </div>
              </div>

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
                    <input type="text" id="role" name="role" value={profile.role} readOnly />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "workspace" && (
            <>
              <div className="settings-card">
                <h2>
                  <Palette size={20} />
                  Workspace Branding
                </h2>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="companyName">
                      <User size={16} />
                      Workspace Name
                    </label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      value={profile.companyName || ""}
                      onChange={handleChange}
                      placeholder="Busi-Tech"
                    />
                    <p className="field-description">
                      This name is used as the dashboard brand and fallback initials.
                    </p>
                  </div>

                  <div className="form-group">
                    <label htmlFor="companyLogo">
                      <Camera size={16} />
                      Company Logo
                    </label>
                    <input
                      type="file"
                      id="companyLogo"
                      name="companyLogo"
                      accept="image/*"
                      onChange={handleChange}
                    />
                    <p className="field-description">
                      If no logo is uploaded, the system uses your workspace name initials.
                    </p>
                  </div>

                  <div className="form-group">
                    <label htmlFor="primaryColor">
                      <Palette size={16} />
                      Primary Color
                    </label>
                    <input
                      type="color"
                      id="primaryColor"
                      name="primaryColor"
                      value={profile.primaryColor || "#12b76a"}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="accentColor">
                      <Palette size={16} />
                      Accent Color
                    </label>
                    <input
                      type="color"
                      id="accentColor"
                      name="accentColor"
                      value={profile.accentColor || "#3154ff"}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="settings-card">
                <h2>
                  <LayoutTemplate size={20} />
                  Layout Placement
                </h2>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="sidebarPlacement">
                      <LayoutTemplate size={16} />
                      Sidebar Placement
                    </label>
                    <select
                      id="sidebarPlacement"
                      name="sidebarPlacement"
                      value={profile.sidebarPlacement || "left"}
                      onChange={handleChange}
                    >
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="navbarPlacement">
                      <LayoutTemplate size={16} />
                      Navbar Placement
                    </label>
                    <select
                      id="navbarPlacement"
                      name="navbarPlacement"
                      value={profile.navbarPlacement || "top"}
                      onChange={handleChange}
                    >
                      <option value="top">Top</option>
                      <option value="bottom">Bottom</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="theme">
                      <Palette size={16} />
                      Theme
                    </label>
                    <select
                      id="theme"
                      name="theme"
                      value={profile.theme || "light"}
                      onChange={handleChange}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
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
                    onChange={(e) =>
                      setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sessionTimeout">
                    <Shield size={16} />
                    Session Timeout (Minutes)
                  </label>
                  <select
                    id="sessionTimeout"
                    name="sessionTimeout"
                    value={profile.sessionTimeout}
                    onChange={handleChange}
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                  </select>
                  <p className="field-description">
                    Choose 15 minutes, 30 minutes, or 1 hour. Default is 15 minutes.
                  </p>
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
                    onChange={(e) =>
                      setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
                    }
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
                    onChange={(e) =>
                      setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                    }
                  />
                </div>

                <div className="form-group full-width">
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={handlePasswordChange}
                    disabled={loading}
                  >
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
