import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost } from "../lib/api.js";
import { isUserRole } from "../lib/auth.js";
import { getStaffPortal } from "../lib/staffPortal.js";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [portal, setPortal] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setPortal(null);

      const data = await apiPost("/api/auth/login", formData);

      if (data?.accessToken) {
        window.dispatchEvent(
          new CustomEvent("auth:token", { detail: { accessToken: data.accessToken } })
        );
      }

      const role = data?.user?.role;

      if (!isUserRole(role)) {
        const nextPortal = getStaffPortal(role);
        setPortal(nextPortal);
        setError(
          `This account is registered as ${role}. Use the correct staff portal instead of the client storefront.`
        );
        window.dispatchEvent(new CustomEvent("auth:clear"));
        return;
      }

      window.dispatchEvent(new Event("authChanged"));
      navigate("/companies");
    } catch (requestError) {
      setError(requestError.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="client-page client-page-cover">
      <section className="client-auth-shell">
        <div className="client-card">
          <span className="client-kicker">Client Login</span>
          <h1>Sign in with a default user account.</h1>
          <p className="client-muted">
            Admin, manager, and agent accounts are redirected to the staff portal.
          </p>

          {error ? <div className="client-notice error">{error}</div> : null}
          {portal ? (
            <div className="client-notice success">
              <span>Return to your staff workspace:</span>{" "}
              <Link to={portal.path}>{portal.label}</Link>
            </div>
          ) : null}

          <form className="client-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(event) => setFormData({ ...formData, email: event.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(event) => setFormData({ ...formData, password: event.target.value })}
              required
            />
            <button type="submit" className="client-primary-button" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="client-muted">
            Need an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
