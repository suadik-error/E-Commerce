import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Search, ShoppingBag } from "lucide-react";
import { apiGet } from "../lib/api.js";
import { getCompanyProfileById } from "../lib/auth.js";
import { addCartItem } from "../lib/cart.js";
import {
  applyStorefrontTheme,
  formatCurrency,
  getCompanyInitials,
  resetStorefrontTheme,
} from "../lib/storefront.js";

const ProductsPage = () => {
  const { companyId } = useParams();
  const [company, setCompany] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadStorefront = async () => {
      try {
        const [companyProfile, productData] = await Promise.all([
          getCompanyProfileById(companyId),
          apiGet("/api/products/public", { companyId, limit: 60 }),
        ]);

        if (!mounted) return;
        setCompany(companyProfile);
        setProducts(productData?.products || []);
        setCategories(productData?.categories || []);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadStorefront();
    return () => {
      mounted = false;
    };
  }, [companyId]);

  useEffect(() => {
    if (!company) return undefined;
    applyStorefrontTheme(company);
    return () => resetStorefrontTheme();
  }, [company]);

  useEffect(() => {
    if (!notice) return undefined;
    const timeoutId = window.setTimeout(() => setNotice(""), 2400);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = activeCategory === "all" || product.category === activeCategory;
      const haystack = [product.name, product.brand, product.description, product.category]
        .join(" ")
        .toLowerCase();
      const matchesSearch = haystack.includes(search.trim().toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, products, search]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setSearch(searchInput);
  };

  if (loading) {
    return <div className="client-empty-state">Loading storefront...</div>;
  }

  if (!company) {
    return <div className="client-empty-state">Company not found.</div>;
  }

  return (
    <div className="client-page">
      <section className="client-store-shell">
        <article className={`client-store-hero ${company.storefrontLayout || "editorial"}`}>
          <div className="client-store-hero-copy">
            <span className="client-kicker">Authenticated Storefront</span>
            <h1>{company.storefrontHeadline || company.companyName}</h1>
            <p>{company.storefrontSubheadline || company.companyDescription}</p>

            <div className="client-actions">
              <Link to="/cart" className="client-primary-link">
                Review Cart
              </Link>
              <Link to="/account" className="client-secondary-link">
                Customer Profile
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
                <span>Open</span>
                <strong>{company.companyWorkingDays || "Every day"}</strong>
              </div>
              <div className="client-company-detail">
                <span>Hours</span>
                <strong>{company.companyWorkingHours || "Always available"}</strong>
              </div>
              <div className="client-company-detail">
                <span>Inventory</span>
                <strong>
                  {products.length > 0
                    ? `${products.length} live products`
                    : "No products available to users"}
                </strong>
              </div>
              <div className="client-company-detail">
                <span>Location</span>
                <strong>{company.companyLocation || "Distributed commerce"}</strong>
              </div>
            </div>
          </div>
        </article>

        {company.storefrontAnnouncement ? (
          <div className="client-announcement">{company.storefrontAnnouncement}</div>
        ) : null}

        <section className="client-toolbar">
          <form className="client-search-form" onSubmit={handleSearchSubmit}>
            <label className="client-search-shell">
              <Search size={18} />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search products, categories, or brands"
                className="client-search"
              />
            </label>
            <button type="submit" className="client-primary-button client-search-button">
              Search
            </button>
          </form>

          <div className="client-chip-row">
            <button
              type="button"
              className={`client-chip ${activeCategory === "all" ? "active" : ""}`}
              onClick={() => setActiveCategory("all")}
            >
              All products
            </button>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`client-chip ${activeCategory === category ? "active" : ""}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {notice ? <div className="client-notice success">{notice}</div> : null}

        {filteredProducts.length > 0 ? (
          <section className="client-product-grid">
            {filteredProducts.map((product) => (
            <article
              key={product._id}
              className={`client-product-card ${company.storefrontCardStyle || "soft"}`}
            >
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
                <div className="client-product-actions">
                  <Link
                    to={`/companies/${companyId}/products/${product._id}`}
                    className="client-secondary-button"
                  >
                    View details
                  </Link>
                  <button
                    type="button"
                    className="client-primary-button"
                    onClick={() => {
                      addCartItem(
                        {
                          ...product,
                          companyId,
                          companyName: company.companyName,
                          companySlug: company.companySlug,
                        },
                        1
                      );
                      setNotice(`${product.name} added to cart.`);
                    }}
                  >
                    <ShoppingBag size={16} />
                    Add
                  </button>
                </div>
              </div>
            </article>
            ))}
          </section>
        ) : (
          <div className="client-empty-state">No products matched your current filters.</div>
        )}
      </section>
    </div>
  );
};

export default ProductsPage;
