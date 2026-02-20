import { useState, useEffect } from "react";

const AgentSales = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("all");
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [sellQuantity, setSellQuantity] = useState(1);

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

  const openSellModal = (sale) => {
    setSelectedSale(sale);
    setSellQuantity(1);
    setShowSellModal(true);
  };

  const closeSellModal = () => {
    setShowSellModal(false);
    setSelectedSale(null);
    setSellQuantity(1);
  };

  const handleMarkSold = async (saleId, quantityToSell) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sales/${saleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productStatus: "sold", soldQuantity: quantityToSell }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Product quantity marked as sold successfully");
        fetchSales();
        closeSellModal();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to mark as sold");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err) {
      setError("Failed to mark as sold");
      setTimeout(() => setError(""), 3000);
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
        setSuccess("Payment submitted to manager. Admin will confirm final payment.");
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

  const handleReturnProduct = async (saleId) => {
    if (!window.confirm("Are you sure you want to return this product?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/sales/${saleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productStatus: "returned" }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Product returned successfully");
        fetchSales();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to return product");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err) {
      setError("Failed to return product");
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
    .filter((s) => s.paymentStatus === "confirmed")
    .reduce((sum, s) => sum + s.totalPrice, 0);

  if (loading) return <div className="loading">Loading sales...</div>;

  return (
    <div className="agent-sales-page">
      <div className="page-header">
        <h1>My Sales</h1>
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
                          className="btn-sold"
                          onClick={() => openSellModal(sale)}
                        >
                          Sell Quantity
                        </button>
                        <button
                          className="btn-return"
                          onClick={() => handleReturnProduct(sale._id)}
                        >
                          Return
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
                    {sale.productStatus === "returned" && (
                      <span className="returned-text">Returned</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showSellModal && selectedSale && (
        <div className="modal-overlay" onClick={closeSellModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Sell Quantity</h2>
            <p><strong>Product:</strong> {selectedSale.product?.name}</p>
            <p><strong>Picked Quantity:</strong> {selectedSale.quantity}</p>

            <div className="form-group">
              <label>Quantity to Sell</label>
              <input
                type="number"
                min="1"
                max={Math.max(1, Number(selectedSale.quantity || 0))}
                value={sellQuantity}
                onChange={(e) => setSellQuantity(Number(e.target.value || 1))}
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={() => handleMarkSold(selectedSale._id, sellQuantity)}
              >
                Confirm Sell
              </button>
              <button type="button" className="btn-secondary" onClick={closeSellModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentSales;
