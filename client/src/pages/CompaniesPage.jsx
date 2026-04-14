import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { getCompanies } from "../lib/auth.js";
import { getCompanyInitials } from "../lib/storefront.js";

const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadCompanies = async () => {
      const nextCompanies = await getCompanies();
      if (!mounted) return;
      setCompanies(nextCompanies);
      setLoading(false);
    };

    loadCompanies();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredCompanies = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return companies;

    return companies.filter((company) =>
      [company.companyName, company.companyDescription, company.companyLocation]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [companies, search]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setSearch(searchInput);
  };

  return (
    <div className="client-page">
      <section className="client-section">
        <div className="client-section-head">
          <span className="client-kicker">Vendor Directory</span>
          <h1>Public company discovery with protected store access</h1>
          <p className="client-muted">
            Explore vendors openly, compare branding and inventory breadth, then sign in to unlock
            each company&apos;s full storefront and checkout flow.
          </p>
        </div>

        <form className="client-toolbar search client-search-form" onSubmit={handleSearchSubmit}>
          <label className="client-search-shell">
            <Search size={18} />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search companies by name, description, or location"
              className="client-search"
            />
          </label>
          <button type="submit" className="client-primary-button client-search-button">
            Search
          </button>
        </form>

        {loading ? (
          <div className="client-empty-state">Loading companies...</div>
        ) : filteredCompanies.length === 0 ? (
          <div className="client-empty-state">No companies matched your search.</div>
        ) : (
          <div className="client-company-grid-list">
            {filteredCompanies.map((company) => (
              <article
                key={company._id}
                className="client-company-card company-directory-card"
                style={{
                  "--company-primary": company.primaryColor,
                  "--company-accent": company.accentColor,
                }}
              >
                <div className="client-company-head">
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
                    <h2>{company.companyName}</h2>
                    <p>{company.companyDescription || "No description available yet."}</p>
                  </div>
                </div>

                <div className="client-company-stack">
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
                    <strong>{company.companyLocation || "Remote / online"}</strong>
                  </div>
                  <div className="client-company-detail">
                    <span>Inventory</span>
                    <strong>
                      {company.hasAvailableProducts
                        ? `${company.availableProductCount || 0} products available`
                        : "No products available for users"}
                    </strong>
                  </div>
                </div>

                <div className="client-actions inline">
                  <Link to={`/companies/${company._id}`} className="client-primary-button">
                    View Preview
                  </Link>
                  <Link to={`/companies/${company._id}/store`} className="client-secondary-button">
                    Open Store
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CompaniesPage;
