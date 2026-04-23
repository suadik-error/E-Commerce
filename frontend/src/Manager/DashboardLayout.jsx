import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { LogOut, ShoppingCart, User } from "lucide-react";
import Sidebar from "../Components/Sidebar";
import { applyWorkspaceAppearance } from "../lib/workspaceBranding";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const ManagerDashboardLayout = () => {
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

  const managerSearchItems = [
    { label: "Dashboard", path: "/manager" },
    { label: "Agents", path: "/manager/agents" },
    { label: "Workers", path: "/manager/workers" },
    { label: "Products", path: "/manager/products" },
    { label: "Sales", path: "/manager/sales" },
    { label: "Payments", path: "/manager/payments" },
    { label: "Order Receive", path: "/manager/order-receive" },
  ];

  const getManagerPageTitle = (pathname) => {
    if (pathname === "/manager") return "Dashboard";
    if (pathname.includes("/agents")) return "Agents";
    if (pathname.includes("/workers")) return "Workers";
    if (pathname.includes("/products")) return "Products";
    if (pathname.includes("/sales")) return "Sales";
    if (pathname.includes("/payments")) return "Payments";
    if (pathname.includes("/order-receive")) return "Order Receive";
    return "Manager";
  };

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

  return (
    <div className={`dashboard-layout manager-dashboard ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar
        role="manager"
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
<h2>{getManagerPageTitle(location.pathname)}</h2>
          </div>
          <div className="header-right">
            <button
              className="notification-btn"
              onClick={() => navigate("/manager/products")}
              title="Sell Product"
            >
              <ShoppingCart size={20} />
            </button>
            <button type="button" className="topbar-profile-chip" onClick={() => navigate("/manager/settings")}>
              <User size={16} />
              <span>{user?.name || "Manager"}</span>
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

export default ManagerDashboardLayout;
