import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Managers = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingManager, setEditingManager] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/managers", {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setManagers(data);
      } else {
        setError(data.message || "Failed to fetch managers");
      }
    } catch (err) {
      setError("Failed to fetch managers");
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

    try {
      const url = editingManager
        ? `http://localhost:4000/api/managers/${editingManager._id}`
        : "http://localhost:4000/api/managers";
      const method = editingManager ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        fetchManagers();
        setShowForm(false);
        setEditingManager(null);
        setFormData({ name: "", email: "", phone: "" });
      } else {
        setError(data.message || "Failed to save manager");
      }
    } catch (err) {
      setError("Failed to save manager");
    }
  };

  const handleEdit = (manager) => {
    setEditingManager(manager);
    setFormData({
      name: manager.name,
      email: manager.email,
      phone: manager.phone,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this manager?")) return;

    try {
      const res = await fetch(`http://localhost:4000/api/managers/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        fetchManagers();
      } else {
        const data = await res.json();
        setError(data.message || "Failed to delete manager");
      }
    } catch (err) {
      setError("Failed to delete manager");
    }
  };

  if (loading) return <div className="loading">Loading managers...</div>;

  return (
    <div className="managers-page">
      <div className="page-header">
        <h1>Managers</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          Add Manager
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingManager ? "Edit Manager" : "Add New Manager"}</h2>
            <form onSubmit={handleSubmit}>
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
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingManager ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingManager(null);
                    setFormData({ name: "", email: "", phone: "" });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="managers-list">
        {managers.length === 0 ? (
          <p>No managers found. Create your first manager.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {managers.map((manager) => (
                <tr key={manager._id}>
                  <td>{manager.name}</td>
                  <td>{manager.email}</td>
                  <td>{manager.phone}</td>
                  <td>{new Date(manager.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(manager)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(manager._id)}
                    >
                      Delete
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

export default Managers;
