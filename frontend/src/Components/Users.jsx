import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";



const initialForm = {
  name: "",
  email: "",
  role: "manager",
  phone: "",
  address: "",
  governmentId: "",
  profilePicture: null,
  location: "",
  dateOfBirth: "",
  managerId: "",
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [delivery, setDelivery] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchUsers();
    fetchManagers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE_URL}/api/users`, { withCredentials: true });
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/managers`, { withCredentials: true });
      setManagers(res.data || []);
    } catch (_) {
      setManagers([]);
    }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setSelectedUserId(null);
    setShowCreateForm(false);
    setShowEditForm(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (e.target.type === "file") {
      const file = e.target.files?.[0] || null;
      setFormData((prev) => ({ ...prev, [name]: file }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setGeneratedPassword("");
    setDelivery(null);

    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("email", formData.email);
      payload.append("role", formData.role);

      if (formData.role === "manager") {
        payload.append("phone", formData.phone);
        payload.append("address", formData.address || "");
        payload.append("governmentId", formData.governmentId || "");
      }

      if (formData.role === "agent") {
        payload.append("phone", formData.phone);
        payload.append("location", formData.location);
        payload.append("governmentId", formData.governmentId);
        payload.append("address", formData.address || "");
        payload.append("dateOfBirth", formData.dateOfBirth || "");
        payload.append("managerId", formData.managerId);
      }

      if (formData.profilePicture) {
        payload.append("profilePicture", formData.profilePicture);
      }

      const res = await axios.post(`${API_BASE_URL}/api/users`, payload, {
        withCredentials: true,
      });
      setGeneratedPassword(res.data?.generatedPassword || "");
      setDelivery(res.data?.delivery || null);
      resetForm();
      await fetchUsers();
      await fetchManagers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (user) => {
    setSelectedUserId(user._id);
    setFormData({
      ...initialForm,
      name: user.name || "",
      email: user.email || "",
      role: user.role || "user",
      managerId: user.managerId || "",
    });
    setShowEditForm(true);
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("email", formData.email);
      payload.append("role", formData.role);
      if (formData.role === "agent") {
        payload.append("managerId", formData.managerId || "");
      }
      if (formData.profilePicture) {
        payload.append("profilePicture", formData.profilePicture);
      }

      await axios.put(`${API_BASE_URL}/api/users/${selectedUserId}`, payload, {
        withCredentials: true,
      });
      resetForm();
      await fetchUsers();
      await fetchManagers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmed = window.confirm("Delete this user?");
    if (!confirmed) return;

    setError("");
    try {
      await axios.delete(`${API_BASE_URL}/api/users/${userId}`, { withCredentials: true });
      await fetchUsers();
      await fetchManagers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
    }
  };

  const handleResetPassword = async (user) => {
    if (!["manager", "agent"].includes(user.role)) {
      setError("Password reset is supported only for manager and agent");
      return;
    }

    const confirmed = window.confirm(`Generate temporary password for ${user.name}?`);
    if (!confirmed) return;

    setError("");
    setGeneratedPassword("");
    setDelivery(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/users/${user._id}/reset-password`, {}, { withCredentials: true });
      setGeneratedPassword(res.data?.generatedPassword || "");
      setDelivery(res.data?.delivery || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>Users Management</h1>
        <button className="primary-btn" onClick={() => setShowCreateForm(true)}>
          + Add User
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}
      {generatedPassword && (
        <div className="success-text">
          <strong>Temporary password:</strong> {generatedPassword}
          <br />
          Please share this only with the new user. They must change it immediately after first login to a strong password they can remember (at least 8 characters, with uppercase, lowercase, number, and symbol).
          {delivery && (
            <>
              <br />
              Email: {delivery.email?.sent ? "sent" : `not sent (${delivery.email?.reason || "unknown reason"})`}
              <br />
              SMS: {delivery.sms?.sent ? "sent" : `not sent (${delivery.sms?.reason || "unknown reason"})`}
            </>
          )}
        </div>
      )}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Manager</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>
                  <div className="table-user">
                    {user.profilePicture ? (
                      <img
                        className="table-avatar"
                        src={user.profilePicture}
                        alt={`${user.name} profile`}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="table-avatar fallback">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span>{user.name}</span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`role ${user.role}`}>{user.role}</span>
                </td>
                <td>
                  {user.role === "agent"
                    ? (user.managerName || user.managerEmail || "Unassigned")
                    : "â€”"}
                </td>
                <td>
                  <span className={`status ${user.isActive === false ? "inactive" : "active"}`}>
                    {user.isActive === false ? "inactive" : "active"}
                  </span>
                </td>
                <td className="actions">
                  <button className="edit" onClick={() => openEditModal(user)}>
                    Edit
                  </button>
                  <button className="danger" onClick={() => handleDeleteUser(user._id)}>
                    Delete
                  </button>
                  {["manager", "agent"].includes(user.role) && (
                    <button className="secondary-btn" onClick={() => handleResetPassword(user)}>
                      Reset Password
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p>No users found</p>}
      </div>

      {showCreateForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add New User</h2>
            <form onSubmit={handleCreateUser}>
              <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />

              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </select>
              <input
                type="file"
                accept="image/*"
                name="profilePicture"
                onChange={handleChange}
              />

              {(formData.role === "manager" || formData.role === "agent") && (
                <input type="text" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required />
              )}

              {formData.role === "manager" && (
                <>
                  <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} />
                  <input
                    type="text"
                    name="governmentId"
                    placeholder="Government ID"
                    value={formData.governmentId}
                    onChange={handleChange}
                  />
                </>
              )}

              {formData.role === "agent" && (
                <>
                  <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange} required />
                  <input
                    type="text"
                    name="governmentId"
                    placeholder="Government ID"
                    value={formData.governmentId}
                    onChange={handleChange}
                    required
                  />
                  <select name="managerId" value={formData.managerId} onChange={handleChange} required>
                    <option value="">Select Manager</option>
                    {managers.map((manager) => (
                      <option key={manager._id} value={manager._id}>
                        {manager.name} ({manager.email})
                      </option>
                    ))}
                  </select>
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} />
                  <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} />
                </>
              )}

              <div className="form-buttons">
                <button type="submit" className="primary-btn" disabled={submitting}>
                  {submitting ? "Creating..." : "Create User"}
                </button>
                <button type="button" className="danger" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit User</h2>
            <form onSubmit={handleEditUser}>
              <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </select>
              <input
                type="file"
                accept="image/*"
                name="profilePicture"
                onChange={handleChange}
              />
              {formData.role === "agent" && (
                <select name="managerId" value={formData.managerId} onChange={handleChange}>
                  <option value="">Unassigned</option>
                  {managers.map((manager) => (
                    <option key={manager._id} value={manager._id}>
                      {manager.name} ({manager.email})
                    </option>
                  ))}
                </select>
              )}
              <div className="form-buttons">
                <button type="submit" className="primary-btn" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" className="danger" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
