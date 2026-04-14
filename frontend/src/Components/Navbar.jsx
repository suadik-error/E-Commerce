import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Bell, ChevronRight, Home, ShieldCheck, User } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";
const CLIENT_APP_URL = import.meta.env.VITE_CLIENT_APP_URL || "";

const getDashboardPathByRole = (role) => {
  const normalizedRole = String(role || "").trim().toLowerCase();

  if (normalizedRole === "admin") return "/dashboard";
  if (normalizedRole === "manager") return "/manager";
  if (normalizedRole === "agent") return "/agent";
  return "/login";
};

const getProfilePathByRole = (role) => {
  const normalizedRole = String(role || "").trim().toLowerCase();

  if (normalizedRole === "admin") return "/dashboard/settings";
  if (normalizedRole === "manager") return "/manager/settings";
  if (normalizedRole === "agent") return "/agent/profile";
  return "/login";
};

const Navbar = () => {
  const location = useLocation();
  const [authState, setAuthState] = useState({
    checked: false,
    isAuthenticated: false,
    role: null,
  });
  const [notifications] = useState(3);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          credentials: "include",
        });

        if (!res.ok) {
          return { isAuthenticated: false, role: null };
        }

        const profile = await res.json();
        const role = profile?.role ?? profile?.user?.role ?? null;
        const normalizedRole = String(role || "").trim().toLowerCase();

        return {
          isAuthenticated: ["admin", "manager", "agent"].includes(normalizedRole),
          role,
        };
      } catch {
        return { isAuthenticated: false, role: null };
      }
    };

    const syncAuth = async () => {
      const nextAuth = await checkAuth();
      setAuthState({ checked: true, ...nextAuth });
    };

    syncAuth();
    window.addEventListener("authChanged", syncAuth);

    return () => window.removeEventListener("authChanged", syncAuth);
  }, []);

  const { checked, isAuthenticated, role } = authState;
  const isDashboardRoute =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/manager") ||
    location.pathname.startsWith("/agent");

  if (!checked) return null;
  if (isAuthenticated && isDashboardRoute) return null;

  return (
    <header className="navbar">
      <div className="navbar-left">
        <NavLink to="/" className="brand-mark">
          <span className="brand-badge">BT</span>
          <div className="brand-copy">
            <strong>Busi-Tech</strong>
            <small>Staff workspace</small>
          </div>
        </NavLink>
      </div>

      <nav className="navbar-right">
        {!isAuthenticated && (
          <NavLink to="/" end className="nav-pill">
            <Home size={18} />
            <span>Home</span>
          </NavLink>
        )}

        {!isAuthenticated && CLIENT_APP_URL ? (
          <a href={CLIENT_APP_URL} className="nav-pill">
            <span>Client App</span>
          </a>
        ) : null}

        {isAuthenticated && (
          <>
            <NavLink to={getDashboardPathByRole(role)} className="nav-pill">
              <ShieldCheck size={18} />
              <span>Dashboard</span>
            </NavLink>
            <button className="notification-btn" type="button" aria-label="Notifications">
              <Bell size={18} />
              {notifications > 0 ? (
                <span className="notification-badge">{notifications}</span>
              ) : null}
            </button>
            <NavLink to={getProfilePathByRole(role)} className="nav-pill">
              <User size={18} />
              <span>Profile</span>
            </NavLink>
          </>
        )}

        {!isAuthenticated &&
          (location.pathname === "/login" ? (
            <NavLink to="/admin-request" className="login-btn">
              Request Access
              <ChevronRight size={16} />
            </NavLink>
          ) : (
            <NavLink to="/login" className="login-btn">
              Staff Login
              <ChevronRight size={16} />
            </NavLink>
          ))}
      </nav>
    </header>
  );
};

export default Navbar;
