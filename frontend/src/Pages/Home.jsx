import { useNavigate } from "react-router-dom";

const CLIENT_APP_URL = import.meta.env.VITE_CLIENT_APP_URL || "";

const roleCards = [
  {
    title: "Admins",
    description:
      "Set platform direction, approve account access, manage managers, monitor activity across the business, and keep products, users, and payments under control from one top-level dashboard.",
  },
  {
    title: "Managers",
    description:
      "Supervise agents and workers, organize product movement, review sales activity, and keep day-to-day operations moving without waiting on constant admin intervention.",
  },
  {
    title: "Agents",
    description:
      "Work directly with products and sales tasks, update progress quickly, and stay focused on execution with a simpler role-specific workspace.",
  },
];

const workflowSteps = [
  "Use the separate client app for default user accounts and customer-facing browsing.",
  "Keep the admin site focused on internal roles like admin, manager, and agent.",
  "Move approved staff into the secured workspace without mixing their experience with the client portal.",
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-grid">
          <div className="home-hero-copy">
            <span className="home-badge">Staff Portal</span>
            <h1>One internal workspace for admins, managers, and agents.</h1>
            <p>
              This frontend is the staff-facing side of Busi-Tech. Default users now belong in the
              separate client app, while this portal stays focused on internal operations.
            </p>

            <div className="home-actions">
              <button className="home-primary-btn" onClick={() => navigate("/login")}>
                Staff Login
              </button>
              {CLIENT_APP_URL ? (
                <button
                  className="home-secondary-btn"
                  onClick={() => window.location.assign(CLIENT_APP_URL)}
                >
                  Open Client App
                </button>
              ) : null}
              <button
                className="home-secondary-btn"
                onClick={() => navigate("/admin-request")}
              >
                Request Admin Access
              </button>
            </div>

            <div className="home-summary">
              <div>
                <strong>Separated Access</strong>
                <span>Customer users and staff roles no longer share the same frontend entry point.</span>
              </div>
              <div>
                <strong>Role Workspaces</strong>
                <span>Admins, managers, and agents keep their own dashboards and protected routes.</span>
              </div>
              <div>
                <strong>Cleaner Flow</strong>
                <span>Client signup stays in the client app while admin requests stay here.</span>
              </div>
            </div>
          </div>

          <div className="home-hero-panel">
            <div className="hero-panel-header">
              <span>Portal Split</span>
              <strong>Internal app only</strong>
            </div>

            <div className="hero-panel-grid">
              <article className="hero-panel-card accent-blue">
                <h3>Admin Control</h3>
                <p>Manage staff, products, payments, and permissions from one secured workspace.</p>
              </article>
              <article className="hero-panel-card accent-gold">
                <h3>Client Isolation</h3>
                <p>Default users authenticate in a separate app so role boundaries stay clear.</p>
              </article>
              <article className="hero-panel-card accent-green">
                <h3>Cleaner Routing</h3>
                <p>Staff routes no longer compete with the customer-facing flow.</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-header">
          <span className="home-section-label">Built Around Roles</span>
          <h2>Each internal role sees the work that matters to them.</h2>
          <p>
            The staff portal is structured around real business responsibilities, while the client
            app is kept separate for default users.
          </p>
        </div>

        <div className="home-role-grid">
          {roleCards.map((role) => (
            <article key={role.title} className="home-role-card">
              <h3>{role.title}</h3>
              <p>{role.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section home-section-alt">
        <div className="home-section-header">
          <span className="home-section-label">How It Works</span>
          <h2>Separate client access from internal operations.</h2>
          <p>
            This keeps user journeys simpler and avoids conflicts between public account flows and
            internal business dashboards.
          </p>
        </div>

        <div className="home-workflow">
          {workflowSteps.map((step, index) => (
            <div key={step} className="home-workflow-step">
              <span className="home-step-number">0{index + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="home-cta">
        <div className="home-cta-card">
          <div>
            <span className="home-section-label">Next Step</span>
            <h2>Use the staff portal for approved roles and the client app for default user accounts.</h2>
          </div>
          <div className="home-actions">
            <button className="home-secondary-btn" onClick={() => navigate("/login")}>
              Staff Login
            </button>
            {CLIENT_APP_URL ? (
              <button
                className="home-primary-btn"
                onClick={() => window.location.assign(CLIENT_APP_URL)}
              >
                Client App
              </button>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
