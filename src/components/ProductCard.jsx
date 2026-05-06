import { Link } from "react-router-dom";
import { formatRupiah } from "../utils/formatCurrency";

export default function ProductCard({ product, onAddToCart }) {
  const isSoldOut = product.stockStatus === "Sold Out";

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSoldOut) return;
    onAddToCart(product);
  };

  return (
    <article className={`product-card ${isSoldOut ? "is-sold-out" : ""}`}>
      <Link
        to={`/shop/${product.slug}`}
        className="product-image"
        aria-label={`View detail ${product.name}`}
      >
        <img src={product.image} alt={product.name} />

        {product.badge && (
          <span className="product-badge">{product.badge}</span>
        )}
      </Link>

      <div className="product-info">
        <div className="product-meta-row">
          <span>{product.category}</span>

          {product.stockStatus && (
            <strong
              className={`stock-badge ${
                isSoldOut ? "sold-out" : "available"
              }`}
            >
              {product.stockStatus}
            </strong>
          )}
        </div>

        <Link to={`/shop/${product.slug}`} className="product-title-link">
          <h3>{product.name}</h3>
        </Link>

        <p>{product.description}</p>

        <div className="product-bottom">
          <strong>
            {product.pricePrefix && <small>{product.pricePrefix}</small>}
            {formatRupiah(product.price)}
          </strong>

          <div className="product-actions">
            <Link to={`/shop/${product.slug}`} className="product-btn secondary">
              Detail
            </Link>

            <button
              type="button"
              onClick={handleAddToCart}
              className="product-btn"
              disabled={isSoldOut}
            >
              {isSoldOut ? "Sold" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}