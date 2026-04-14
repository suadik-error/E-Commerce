import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { getProfile, isUserRole } from "../lib/auth.js";
import { getCartCount, readCart } from "../lib/cart.js";

const ClientLayout = ({ children }) => {
  const [authState, setAuthState] = useState({
    checked: false,
    isAuthenticated: false,
  });
  const [cartCount, setCartCount] = useState(() => getCartCount(readCart()));

  useEffect(() => {
    let mounted = true;

    const syncAuth = async () => {
      const profile = await getProfile();
      if (!mounted) return;
      setAuthState({
        checked: true,
        isAuthenticated: Boolean(profile) && isUserRole(profile.role),
      });
    };

    syncAuth();
    window.addEventListener("authChanged", syncAuth);

    return () => {
      mounted = false;
      window.removeEventListener("authChanged", syncAuth);
    };
  }, []);

  useEffect(() => {
    const syncCart = () => setCartCount(getCartCount(readCart()));
    window.addEventListener("cart:updated", syncCart);
    return () => window.removeEventListener("cart:updated", syncCart);
  }, []);

  return (
    <div className="client-app-shell">
      <header className="client-header">
        <Link to="/" className="client-brand">
          <span className="client-brand-badge">MV</span>
          <div>
            <strong>VendorOS Commerce</strong>
            <small>Centralized inventory, branded storefronts</small>
          </div>
        </Link>

        <nav className="client-nav">
          <NavLink to="/" end className="client-nav-link">
            Home
          </NavLink>
          <NavLink to="/companies" className="client-nav-link">
            Companies
          </NavLink>
          <NavLink to="/cart" className="client-nav-link client-cart-link">
            <ShoppingBag size={16} />
            Cart
            {cartCount > 0 ? <span className="client-cart-count">{cartCount}</span> : null}
          </NavLink>

          {authState.checked && authState.isAuthenticated ? (
            <NavLink to="/account" className="client-primary-link">
              Account
            </NavLink>
          ) : (
            <>
              <NavLink to="/login" className="client-nav-link">
                Login
              </NavLink>
              <NavLink to="/signup" className="client-primary-link">
                Start Shopping
              </NavLink>
            </>
          )}
        </nav>
      </header>

      <main className="client-main">{children}</main>
    </div>
  );
};

export default ClientLayout;
