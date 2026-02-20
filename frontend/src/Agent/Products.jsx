import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const AgentProducts = () => {
  const [products, setProducts] = useState([]);
  const [pickedSales, setPickedSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPickModal, setShowPickModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    quantity: 1,
  });

  useEffect(() => {
    fetchProducts();
    fetchMySales();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || []);
      } else {
        setError(data.message || "Failed to fetch products");
      }
    } catch (err) {
      setError("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const fetchMySales = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sales`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        const picked = (Array.isArray(data) ? data : []).filter((s) => s.productStatus === "picked");
        setPickedSales(picked);
      }
    } catch (err) {
      console.error("Failed to fetch picked sales");
    }
  };

  const openPickModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      quantity: 1,
    });
    setShowPickModal(true);
  };

  const closePickModal = () => {
    setShowPickModal(false);
    setSelectedProduct(null);
  };

  const handlePickSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setSubmitting(true);
    setError("");

    try {
      const quantity = Number(formData.quantity || 1);
      const unitPrice = Number(selectedProduct.price || 0);

      const res = await fetch(`${API_BASE_URL}/api/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          productId: selectedProduct._id,
          quantity,
          unitPrice,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Failed to pick product");
      }

      closePickModal();
      await fetchProducts();
      await fetchMySales();
    } catch (err) {
      setError(err.message || "Failed to pick product");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading products...</div>;

  return (
    <div className="agent-products-page">
      <div className="page-header">
        <h1>Pick Products</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="table-card agent-picked-table" style={{ marginBottom: "16px" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pickedSales.map((sale) => (
              <tr key={sale._id} className="picked-row">
                <td>{new Date(sale.createdAt).toLocaleDateString()}</td>
                <td>{sale.product?.name}</td>
                <td>{sale.quantity}</td>
                <td>${Number(sale.totalPrice || 0).toFixed(2)}</td>
                <td>
                  <span className="status picked">picked</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pickedSales.length === 0 && <p style={{ padding: "12px" }}>No picked products yet.</p>}
      </div>

      <div className="products-grid agent-products-grid">
        {products.length === 0 ? (
          <p>No products available.</p>
        ) : (
          products.map((product) => (
            <div key={product._id} className="product-card">
              {product.image && <img src={product.image} alt={product.name} className="product-image" />}
              <div className="product-info">
                <h3>{product.name}</h3>
                <p>Brand: {product.brand}</p>
                <p>Color: {product.color}</p>
                <p className="price">${product.price}</p>
                <p>Stock: <strong>{product.quantity ?? 0}</strong></p>
                <button
                  className="btn-primary"
                  onClick={() => openPickModal(product)}
                  disabled={(product.quantity ?? 0) < 1}
                >
                  {(product.quantity ?? 0) < 1 ? "Out of Stock" : "Pick Product"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showPickModal && selectedProduct && (
        <div className="modal-overlay" onClick={closePickModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Pick Product</h2>
            <p>{selectedProduct.name}</p>
            <p>Unit Price: ${selectedProduct.price}</p>
            <p>Available Stock: {selectedProduct.quantity ?? 0}</p>

            <form onSubmit={handlePickSubmit}>
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={Math.max(1, Number(selectedProduct.quantity || 0))}
                  value={formData.quantity}
                  onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="primary-btn" disabled={submitting}>
                  {submitting ? "Picking..." : "Confirm Pick"}
                </button>
                <button type="button" className="secondary-btn" onClick={closePickModal}>
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

export default AgentProducts;
