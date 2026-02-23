import { useState, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const ManagerWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    department: "general",
    position: "worker",
  });

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/workers`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setWorkers(data);
      } else {
        setError(data.message || "Failed to fetch workers");
      }
    } catch (err) {
      setError("Failed to fetch workers");
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
      const res = await fetch(`${API_BASE_URL}/api/workers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        fetchWorkers();
        setShowForm(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          address: "",
          department: "general",
          position: "worker",
        });
      } else {
        setError(data.message || "Failed to create worker");
      }
    } catch (err) {
      setError("Failed to create worker");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this worker?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/workers/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        fetchWorkers();
      } else {
        const data = await res.json();
        setError(data.message || "Failed to delete worker");
      }
    } catch (err) {
      setError("Failed to delete worker");
    }
  };

  if (loading) return <div className="loading">Loading workers...</div>;

  return (
    <div className="manager-workers-page">
      <div className="page-header">
        <h1>Workers</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          Add Worker
        </button>
      </div>

      <div className="info-box">
        <p>
          <strong>Note:</strong> Workers do not have login access. They are staff members
          who assist with operations but don't have access to the dashboard.
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Worker</h2>
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
                  <label>Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                  >
                    <option value="general">General</option>
                    <option value="warehouse">Warehouse</option>
                    <option value="delivery">Delivery</option>
                    <option value="support">Support</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Position</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    placeholder="e.g., Packer, Driver, Assistant"
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
                  Create Worker
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      name: "",
                      email: "",
                      phone: "",
                      address: "",
                      department: "general",
                      position: "worker",
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

      <div className="workers-list">
        {workers.length === 0 ? (
          <p>No workers found. Create your first worker.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Department</th>
                <th>Position</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((worker) => (
                <tr key={worker._id}>
                  <td>{worker.name}</td>
                  <td>{worker.email}</td>
                  <td>{worker.phone}</td>
                  <td>{worker.department}</td>
                  <td>{worker.position}</td>
                  <td>{new Date(worker.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(worker._id)}
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

export default ManagerWorkers;
