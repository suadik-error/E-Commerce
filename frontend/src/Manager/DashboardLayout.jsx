import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingCart } from "lucide-react";
import Sidebar from "../Components/Sidebar";
import { applyWorkspaceAppearance } from "../lib/workspaceBranding";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const ManagerDashboardLayout = () => {
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

  const toggleSidebar = () => setIsSidebarOpen((value) => !value);

  return (
    <div className="dashboard-layout manager-dashboard">
      <Sidebar
        role="manager"
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      <main className="dashboard-content">
        <header className="dashboard-header">
          <div className="header-left">
            <button
              type="button"
              className="dashboard-menu-btn"
              onClick={toggleSidebar}
              aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
            >
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <h2>Welcome, {user?.name || "Manager"}</h2>
          </div>
          <div className="header-right">
            <button
              className="notification-btn"
              onClick={() => navigate("/manager/products")}
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

export default ManagerDashboardLayout;
