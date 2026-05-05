import { Link } from "react-router-dom";

export default function CartDrawer({ isOpen, onClose, cartItems = [] }) {
  const total = cartItems.reduce((sum, item) => {
    return sum + item.price * (item.quantity || 1);
  }, 0);

  if (!isOpen) return null;

  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <aside className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-drawer-header">
          <div>
            <span>dikadoki Store</span>
            <h3>Your Cart</h3>
          </div>

          <button onClick={onClose} aria-label="Close cart">
            ×
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <p>Keranjang kamu masih kosong.</p>

            <Link to="/shop" onClick={onClose}>
              Explore Products
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map((item) => (
                <div className="cart-item" key={item.id}>
                  <img src={item.image} alt={item.name} />

                  <div>
                    <span>{item.category}</span>
                    <h4>{item.name}</h4>
                    <p>Qty: {item.quantity || 1}</p>
                    <strong>
                      Rp{" "}
                      {(item.price * (item.quantity || 1)).toLocaleString(
                        "id-ID"
                      )}
                    </strong>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-drawer-footer">
              <div className="cart-total">
                <span>Total</span>
                <strong>Rp {total.toLocaleString("id-ID")}</strong>
              </div>

              <Link to="/cart" onClick={onClose} className="cart-checkout-btn">
                View Cart
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}