import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Bell, Menu, X } from "lucide-react";
import Sidebar from "../Components/Sidebar";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const adminSearchItems = [
  { label: "Dashboard Overview", path: "/dashboard" },
  { label: "Users", path: "/dashboard/users" },
  { label: "Products", path: "/dashboard/products" },
  { label: "Payments", path: "/dashboard/payments" },
  { label: "Orders", path: "/dashboard/orders" },
  { label: "Analytics", path: "/dashboard/analytics" },
  { label: "Messages", path: "/dashboard/messages" },
  { label: "Security", path: "/dashboard/security" },
  { label: "Settings", path: "/dashboard/settings" },
];

const getAdminPageTitle = (pathname) => {
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname.includes("/users")) return "Users";
  if (pathname.includes("/products")) return "Products";
  if (pathname.includes("/payments")) return "Payments";
  if (pathname.includes("/orders")) return "Orders";
  if (pathname.includes("/analytics")) return "Analytics";
  if (pathname.includes("/messages")) return "Messages";
  if (pathname.includes("/security")) return "Security";
  if (pathname.includes("/settings")) return "Settings";
  return "Admin";
};

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light");
  }, []);

  const fetchAdminShellData = async () => {
    try {
      const [profileRes, notificationsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/auth/profile`, {
          credentials: "include",
        }),
        fetch(`${API_BASE_URL}/api/notifications`, {
          credentials: "include",
        }),
      ]);

      if (profileRes.ok) {
        const profile = await profileRes.json();
        setUser(profile);
      }

      if (notificationsRes.ok) {
        const notificationsData = await notificationsRes.json();
        setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
      }
    } catch (error) {
      console.error("Failed to load admin shell data");
    }
  };

  useEffect(() => {
    fetchAdminShellData();
  }, []);

  useEffect(() => {
    setSearchTerm("");
    setIsSidebarOpen(false);
    setIsNotificationsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const filteredSearchItems = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();
    if (!normalizedQuery) return adminSearchItems;

    return adminSearchItems.filter((item) =>
      item.label.toLowerCase().includes(normalizedQuery)
    );
  }, [searchTerm]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
        method: "PUT",
        credentials: "include",
      });
      await fetchAdminShellData();
    } catch (error) {
      console.error("Failed to mark notification as read");
    }
  };

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

  return (
    <div className="dashboard-layout admin-dashboard-layout">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchItems={filteredSearchItems}
        onSearchSelect={(path) => navigate(path)}
        onLogout={handleLogout}
      />

      <div className="admin-dashboard-main">
        <header className="admin-topbar admin-topbar-minimal">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-icon-btn admin-menu-btn"
              onClick={() => setIsSidebarOpen((value) => !value)}
              aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
            >
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="admin-topbar-title">
              <strong>{getAdminPageTitle(location.pathname)}</strong>
              <span>Admin workspace</span>
            </div>
          </div>
          <div className="admin-topbar-right">
            <div className="admin-notification-wrap">
              <button
                type="button"
                className="admin-icon-btn admin-notify-btn"
                onClick={() => setIsNotificationsOpen((value) => !value)}
                aria-label={isNotificationsOpen ? "Close messages" : "Open messages"}
              >
                <Bell size={18} />
                {unreadCount > 0 && <span className="admin-dot">{unreadCount > 9 ? "9+" : unreadCount}</span>}
              </button>

              {isNotificationsOpen && (
                <div className="admin-notification-panel">
                  <div className="admin-notification-header">
                    <strong>Messages</strong>
                    <span>{unreadCount} unread</span>
                  </div>

                  {notifications.length === 0 ? (
                    <p className="admin-empty-state">No notifications yet.</p>
                  ) : (
                    <div className="admin-notification-list">
                      {notifications.slice(0, 6).map((notification) => (
                        <button
                          key={notification._id}
                          type="button"
                          className={`admin-notification-item ${
                            notification.isRead ? "" : "is-unread"
                          }`}
                          onClick={() => handleMarkAsRead(notification._id)}
                        >
                          <strong>{notification.title || "Notification"}</strong>
                          <span>{notification.message || "Open to review details."}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="dashboard-content admin-dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
