import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";
const CLIENT_APP_URL = import.meta.env.VITE_CLIENT_APP_URL || "";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const rawText = await response.text();
      const data = rawText ? JSON.parse(rawText) : {};

      if (!response.ok) {
        const existingRole = String(data?.existingRole || "").toLowerCase();
        if (["admin", "manager", "agent"].includes(existingRole)) {
          throw new Error("This email belongs to a staff account. Please use Staff Login.");
        }
        throw new Error(data?.message || "Signup failed");
      }

      // New default-user accounts should continue in the client app flow.
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

      setSuccess("Signup successful. Please continue by logging in.");
      navigate("/login");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="auth-shell">
        <div className="auth-brand">
          <span className="auth-kicker">Create Account</span>
          <h1>Create your account to access the client experience.</h1>
          <p>
            Sign up here with your details. Staff accounts (admin, manager, agent) should use the
            internal login flow.
          </p>
          <div className="auth-highlights">
            <span>Quick registration</span>
            <span>Client account flow</span>
            <span>Staff access control</span>
          </div>
        </div>

        <div className="signup-card auth-panel">
          <h2>Sign up</h2>
          <p className="auth-subtitle">Create your account with name, email, and password.</p>

          {error ? <p className="error-text">{error}</p> : null}
          {success ? <p className="success-text">{success}</p> : null}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <span className="icon" aria-hidden="true">
                <User size={16} />
              </span>
              <input
                type="text"
                name="name"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <span className="icon" aria-hidden="true">
                <Mail size={16} />
              </span>
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
              <span className="icon" aria-hidden="true">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={handleChange}
                minLength={8}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button type="submit" className="signup-btn" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="auth-form">
            <Link to="/admin-request" className="login-btn">
              Request Admin Access
            </Link>
          </div>

          <p className="login-text">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
