import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const AgentDetails = () => {
  const { id } = useParams();
  const [agent, setAgent] = useState(null);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (id) {
      fetchAgentDetails();
      fetchAgentSales();
    }
  }, [id]);

  const fetchAgentDetails = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/agents/${id}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setAgent(data);
      } else {
        setError(data.message || "Failed to fetch agent details");
      }
    } catch (err) {
      setError("Failed to fetch agent details");
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentSales = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/sales", {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        // Filter sales for this agent
        const agentSales = data.filter((sale) => sale.agent && sale.agent._id === id);
        setSales(agentSales);
      }
    } catch (err) {
      console.error("Failed to fetch sales");
    }
  };

  const calculatePerformance = () => {
    const totalSales = sales.filter((s) => s.productStatus === "sold").length;
    const totalRevenue = sales
      .filter((s) => s.paymentStatus === "confirmed")
      .reduce((sum, s) => sum + s.totalPrice, 0);
    const pendingPayments = sales.filter((s) => s.paymentStatus === "pending").length;
    const returnedProducts = sales.filter((s) => s.productStatus === "returned").length;

    return { totalSales, totalRevenue, pendingPayments, returnedProducts };
  };

  const performance = calculatePerformance();

  if (loading) return <div className="loading">Loading agent details...</div>;
  if (!agent) return <div className="error-message">Agent not found</div>;

  return (
    <div className="agent-details-page">
      <div className="page-header">
        <h1>Agent Details</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="agent-profile">
        <div className="profile-header">
          <div className="profile-avatar">
            {agent.name?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h2>{agent.name}</h2>
            <p>{agent.email}</p>
            <p>{agent.phone}</p>
            <p>Location: {agent.location}</p>
            <p>
              Status:{" "}
              <span className={`status ${agent.isActive ? "active" : "inactive"}`}>
                {agent.isActive ? "Active" : "Inactive"}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === "activities" ? "active" : ""}`}
          onClick={() => setActiveTab("activities")}
        >
          Activities
        </button>
        <button
          className={`tab ${activeTab === "performance" ? "active" : ""}`}
          onClick={() => setActiveTab("performance")}
        >
          Performance
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "overview" && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Sales</h3>
                <p className="stat-value">{performance.totalSales}</p>
              </div>
              <div className="stat-card">
                <h3>Total Revenue</h3>
                <p className="stat-value">${performance.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="stat-card">
                <h3>Pending Payments</h3>
                <p className="stat-value">{performance.pendingPayments}</p>
              </div>
              <div className="stat-card">
                <h3>Returned Products</h3>
                <p className="stat-value">{performance.returnedProducts}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "activities" && (
          <div className="activities-tab">
            <h3>Recent Activities</h3>
            {sales.length === 0 ? (
              <p>No activities yet.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Product</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale._id}>
                      <td>{new Date(sale.createdAt).toLocaleDateString()}</td>
                      <td>{sale.product?.name}</td>
                      <td>{sale.customerName}</td>
                      <td>
                        <span className={`status-badge ${sale.productStatus}`}>
                          {sale.productStatus}
                        </span>
                      </td>
                      <td>${sale.totalPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "performance" && (
          <div className="performance-tab">
            <h3>Performance Metrics</h3>
            <div className="performance-grid">
              <div className="performance-card">
                <h4>Sales Performance</h4>
                <p>Total Completed Sales: {performance.totalSales}</p>
                <p>
                  Success Rate:{" "}
                  {sales.length > 0
                    ? ((performance.totalSales / sales.length) * 100).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
              <div className="performance-card">
                <h4>Revenue Performance</h4>
                <p>Total Revenue: ${performance.totalRevenue.toFixed(2)}</p>
                <p>Average Sale Value: ${(performance.totalRevenue / (performance.totalSales || 1)).toFixed(2)}</p>
              </div>
              <div className="performance-card">
                <h4>Product Handling</h4>
                <p>Products Picked: {sales.length}</p>
                <p>Products Returned: {performance.returnedProducts}</p>
                <p>
                  Return Rate:{" "}
                  {sales.length > 0
                    ? ((performance.returnedProducts / sales.length) * 100).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDetails;
