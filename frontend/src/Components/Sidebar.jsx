import { NavLink, useNavigate } from "react-router-dom";
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  Settings,
  Shield,
  ShoppingCart,
  Users,
  X,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const primaryLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dashboard/users", label: "Users", icon: Users },
  { to: "/dashboard/products", label: "Products", icon: Package },
  { to: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { to: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
];

const secondaryLinks = [
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { to: "/dashboard/security", label: "Security", icon: Shield },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      window.dispatchEvent(new Event("authChanged"));
      navigate("/login");
    } catch (error) {
      console.error("Logout failed");
    }
  };

  const renderNavLink = ({ to, label, icon: Icon, end = false }) => (
    <NavLink key={to} to={to} end={end} onClick={onClose}>
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );

  return (
    <>
      <div
        className={`admin-sidebar-backdrop ${isOpen ? "is-visible" : ""}`}
        onClick={onClose}
      />

      <aside className={`sidebar admin-sidebar ${isOpen ? "is-open" : ""}`}>
        <div className="sidebar-logo admin-sidebar-brand">
          <div className="admin-sidebar-logo-mark">SB</div>
          <div>
            <h2>Suad Admin</h2>
            <p>Control center</p>
          </div>

          <button
            type="button"
            className="admin-sidebar-close"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="admin-sidebar-scroll">
          <div className="admin-sidebar-group">
            <span className="admin-sidebar-label">Menu</span>
            <nav className="sidebar-menu admin-sidebar-menu">
              {primaryLinks.map(renderNavLink)}
            </nav>
          </div>

          <div className="admin-sidebar-group">
            <span className="admin-sidebar-label">Workspace</span>
            <nav className="sidebar-menu admin-sidebar-menu">
              {secondaryLinks.map(renderNavLink)}
            </nav>
          </div>
        </div>

        <div className="sidebar-footer admin-sidebar-footer">
          <button className="logout-btn admin-logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
