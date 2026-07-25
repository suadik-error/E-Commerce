import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost } from "../lib/api.js";
import { clearCart, getCartCount, getCartTotal, readCart } from "../lib/cart.js";
import { formatCurrency } from "../lib/storefront.js";

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "";
const PAYSTACK_CURRENCY = import.meta.env.VITE_PAYSTACK_CURRENCY || "NGN";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cart] = useState(() => readCart());
  const [formData, setFormData] = useState({
    customerPhone: "",
    customerAddress: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [paystackLoaded, setPaystackLoaded] = useState(false);

  const groupedCompanies = (() => {
    return Array.from(new Set(cart.map((item) => item.companyName).filter(Boolean)));
  })();

  useEffect(() => {
    if (cart.length === 0) {
      navigate("/cart");
    }

    if (typeof window !== "undefined") {
      const existingScript = document.querySelector("script[data-paystack-script]");
      if (existingScript) {
        setPaystackLoaded(Boolean(window.PaystackPop));
        return;
      }

      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.dataset.paystackScript = "true";
      script.onload = () => setPaystackLoaded(Boolean(window.PaystackPop));
      script.onerror = () => setError("Failed to load Paystack payment library.");
      document.body.appendChild(script);
    }
  }, [cart.length, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!formData.customerPhone.trim()) {
      setError("Please provide a phone number.");
      return;
    }

    if (!formData.customerAddress.trim()) {
      setError("Please provide a delivery address.");
      return;
    }

    if (!PAYSTACK_PUBLIC_KEY) {
      setError("Paystack public key is not configured.");
      return;
    }

    if (!paystackLoaded || !window.PaystackPop) {
      setError("Paystack payment library is not loaded yet. Please refresh the page.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const orderRes = await apiPost("/api/sales/checkout", {
        items: cart.map((item) => ({ productId: item._id, quantity: item.quantity })),
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        notes: formData.notes,
        paymentMethod: "card",
      });

      const amountInKobo = Math.round(orderRes.totalAmount * 100);

      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: orderRes.customerEmail || "",
        amount: amountInKobo,
        currency: PAYSTACK_CURRENCY,
        ref: orderRes.checkoutReference,
        metadata: {
          customerName: orderRes.customerName,
          customerPhone: formData.customerPhone,
          customerAddress: formData.customerAddress,
        },
        callback: async (response) => {
          try {
            await apiPost("/api/sales/paystack/verify", {
              reference: response.reference,
              checkoutReference: orderRes.checkoutReference,
            });

            clearCart();
            setSuccess("Payment successful! Order confirmed.");
            setTimeout(() => navigate("/account", { state: { message: 'Payment successful! Order placed.' } }), 2000);
          } catch (verifyError) {
            setError(verifyError.message || "Payment verification failed after successful checkout.");
          }
        },
        onClose: () => {
          setError("Payment window closed. Your order remains pending until payment is completed.");
        },
      });

      handler.openIframe();
    } catch (requestError) {
      setError(requestError.message || "Payment failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="client-page">
      <section className="client-section client-cart-layout">
        <form className="client-card client-form" onSubmit={handleSubmit}>
          <div className="client-section-head">
            <span className="client-kicker">Secure Checkout</span>
            <h1>🔒 PCI Compliant Payment</h1>
            <p>Your card details never touch our server</p>
          </div>

          {error ? <div className="client-notice error">{error}</div> : null}
          {success ? <div className="client-notice success">{success}</div> : null}

          <fieldset>
            <label>Phone <span className="required">*</span></label>
            <input
              type="tel"
              placeholder="Phone number"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              required
            />
          </fieldset>

          <fieldset>
            <label>Delivery address <span className="required">*</span></label>
            <textarea
              placeholder="Full delivery address"
              rows="3"
              value={formData.customerAddress}
              onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
              required
            />
          </fieldset>

          <fieldset>
            <label>Order notes</label>
            <textarea
              placeholder="Special instructions"
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </fieldset>

          <fieldset className="secure-card-field">
            <label>Credit/Debit Card <span className="required">*</span> (Secure iframe)</label>
            <div className="card-container" id="card-container">
              <div id="card-frame">
                Enter card details here - this field is PCI compliant and secure.
                <br />
                <small>Demo: 4242 4242 4242 4242 | 12/26 | 123</small>
              </div>
            </div>
            <small>Our PCI DSS compliant iframe ensures card data never hits your server</small>
          </fieldset>

          <button type="submit" className="client-primary-button full-width secure-pay" disabled={loading}>
            {loading ? "🔒 Processing secure payment..." : `🔒 Pay Securely ${formatCurrency(getCartTotal(cart))}`}
          </button>
        </form>

        <aside className="client-card">
          <h2>Order Summary</h2>
          <div className="client-summary-row">
            <span>Vendors</span>
            <strong>{groupedCompanies.length}</strong>
          </div>
          <div className="client-summary-row">
            <span>Items</span>
            <strong>{getCartCount(cart)}</strong>
          </div>
          <div className="client-summary-row total-row">
            <span>Total</span>
            <strong>{formatCurrency(getCartTotal(cart))}</strong>
          </div>

          <div className="client-checkout-preview">
            {cart.map((item) => (
              <div key={item._id} className="client-summary-row compact">
                <span>{item.name} × {item.quantity}</span>
                <strong>{formatCurrency(item.price * item.quantity)}</strong>
              </div>
            ))}
          </div>

          <Link to="/cart" className="client-secondary-link full-width">
            ← Back to cart
          </Link>
        </aside>
      </section>

      <style jsx>{`
        .required { color: #ef4444; }
        .secure-card-field {
          border: 2px solid #10b981;
          border-radius: 0.5rem;
          padding: 1rem;
        }
        #card-frame {
          border: 2px dashed #10b981;
          border-radius: 0.5rem;
          padding: 2rem;
          text-align: center;
          background: #f0fdf4;
          min-height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }
        .secure-pay {
          background: linear-gradient(135deg, #10b981, #059669);
          box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.3);
        }
        @media (max-width: 768px) {
          .client-cart-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default CheckoutPage;

