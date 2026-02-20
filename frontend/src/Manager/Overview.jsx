import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const ManagerOverview = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    totalOrders: 0,
  });
  const [inventory, setInventory] = useState({
    totalProducts: 0,
    totalUnits: 0,
    lowStock: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [statsRes, productsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/sales/stats`, {
          credentials: "include",
        }),
        fetch(`${API_BASE_URL}/api/products`, {
          credentials: "include",
        }),
      ]);

      const statsData = await statsRes.json();
      const productsData = await productsRes.json();

      if (statsRes.ok) setStats(statsData);

      if (productsRes.ok) {
        const products = Array.isArray(productsData?.products) ? productsData.products : [];
        const totalUnits = products.reduce((sum, p) => sum + Number(p.quantity || 0), 0);
        const lowStock = products.filter((p) => Number(p.quantity || 0) > 0 && Number(p.quantity || 0) <= 5).length;
        setInventory({
          totalProducts: products.length,
          totalUnits,
          lowStock,
        });
      }
    } catch (error) {
      console.error("Failed to fetch manager stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading overview...</p>;

  return (
    <div className="manager-overview-page">
      <div className="page-header">
        <h1>Manager Overview</h1>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p className="stat-value">{stats.totalOrders}</p>
        </div>
        <div className="stat-card">
          <h3>Sales Completed</h3>
          <p className="stat-value">{stats.totalSales}</p>
        </div>
        <div className="stat-card">
          <h3>Revenue</h3>
          <p className="stat-value">${Number(stats.totalRevenue || 0).toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Payments</h3>
          <p className="stat-value">{stats.pendingPayments}</p>
        </div>
        <div className="stat-card">
          <h3>Inventory Products</h3>
          <p className="stat-value">{inventory.totalProducts}</p>
        </div>
        <div className="stat-card">
          <h3>Inventory Units</h3>
          <p className="stat-value">{inventory.totalUnits}</p>
        </div>
        <div className="stat-card">
          <h3>Low Stock Items</h3>
          <p className="stat-value">{inventory.lowStock}</p>
        </div>
      </div>
    </div>
  );
};

export default ManagerOverview;
