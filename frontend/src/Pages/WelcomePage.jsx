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
          <span>Amazon</span>
          <span>Shopify</span>
          <span>Paystack</span>
          <span>Stripe</span>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} Your Company Name</p>
      </footer>
    </div>
  );
};

const styles = {

};

export default WelcomePage;
