import { useNavigate } from "react-router-dom";

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* HERO SECTION */}
      <section className="hero">
        <div className="overlay">
          <h1>Welcome to Our E-Commerce Platform</h1>
          <p>
            Manage products, orders, and customers efficiently.
            Grow your business with powerful admin tools.
          </p>

          <button
            className="button"
            onClick={() => navigate("/admin-request")}
          >
            Request Admin Access
          </button>
        </div>
      </section>

      {/* PARTNERS */}
      <section className="partners">
        <h3>Trusted by Our Partners</h3>
        <div className="logos">
          <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon" style={{ height: "50px" }} />
          <img src="https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopify_logo_2018.svg" alt="Shopify" style={{ height: "50px" }} />
          <img src="data:image/png;base64,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" alt="Paystack" style={{ height: "50px" }} />
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" style={{ height: "50px" }} />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} Suad Business Tech</p>
      </footer>
    </div>
  );
};



export default WelcomePage;
