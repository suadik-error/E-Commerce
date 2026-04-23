import { useEffect, useMemo, useState } from "react";
import { useApiCall } from "../hooks/useApiCall"; // Assume similar hook or use fetch
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const OrderReceive = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const fetchPendingOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/sales?deliveryStatus=pending`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch pending delivery orders");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDelivered = async (orderId) => {
    if (updating[orderId]) return;
    setUpdating(prev => ({ ...prev, [orderId]: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/sales/${orderId}/delivery-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryStatus: "delivered" }),
        credentials: "include",
      });
      if (res.ok) {
        fetchPendingOrders();
      }
    } catch (error) {
      console.error("Failed to update delivery status");
    } finally {
      setUpdating(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const filteredOrders = useMemo(() => orders.filter(o => o.deliveryStatus === "pending"), [orders]);

  if (loading) return <div className="page-loading">Loading pending deliveries...</div>;

  return (
    <div className="order-receive-page">
      <div className="page-header">
        <h1>Receive Orders for Delivery</h1>
        <p>Review customer orders ready for delivery confirmation. Customer contact details provided.</p>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order._id}>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>{order.product?.name || "N/A"}</td>
                <td>{order.customerName}</td>
                <td>{order.customerPhone || "N/A"}</td>
                <td>{order.customerAddress || "N/A"}</td>
                <td>${order.totalPrice?.toFixed(2) || 0}</td>
                <td>
                  <span className={`status ${(order.paymentStatus || "").toLowerCase()}`}>
                    {order.paymentStatus || "unknown"}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => handleMarkDelivered(order._id)}
                    disabled={updating[order._id]}
                  >
                    {updating[order._id] ? "Updating..." : "Mark Delivered"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <p style={{ padding: "12px", textAlign: "center" }}>
            No pending delivery orders. All orders up to date.
          </p>
        )}
      </div>
    </div>
  );
};

export default OrderReceive;

