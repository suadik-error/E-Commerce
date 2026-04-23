import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Bell, LogOut } from "lucide-react";
import Sidebar from "../Components/Sidebar";
import { applyWorkspaceAppearance, getWorkspaceBranding } from "../lib/workspaceBranding";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const adminSearchItems = [
  { label: "Dashboard Overview", path: "/dashboard" },
  { label: "Users", path: "/dashboard/users" },
  { label: "Products", path: "/dashboard/products" },
  { label: "Payments", path: "/dashboard/payments" },
{ label: "Orders", path: "/dashboard/orders" },
  { label: "Order Receive", path: "/dashboard/order-receive" },
  { label: "Analytics", path: "/dashboard/analytics" },
  { label: "Messages", path: "/dashboard/messages" },
  { label: "Settings", path: "/dashboard/settings" },
];

const getAdminPageTitle = (pathname) => {
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname.includes("/users")) return "Users";
  if (pathname.includes("/products")) return "Products";
  if (pathname.includes("/payments")) return "Payments";
  if (pathname.includes("/orders")) return "Orders";
  if (pathname.includes("/order-receive")) return "Order Receive";
  if (pathname.includes("/analytics")) return "Analytics";
  if (pathname.includes("/messages")) return "Messages";
  if (pathname.includes("/settings")) return "Settings";
  return "Admin";
};

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => localStorage.getItem("dashboardSidebarCollapsed") === "true"
  );
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const isDesktop = () => window.matchMedia("(min-width: 901px)").matches;

  useEffect(() => {
    fetchAdminShellData();
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
        applyWorkspaceAppearance(profile);
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
    if (!isDesktop()) {
      setIsSidebarOpen(false);
    }
    setIsNotificationsOpen(false);
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

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

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

  const toggleSidebar = () => {
    if (isDesktop()) {
      setIsSidebarCollapsed((value) => !value);
      return;
    }
    setIsSidebarOpen((value) => !value);
  };
  const branding = getWorkspaceBranding(user);

  return (
    <div
      className={`dashboard-layout admin-dashboard-layout ${
        isSidebarCollapsed ? "sidebar-collapsed" : ""
      }`}
    >
      <Sidebar
        role="admin"
        basePath="/dashboard"
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

      <div className="admin-dashboard-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <div className="admin-topbar-title">
              <strong>{getAdminPageTitle(location.pathname)}</strong>
              <span>{branding.companyName} workspace</span>
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
            <button type="button" className="admin-profile-chip" onClick={() => navigate("/dashboard/settings")}>
              <span className="admin-avatar">{String(user?.name || "A").charAt(0).toUpperCase()}</span>
              <span className="admin-profile-copy">
                <strong>{user?.name || "Admin"}</strong>
                <small>{user?.email || "Profile"}</small>
              </span>
            </button>
            <button type="button" className="admin-icon-btn admin-logout-btn" onClick={handleLogout} aria-label="Logout">
              <LogOut size={18} />
            </button>
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
