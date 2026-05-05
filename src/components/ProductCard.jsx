import { Link } from "react-router-dom";
import { formatRupiah } from "../utils/formatCurrency";

export default function ProductCard({ product, onAddToCart }) {
  const isSoldOut = product.stockStatus === "Sold Out";

  return (
    <article className={`product-card ${isSoldOut ? "is-sold-out" : ""}`}>
      <Link to={`/shop/${product.slug}`} className="product-image">
        <img src={product.image} alt={product.name} />

        {product.badge && <span className="product-badge">{product.badge}</span>}
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

        <h3>{product.name}</h3>
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
              onClick={() => onAddToCart(product)}
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