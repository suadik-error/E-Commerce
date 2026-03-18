import { useNavigate } from "react-router-dom";

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
  "Create a secure workspace where your business can manage staff, products, and operations in a structured way.",
  "Assign the right dashboards to admins, managers, and agents so each person sees only the tools and information relevant to their role.",
  "Track products, sales, payment confirmations, notifications, and team activity inside one connected system instead of separate spreadsheets and chats.",
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-grid">
          <div className="home-hero-copy">
            <span className="home-badge">Suad Business Tech</span>
            <h1>One business platform for managing products, sales, people, and daily operations.</h1>
            <p>
              Suad Business Tech brings your operational workflow into one place.
              Instead of managing products in one tool, tracking payments in another,
              and coordinating staff manually, you get a connected workspace built
              for admins, managers, and agents working as one team.
            </p>

            <div className="home-actions">
              <button className="home-primary-btn" onClick={() => navigate("/login")}>
                Login to Workspace
              </button>
              <button
                className="home-secondary-btn"
                onClick={() => navigate("/admin-request")}
              >
                Request Admin Access
              </button>
            </div>

            <div className="home-summary">
              <div>
                <strong>Products</strong>
                <span>Organize inventory, product activity, and sales flow from a single workspace.</span>
              </div>
              <div>
                <strong>Teams</strong>
                <span>Give admins, managers, and agents the right access without splitting the system.</span>
              </div>
              <div>
                <strong>Mobile Ready</strong>
                <span>Use the platform across desktop, tablet, and mobile when work needs to move fast.</span>
              </div>
            </div>
          </div>

          <div className="home-hero-panel">
            <div className="hero-panel-header">
              <span>Platform Snapshot</span>
              <strong>Built for everyday operations</strong>
            </div>

            <div className="hero-panel-grid">
              <article className="hero-panel-card accent-blue">
                <h3>Product Oversight</h3>
                <p>See product-related activity in context so stock, updates, and sales actions stay aligned.</p>
              </article>
              <article className="hero-panel-card accent-gold">
                <h3>Payment Visibility</h3>
                <p>Review payment confirmations and sales records with clearer operational visibility.</p>
              </article>
              <article className="hero-panel-card accent-green">
                <h3>Team Coordination</h3>
                <p>Keep handoffs between admin, manager, and agent organized instead of fragmented.</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-header">
          <span className="home-section-label">Built Around Roles</span>
          <h2>Each user sees the work that matters to them.</h2>
          <p>
            The platform is structured around real business responsibilities, so
            leadership can monitor performance while each team member stays focused
            on their own tasks.
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
          <h2>A cleaner workflow from setup to daily execution.</h2>
          <p>
            From onboarding your team to tracking sales outcomes, the system is
            designed to reduce confusion and keep your operational flow visible.
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
            <span className="home-section-label">Ready To Use It</span>
            <h2>Start from the public homepage, then move directly into the workspace that fits your role.</h2>
          </div>
          <div className="home-actions">
            <button className="home-primary-btn" onClick={() => navigate("/signup")}>
              Create Account
            </button>
            <button className="home-secondary-btn" onClick={() => navigate("/login")}>
              Login
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
