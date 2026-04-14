import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getCartCount,
  getCartTotal,
  readCart,
  removeCartItem,
  updateCartItemQuantity,
} from "../lib/cart.js";
import { formatCurrency } from "../lib/storefront.js";

const CartPage = () => {
  const [cart, setCart] = useState(() => readCart());

  useEffect(() => {
    const syncCart = () => setCart(readCart());
    window.addEventListener("cart:updated", syncCart);
    return () => window.removeEventListener("cart:updated", syncCart);
  }, []);

  const groupedCart = useMemo(() => {
    return cart.reduce((groups, item) => {
      const key = item.companyId || "unassigned";
      if (!groups[key]) {
        groups[key] = {
          companyName: item.companyName || "Company",
          companyId: item.companyId,
          items: [],
        };
      }

      groups[key].items.push(item);
      return groups;
    }, {});
  }, [cart]);

  return (
    <div className="client-page">
      <section className="client-section client-cart-layout">
        <div className="client-card">
          <div className="client-section-head">
            <span className="client-kicker">Cart</span>
            <h1>Ready for checkout across your selected vendors</h1>
          </div>

          {cart.length === 0 ? (
            <div className="client-empty-state">
              Your cart is empty. <Link to="/companies">Browse storefronts</Link>.
            </div>
          ) : (
            <div className="client-cart-groups">
              {Object.entries(groupedCart).map(([companyKey, group]) => (
                <section key={companyKey} className="client-cart-group">
                  <div className="client-cart-group-head">
                    <h2>{group.companyName}</h2>
                    {group.companyId ? (
                      <Link to={`/companies/${group.companyId}/store`} className="client-secondary-button">
                        Continue shopping
                      </Link>
                    ) : null}
                  </div>

                  <div className="client-cart-list">
                    {group.items.map((item) => (
                      <article key={item._id} className="client-cart-item">
                        <img src={item.image} alt={item.name} />
                        <div className="client-cart-content">
                          <div>
                            <p className="client-meta">
                              {item.brand} • {item.category}
                            </p>
                            <h3>{item.name}</h3>
                            <p>{item.stock} available</p>
                          </div>
                          <div className="client-cart-controls">
                            <div className="client-stepper">
                              <button
                                type="button"
                                onClick={() =>
                                  setCart(updateCartItemQuantity(item._id, item.quantity - 1))
                                }
                              >
                                -
                              </button>
                              <span>{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setCart(updateCartItemQuantity(item._id, item.quantity + 1))
                                }
                              >
                                +
                              </button>
                            </div>
                            <strong>{formatCurrency(item.price * item.quantity)}</strong>
                            <button
                              type="button"
                              className="client-secondary-button"
                              onClick={() => setCart(removeCartItem(item._id))}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        <aside className="client-card">
          <h2>Checkout Summary</h2>
          <div className="client-summary-row">
            <span>Items</span>
            <strong>{getCartCount(cart)}</strong>
          </div>
          <div className="client-summary-row">
            <span>Total</span>
            <strong>{formatCurrency(getCartTotal(cart))}</strong>
          </div>
          <p className="client-muted">
            Orders are submitted through the shared sales API and immediately reduce live inventory.
          </p>

          <Link
            to={cart.length > 0 ? "/checkout" : "/companies"}
            className="client-primary-link full-width"
          >
            {cart.length > 0 ? "Proceed to checkout" : "Explore companies"}
          </Link>
        </aside>
      </section>
    </div>
  );
};

export default CartPage;
