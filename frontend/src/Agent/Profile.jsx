import { useState, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";



const AgentProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
    address: "",
    profilePicture: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/agents/profile/me`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        setFormData({
          name: data.name || "",
          phone: data.phone || "",
          location: data.location || "",
          address: data.address || "",
          profilePicture: null,
        });
      } else {
        setError(data.message || "Failed to fetch profile");
      }
    } catch (err) {
      setError("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    if (e.target.type === "file") {
      const file = e.target.files?.[0] || null;
      setFormData({ ...formData, [e.target.name]: file });
      return;
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("phone", formData.phone);
      payload.append("location", formData.location);
      payload.append("address", formData.address || "");
      if (formData.profilePicture) {
        payload.append("profilePicture", formData.profilePicture);
      }

      const res = await fetch(`${API_BASE_URL}/api/agents/profile/me`, {
        method: "PUT",
        credentials: "include",
        body: payload,
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Profile updated successfully");
        fetchProfile();
        setIsEditing(false);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to update profile");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err) {
      setError("Failed to update profile");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setChangingPassword(true);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New password and confirm password do not match");
      setChangingPassword(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to change password");
        return;
      }

      setSuccess("Password changed successfully");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordForm(false);
    } catch (err) {
      setError("Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) return <div className="loading">Loading profile...</div>;

  return (
    <div className="agent-profile-page">
      <div className="page-header">
        <h1>My Profile</h1>
        {!isEditing && (
          <div className="profile-actions">
            <button className="btn-primary" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
            <button type="button" className="btn-secondary" onClick={() => setShowPasswordForm((prev) => !prev)}>
              Change Password
            </button>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={`${user?.name || "Agent"} profile`}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : (
              user?.name?.charAt(0).toUpperCase()
            )}
          </div>
          <div className="profile-info">
            <h2>{user?.name}</h2>
            <p className="email">{user?.email}</p>
            <p className="role">Agent</p>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Profile Picture</label>
              <input
                type="file"
                accept="image/*"
                name="profilePicture"
                onChange={handleChange}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-details">
            <div className="detail-item">
              <label>Phone</label>
              <p>{user?.phone || "Not set"}</p>
            </div>
            <div className="detail-item">
              <label>Location</label>
              <p>{user?.location || "Not set"}</p>
            </div>
            <div className="detail-item">
              <label>Address</label>
              <p>{user?.address || "Not set"}</p>
            </div>
            <div className="detail-item">
              <label>Government ID</label>
              <p>{user?.governmentId || "Not set"}</p>
            </div>
          </div>
        )}
      </div>

      {showPasswordForm && (
        <div className="profile-card">
          <h3>Change Password</h3>
          <form onSubmit={handleChangePassword} className="profile-form">
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                minLength={8}
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                minLength={8}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={changingPassword}>
                {changingPassword ? "Updating..." : "Update Password"}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowPasswordForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Performance Stats */}
      <div className="performance-card">
        <h3>Performance</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <h4>Total Sales</h4>
            <p className="stat-value">{user?.totalSales || 0}</p>
          </div>
          <div className="stat-item">
            <h4>Total Revenue</h4>
            <p className="stat-value">${(user?.totalRevenue || 0).toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentProfile;
