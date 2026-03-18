import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Bell, LogOut, Menu, Search, Settings, UserCircle2, X } from "lucide-react";
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

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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
    setShowSearchResults(false);
    setShowNotifications(false);
    setShowProfileMenu(false);
    setSearchTerm("");
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;
  const userInitial = String(user?.name || "A").trim().charAt(0).toUpperCase();

  const filteredSearchItems = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();
    if (!normalizedQuery) return adminSearchItems;

    return adminSearchItems.filter((item) =>
      item.label.toLowerCase().includes(normalizedQuery)
    );
  }, [searchTerm]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (!filteredSearchItems.length) return;
    navigate(filteredSearchItems[0].path);
    setShowSearchResults(false);
  };

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
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="admin-dashboard-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-icon-btn admin-menu-btn"
              onClick={() => setIsSidebarOpen((value) => !value)}
              aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
            >
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <div className="admin-search-wrap">
              <form className="admin-search-shell" onSubmit={handleSearchSubmit}>
                <Search size={18} />
                <input
                  type="search"
                  value={searchTerm}
                  placeholder="Search managers, agents, sales, and products..."
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setShowSearchResults(true);
                    setShowNotifications(false);
                    setShowProfileMenu(false);
                  }}
                  onFocus={() => {
                    setShowSearchResults(true);
                    setShowNotifications(false);
                    setShowProfileMenu(false);
                  }}
                />
              </form>

              {showSearchResults && filteredSearchItems.length > 0 && (
                <div className="admin-search-results">
                  {filteredSearchItems.slice(0, 6).map((item) => (
                    <button
                      key={item.path}
                      type="button"
                      className="admin-search-result"
                      onClick={() => {
                        navigate(item.path);
                        setShowSearchResults(false);
                      }}
                    >
                      <span>{item.label}</span>
                      <small>{item.path}</small>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="admin-topbar-right">
            <div className="admin-notification-wrap">
              <button
                type="button"
                className="admin-icon-btn admin-notify-btn"
                aria-label="Notifications"
                onClick={() => {
                  setShowNotifications((value) => !value);
                  setShowSearchResults(false);
                  setShowProfileMenu(false);
                }}
              >
                <Bell size={18} />
                {unreadCount > 0 && <span className="admin-dot" />}
              </button>

              {showNotifications && (
                <div className="admin-notification-panel">
                  <div className="admin-notification-header">
                    <strong>Notifications</strong>
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
                            notification.isRead ? "is-read" : "is-unread"
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

            <div className="admin-profile-menu-wrap">
              <button
                type="button"
                className="admin-profile-chip"
                onClick={() => {
                  setShowProfileMenu((value) => !value);
                  setShowSearchResults(false);
                  setShowNotifications(false);
                }}
              >
                <span className="admin-avatar">{userInitial}</span>
                <div className="admin-profile-copy">
                  <strong>{user?.name || "Admin"}</strong>
                  <small>{user?.email || "Administrator"}</small>
                </div>
              </button>

              {showProfileMenu && (
                <div className="admin-profile-menu">
                  <button
                    type="button"
                    className="admin-profile-menu-item"
                    onClick={() => navigate("/dashboard/settings?tab=profile")}
                  >
                    <UserCircle2 size={16} />
                    <span>Profile</span>
                  </button>
                  <button
                    type="button"
                    className="admin-profile-menu-item"
                    onClick={() => navigate("/dashboard/settings")}
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </button>
                  <button
                    type="button"
                    className="admin-profile-menu-item danger"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
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
