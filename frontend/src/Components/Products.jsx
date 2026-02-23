import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";



const initialForm = {
  name: "",
  brand: "",
  description: "",
  color: "",
  price: "",
  quantity: "",
  image: null,
  category: "",
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(initialForm);
  const [sellData, setSellData] = useState({
    quantity: 1,
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    notes: "",
    markSold: true,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products`, {
        withCredentials: true,
      });
      setProducts(res.data.products || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setSelectedProductId(null);
    setShowCreateModal(false);
    setShowEditModal(false);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (e.target.type === "file") {
      const file = e.target.files?.[0] || null;
      setFormData((prev) => ({ ...prev, [name]: file }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
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

      await axios.post(`${API_BASE_URL}/api/products`, payload, {
        withCredentials: true,
      });
      resetForm();
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (product) => {
    setSelectedProductId(product._id);
    setFormData({
      name: product.name || "",
      brand: product.brand || "",
      description: product.description || "",
      color: product.color || "",
      price: product.price || "",
      quantity: product.quantity ?? "",
      image: null,
      category: product.category || "",
    });
    setShowEditModal(true);
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
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

      await axios.put(`${API_BASE_URL}/api/products/${selectedProductId}`, payload, {
        withCredentials: true,
      });
      resetForm();
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    const confirmed = window.confirm("Delete this product?");
    if (!confirmed) return;

    setError("");
    try {
      await axios.delete(`${API_BASE_URL}/api/products/${productId}`, {
        withCredentials: true,
      });
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete product");
    }
  };

  const handleSellSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/sales`,
        {
          productId: selectedProduct._id,
          quantity: Number(sellData.quantity || 1),
          customerName: sellData.customerName,
          customerPhone: sellData.customerPhone,
          customerAddress: sellData.customerAddress,
          notes: sellData.notes,
          markSold: sellData.markSold,
        },
        { withCredentials: true }
      );

      if (res.status >= 200 && res.status < 300) {
        await fetchProducts();
        closeSellModal();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record sale");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading products...</p>;

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Products Management</h1>
        <button className="primary-btn" onClick={() => setShowCreateModal(true)}>
          + Add Product
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Brand</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>{product.name}</td>
                <td>{product.brand}</td>
                <td>${product.price}</td>
                <td>{product.quantity ?? 0}</td>
                <td>{product.category}</td>
                <td className="actions">
                  <button className="edit" onClick={() => openEditModal(product)}>
                    Edit
                  </button>
                  <button className="danger" onClick={() => handleDeleteProduct(product._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && <p>No products found</p>}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Product</h2>
              <button className="close-btn" onClick={resetForm}>
                x
              </button>
            </div>
            <form onSubmit={handleCreateProduct}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Brand</label>
                <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Color</label>
                <input type="text" name="color" value={formData.color} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  min="0"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Image</label>
                <input type="file" accept="image/*" name="image" onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input type="text" name="category" value={formData.category} onChange={handleInputChange} required />
              </div>
              <div className="form-actions">
                <button type="button" className="secondary-btn" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Product</h2>
              <button className="close-btn" onClick={resetForm}>
                x
              </button>
            </div>
            <form onSubmit={handleEditProduct}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Brand</label>
                <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Color</label>
                <input type="text" name="color" value={formData.color} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  min="0"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Image</label>
                <input type="file" accept="image/*" name="image" onChange={handleInputChange} required={!selectedProductId} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input type="text" name="category" value={formData.category} onChange={handleInputChange} required />
              </div>
              <div className="form-actions">
                <button type="button" className="secondary-btn" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSellModal && selectedProduct && (
        <div className="modal-overlay" onClick={closeSellModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Sell Product</h2>
              <button className="close-btn" onClick={closeSellModal}>
                x
              </button>
            </div>
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
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={sellData.markSold}
                    onChange={(e) => setSellData((prev) => ({ ...prev, markSold: e.target.checked }))}
                  />
                  Mark as Sold and Paid
                </label>
              </div>
              <div className="form-actions">
                <button type="button" className="secondary-btn" onClick={closeSellModal}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={submitting}>
                  {submitting ? "Recording..." : "Record Sale"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
