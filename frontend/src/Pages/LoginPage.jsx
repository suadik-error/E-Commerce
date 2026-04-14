import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";
const CLIENT_APP_URL = import.meta.env.VITE_CLIENT_APP_URL || "";

const getRedirectPathByRole = (role) => {
  const normalizedRole = String(role || "").trim().toLowerCase();

  if (normalizedRole === "admin") return "/dashboard";
  if (normalizedRole === "manager") return "/manager";
  if (normalizedRole === "agent") return "/agent";
  return "/welcome";
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data?.accessToken) {
        window.dispatchEvent(
          new CustomEvent("auth:token", {
            detail: { accessToken: data.accessToken },
          })
        );
      }

      let role = (data.user || data)?.role;

      try {
        const profileRes = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          credentials: "include",
        });
        if (profileRes.ok) {
          const profile = await profileRes.json();
          role = profile?.role ?? role;
        }
      } catch {
      }

      const normalizedRole = String(role || "").trim().toLowerCase();

      if (normalizedRole === "user") {
        window.dispatchEvent(new CustomEvent("auth:clear"));

        try {
          await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: "POST",
            credentials: "include",
          });
        } catch {
        }

        if (CLIENT_APP_URL) {
          window.location.assign(`${CLIENT_APP_URL.replace(/\/$/, "")}/login`);
          return;
        }

        throw new Error("Default users should sign in through the client app.");
      }

      window.dispatchEvent(new Event("authChanged"));
      navigate(getRedirectPathByRole(role));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="auth-shell">
        <div className="auth-brand">
          <span className="auth-kicker">Staff Portal</span>
          <h1>Admin, manager, and agent access lives here.</h1>
          <p>
            This login is for the internal workspace only. Default users should use the separate
            client application instead of this staff portal.
          </p>
          <div className="auth-highlights">
            <span>Admin workflows</span>
            <span>Manager tools</span>
            <span>Agent dashboards</span>
          </div>
        </div>

        <div className="login-card auth-panel">
          <h2>Staff login</h2>
          <p className="auth-subtitle">Continue to the internal workspace.</p>

          {error ? <p className="error-text">{error}</p> : null}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <span className="icon">Email</span>
              <input
                type="email"
                name="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <span className="icon">Pass</span>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="signup-text">
            Need admin access? <Link to="/admin-request">Submit a request</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
