import { Link } from "react-router-dom";

const CLIENT_APP_URL = import.meta.env.VITE_CLIENT_APP_URL || "";

const SignUpPage = () => {
  return (
    <div className="signup-container">
      <div className="auth-shell">
        <div className="auth-brand">
          <span className="auth-kicker">Portal Split</span>
          <h1>Customer signup now belongs in the separate client app.</h1>
          <p>
            This frontend is reserved for internal admin, manager, and agent workflows. Default
            users should create accounts in the client app.
          </p>
          <div className="auth-highlights">
            <span>Separate client app</span>
            <span>Internal staff portal</span>
            <span>Admin request flow</span>
          </div>
        </div>

        <div className="signup-card auth-panel">
          <h2>Choose the right entry point</h2>
          <p className="auth-subtitle">
            Use the client app for user accounts, or request internal access here.
          </p>

          <div className="auth-form">
            {CLIENT_APP_URL ? (
              <a href={`${CLIENT_APP_URL.replace(/\/$/, "")}/signup`} className="signup-btn">
                Open Client Signup
              </a>
            ) : (
              <p className="error-text">Set `VITE_CLIENT_APP_URL` to link the client app here.</p>
            )}
            <Link to="/admin-request" className="login-btn">
              Request Admin Access
            </Link>
          </div>

          <p className="login-text">
            Already staff? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
