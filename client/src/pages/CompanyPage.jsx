import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { LockKeyhole, Sparkles } from "lucide-react";
import { apiGet } from "../lib/api.js";
import { getCompanyProfileById } from "../lib/auth.js";
import {
  applyStorefrontTheme,
  formatCurrency,
  getCompanyInitials,
  resetStorefrontTheme,
} from "../lib/storefront.js";

const CompanyPage = () => {
  const { companyId } = useParams();
  const [company, setCompany] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadCompanyPreview = async () => {
      try {
        const [companyProfile, productData] = await Promise.all([
          getCompanyProfileById(companyId),
          apiGet("/api/products/public", { companyId, limit: 6 }),
        ]);

        if (!mounted) return;
        setCompany(companyProfile);
        setProducts(productData?.products || []);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadCompanyPreview();
    return () => {
      mounted = false;
    };
  }, [companyId]);

  useEffect(() => {
    if (!company) return undefined;
    applyStorefrontTheme(company);
    return () => resetStorefrontTheme();
  }, [company]);

  if (loading) {
    return <div className="client-empty-state">Loading company preview...</div>;
  }

  if (!company) {
    return <div className="client-empty-state">Company not found.</div>;
  }

  return (
    <div className="client-page">
      <section className="client-store-shell">
        <article className="client-store-hero">
          <div className="client-store-hero-copy">
            <span className="client-kicker">Public Preview</span>
            <h1>{company.storefrontHeadline || company.companyName}</h1>
            <p>{company.storefrontSubheadline || company.companyDescription}</p>

            <div className="client-actions">
              <Link to={`/companies/${companyId}/store`} className="client-primary-link">
                Unlock Full Store
              </Link>
              <Link to="/login" className="client-secondary-link">
                Customer Login
              </Link>
            </div>
          </div>

          <div className="client-store-company">
            {company.companyLogo ? (
              <img src={company.companyLogo} alt={company.companyName} className="client-company-logo" />
            ) : (
              <div className="client-company-logo client-company-logo-fallback">
                {getCompanyInitials(company)}
              </div>
            )}

            <div className="client-company-stack">
              <div className="client-company-detail">
                <span>Company</span>
                <strong>{company.companyName}</strong>
              </div>
              <div className="client-company-detail">
                <span>Working Hours</span>
                <strong>{company.companyWorkingHours || "Not set"}</strong>
              </div>
              <div className="client-company-detail">
                <span>Working Days</span>
                <strong>{company.companyWorkingDays || "Not set"}</strong>
              </div>
              <div className="client-company-detail">
                <span>Location</span>
                <strong>{company.companyLocation || "Online first"}</strong>
              </div>
              <div className="client-company-detail">
                <span>User Availability</span>
                <strong>
                  {company.hasAvailableProducts
                    ? `${company.availableProductCount || 0} products available now`
                    : "No products available for users right now"}
                </strong>
              </div>
            </div>
          </div>
        </article>

        {company.storefrontAnnouncement ? (
          <div className="client-announcement">
            <Sparkles size={16} />
            <span>{company.storefrontAnnouncement}</span>
          </div>
        ) : null}

        <section className="client-section">
          <div className="client-section-head split">
            <div>
              <span className="client-kicker">Preview Products</span>
              <h2>Authentication unlocks the complete shopping experience</h2>
            </div>
            <div className="client-lock-note">
              <LockKeyhole size={16} />
              <span>
                {company.hasAvailableProducts
                  ? "Sign in required for full store access and purchases"
                  : "This company has no user-available products right now"}
              </span>
            </div>
          </div>

          {products.length > 0 ? (
            <div className="client-product-grid">
              {products.map((product) => (
                <article key={product._id} className="client-product-card">
                  <img src={product.image} alt={product.name} />
                  <div>
                    <p className="client-meta">
                      {product.brand} • {product.category}
                    </p>
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <div className="client-product-row">
                      <strong>{formatCurrency(product.price)}</strong>
                      <span>{product.quantity} in stock</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="client-empty-state">
              This company has products configured, but none are currently available to users.
            </div>
          )}
        </section>
      </section>
    </div>
  );
};

export default CompanyPage;
