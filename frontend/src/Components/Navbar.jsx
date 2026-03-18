import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Bell, ChevronRight, Home, ShieldCheck, User } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

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

  const checkAuth = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        credentials: "include",
      });

      if (!res.ok) {
        return { isAuthenticated: false, role: null };
      }

      const profile = await res.json();
      return {
        isAuthenticated: true,
        role: profile?.role ?? profile?.user?.role ?? null,
      };
    } catch {
      return { isAuthenticated: false, role: null };
    }
  };

  useEffect(() => {
    const fetchAuth = async () => {
      const nextAuth = await checkAuth();
      setAuthState({ checked: true, ...nextAuth });
    };

    fetchAuth();

    const handleAuthChange = async () => {
      const nextAuth = await checkAuth();
      setAuthState({ checked: true, ...nextAuth });
    };

    window.addEventListener("authChanged", handleAuthChange);
    return () => window.removeEventListener("authChanged", handleAuthChange);
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
          <span className="brand-badge">SB</span>
          <div className="brand-copy">
            <strong>Suad Business Tech</strong>
            <small>Commerce operations platform</small>
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

        {isAuthenticated && (
          <>
            <NavLink to={getDashboardPathByRole(role)} className="nav-pill">
              <ShieldCheck size={18} />
              <span>Dashboard</span>
            </NavLink>
            <button className="notification-btn" type="button" aria-label="Notifications">
              <Bell size={18} />
              {notifications > 0 && (
                <span className="notification-badge">{notifications}</span>
              )}
            </button>
            <NavLink to={getProfilePathByRole(role)} className="nav-pill">
              <User size={18} />
              <span>Profile</span>
            </NavLink>
          </>
        )}

        {!isAuthenticated &&
          (location.pathname === "/login" ? (
            <NavLink to="/signup" className="login-btn">
              Signup
              <ChevronRight size={16} />
            </NavLink>
          ) : (
            <NavLink to="/login" className="login-btn">
              Login
              <ChevronRight size={16} />
            </NavLink>
          ))}
      </nav>
    </header>
  );
};

export default Navbar;
