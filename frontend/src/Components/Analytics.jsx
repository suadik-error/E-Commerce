import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const formatMoney = (value) =>
  `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const buildMonthlySeries = (sales) => {
  const now = new Date();
  const months = [];

  for (let index = 5; index >= 0; index -= 1) {
    const current = new Date(now.getFullYear(), now.getMonth() - index, 1);
    months.push({
      key: `${current.getFullYear()}-${current.getMonth()}`,
      label: current.toLocaleString("en-US", { month: "short" }),
      value: 0,
    });
  }

  sales.forEach((sale) => {
    const createdAt = new Date(sale.soldAt || sale.createdAt);
    if (Number.isNaN(createdAt.getTime())) return;

    const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
    const targetMonth = months.find((month) => month.key === key);
    if (!targetMonth) return;

    targetMonth.value += Number(sale.totalPrice || 0);
  });

  return months;
};

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

    fetchAnalytics();
  }, []);

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

  const monthlyRevenue = useMemo(() => buildMonthlySeries(sales), [sales]);
  const peakRevenue = Math.max(...monthlyRevenue.map((item) => item.value), 1);

  if (loading) return <p>Loading analytics...</p>;

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>Analytics</h1>
        <p>Live sales, revenue, and product performance based on current records.</p>
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
          <p className="stat-value">{formatMoney(stats.totalRevenue)}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Payments</h3>
          <p className="stat-value">{stats.pendingPayments}</p>
        </div>
      </div>

      <div className="admin-bottom-grid">
        <section className="recent-section admin-table-card">
          <div className="section-header">
            <div>
              <h2>Monthly revenue</h2>
              <p>Live revenue totals built from current sales records.</p>
            </div>
          </div>

          <div className="analytics-bars">
            {monthlyRevenue.map((item) => (
              <div key={item.key} className="analytics-bar-column">
                <span>{item.label}</span>
                <div className="analytics-bar-track">
                  <div
                    className="analytics-bar-fill"
                    style={{ height: `${Math.max((item.value / peakRevenue) * 100, item.value > 0 ? 12 : 0)}%` }}
                  />
                </div>
                <strong>{formatMoney(item.value)}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="recent-section admin-table-card">
          <div className="section-header">
            <div>
              <h2>Top products</h2>
              <p>Highest-performing products based on current sales and revenue.</p>
            </div>
          </div>

          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Units Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((item) => (
                  <tr key={item.name}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{formatMoney(item.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {topProducts.length === 0 && <p style={{ padding: "12px" }}>No analytics data yet</p>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Analytics;
