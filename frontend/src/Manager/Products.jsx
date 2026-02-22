import { useState, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";


const ManagerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sellData, setSellData] = useState({
    quantity: 1,
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    notes: "",
    markSold: true,
  });
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    description: "",
    color: "",
    price: "",
    quantity: "",
    category: "",
    image: null,
  });

  useEffect(() => {
    fetchProducts();
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

  const handleChange = (e) => {
    if (e.target.type === "file") {
      const file = e.target.files?.[0] || null;
      setFormData({ ...formData, [e.target.name]: file });
      return;
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      brand: "",
      description: "",
      color: "",
      price: "",
      quantity: "",
      category: "",
      image: null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const url = editingProduct
        ? `${API_BASE_URL}/api/products/${editingProduct._id}`
        : `${API_BASE_URL}/api/products`;
      const method = editingProduct ? "PUT" : "POST";

      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("brand", formData.brand);
      payload.append("description", formData.description);
      payload.append("color", formData.color);
      payload.append("price", formData.price);
      payload.append("quantity", formData.quantity);
      payload.append("category", formData.category);
      if (formData.image) {
        payload.append("image", formData.image);
      }

      const res = await fetch(url, {
        method,
        credentials: "include",
        body: payload,
      });

      const data = await res.json();

      if (res.ok) {
        await fetchProducts();
        resetForm();
      } else {
        setError(data.message || "Failed to save product");
      }
    } catch (err) {
      setError("Failed to save product");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand,
      description: product.description,
      color: product.color,
      price: product.price,
      quantity: product.quantity ?? 0,
      category: product.category,
      image: null,
    });
    setShowForm(true);
  };

  const openSellModal = (product) => {
    setSelectedProduct(product);
    setSellData({
      quantity: 1,
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      notes: "",
      markSold: true,
    });
    setShowSellModal(true);
  };

  const closeSellModal = () => {
    setShowSellModal(false);
    setSelectedProduct(null);
  };

  const handleSellSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          productId: selectedProduct._id,
          quantity: Number(sellData.quantity || 1),
          customerName: sellData.customerName,
          customerPhone: sellData.customerPhone,
          customerAddress: sellData.customerAddress,
          notes: sellData.notes,
          markSold: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to record sale");
        return;
      }

      await fetchProducts();
      closeSellModal();
    } catch (err) {
      setError("Failed to record sale");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        fetchProducts();
      } else {
        const data = await res.json();
        setError(data.message || "Failed to delete product");
      }
    } catch (err) {
      setError("Failed to delete product");
    }
  };

  if (loading) return <div className="loading">Loading products...</div>;

  const categories = ["all", ...new Set(products.map((p) => p.category).filter(Boolean))];
  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="manager-products-page">
      <div className="page-header">
        <h1>Products</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          Add Product
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filter-tabs">
        <select
          className="filter-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === "all" ? "All Categories" : category}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingProduct ? "Edit Product" : "Add New Product"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Brand</label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Color</label>
                  <input type="text" name="color" value={formData.color} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Price</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} step="0.01" min="0" required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Quantity</label>
                  <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} min="0" required />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input type="text" name="category" value={formData.category} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Image</label>
                <input type="file" accept="image/*" name="image" onChange={handleChange} required={!editingProduct} />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingProduct ? "Update" : "Create"}
                </button>
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <p>No products found. Create your first product.</p>
        ) : (
          <div className="products-table">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Brand</th>
                  <th>Color</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id}>
                    <td>â€”</td>
                    <td>{product.name}</td>
                    <td>{product.brand}</td>
                    <td>{product.color}</td>
                    <td>${product.price}</td>
                    <td>{product.quantity ?? 0}</td>
                    <td>{product.category}</td>
                    <td>
                      <button className="btn-edit" onClick={() => handleEdit(product)}>
                        Edit
                      </button>
                      <button
                        className="btn-confirm"
                        onClick={() => openSellModal(product)}
                        disabled={(product.quantity ?? 0) < 1}
                      >
                        Sell
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(product._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showSellModal && selectedProduct && (
        <div className="modal-overlay" onClick={closeSellModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Sell Product</h2>
            <p>{selectedProduct.name}</p>
            <p>Unit Price: ${selectedProduct.price}</p>
            <p>Available Stock: {selectedProduct.quantity ?? 0}</p>

            <form onSubmit={handleSellSubmit}>
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={Math.max(1, Number(selectedProduct.quantity || 0))}
                  value={sellData.quantity}
                  onChange={(e) => setSellData((prev) => ({ ...prev, quantity: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label>Customer Name</label>
                <input
                  type="text"
                  value={sellData.customerName}
                  onChange={(e) => setSellData((prev) => ({ ...prev, customerName: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label>Customer Phone</label>
                <input
                  type="text"
                  value={sellData.customerPhone}
                  onChange={(e) => setSellData((prev) => ({ ...prev, customerPhone: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label>Customer Address</label>
                <textarea
                  rows="2"
                  value={sellData.customerAddress}
                  onChange={(e) => setSellData((prev) => ({ ...prev, customerAddress: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  rows="2"
                  value={sellData.notes}
                  onChange={(e) => setSellData((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Record Sale
                </button>
                <button type="button" className="btn-secondary" onClick={closeSellModal}>
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

export default ManagerProducts;
