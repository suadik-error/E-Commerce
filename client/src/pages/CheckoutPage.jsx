import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost } from "../lib/api.js";
import { clearCart, getCartCount, getCartTotal, readCart } from "../lib/cart.js";
import { formatCurrency } from "../lib/storefront.js";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(() => readCart());
  const [formData, setFormData] = useState({
    customerPhone: "",
    customerAddress: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const groupedCompanies = useMemo(() => {
    return Array.from(new Set(cart.map((item) => item.companyName).filter(Boolean)));
  }, [cart]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await apiPost("/api/sales/checkout", {
        items: cart.map((item) => ({ productId: item._id, quantity: item.quantity })),
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        notes: formData.notes,
      });

      setCart(clearCart());
      navigate("/account");
    } catch (requestError) {
      setError(requestError.message || "Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="client-page">
      <section className="client-section client-cart-layout">
        <form className="client-card client-form" onSubmit={handleSubmit}>
          <div className="client-section-head">
            <span className="client-kicker">Checkout</span>
            <h1>Complete your order</h1>
          </div>

          {error ? <div className="client-notice error">{error}</div> : null}

          <input
            type="tel"
            placeholder="Phone number"
            value={formData.customerPhone}
            onChange={(event) => setFormData({ ...formData, customerPhone: event.target.value })}
          />
          <input
            type="text"
            placeholder="Delivery address"
            value={formData.customerAddress}
            onChange={(event) =>
              setFormData({ ...formData, customerAddress: event.target.value })
            }
            required
          />
          <textarea
            placeholder="Order notes or delivery instructions"
            rows={5}
            value={formData.notes}
            onChange={(event) => setFormData({ ...formData, notes: event.target.value })}
          />

          <button type="submit" className="client-primary-button" disabled={loading}>
            {loading ? "Placing order..." : "Place order"}
          </button>
        </form>

        <aside className="client-card">
          <h2>Order Review</h2>
          <div className="client-summary-row">
            <span>Companies</span>
            <strong>{groupedCompanies.length}</strong>
          </div>
          <div className="client-summary-row">
            <span>Items</span>
            <strong>{getCartCount(cart)}</strong>
          </div>
          <div className="client-summary-row">
            <span>Total</span>
            <strong>{formatCurrency(getCartTotal(cart))}</strong>
          </div>

          <div className="client-checkout-preview">
            {cart.map((item) => (
              <div key={item._id} className="client-summary-row compact">
                <span>
                  {item.name} x {item.quantity}
                </span>
                <strong>{formatCurrency(item.price * item.quantity)}</strong>
              </div>
            ))}
          </div>

          <Link to="/cart" className="client-secondary-link full-width">
            Back to cart
          </Link>
        </aside>
      </section>
    </div>
  );
};

export default CheckoutPage;
