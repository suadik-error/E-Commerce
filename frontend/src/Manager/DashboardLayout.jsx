import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
LayoutDashboard,
  Users,
  Package,
  CreditCard,
  Settings,
  LogOut,
  ShoppingCart,
  MessageSquare,
  UserCog,
  Briefcase,
  Bell
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";


const ManagerDashboardLayout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchNotifications();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
      }
    } catch (err) {
      console.error("Failed to fetch user");
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setNotifications(data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications");
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

  const markAsRead = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: "PUT",
        credentials: "include",
      });
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark as read");
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="dashboard-layout manager-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        {/* LOGO */}
        <div className="sidebar-logo">
          <h2>Manager<span>Panel</span></h2>
        </div>

        {/* MENU */}
        <nav className="sidebar-menu">
          <NavLink to="/manager" end>
            <LayoutDashboard size={20} />
            <span>Overview</span>
          </NavLink>

          <NavLink to="/manager/agents">
            <UserCog size={20} />
            <span>Agents</span>
          </NavLink>

          <NavLink to="/manager/workers">
            <Briefcase size={20} />
            <span>Workers</span>
          </NavLink>

          <NavLink to="/manager/products">
            <Package size={20} />
            <span>Products</span>
          </NavLink>

          <NavLink to="/manager/sales">
            <ShoppingCart size={20} />
            <span>Sales</span>
          </NavLink>

          <NavLink to="/manager/payments">
            <CreditCard size={20} />
            <span>Payments</span>
          </NavLink>

          <NavLink to="/manager/settings">
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

      {/* Main Content */}
      <main className="dashboard-content">
        {/* Top Navbar */}
        <header className="dashboard-header">
          <div className="header-left">
            <h2>Welcome, {user?.name || "Manager"}</h2>
          </div>
          <div className="header-right">
            <button
              className="notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>
            <button
              className="notification-btn"
              onClick={() => navigate("/manager/products")}
              title="Sell Product"
            >
              <ShoppingCart size={20} />
            </button>
            {showNotifications && (
              <div className="notifications-dropdown">
                <h3>Notifications</h3>
                {notifications.length === 0 ? (
                  <p>No notifications</p>
                ) : (
                  <ul>
                    {notifications.slice(0, 5).map((notif) => (
                      <li
                        key={notif._id}
                        className={notif.isRead ? "read" : "unread"}
                        onClick={() => markAsRead(notif._id)}
                      >
                        <strong>{notif.title}</strong>
                        <p>{notif.message}</p>
                        <small>
                          {new Date(notif.createdAt).toLocaleString()}
                        </small>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ManagerDashboardLayout;
