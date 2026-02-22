import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Home, User, Bell } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const Navbar = () => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading
  const [notifications, setNotifications] = useState(3); // Mock notification count

  const checkAuth = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        credentials: "include",
      });
      console.log("Profile status:", res.status);
      return res.ok;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const fetchAuth = async () => {
      const isAuth = await checkAuth();
      setIsAuthenticated(isAuth);
    };

    fetchAuth();

    // ðŸ” Listen for login/logout changes
    const handleAuthChange = async () => {
      const isAuth = await checkAuth();
      setIsAuthenticated(isAuth);
    };

    window.addEventListener("authChanged", handleAuthChange);
    return () => window.removeEventListener("authChanged", handleAuthChange);
  }, []);

  if (isAuthenticated === null) return <div>Loading...</div>; // avoid flicker

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h2>Suad<span>Shop</span></h2>
      </div>

      <nav className="navbar-right">
        <NavLink to="/" end>
          <Home size={18} />
          <span>Home</span>
        </NavLink>

        {isAuthenticated && (
          <>
            <button className="notification-btn">
              <Bell size={18} />
              {notifications > 0 && (
                <span className="notification-badge">{notifications}</span>
              )}
            </button>
            <NavLink to="/dashboard/settings">
              <User size={18} />
              <span>Profile</span>
            </NavLink>
          </>
        )}

        {!isAuthenticated && (
          location.pathname === "/login" ? (
            <NavLink to="/signup" className="login-btn">
              Signup
            </NavLink>
          ) : (
            <NavLink to="/login" className="login-btn">
              Login
            </NavLink>
          )
        )}
      </nav>
    </header>
  );
};

export default Navbar;
