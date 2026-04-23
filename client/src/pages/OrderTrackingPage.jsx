import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../lib/api.js";
import { getProfile } from "../lib/auth.js";
import { formatCurrency } from "../lib/storefront.js";

const OrderTrackingPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    let mounted = true;

    const loadOrders = async () => {
      try {
        const nextProfile = await getProfile();
        if (!mounted) return;
        setProfile(nextProfile);

        if (!nextProfile) {
          navigate("/login");
          return;
        }

        const orderData = await apiGet("/api/sales/mine");
        setOrders(Array.isArray(orderData) ? orderData : []);
      } catch (error) {
        console.error("Failed to load orders:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadOrders();
    return () => { mounted = false; };
  }, [navigate]);

  const handleMarkReceived = async (orderId) => {
    if (updating[orderId]) return;
    
    setUpdating(prev => ({ ...prev, [orderId]: true }));
    try {
      await apiPost(`/api/sales/${orderId}/delivery-status`, { deliveryStatus: "received" });
      
      // Refresh orders
      const orderData = await apiGet("/api/sales/mine");
      setOrders(Array.isArray(orderData) ? orderData : []);
    } catch (error) {
      console.error("Failed to mark received:", error);
      alert("Failed to mark as received. Please try again.");
    } finally {
      setUpdating(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-gray-100 text-gray-800",
      shipped: "bg-blue-100 text-blue-800",
      delivered: "bg-green-100 text-green-800",
      received: "bg-emerald-100 text-emerald-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return `client-order-status ${badges[status] || "bg-gray-100 text-gray-800"}`;
  };

  if (loading) {
    return <div className="client-empty-state">Loading your orders...</div>;
  }

  return (
    <div className="client-page">
      <section className="client-section">
        <article className="client-card">
          <span className="client-kicker">Tracking</span>
          <h1>Order Tracking</h1>
          <p className="client-muted">
            Track delivery status of your recent purchases. Confirm receipt when your order arrives.
          </p>
          <Link to="/account" className="client-secondary-link">← Back to Account</Link>
        </article>
      </section>

      {orders.length === 0 ? (
        <section className="client-section">
          <div className="client-empty-state">
            <h2>No orders to track</h2>
            <p>Place your first order from any storefront to start tracking.</p>
            <Link to="/companies" className="client-primary-button">Browse Companies</Link>
          </div>
        </section>
      ) : (
        <section className="client-section">
          <div className="client-order-list">
            {orders.map((order) => (
              <article key={order._id} className="client-order-card">
                <div className="client-summary-row">
                  <strong>{order.product?.name || "Product"}</strong>
                  <span>{formatCurrency(order.totalPrice)}</span>
                </div>
                <p className="client-muted">
                  {order.storefrontCompany?.companyName || "Company"} • Ref {order.checkoutReference}
                </p>
                <div className="client-summary-row compact">
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  <span className={getStatusBadge(order.paymentStatus)}>
                    Payment: {order.paymentStatus}
                  </span>
                  <span className={getStatusBadge(order.deliveryStatus)}>
                    Delivery: {order.deliveryStatus}
                  </span>
                </div>
                {order.deliveryStatus === "delivered" && (
                  <button 
                    className="client-primary-button mt-4"
                    onClick={() => handleMarkReceived(order._id)}
                    disabled={updating[order._id]}
                  >
                    {updating[order._id] ? "Confirming..." : "Mark as Received"}
                  </button>
                )}
                {order.deliveryStatus === "received" && (
                  <div className="client-success mt-4 p-3 rounded bg-emerald-50 text-emerald-800">
                    ✓ Product received confirmed
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default OrderTrackingPage;

