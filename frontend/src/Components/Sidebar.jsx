import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  CreditCard,
  Settings,
  LogOut,
  BarChart3,
  ShoppingCart,
  MessageSquare,
  Shield
} from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      window.dispatchEvent(new Event("authChanged"));
      navigate("/login");
    } catch (error) {
      console.error("Logout failed");
    }
  };

  return (
    <aside className="sidebar">
      {/* LOGO */}
      <div className="sidebar-logo">
        <h2>Suad<span>Admin</span></h2>
      </div>

      {/* MENU */}
      <nav className="sidebar-menu">
        <NavLink to="/dashboard" end>
          <LayoutDashboard size={20} />
          <span>Overview</span>
        </NavLink>

        <NavLink to="/dashboard/users">
          <Users size={20} />
          <span>Users</span>
        </NavLink>

        <NavLink to="/dashboard/products">
          <Package size={20} />
          <span>Products</span>
        </NavLink>

        <NavLink to="/dashboard/payments">
          <CreditCard size={20} />
          <span>Payments</span>
        </NavLink>

        <NavLink to="/dashboard/orders">
          <ShoppingCart size={20} />
          <span>Orders</span>
        </NavLink>

        <NavLink to="/dashboard/analytics">
          <BarChart3 size={20} />
          <span>Analytics</span>
        </NavLink>

        <NavLink to="/dashboard/messages">
          <MessageSquare size={20} />
          <span>Messages</span>
        </NavLink>

        <NavLink to="/dashboard/security">
          <Shield size={20} />
          <span>Security</span>
        </NavLink>

        <NavLink to="/dashboard/settings">
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>

      {/* FOOTER */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
