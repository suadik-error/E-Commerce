import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const SignUpPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};

const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    setError("Passwords do not match");
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

    const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Signup failed");
    }

    navigate("/login");

  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  const validatePassword = (password) => {
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (!minLength) return "Password must be at least 8 characters";
  if (!hasUpper) return "Password must include an uppercase letter";
  if (!hasLower) return "Password must include a lowercase letter";
  if (!hasNumber) return "Password must include a number";
  if (!hasSpecial) return "Password must include a special character";

  return "";
};


  return (
    <div className="signup-container">
      <div className="auth-shell">
        <div className="auth-brand">
          <span className="auth-kicker">Get Started</span>
          <h1>Create your account and launch your sales workspace.</h1>
          <p>
            Set up your access once, then manage products, staff activity, and
            customer-facing operations from a single dashboard.
          </p>
          <div className="auth-highlights">
            <span>Fast onboarding</span>
            <span>Secure access</span>
            <span>Team-ready tools</span>
          </div>
        </div>

        <div className="signup-card auth-panel">
          <h2>Create account</h2>
          <p className="auth-subtitle">Open a new workspace in a few steps.</p>

          {error && <p className="error-text">{error}</p>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <span className="icon">👤</span>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <span className="icon">📧</span>
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
              <span className="icon">🔒</span>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <span className="icon">🔒</span>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            {formData.password && (
              <small className="password-hint">
                Use at least 8 characters, uppercase, number & symbol
              </small>
            )}

            <button type="submit" className="signup-btn" disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <p className="login-text">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
