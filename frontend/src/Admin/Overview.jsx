import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  CircleDollarSign,
  PackageCheck,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const formatDateTime = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString();
};

const formatMoney = (value) => `$${Number(value || 0).toLocaleString(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;

const getSellerLabel = (sale) => {
  if (sale?.agent?.name) return `Agent: ${sale.agent.name}`;
  if (sale?.manager?.name) return `Manager: ${sale.manager.name}`;
  return "N/A";
};

const buildMonthlyRevenueSeries = (sales) => {
  const now = new Date();
  const months = [];

  for (let index = 5; index >= 0; index -= 1) {
    const current = new Date(now.getFullYear(), now.getMonth() - index, 1);
    months.push({
      key: `${current.getFullYear()}-${current.getMonth()}`,
      label: current.toLocaleString("en-US", { month: "short" }),
      revenue: 0,
      orders: 0,
    });
  }

  sales.forEach((sale) => {
    const createdAt = new Date(sale.soldAt || sale.createdAt);
    if (Number.isNaN(createdAt.getTime())) return;

    const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
    const month = months.find((entry) => entry.key === key);
    if (!month) return;

    month.orders += 1;
    if (sale.paymentStatus === "confirmed") {
      month.revenue += Number(sale.totalPrice || 0);
    }
  });

  return months;
};

const buildRevenuePath = (values) => {
  if (!values.length) return "";
  const maxValue = Math.max(...values, 1);

  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 100;
      const y = 100 - (value / maxValue) * 100;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
};

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalManagers: 0,
    totalAgents: 0,
    totalSales: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    confirmedPayments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentSales, setRecentSales] = useState([]);
  const [recentManagers, setRecentManagers] = useState([]);
  const [salesSeries, setSalesSeries] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [managersRes, agentsRes, salesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/managers`, { credentials: "include" }),
          fetch(`${API_BASE_URL}/api/agents`, { credentials: "include" }),
          fetch(`${API_BASE_URL}/api/sales`, { credentials: "include" }),
        ]);

        const [managersData, agentsData, salesData] = await Promise.all([
          managersRes.json(),
          agentsRes.json(),
          salesRes.json(),
        ]);

        if (managersRes.ok && agentsRes.ok && salesRes.ok) {
          const managers = Array.isArray(managersData) ? managersData : [];
          const agents = Array.isArray(agentsData) ? agentsData : [];
          const sales = Array.isArray(salesData) ? salesData : [];
          const confirmedPayments = sales.filter(
            (sale) => sale.paymentStatus === "confirmed"
          ).length;
          const totalRevenue = sales
            .filter((sale) => sale.paymentStatus === "confirmed")
            .reduce((sum, sale) => sum + Number(sale.totalPrice || 0), 0);
          const pendingPayments = sales.filter(
            (sale) => sale.paymentStatus === "pending"
          ).length;

          setStats({
            totalManagers: managers.length,
            totalAgents: agents.length,
            totalSales: sales.filter((sale) => sale.productStatus === "sold").length,
            totalRevenue,
            pendingPayments,
            confirmedPayments,
          });

          setSalesSeries(buildMonthlyRevenueSeries(sales));
          setRecentSales(sales.slice(0, 6));
          setRecentManagers(managers.slice(0, 5));
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const targetProgress = useMemo(() => {
    const totalTrackedPayments = stats.confirmedPayments + stats.pendingPayments;
    if (!totalTrackedPayments) return 0;
    return Math.round((stats.confirmedPayments / totalTrackedPayments) * 100);
  }, [stats.confirmedPayments, stats.pendingPayments]);

  const revenueValues = salesSeries.map((entry) => entry.revenue);
  const revenuePath = buildRevenuePath(revenueValues);
  const highestMonthRevenue = Math.max(...revenueValues, 0);

  const statCards = [
    {
      title: "Managers",
      value: stats.totalManagers,
      icon: BriefcaseBusiness,
      accent: "accent-blue",
      link: "/dashboard/managers",
      action: "View managers",
    },
    {
      title: "Agents",
      value: stats.totalAgents,
      icon: UsersRound,
      accent: "accent-violet",
      link: "/dashboard/agents",
      action: "Review agents",
    },
    {
      title: "Confirmed Revenue",
      value: formatMoney(stats.totalRevenue),
      icon: BadgeDollarSign,
      accent: "accent-green",
      link: "/dashboard/payments",
      action: "See payments",
    },
    {
      title: "Pending Payments",
      value: stats.pendingPayments,
      icon: CircleDollarSign,
      accent: "accent-amber",
      link: "/dashboard/payments",
      action: "Confirm now",
    },
  ];

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="admin-overview-page admin-tail-overview">
      <div className="admin-page-intro">
        <div>
          <p className="admin-eyebrow">Admin Dashboard</p>
          <h1>Business control center</h1>
          <span>
            Monitor sales performance, team activity, payment flow, and recent
            management actions from one overview.
          </span>
        </div>
        <div className="admin-summary-chip">
          <ShieldCheck size={18} />
          <span>{stats.totalSales} completed sales tracked</span>
        </div>
      </div>

      <div className="admin-overview-hero">
        <div className="admin-kpi-grid">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <article key={card.title} className={`admin-kpi-card ${card.accent}`}>
                <div className="admin-kpi-icon">
                  <Icon size={20} />
                </div>
                <div className="admin-kpi-copy">
                  <h3>{card.title}</h3>
                  <p>{card.value}</p>
                </div>
                <Link to={card.link} className="admin-kpi-link">
                  {card.action}
                </Link>
              </article>
            );
          })}
        </div>

        <section className="admin-target-card">
          <div className="admin-card-heading">
            <div>
              <h2>Payment confirmation rate</h2>
              <p>How much of tracked payment flow is already confirmed</p>
            </div>
          </div>

          <div
            className="admin-progress-ring"
            style={{
              background: `conic-gradient(#465fff ${targetProgress}%, #e9eefb ${targetProgress}% 100%)`,
            }}
          >
            <div className="admin-progress-ring-inner">
              <strong>{targetProgress}%</strong>
              <span>confirmed</span>
            </div>
          </div>

          <div className="admin-target-stats">
            <div>
              <span>Revenue</span>
              <strong>{formatMoney(stats.totalRevenue)}</strong>
            </div>
            <div>
              <span>Pending</span>
              <strong>{stats.pendingPayments}</strong>
            </div>
            <div>
              <span>Managers</span>
              <strong>{stats.totalManagers}</strong>
            </div>
          </div>
        </section>
      </div>

      <section className="admin-analytics-card">
        <div className="admin-card-heading">
          <div>
            <h2>Revenue trend</h2>
            <p>Confirmed revenue across the last six months</p>
          </div>
          <span className="admin-pill">Monthly</span>
        </div>

        <div className="admin-chart-summary">
          <strong>{formatMoney(highestMonthRevenue)}</strong>
          <span>Highest monthly confirmed revenue in the current view</span>
        </div>

        <div className="admin-line-chart">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="adminRevenueFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(70, 95, 255, 0.24)" />
                <stop offset="100%" stopColor="rgba(70, 95, 255, 0.01)" />
              </linearGradient>
            </defs>
            <path d={`${revenuePath} L 100 100 L 0 100 Z`} fill="url(#adminRevenueFill)" />
            <path d={revenuePath} fill="none" stroke="#465fff" strokeWidth="2.2" />
          </svg>
          <div className="admin-chart-labels">
            {salesSeries.map((entry) => (
              <span key={entry.key}>{entry.label}</span>
            ))}
          </div>
        </div>
      </section>

      <div className="admin-bottom-grid">
        <section className="recent-section admin-table-card admin-sales-table-card">
          <div className="section-header">
            <div>
              <h2>Recent sales</h2>
              <p>Latest sold products and their payment status</p>
            </div>
            <Link to="/dashboard/payments" className="view-all-link">
              View payments
            </Link>
          </div>

          {recentSales.length === 0 ? (
            <p>No recent sales</p>
          ) : (
            <div className="table-card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Seller</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Sold At</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((sale) => (
                    <tr key={sale._id}>
                      <td>{sale.product?.name || "N/A"}</td>
                      <td>{getSellerLabel(sale)}</td>
                      <td>{sale.customerName || "N/A"}</td>
                      <td>{formatMoney(sale.totalPrice)}</td>
                      <td>{formatDateTime(sale.soldAt)}</td>
                      <td>
                        <span className={`status-badge ${sale.paymentStatus}`}>
                          {sale.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <section className="recent-section admin-activity-strip">
        <div className="admin-activity-card">
          <div className="admin-activity-icon">
            <PackageCheck size={18} />
          </div>
          <div>
            <strong>{stats.totalSales}</strong>
            <span>Products sold</span>
          </div>
        </div>
        <div className="admin-activity-card">
          <div className="admin-activity-icon">
            <BriefcaseBusiness size={18} />
          </div>
          <div>
            <strong>{stats.totalManagers}</strong>
            <span>Managers onboarded</span>
          </div>
        </div>
        <div className="admin-activity-card">
          <div className="admin-activity-icon">
            <UsersRound size={18} />
          </div>
          <div>
            <strong>{stats.totalAgents}</strong>
            <span>Agents assigned</span>
          </div>
        </div>
      </section>

      <section className="recent-section admin-manager-summary-card">
        <div className="section-header">
          <div>
            <h2>Recent managers</h2>
            <p>Newly added managers and their current status</p>
          </div>
          <Link to="/dashboard/managers" className="view-all-link">
            View managers
          </Link>
        </div>

        {recentManagers.length === 0 ? (
          <p>No managers added yet</p>
        ) : (
          <div className="admin-manager-list compact">
            {recentManagers.map((manager) => (
              <article key={manager._id} className="admin-manager-row">
                <div className="admin-manager-avatar">
                  {(manager.name || "M").charAt(0).toUpperCase()}
                </div>
                <div className="admin-manager-copy">
                  <strong>{manager.name}</strong>
                  <span>{manager.email}</span>
                </div>
                <div className="admin-manager-meta">
                  <span>{manager.location || "No location"}</span>
                  <span
                    className={`status-badge ${manager.isActive ? "active" : "inactive"}`}
                  >
                    {manager.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminOverview;
