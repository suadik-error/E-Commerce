import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/sales`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter((order) => (order.productStatus || "").toLowerCase() === statusFilter);
  }, [orders, statusFilter]);

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1>Orders</h1>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="picked">Picked</option>
          <option value="sold">Sold</option>
          <option value="returned">Returned</option>
        </select>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Customer</th>
              <th>Qty</th>
              <th>Total</th>
              <th>Order Status</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order._id}>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>{order.product?.name || "N/A"}</td>
                <td>{order.customerName || "N/A"}</td>
                <td>{order.quantity}</td>
                <td>${order.totalPrice}</td>
                <td>
                  <span className={`status ${(order.productStatus || "").toLowerCase()}`}>
                    {order.productStatus || "unknown"}
                  </span>
                </td>
                <td>
                  <span className={`status ${(order.paymentStatus || "").toLowerCase()}`}>
                    {order.paymentStatus || "unknown"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && <p style={{ padding: "12px" }}>No orders found</p>}
      </div>
    </div>
  );
};

export default Orders;
