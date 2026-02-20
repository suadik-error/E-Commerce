import { useState, useEffect } from "react";

const ManagerAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [delivery, setDelivery] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    governmentId: "",
    dateOfBirth: "",
    address: "",
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/agents", {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setAgents(data);
      } else {
        setError(data.message || "Failed to fetch agents");
      }
    } catch (err) {
      setError("Failed to fetch agents");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setGeneratedPassword("");
    setDelivery(null);

    try {
      const url = editingAgent
        ? `http://localhost:4000/api/agents/${editingAgent._id}`
        : "http://localhost:4000/api/agents";
      const method = editingAgent ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        if (!editingAgent) {
          setGeneratedPassword(data.generatedPassword || "");
          setDelivery(data.delivery || null);
          setSuccess("Agent created successfully.");
        } else {
          setSuccess("Agent updated successfully.");
        }
        fetchAgents();
        setShowForm(false);
        setEditingAgent(null);
        setFormData({
          name: "",
          email: "",
          phone: "",
          location: "",
          governmentId: "",
          dateOfBirth: "",
          address: "",
        });
      } else {
        setError(data.message || "Failed to save agent");
      }
    } catch (err) {
      setError("Failed to save agent");
    }
  };

  const handleEdit = (agent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      location: agent.location,
      governmentId: agent.governmentId || "",
      dateOfBirth: agent.dateOfBirth || "",
      address: agent.address || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this agent?")) return;

    try {
      const res = await fetch(`http://localhost:4000/api/agents/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        fetchAgents();
        setSuccess("Agent deleted successfully.");
      } else {
        const data = await res.json();
        setError(data.message || "Failed to delete agent");
      }
    } catch (err) {
      setError("Failed to delete agent");
    }
  };

  const toggleAgentStatus = async (agent) => {
    try {
      const res = await fetch(`http://localhost:4000/api/agents/${agent._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !agent.isActive }),
      });

      if (res.ok) {
        fetchAgents();
        setSuccess("Agent status updated successfully.");
      }
    } catch (err) {
      setError("Failed to update agent status");
    }
  };

  const handleResetPassword = async (agent) => {
    if (!window.confirm(`Generate a new temporary password for ${agent.name}?`)) return;

    setError("");
    setSuccess("");
    setGeneratedPassword("");
    setDelivery(null);

    try {
      const res = await fetch(`http://localhost:4000/api/agents/${agent._id}/reset-password`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to reset password");
        return;
      }

      setGeneratedPassword(data.generatedPassword || "");
      setDelivery(data.delivery || null);
      setSuccess(`Temporary password reset for ${agent.name}.`);
    } catch (err) {
      setError("Failed to reset password");
    }
  };

  if (loading) return <div className="loading">Loading agents...</div>;

  return (
    <div className="manager-agents-page">
      <div className="page-header">
        <h1>Agents</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          Add Agent
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      {generatedPassword && (
        <div className="success-message">
          <strong>Temporary password:</strong> {generatedPassword}
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

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingAgent ? "Edit Agent" : "Add New Agent"}</h2>
            <form onSubmit={handleSubmit}>
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
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={editingAgent}
                  />
                </div>
              </div>
              <div className="form-row">
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
              <div className="form-row">
                <div className="form-group">
                  <label>Government ID</label>
                  <input
                    type="text"
                    name="governmentId"
                    value={formData.governmentId}
                    onChange={handleChange}
                    placeholder="Enter government issued ID"
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
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
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingAgent ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAgent(null);
                    setFormData({
                      name: "",
                      email: "",
                      phone: "",
                      location: "",
                      governmentId: "",
                      dateOfBirth: "",
                      address: "",
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="agents-list">
        {agents.length === 0 ? (
          <p>No agents found. Create your first agent.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Status</th>
                <th>Total Sales</th>
                <th>Total Revenue</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent._id}>
                  <td>{agent.name}</td>
                  <td>{agent.email}</td>
                  <td>{agent.phone}</td>
                  <td>{agent.location}</td>
                  <td>
                    <button
                      className={`status-toggle ${agent.isActive ? "active" : "inactive"}`}
                      onClick={() => toggleAgentStatus(agent)}
                    >
                      {agent.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td>{agent.totalSales || 0}</td>
                  <td>${(agent.totalRevenue || 0).toFixed(2)}</td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(agent)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(agent._id)}
                    >
                      Delete
                    </button>
                    <button
                      className="btn-confirm"
                      onClick={() => handleResetPassword(agent)}
                    >
                      Reset Password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManagerAgents;
