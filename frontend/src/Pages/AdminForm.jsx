import { useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const AdminForm = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    country: "",
    city: "",
    phone: "",
    reason: "",
    businessDoc: null,
    ownerId: null,
    financeDoc: null,
    declaration: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    setFormData({
      ...formData,
      [name]:
        type === "file"
          ? files[0]
          : type === "checkbox"
          ? checked
          : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.declaration) {
      return setMessage("You must accept the declaration to proceed.");
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    try {
      setLoading(true);
      setMessage("");

      await axios.post(
        `${API_BASE_URL}/api/admin-request`,
        data,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setMessage("Admin request submitted. Verification in progress.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

 return (
  <div className="admin-page">
    <div className="admin-card">
      <h2>Request Admin Access</h2>

      <form onSubmit={handleSubmit} className="admin-form">
        <input name="businessName" placeholder="Business Name" onChange={handleChange} required />

        <select name="businessType" onChange={handleChange} required>
          <option value="">Business Type</option>
          <option value="online">Online Store</option>
          <option value="retail">Retail Shop</option>
          <option value="wholesale">Wholesale</option>
          <option value="logistics">Logistics</option>
        </select>

        <input name="country" placeholder="Country" onChange={handleChange} required />
        <input name="city" placeholder="City" onChange={handleChange} required />
        <input name="phone" placeholder="Phone Number" onChange={handleChange} required />

        <textarea name="reason" placeholder="Why do you need admin access?" onChange={handleChange} required />

        <label className="file-label">Business Registration Document</label>
        <input type="file" name="businessDoc" accept=".pdf,.jpg,.png" required onChange={handleChange} />

        <label className="file-label">Owner Government ID</label>
        <input type="file" name="ownerId" accept=".pdf,.jpg,.png" required onChange={handleChange} />

        <label className="file-label">Financial Capability Proof</label>
        <input type="file" name="financeDoc" accept=".pdf,.jpg,.png" required onChange={handleChange} />

        <label className="checkbox-group">
          <input type="checkbox" name="declaration" onChange={handleChange} />
          I confirm all information is true
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Request"}
        </button>

        {message && <p className="form-message">{message}</p>}
      </form>
    </div>
  </div>
);

};

export default AdminForm;
