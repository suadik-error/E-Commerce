import { useState } from "react";
import axios from "axios";

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
        "http://localhost:4000/api/admin-request",
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
    <div style={{ maxWidth: "650px", margin: "40px auto", background: "#ffffff", padding: "30px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(20, 10, 10, 0.1)" }}>
      <h2 style={{textAlign: "center", marginBottom: "20px"}}>Request Admin Access</h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", padding: "12px 14px", borderRadius: 10 }}>
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

        <label>Business Registration Document</label>
        <input type="file" name="businessDoc" accept=".pdf,.jpg,.png" required onChange={handleChange} />

        <label>Owner Government ID</label>
        <input type="file" name="ownerId" accept=".pdf,.jpg,.png" required onChange={handleChange} />

        <label>Financial Capability Proof</label>
        <input type="file" name="financeDoc" accept=".pdf,.jpg,.png" required onChange={handleChange} />

        <label>
          <input type="checkbox" name="declaration" onChange={handleChange} /> I confirm all information is true
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Request"}
        </button>

        {message && <p>{message}</p>}
      </form>
    </div>
  );
};

export default AdminForm;
