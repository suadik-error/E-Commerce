import { useState, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const formatDateTime = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString();
};

const getSellerLabel = (sale) => {
  if (sale?.agent?.name) return `Agent: ${sale.agent.name}`;
  if (sale?.manager?.name) return `Manager: ${sale.manager.name}`;
  return "N/A";
};

const PaymentConfirmation = () => {
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
      const res = await fetch(`${API_BASE_URL}/api/sales/${saleId}/confirm-payment`, {
        method: "PUT",
        credentials: "include",
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
    if (filter === "confirmed") return sale.paymentStatus === "confirmed";
    return true;
  });

  const totalPending = sales.filter((s) => s.paymentStatus === "pending").length;
  const totalConfirmed = sales.filter((s) => s.paymentStatus === "confirmed").length;
  const totalPendingAmount = sales
    .filter((s) => s.paymentStatus === "pending")
    .reduce((sum, s) => sum + s.totalPrice, 0);
  const totalConfirmedAmount = sales
    .filter((s) => s.paymentStatus === "confirmed")
    .reduce((sum, s) => sum + s.totalPrice, 0);

  if (loading) return <div className="loading">Loading payments...</div>;

  return (
    <div className="payment-confirmation-page">
      <div className="page-header">
        <h1>Payment Confirmation</h1>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Pending Payments</h3>
          <p className="stat-value">{totalPending}</p>
          <p className="stat-amount">${totalPendingAmount.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Confirmed Payments</h3>
          <p className="stat-value">{totalConfirmed}</p>
          <p className="stat-amount">${totalConfirmedAmount.toFixed(2)}</p>
        </div>
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === "pending" ? "active" : ""}`}
          onClick={() => setFilter("pending")}
        >
          Pending ({totalPending})
        </button>
        <button
          className={`filter-tab ${filter === "confirmed" ? "active" : ""}`}
          onClick={() => setFilter("confirmed")}
        >
          Confirmed ({totalConfirmed})
        </button>
        <button
          className={`filter-tab ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
      </div>

      <div className="sales-list">
        {filteredSales.length === 0 ? (
          <p>No payments found.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Picked At</th>
                <th>Sold At</th>
                <th>Product</th>
                <th>Seller</th>
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
                  <td>{formatDateTime(sale.createdAt)}</td>
                  <td>{formatDateTime(sale.soldAt)}</td>
                  <td>{sale.product?.name}</td>
                  <td>{getSellerLabel(sale)}</td>
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
                        Confirm Payment
                      </button>
                    )}
                    {sale.paymentStatus === "confirmed" && (
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

export default PaymentConfirmation;
