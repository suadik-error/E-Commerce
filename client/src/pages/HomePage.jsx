import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Building2, Palette, ShieldCheck, Sparkles } from "lucide-react";
import { getCompanies } from "../lib/auth.js";
import { getCompanyInitials } from "../lib/storefront.js";

const HomePage = () => {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadCompanies = async () => {
      const nextCompanies = await getCompanies();
      if (mounted) setCompanies(nextCompanies);
    };

    loadCompanies();
    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(
    () => ({
      companies: companies.length,
      products: companies.reduce((sum, company) => sum + (company.productCount || 0), 0),
      featured: companies.reduce((sum, company) => sum + (company.featuredCount || 0), 0),
    }),
    [companies]
  );

  return (
    <div className="client-page client-page-cover">
      <section className="client-hero client-hero-home">
        <div className="client-hero-copy">
          <span className="client-kicker">Multi-Vendor Commerce</span>
          <h1>One inventory core. Instantly branded storefronts for every company.</h1>
          <p>
            Browse companies publicly, then sign in to enter each vendor&apos;s full storefront,
            manage your cart, and complete checkout across a centralized commerce platform.
          </p>

          <div className="client-actions">
            <Link to="/companies" className="client-primary-link">
              Explore Companies
              <ArrowRight size={16} />
            </Link>
            <Link to="/signup" className="client-secondary-link">
              Create Customer Account
            </Link>
          </div>

          <div className="client-stat-row">
            <div className="client-stat-card">
              <strong>{stats.companies}</strong>
              <span>Active companies</span>
            </div>
            <div className="client-stat-card">
              <strong>{stats.products}</strong>
              <span>Synced products</span>
            </div>
            <div className="client-stat-card">
              <strong>{stats.featured}</strong>
              <span>Featured launches</span>
            </div>
          </div>
        </div>

        <div className="client-showcase-panel">
          <div className="client-feature-tile">
            <Sparkles size={18} />
            <div>
              <strong>Generated storefronts</strong>
              <span>Every company gets a polished responsive customer experience automatically.</span>
            </div>
          </div>
          <div className="client-feature-tile">
            <Palette size={18} />
            <div>
              <strong>Brand controls</strong>
              <span>Color, layout, announcement copy, and card style come from the dashboard.</span>
            </div>
          </div>
          <div className="client-feature-tile">
            <ShieldCheck size={18} />
            <div>
              <strong>Protected commerce flow</strong>
              <span>Customers can browse publicly, but authentication gates full stores and checkout.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="client-section">
        <div className="client-section-head split">
          <div>
            <span className="client-kicker">Companies</span>
            <h2>Discover storefront-ready businesses</h2>
          </div>
          <Link to="/companies" className="client-secondary-link">
            View all vendors
          </Link>
        </div>

        <div className="client-company-grid-list">
          {companies.slice(0, 6).map((company) => (
            <article
              key={company._id}
              className="client-company-card featured"
              style={{
                "--company-primary": company.primaryColor,
                "--company-accent": company.accentColor,
              }}
            >
              {company.companyLogo ? (
                <img
                  src={company.companyLogo}
                  alt={company.companyName}
                  className="client-company-logo compact"
                />
              ) : (
                <div className="client-company-logo client-company-logo-fallback compact">
                  {getCompanyInitials(company)}
                </div>
              )}

              <div className="client-company-copy stacked">
                <div className="client-inline-meta">
                  <span>{company.companyWorkingHours || "Hours on request"}</span>
                  <span>
                    {company.hasAvailableProducts
                      ? `${company.availableProductCount || 0} available to users`
                      : "Currently unavailable"}
                  </span>
                </div>
                <h3>{company.companyName}</h3>
                <p>{company.companyDescription || "No company description yet."}</p>
              </div>

              <Link to={`/companies/${company._id}`} className="client-primary-button">
                Preview Store
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="client-section client-platform-strip">
        <article className="client-card">
          <Building2 size={20} />
          <h3>Centralized operations</h3>
          <p>Inventory, catalog updates, and orders stay synchronized through one backend API.</p>
        </article>
        <article className="client-card">
          <Palette size={20} />
          <h3>Customizable presentation</h3>
          <p>Each company can define storefront tone, colors, hero messaging, and product card feel.</p>
        </article>
        <article className="client-card">
          <ShieldCheck size={20} />
          <h3>Ready for scale</h3>
          <p>Shared users, guarded vendor access, and reusable storefront patterns support growth cleanly.</p>
        </article>
      </section>
    </div>
  );
};

export default HomePage;
