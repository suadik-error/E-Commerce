import { useNavigate } from "react-router-dom";

const features = [
  {
    title: "Operations Control",
    description:
      "Keep products, orders, and staff activity organized from one central workspace.",
  },
  {
    title: "Role-Based Dashboards",
    description:
      "Give admins, managers, and agents clean access to the tools they actually need.",
  },
  {
    title: "Faster Decisions",
    description:
      "Track payments, sales performance, and product movement without jumping between tools.",
  },
];

const partners = ["Amazon", "Shopify", "Paystack", "Stripe"];

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-page">
      <section className="hero">
        <div className="overlay hero-layout">
          <div className="hero-copy">
            <span className="hero-kicker">Busi-Tech</span>
            <h1>Modern commerce operations for teams that need clarity.</h1>
            <p>
              Manage products, payments, team roles, and sales activity from a
              platform built to keep your business moving without spreadsheet chaos.
            </p>

            <div className="hero-actions">
              <button
                className="button"
                onClick={() => navigate("/admin-request")}
              >
                Request Admin Access
              </button>
              <button
                className="button button-secondary"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
            </div>
          </div>

          <div className="hero-panel">
            <div className="hero-metric">
              <strong>1 dashboard</strong>
              <span>for inventory, teams, and sales visibility</span>
            </div>
            <div className="hero-metric">
              <strong>3 user roles</strong>
              <span>so admins, managers, and agents stay in their lane</span>
            </div>
            <div className="hero-metric">
              <strong>Live workflow</strong>
              <span>with a setup that works on desktop and mobile</span>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="features-header">
          <span className="section-label">Why teams use it</span>
          <h2>A cleaner way to run your commerce workflow.</h2>
        </div>

        <div className="feature-grid">
          {features.map((feature) => (
            <article key={feature.title} className="feature-card">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="partners">
        <h3>
          Built for businesses working across modern payment and storefront systems
        </h3>
        <div className="logos">
          {partners.map((partner) => (
            <div key={partner} className="partner-pill">
              {partner}
            </div>
          ))}
        </div>
      </section>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Busi-Tech</p>
      </footer>
    </div>
  );
};

export default WelcomePage;
