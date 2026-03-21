import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import {
  applyWorkspaceAppearance,
  getWorkspaceBranding,
  getWorkspaceInitials,
} from "../lib/workspaceBranding";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const AgentDashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        applyWorkspaceAppearance(data);
      }
    } catch (err) {
      console.error("Failed to fetch user");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        credentials: "include",
      });
      navigate("/login");
    } catch (err) {
      console.error("Logout failed");
    }
  };

  const branding = getWorkspaceBranding(user);
  const workspaceMark = getWorkspaceInitials(user);

  return (
    <div className={`dashboard-layout agent-dashboard sidebar-${branding.sidebarPlacement}`}>
      <div
        className={`mobile-sidebar-backdrop ${isSidebarOpen ? "is-visible" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside className={`sidebar mobile-dashboard-sidebar ${isSidebarOpen ? "is-open" : ""}`}>
        <div className="sidebar-logo workspace-sidebar-logo">
          <div className="workspace-sidebar-brand">
            <div className="workspace-sidebar-mark">
              {branding.companyLogo ? (
                <img src={branding.companyLogo} alt={branding.companyName} className="workspace-logo-image" />
              ) : (
                workspaceMark
              )}
            </div>
            <div>
              <h2>{branding.companyName}</h2>
              <p>Agent workspace</p>
            </div>
          </div>
          <button
            type="button"
            className="mobile-sidebar-close"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-menu">
          <NavLink to="/agent" end onClick={() => setIsSidebarOpen(false)}>
            <LayoutDashboard size={20} />
            <span>Overview</span>
          </NavLink>

          <NavLink to="/agent/products" onClick={() => setIsSidebarOpen(false)}>
            <Package size={20} />
            <span>Products</span>
          </NavLink>

          <NavLink to="/agent/sales" onClick={() => setIsSidebarOpen(false)}>
            <ShoppingCart size={20} />
            <span>My Sales</span>
          </NavLink>

          <NavLink to="/agent/profile" onClick={() => setIsSidebarOpen(false)}>
            <User size={20} />
            <span>Profile</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-content">
        <header className="dashboard-header mobile-dashboard-header">
          <div className="header-left">
            <button
              type="button"
              className="dashboard-menu-btn"
              onClick={() => setIsSidebarOpen((value) => !value)}
              aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
            >
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <h2>Welcome, {user?.name || "Agent"}</h2>
          </div>
          <div className="header-right">
            <button
              className="notification-btn"
              onClick={() => navigate("/agent/products")}
              title="Sell Product"
            >
              <ShoppingCart size={20} />
            </button>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AgentDashboardLayout;
