const CART_STORAGE_KEY = "busi_tech_client_cart";

export function readCart() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCart(cart) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent("cart:updated", { detail: cart }));
}

export function addCartItem(product, quantity = 1) {
  const cart = readCart();
  const existing = cart.find((item) => item._id === product._id);

  if (existing) {
    existing.quantity = Math.min(existing.quantity + quantity, existing.stock || quantity);
  } else {
    cart.push({
      _id: product._id,
      name: product.name,
      brand: product.brand,
      image: product.image,
      category: product.category,
      companyId: product.companyId || product.ownerAdmin || "",
      companyName: product.companyName || "",
      companySlug: product.companySlug || "",
      price: Number(product.price) || 0,
      quantity: Math.min(quantity, Number(product.quantity) || quantity),
      stock: Number(product.quantity) || 0,
    });
  }

  writeCart(cart);
  return cart;
}

export function updateCartItemQuantity(productId, quantity) {
  const cart = readCart()
    .map((item) => {
      if (item._id !== productId) return item;
      return {
        ...item,
        quantity: Math.max(1, Math.min(quantity, item.stock || quantity)),
      };
    })
    .filter((item) => item.quantity > 0);

  writeCart(cart);
  return cart;
}

export function removeCartItem(productId) {
  const cart = readCart().filter((item) => item._id !== productId);
  writeCart(cart);
  return cart;
}

export function getCartCount(cart = readCart()) {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartTotal(cart = readCart()) {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function clearCart() {
  writeCart([]);
  return [];
}
