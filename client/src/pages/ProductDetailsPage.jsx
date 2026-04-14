import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { apiGet } from "../lib/api.js";
import { getCompanyProfileById } from "../lib/auth.js";
import { addCartItem } from "../lib/cart.js";
import { applyStorefrontTheme, formatCurrency, resetStorefrontTheme } from "../lib/storefront.js";

const ProductDetailsPage = () => {
  const { companyId, productId } = useParams();
  const [company, setCompany] = useState(null);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadProduct = async () => {
      const [companyProfile, productData] = await Promise.all([
        getCompanyProfileById(companyId),
        apiGet(`/api/products/public/${productId}`),
      ]);

      if (!mounted) return;
      setCompany(companyProfile);
      setProduct(productData?.product || null);
      setRelatedProducts(productData?.relatedProducts || []);
    };

    loadProduct();
    return () => {
      mounted = false;
    };
  }, [companyId, productId]);

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

  if (!company || !product) {
    return <div className="client-empty-state">Loading product details...</div>;
  }

  return (
    <div className="client-page">
      <section className="client-section product-detail-layout">
        <article className="client-product-detail-media">
          <img src={product.image} alt={product.name} />
        </article>

        <article className="client-card client-product-detail-copy">
          <span className="client-kicker">{company.companyName}</span>
          <h1>{product.name}</h1>
          <p className="client-meta">
            {product.brand} • {product.category} • {product.color}
          </p>
          <p>{product.description}</p>

          <div className="client-price-line">
            <strong>{formatCurrency(product.price)}</strong>
            <span>{product.quantity} units available</span>
          </div>

          <div className="client-stepper large">
            <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>
              <Minus size={16} />
            </button>
            <span>{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.min(product.quantity, value + 1))}
            >
              <Plus size={16} />
            </button>
          </div>

          {notice ? <div className="client-notice success">{notice}</div> : null}

          <div className="client-actions">
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
                  quantity
                );
                setNotice("Added to cart.");
              }}
            >
              Add to cart
            </button>
            <Link to={`/companies/${companyId}/store`} className="client-secondary-button">
              Back to store
            </Link>
          </div>
        </article>
      </section>

      <section className="client-section">
        <div className="client-section-head">
          <span className="client-kicker">Related products</span>
          <h2>More from this vendor</h2>
        </div>

        <div className="client-product-grid">
          {relatedProducts.map((item) => (
            <article key={item._id} className="client-product-card">
              <img src={item.image} alt={item.name} />
              <div>
                <p className="client-meta">
                  {item.brand} • {item.category}
                </p>
                <h3>{item.name}</h3>
                <div className="client-product-row">
                  <strong>{formatCurrency(item.price)}</strong>
                  <Link
                    to={`/companies/${companyId}/products/${item._id}`}
                    className="client-secondary-button"
                  >
                    View
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductDetailsPage;
