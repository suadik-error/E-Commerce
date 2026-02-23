import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const formatDateTime = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString();
};

const getSellerLabel = (sale) => {
  if (sale?.agent?.name) return `Agent: ${sale.agent.name}`;
  if (sale?.manager?.name) return `Manager: ${sale.manager.name}`;
  return "N/A";
};

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalManagers: 0,
    totalAgents: 0,
    totalSales: 0,
    totalRevenue: 0,
    pendingPayments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentSales, setRecentSales] = useState([]);
  const [recentManagers, setRecentManagers] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch managers
      const managersRes = await fetch(`${API_BASE_URL}/api/managers`, {
        credentials: "include",
      });
      const managersData = await managersRes.json();

      // Fetch agents
      const agentsRes = await fetch(`${API_BASE_URL}/api/agents`, {
        credentials: "include",
      });
      const agentsData = await agentsRes.json();

      // Fetch sales
      const salesRes = await fetch(`${API_BASE_URL}/api/sales`, {
        credentials: "include",
      });
      const salesData = await salesRes.json();

      if (managersRes.ok && agentsRes.ok && salesRes.ok) {
        const managers = managersData;
        const agents = agentsData;
        const sales = salesData;

        const totalRevenue = sales
          .filter((s) => s.paymentStatus === "confirmed")
          .reduce((sum, s) => sum + s.totalPrice, 0);

        const pendingPayments = sales.filter(
          (s) => s.paymentStatus === "pending"
        ).length;

        setStats({
          totalManagers: managers.length,
          totalAgents: agents.length,
          totalSales: sales.filter((s) => s.productStatus === "sold").length,
          totalRevenue,
          pendingPayments,
        });

        // Get recent sales (last 5)
        setRecentSales(sales.slice(0, 5));

        // Get recent managers (last 5)
        setRecentManagers(managers.slice(0, 5));
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="admin-overview-page">
      <div className="page-header">
        <h1>Dashboard Overview</h1>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Managers</h3>
          <p className="stat-value">{stats.totalManagers}</p>
          <Link to="/dashboard/managers" className="stat-link">
            View Managers
          </Link>
        </div>
        <div className="stat-card">
          <h3>Total Agents</h3>
          <p className="stat-value">{stats.totalAgents}</p>
          <Link to="/dashboard/agents" className="stat-link">
            View Agents
          </Link>
        </div>
        <div className="stat-card">
          <h3>Total Sales</h3>
          <p className="stat-value">{stats.totalSales}</p>
          <Link to="/dashboard/sales" className="stat-link">
            View Sales
          </Link>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-value">${stats.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Payments</h3>
          <p className="stat-value">{stats.pendingPayments}</p>
          <Link to="/dashboard/payments" className="stat-link">
            Confirm Payments
          </Link>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="recent-section">
        <div className="section-header">
          <h2>Recent Sales</h2>
          <Link to="/dashboard/payments" className="view-all-link">
            View All
          </Link>
        </div>
        {recentSales.length === 0 ? (
          <p>No recent sales</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Picked At</th>
                <th>Sold At</th>
                <th>Product</th>
                <th>Seller</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map((sale) => (
                <tr key={sale._id}>
                  <td>{formatDateTime(sale.createdAt)}</td>
                  <td>{formatDateTime(sale.soldAt)}</td>
                  <td>{sale.product?.name}</td>
                  <td>{getSellerLabel(sale)}</td>
                  <td>{sale.customerName}</td>
                  <td>${Number(sale.totalPrice || 0).toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${sale.paymentStatus}`}>
                      {sale.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Recent Managers */}
      <div className="recent-section">
        <div className="section-header">
          <h2>Recent Managers</h2>
          <Link to="/dashboard/managers" className="view-all-link">
            View All
          </Link>
        </div>
        {recentManagers.length === 0 ? (
          <p>No managers added yet</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentManagers.map((manager) => (
                <tr key={manager._id}>
                  <td>{manager.name}</td>
                  <td>{manager.email}</td>
                  <td>{manager.phone}</td>
                  <td>{manager.location}</td>
                  <td>
                    <span
                      className={`status-badge ${manager.isActive ? "active" : "inactive"}`}
                    >
                      {manager.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminOverview;
