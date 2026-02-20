import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const Analytics = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    totalOrders: 0,
  });
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [statsRes, salesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/sales/stats`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/api/sales`, { credentials: "include" }),
      ]);

      const statsData = await statsRes.json();
      const salesData = await salesRes.json();

      if (statsRes.ok) setStats(statsData);
      if (salesRes.ok) setSales(Array.isArray(salesData) ? salesData : []);
    } catch (error) {
      console.error("Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  const topProducts = useMemo(() => {
    const map = new Map();
    for (const sale of sales) {
      const name = sale.product?.name || "Unknown";
      const current = map.get(name) || { quantity: 0, revenue: 0 };
      current.quantity += Number(sale.quantity || 0);
      current.revenue += Number(sale.totalPrice || 0);
      map.set(name, current);
    }
    return [...map.entries()]
      .map(([name, value]) => ({ name, ...value }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [sales]);

  if (loading) return <p>Loading analytics...</p>;

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>Analytics</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p className="stat-value">{stats.totalOrders}</p>
        </div>
        <div className="stat-card">
          <h3>Completed Sales</h3>
          <p className="stat-value">{stats.totalSales}</p>
        </div>
        <div className="stat-card">
          <h3>Confirmed Revenue</h3>
          <p className="stat-value">${Number(stats.totalRevenue || 0).toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Payments</h3>
          <p className="stat-value">{stats.pendingPayments}</p>
        </div>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Top Product</th>
              <th>Units Sold</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((item) => (
              <tr key={item.name}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>${item.revenue.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {topProducts.length === 0 && <p style={{ padding: "12px" }}>No analytics data yet</p>}
      </div>
    </div>
  );
};

export default Analytics;
