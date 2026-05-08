import { Link } from "react-router-dom";
import { formatRupiah } from "../utils/formatCurrency";

export default function ProductCard({ product, onAddToCart }) {
  const isSoldOut =
    product.stockStatus === "Sold Out" ||
    product.stock_status === "Sold Out" ||
    product.is_active === false;

  const slug = product.slug || product.id;
  const productUrl = `/shop/${slug}`;

  const imageUrl =
    product.image ||
    product.image_url ||
    product.thumbnail_url ||
    "/images/placeholder.jpg";

  const category = product.category || "Digital Product";

  const hasDiscount =
    product.compare_at_price &&
    Number(product.compare_at_price) > Number(product.price);

  const discountPercent = hasDiscount
    ? Math.round(
        ((Number(product.compare_at_price) - Number(product.price)) /
          Number(product.compare_at_price)) *
          100
      )
    : 0;

  const badge = product.badge || (product.is_sale ? "SALE" : null);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSoldOut) return;

    const cartProduct = {
      id: product.id,
      name: product.name,
      slug,
      category,
      description: product.description || "",
      price: Number(product.price || 0),
      compare_at_price: product.compare_at_price || null,
      image: imageUrl,
      file_path: product.file_path || null,
      quantity: 1,
    };

    onAddToCart?.(cartProduct);
  };

  return (
    <article className={`product-card ${isSoldOut ? "is-sold-out" : ""}`}>
      <Link
        to={productUrl}
        className="product-image"
        aria-label={`View detail ${product.name}`}
      >
        <img src={imageUrl} alt={product.name || "Product"} loading="lazy" />

        {badge && <span className="product-badge">{badge}</span>}

        {hasDiscount && (
          <span className="product-discount-badge">
            Save {discountPercent}%
          </span>
        )}

        {isSoldOut && <span className="product-badge sold">Sold Out</span>}
      </Link>

      <div className="product-info">
        <div className="product-meta-row">
          <span>{category}</span>

          <strong
            className={`stock-badge ${isSoldOut ? "sold-out" : "available"}`}
          >
            {isSoldOut ? "Sold Out" : "Available"}
          </strong>
        </div>

        <Link to={productUrl} className="product-title-link">
          <h3>{product.name}</h3>
        </Link>

        <p>
          {product.short_description ||
            product.description ||
            "Produk digital siap pakai untuk kebutuhan kreatif kamu."}
        </p>

        <div className="product-card-rating">
          ★★★★★
          <span>
            {Number(product.rating || 4.9).toFixed(1)}
            {product.sold_count ? ` • ${product.sold_count} sold` : ""}
          </span>
        </div>

        <div className="product-bottom">
          <div className="product-card-price">
            <strong>
              {product.pricePrefix && <small>{product.pricePrefix}</small>}
              {formatRupiah(product.price || 0)}
            </strong>

            {hasDiscount && (
              <span>{formatRupiah(product.compare_at_price)}</span>
            )}
          </div>

          <div className="product-actions">
            <Link to={productUrl} className="product-btn secondary">
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