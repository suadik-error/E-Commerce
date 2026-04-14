import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost } from "../lib/api.js";
import { getStaffPortal } from "../lib/staffPortal.js";

const validatePassword = (password) => {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Password must include an uppercase letter.";
  if (!/[a-z]/.test(password)) return "Password must include a lowercase letter.";
  if (!/[0-9]/.test(password)) return "Password must include a number.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Password must include a symbol.";
  return "";
};

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [portal, setPortal] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setPortal(null);

      await apiPost("/api/auth/signup", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      navigate("/login");
    } catch (requestError) {
      const nextPortal = getStaffPortal(requestError.existingRole);
      if (nextPortal) {
        setPortal(nextPortal);
        setError(
          `This email already belongs to a ${requestError.existingRole} account. Go back to the correct staff portal.`
        );
        return;
      }
      setError(requestError.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="client-page client-page-cover">
      <section className="client-auth-shell">
        <div className="client-card">
          <span className="client-kicker">Create Account</span>
          <h1>Register as a client user.</h1>

          {error ? <div className="client-notice error">{error}</div> : null}
          {portal ? (
            <div className="client-notice success">
              <span>Open your existing workspace:</span> <Link to={portal.path}>{portal.label}</Link>
            </div>
          ) : null}

          <form className="client-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Full name"
              value={formData.name}
              onChange={(event) => setFormData({ ...formData, name: event.target.value })}
              required
            />
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
            <input
              type="password"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={(event) =>
                setFormData({ ...formData, confirmPassword: event.target.value })
              }
              required
            />
            <button type="submit" className="client-primary-button" disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>

          <p className="client-muted">
            Already registered? <Link to="/login">Login</Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default SignupPage;
