import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Bell,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  Search,
  Settings,
  Shield,
  ShoppingCart,
  Users,
  X,
} from "lucide-react";

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
];

const Sidebar = ({
  isOpen = false,
  onClose = () => {},
  user = null,
  notifications = [],
  unreadCount = 0,
  searchTerm = "",
  onSearchChange = () => {},
  searchItems = [],
  onSearchSelect = () => {},
  onNotificationClick = () => {},
  onLogout = () => {},
}) => {
  const userInitial = String(user?.name || "A").trim().charAt(0).toUpperCase();

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
          <div className="admin-sidebar-utility">
            <div className="admin-sidebar-search">
              <div className="admin-sidebar-input-shell">
                <Search size={16} />
                <input
                  type="search"
                  value={searchTerm}
                  placeholder="Search admin pages"
                  onChange={(event) => onSearchChange(event.target.value)}
                />
              </div>

              {searchTerm.trim() && searchItems.length > 0 && (
                <div className="admin-sidebar-search-results">
                  {searchItems.slice(0, 5).map((item) => (
                    <button
                      key={item.path}
                      type="button"
                      className="admin-sidebar-search-item"
                      onClick={() => {
                        onSearchSelect(item.path);
                        onClose();
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}

              {searchTerm.trim() && searchItems.length === 0 && (
                <div className="admin-sidebar-search-results">
                  <div className="admin-sidebar-search-empty">
                    No matching admin pages found.
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="admin-sidebar-group">
            <span className="admin-sidebar-label">Navigation</span>
            <div className="admin-sidebar-nav-card">
              <nav className="sidebar-menu admin-sidebar-menu">
                {primaryLinks.map(renderNavLink)}
              </nav>
              <div className="admin-sidebar-divider" />
              <nav className="sidebar-menu admin-sidebar-menu">
                {secondaryLinks.map(renderNavLink)}
              </nav>
            </div>
          </div>

          <div className="admin-sidebar-group">
            <span className="admin-sidebar-label">Updates</span>
            <div className="admin-sidebar-message-card">
              <div className="admin-sidebar-message-header">
                <div className="admin-sidebar-message-title">
                  <Bell size={16} />
                  <span>Updates</span>
                </div>
                <small>{unreadCount} unread</small>
              </div>

              {notifications.length === 0 ? (
                <p className="admin-empty-state">No notifications yet.</p>
              ) : (
                <div className="admin-sidebar-notification-list">
                  {notifications.slice(0, 4).map((notification) => (
                    <button
                      key={notification._id}
                      type="button"
                      className={`admin-sidebar-notification-item ${
                        notification.isRead ? "is-read" : "is-unread"
                      }`}
                      onClick={() => onNotificationClick(notification._id)}
                    >
                      <strong>{notification.title || "Notification"}</strong>
                      <span>{notification.message || "Open to review details."}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="admin-sidebar-group admin-sidebar-account-group">
            <span className="admin-sidebar-label">Account</span>
            <div className="admin-sidebar-account-actions">
              <NavLink
                to="/dashboard/settings?tab=profile"
                onClick={onClose}
                className="admin-sidebar-account-profile"
              >
                <span className="admin-avatar">{userInitial}</span>
                <span className="admin-sidebar-account-copy">
                  <strong>{user?.name || "Admin"}</strong>
                  <small>Profile</small>
                </span>
              </NavLink>
              <NavLink to="/dashboard/settings" onClick={onClose}>
                <Settings size={16} />
                <span>Settings</span>
              </NavLink>
            </div>
          </div>
        </div>

        <div className="sidebar-footer admin-sidebar-footer">
          <button className="logout-btn admin-logout-btn" onClick={onLogout}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
