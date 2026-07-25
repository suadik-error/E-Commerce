import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  Settings,
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
  isCollapsed = false,
  onClose = () => {},
  onToggleSidebar = () => {},
  user = null,
  onLogout = () => {},
  showLogout = true,
  basePath = "/dashboard",
  searchTerm = "",
  onSearchChange = () => {},
  searchItems = [],
  onSearchSelect = () => {},
}) => {
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
      { to: `${basePath}/settings`, label: "Settings", icon: Settings },
    ],
    agent: [
      { to: "/agent", label: "Overview", icon: LayoutDashboard, end: true },
      { to: "/agent/products", label: "Products", icon: Package },
      { to: "/agent/sales", label: "My Sales", icon: ShoppingCart },
      { to: "/agent/messages", label: "Messages", icon: MessageSquare },
      { to: "/agent/profile", label: "Profile", icon: User },
    ],
    manager: [
      { to: "/manager", label: "Overview", icon: LayoutDashboard, end: true },
      { to: "/manager/agents", label: "Agents", icon: UserCog },
      { to: "/manager/workers", label: "Workers", icon: Briefcase },
      { to: "/manager/products", label: "Products", icon: Package },
      { to: "/manager/sales", label: "Sales", icon: ShoppingCart },
      { to: "/manager/payments", label: "Payments", icon: CreditCard },
      { to: "/manager/messages", label: "Messages", icon: MessageSquare },
      { to: "/manager/settings", label: "Settings", icon: Settings },
    ],
  }[role] || [];

  const renderNavLink = ({ to, label, icon: Icon, end = false }, index) => (
    <NavLink
      key={to || index}
      to={to}
      end={end}
      title={isCollapsed ? label : undefined}
      className={({ isActive }) => (isActive ? "active" : "")}
      onClick={onClose}
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );

  return (
    <>
      <div
        className={`sidebar-backdrop ${isOpen ? "is-visible" : ""}`}
        onClick={onClose}
      />

      <aside
        className={`sidebar rolling-sidebar ${role}-sidebar ${isOpen ? "is-open" : ""} ${
          isCollapsed ? "is-collapsed" : ""
        }`}
      >
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

        {showLogout ? (
          <div className="sidebar-footer">
            <button
              className="sidebar-toggle-btn"
              onClick={onToggleSidebar}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              <span>{isCollapsed ? "Expand" : "Collapse"}</span>
            </button>
            <button className="logout-btn" onClick={onLogout} title={isCollapsed ? "Logout" : undefined}>
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="sidebar-footer">
            <button
              className="sidebar-toggle-btn"
              onClick={onToggleSidebar}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              <span>{isCollapsed ? "Expand" : "Collapse"}</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
