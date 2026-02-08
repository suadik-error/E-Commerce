import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading

  const checkAuth = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/auth/profile", {
        method: "POST",
        credentials: "include",
      });
      console.log("Profile status:", res.status);

      setIsAuthenticated(res.ok);
    } catch {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuth();

    // 🔁 Listen for login/logout changes
    window.addEventListener("authChanged", checkAuth);
    return () => window.removeEventListener("authChanged", checkAuth);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:4000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      setIsAuthenticated(false);
      window.dispatchEvent(new Event("authChanged"));
      navigate("/login");
    } catch (err) {
      console.error("Logout failed");
    }
  };

  if (isAuthenticated === null) return null; // avoid flicker

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h2>Suad<span>Shop</span></h2>
      </div>

      <nav className="navbar-right">
        <NavLink to="/" end>Home</NavLink>

        {isAuthenticated && (
          <>
            <NavLink to="/products">Products</NavLink>
            <NavLink to="/orders">Orders</NavLink>
            <NavLink to="/cart">Cart</NavLink>
          </>
        )}

        {!isAuthenticated ? (
          <NavLink to="/login" className="login-btn">
            Login
          </NavLink>
        ) : (
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
