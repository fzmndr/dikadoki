import { Link } from "react-router-dom";

import { routes } from "../config/routes";
import { formatRupiah } from "../utils/formatCurrency";

export default function CartDrawer({ isOpen, onClose, cartItems = [] }) {
  const total = cartItems.reduce((sum, item) => {
    return sum + item.price * (item.quantity || 1);
  }, 0);

  const totalItems = cartItems.reduce((sum, item) => {
    return sum + (item.quantity || 1);
  }, 0);

  if (!isOpen) return null;

  return (
    <div
      className="cart-drawer-overlay"
      onClick={onClose}
      role="button"
      tabIndex={-1}
    >
      <aside
        className="cart-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className="cart-drawer-header">
          <div>
            <span>dikadoki Store</span>
            <h3>Your Cart</h3>

            {cartItems.length > 0 && (
              <p>
                {totalItems} item{totalItems > 1 ? "s" : ""} in cart
              </p>
            )}
          </div>

          <button type="button" onClick={onClose} aria-label="Close cart">
            ×
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <p>Keranjang kamu masih kosong.</p>

            <Link to={routes.shop} onClick={onClose}>
              Explore Products
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map((item) => {
                const quantity = item.quantity || 1;
                const itemTotal = item.price * quantity;

                return (
                  <div className="cart-item" key={item.id}>
                    <Link
                      to={`${routes.shop}/${item.slug}`}
                      onClick={onClose}
                      className="cart-item-image"
                    >
                      <img src={item.image} alt={item.name} />
                    </Link>

                    <div>
                      <span>{item.category}</span>

                      <Link
                        to={`${routes.shop}/${item.slug}`}
                        onClick={onClose}
                        className="cart-item-title"
                      >
                        <h4>{item.name}</h4>
                      </Link>

                      <p>Qty: {quantity}</p>

                      <strong>{formatRupiah(itemTotal)}</strong>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart-drawer-footer">
              <div className="cart-total">
                <span>Total</span>
                <strong>{formatRupiah(total)}</strong>
              </div>

              <Link
                to={routes.cart}
                onClick={onClose}
                className="cart-checkout-btn"
              >
                View Cart
              </Link>

              <Link
                to={routes.shop}
                onClick={onClose}
                className="cart-continue-btn"
              >
                Continue Shopping
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}