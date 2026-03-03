import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const DashboardHome = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/stats`, {
        withCredentials: true,
      });
      setStats(res.data);
    } catch (error) {
      console.error("Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="dashboard-home">
      <h1>Dashboard Overview</h1>
      <p className="subtitle">Monitor your platform performance</p>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">{stats.totalUsers.toLocaleString()}</p>
          <span className="stat-label">Active users</span>
        </div>

        <div className="stat-card">
          <h3>Products</h3>
          <p className="stat-number">{stats.totalProducts.toLocaleString()}</p>
          <span className="stat-label">In store</span>
        </div>

        <div className="stat-card">
          <h3>Orders</h3>
          <p className="stat-number">{stats.totalOrders.toLocaleString()}</p>
          <span className="stat-label">This month</span>
        </div>

        <div className="stat-card highlight">
          <h3>Revenue</h3>
          <p className="stat-number">₵{stats.totalRevenue.toLocaleString()}</p>
          <span className="stat-label">Total earned</span>
        </div>
      </div>

      <div className="activity-card">
        <h2>Recent Activity</h2>

        <ul>
          <li>🟢 New user registered</li>
          <li>📦 Product "Samsung A14" added</li>
          <li>💳 Payment received ₵1,200</li>
          <li>👤 Manager account approved</li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardHome;
