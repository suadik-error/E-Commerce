import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../lib/api.js";
import { getProfile } from "../lib/auth.js";
import { formatCurrency } from "../lib/storefront.js";

const AccountPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]); 

  useEffect(() => {
    let mounted = true;

    const loadAccount = async () => {
        const [nextProfile, nextOrders, nextPayments] = await Promise.all([
          getProfile(),
          apiGet("/api/sales/mine").catch(() => []),
          apiGet("/api/payments").catch(() => []),
      ]);

      if (!mounted) return;
      setProfile(nextProfile);
      setOrders(Array.isArray(nextOrders) ? nextOrders : []);
      setPayments(Array.isArray(nextPayments) ? nextPayments : []); 
    };

    loadAccount();
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await apiPost("/api/auth/logout", {});
    } finally {
      window.dispatchEvent(new CustomEvent("auth:clear"));
      window.dispatchEvent(new Event("authChanged"));
      navigate("/login");
    }
  };

  return (
    <div className="client-page">
      <section className="client-section client-account-grid">
        <article className="client-card">
          <span className="client-kicker">Profile</span>
          <h1>{profile?.name || "Customer"}</h1>
          <p className="client-muted">{profile?.email || "No email loaded."}</p>
          <div className="client-summary-row">
            <span>Role</span>
            <strong>{profile?.role || "user"}</strong>
          </div>
          <div className="client-actions">
            <Link to="/companies" className="client-secondary-link">
              Browse companies
            </Link>
            <button type="button" className="client-primary-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </article>

  <article className="client-card">
          <span className="client-kicker">Orders</span>
          <h2>Recent storefront purchases</h2>
          {orders.length === 0 ? (
            <p className="client-muted">No storefront orders yet.</p>
          ) : (
            <div className="client-order-list">
              {orders.slice(0, 6).map((order) => (
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
                    <span className="client-order-status">{order.paymentStatus}</span>
                  </div>
                  <Link to="/tracking" className="client-secondary-button mt-2 block w-full text-center">
                    Track Delivery
                  </Link>
                </article>
              ))}
            </div>
          )}
        </article>
        <article className="client-card">
          <span className="client-kicker">Payments</span>
          <h2>Payment history</h2>
          {payments.length === 0 ? (
            <p className="client-muted">No payments yet.</p>
          ) : (
            <div className="client-order-list">
              {payments.slice(0, 6).map((payment) => (
                <article key={payment._id} className="client-order-card">
                  <div className="client-summary-row">
                    <strong>{formatCurrency(payment.amount)}</strong>
                    <span>{payment.status}</span>
                  </div>
                  <p className="client-muted">
                    {payment.description || "Card payment"} • {new Date(payment.date).toLocaleDateString()}
                  </p>
                </article>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  );
};

export default AccountPage;
