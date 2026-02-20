import { useState, useEffect } from "react";

const ManagerSales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchSales();
  }, [filter]);

  const fetchSales = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/sales", {
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

  const handleUpdateStatus = async (saleId, productStatus) => {
    try {
      const res = await fetch(`http://localhost:4000/api/sales/${saleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productStatus }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(`Product status updated to ${productStatus}`);
        fetchSales();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to update status");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err) {
      setError("Failed to update status");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleConfirmPayment = async (saleId) => {
    try {
      const res = await fetch(`http://localhost:4000/api/sales/${saleId}`, {
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
    if (filter === "all") return true;
    if (filter === "picked") return sale.productStatus === "picked";
    if (filter === "sold") return sale.productStatus === "sold";
    if (filter === "returned") return sale.productStatus === "returned";
    return true;
  });

  const totalSales = sales.filter((s) => s.productStatus === "sold").length;
  const totalRevenue = sales
    .filter((s) => s.paymentStatus === "paid" || s.paymentStatus === "confirmed")
    .reduce((sum, s) => sum + s.totalPrice, 0);
  const pendingPayments = sales.filter((s) => s.paymentStatus === "pending").length;

  if (loading) return <div className="loading">Loading sales...</div>;

  return (
    <div className="manager-sales-page">
      <div className="page-header">
        <h1>Sales</h1>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Sales</h3>
          <p className="stat-value">{totalSales}</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-value">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Payments</h3>
          <p className="stat-value">{pendingPayments}</p>
        </div>
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={`filter-tab ${filter === "picked" ? "active" : ""}`}
          onClick={() => setFilter("picked")}
        >
          Picked
        </button>
        <button
          className={`filter-tab ${filter === "sold" ? "active" : ""}`}
          onClick={() => setFilter("sold")}
        >
          Sold
        </button>
        <button
          className={`filter-tab ${filter === "returned" ? "active" : ""}`}
          onClick={() => setFilter("returned")}
        >
          Returned
        </button>
      </div>

      <div className="sales-list">
        {filteredSales.length === 0 ? (
          <p>No sales found.</p>
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
                    {sale.productStatus === "picked" && (
                      <>
                        <button
                          className="btn-confirm"
                          onClick={() => handleUpdateStatus(sale._id, "sold")}
                        >
                          Mark Sold
                        </button>
                        <button
                          className="btn-return"
                          onClick={() => handleUpdateStatus(sale._id, "returned")}
                        >
                          Mark Returned
                        </button>
                      </>
                    )}
                    {sale.productStatus === "sold" && sale.paymentStatus === "pending" && (
                      <button
                        className="btn-confirm"
                        onClick={() => handleConfirmPayment(sale._id)}
                      >
                        Confirm Payment
                      </button>
                    )}
                    {sale.paymentStatus === "paid" && (
                      <span className="confirmed-text">Payment Received</span>
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

export default ManagerSales;
