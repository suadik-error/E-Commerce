import { useState, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const ManagerPayments = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    fetchSales();
  }, [filter]);

  const fetchSales = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sales`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setSales(data);
      } else {
        setError(data.message || "Failed to fetch sales");
      }
    } catch (err) {
      setError("Failed to fetch sales");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (saleId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sales/${saleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ paymentStatus: "paid" }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Payment confirmed successfully");
        fetchSales();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to confirm payment");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err) {
      setError("Failed to confirm payment");
      setTimeout(() => setError(""), 3000);
    }
  };

  const filteredSales = sales.filter((sale) => {
    if (filter === "pending") return sale.paymentStatus === "pending";
    if (filter === "paid") return sale.paymentStatus === "paid";
    if (filter === "confirmed") return sale.paymentStatus === "confirmed";
    return true;
  });

  const pendingAmount = sales
    .filter((s) => s.paymentStatus === "pending")
    .reduce((sum, s) => sum + s.totalPrice, 0);
  const paidAmount = sales
    .filter((s) => s.paymentStatus === "paid")
    .reduce((sum, s) => sum + s.totalPrice, 0);
  const confirmedAmount = sales
    .filter((s) => s.paymentStatus === "confirmed")
    .reduce((sum, s) => sum + s.totalPrice, 0);

  if (loading) return <div className="loading">Loading payments...</div>;

  return (
    <div className="manager-payments-page">
      <div className="page-header">
        <h1>Payment Management</h1>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Pending Payments</h3>
          <p className="stat-value">${pendingAmount.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Paid (Awaiting Confirmation)</h3>
          <p className="stat-value">${paidAmount.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Confirmed by Admin</h3>
          <p className="stat-value">${confirmedAmount.toFixed(2)}</p>
        </div>
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === "pending" ? "active" : ""}`}
          onClick={() => setFilter("pending")}
        >
          Pending
        </button>
        <button
          className={`filter-tab ${filter === "paid" ? "active" : ""}`}
          onClick={() => setFilter("paid")}
        >
          Paid
        </button>
        <button
          className={`filter-tab ${filter === "confirmed" ? "active" : ""}`}
          onClick={() => setFilter("confirmed")}
        >
          Confirmed
        </button>
        <button
          className={`filter-tab ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
      </div>

      <div className="payments-list">
        {filteredSales.length === 0 ? (
          <p>No payments found.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Agent</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Product Status</th>
                <th>Payment Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale._id}>
                  <td>{new Date(sale.createdAt).toLocaleDateString()}</td>
                  <td>{sale.product?.name}</td>
                  <td>{sale.agent?.name || "N/A"}</td>
                  <td>{sale.customerName}</td>
                  <td>${sale.totalPrice.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${sale.productStatus}`}>
                      {sale.productStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${sale.paymentStatus}`}>
                      {sale.paymentStatus}
                    </span>
                  </td>
                  <td>
                    {sale.paymentStatus === "pending" && (
                      <button
                        className="btn-confirm"
                        onClick={() => handleConfirmPayment(sale._id)}
                      >
                        Confirm Payment Received
                      </button>
                    )}
                    {(sale.paymentStatus === "paid" || sale.paymentStatus === "confirmed") && (
                      <span className="confirmed-text">Confirmed</span>
                    )}
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

export default ManagerPayments;
