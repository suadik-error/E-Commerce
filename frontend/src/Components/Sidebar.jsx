import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Briefcase,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  Search,
  Settings,
  Shield,
  ShoppingCart,
  User,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { getWorkspaceBranding, getWorkspaceInitials } from "../lib/workspaceBranding";

const Sidebar = ({
  role = "admin",
  isOpen = false,
  onClose = () => {},
  user = null,
  onLogout = () => {},
  basePath = "/dashboard",
  searchTerm = "",
  onSearchChange = () => {},
  searchItems = [],
  onSearchSelect = () => {},
}) => {
  const userInitial = String(user?.name || "U").trim().charAt(0).toUpperCase();
  const branding = getWorkspaceBranding(user);
  const workspaceMark = getWorkspaceInitials(user);

  // Role-specific links
  const links = {
    admin: [
      { to: `${basePath}`, label: "Dashboard", icon: LayoutDashboard, end: true },
      { to: `${basePath}/users`, label: "Users", icon: Users },
      { to: `${basePath}/products`, label: "Products", icon: Package },
      { to: `${basePath}/payments`, label: "Payments", icon: CreditCard },
      { to: `${basePath}/orders`, label: "Orders", icon: ShoppingCart },
      { to: `${basePath}/analytics`, label: "Analytics", icon: BarChart3 },
      { to: `${basePath}/messages`, label: "Messages", icon: MessageSquare },
      { to: `${basePath}/security`, label: "Security", icon: Shield },
      { to: `${basePath}/settings`, label: "Settings", icon: Settings },
    ],
    agent: [
      { to: "/agent", label: "Overview", icon: LayoutDashboard, end: true },
      { to: "/agent/products", label: "Products", icon: Package },
      { to: "/agent/sales", label: "My Sales", icon: ShoppingCart },
      { to: "/agent/profile", label: "Profile", icon: User },
    ],
    manager: [
      { to: "/manager", label: "Overview", icon: LayoutDashboard, end: true },
      { to: "/manager/agents", label: "Agents", icon: UserCog },
      { to: "/manager/workers", label: "Workers", icon: Briefcase },
      { to: "/manager/products", label: "Products", icon: Package },
      { to: "/manager/sales", label: "Sales", icon: ShoppingCart },
      { to: "/manager/payments", label: "Payments", icon: CreditCard },
      { to: "/manager/settings", label: "Settings", icon: Settings },
    ],
  }[role] || [];

  const renderNavLink = ({ to, label, icon: Icon, end = false }, index) => (
    <NavLink
      key={to || index}
      to={to}
      end={end}
      className={({ isActive }) => (isActive ? "active" : "")}
      onClick={onClose}
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );

  const isAdmin = role === "admin";

  return (
    <>
      <div
        className={`sidebar-backdrop ${isOpen ? "is-visible" : ""}`}
        onClick={onClose}
      />

        <aside className={`sidebar rolling-sidebar ${role}-sidebar ${isOpen ? "is-open" : ""}`}>
        <div className="sidebar-logo">
          <div className="workspace-sidebar-brand">
            <div className="workspace-sidebar-mark">
              {branding.companyLogo ? (
                <img src={branding.companyLogo} alt={branding.companyName} className="workspace-logo-image" />
              ) : (
                workspaceMark
              )}
            </div>
            <div>
              <h2>{branding.companyName}</h2>
              <p>
                {role === "admin" ? "Control center" :
                 role === "agent" ? "Agent workspace" :
                 "Manager workspace"}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-menu">
          {links.map(renderNavLink)}
        </nav>

        {isAdmin && (
          <div className="admin-sidebar-account">
            <NavLink to={`${basePath}/settings?tab=profile`} onClick={onClose} className="account-profile">
              <span className="admin-avatar">{userInitial}</span>
              <span>
                <strong>{user?.name || "Admin"}</strong>
                <small>Profile</small>
              </span>
            </NavLink>
          </div>
        )}

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={onLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

