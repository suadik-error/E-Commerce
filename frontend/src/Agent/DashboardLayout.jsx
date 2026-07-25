import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, ShoppingCart, User } from "lucide-react";
import Sidebar from "../Components/Sidebar";
import { applyWorkspaceAppearance } from "../lib/workspaceBranding";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const AgentDashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => localStorage.getItem("dashboardSidebarCollapsed") === "true"
  );
  const isDesktop = () => window.matchMedia("(min-width: 901px)").matches;

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (!isDesktop()) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen && !isDesktop() ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    localStorage.setItem("dashboardSidebarCollapsed", String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

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

  const toggleSidebar = () => {
    if (isDesktop()) {
      setIsSidebarCollapsed((value) => !value);
      return;
    }
    setIsSidebarOpen((value) => !value);
  };

  const getAgentPageTitle = (pathname) => {
    if (pathname === "/agent") return `Welcome, ${user?.name || "Agent"}`;
    if (pathname.includes("/products")) return "Products";
    if (pathname.includes("/sales")) return "My Sales";
    if (pathname.includes("/messages")) return "Messages";
    if (pathname.includes("/profile")) return "Profile";
    return "Agent";
  };

  return (
    <div className={`dashboard-layout agent-dashboard ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar
        role="agent"
        isOpen={isDesktop() ? true : isSidebarOpen}
        isCollapsed={isDesktop() ? isSidebarCollapsed : false}
        showLogout={false}
        onToggleSidebar={toggleSidebar}
        onClose={() => {
          if (!isDesktop()) setIsSidebarOpen(false);
        }}
        user={user}
        onLogout={handleLogout}
      />

      <main className="dashboard-content">
        <header className="dashboard-header">
          <div className="header-left">
            <button
              type="button"
              className="agent-menu-btn"
              onClick={toggleSidebar}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
            <h2>{getAgentPageTitle(location.pathname)}</h2>
          </div>
          <div className="header-right">
            <button
              className="notification-btn"
              onClick={() => navigate("/agent/products")}
              title="Sell Product"
            >
              <ShoppingCart size={20} />
            </button>
            <button type="button" className="topbar-profile-chip" onClick={() => navigate("/agent/profile")}>
              <User size={16} />
              <span>{user?.name || "Agent"}</span>
            </button>
            <button type="button" className="notification-btn" onClick={handleLogout} title="Logout">
              <LogOut size={18} />
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
