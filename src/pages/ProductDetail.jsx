import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { products } from "../data/products";
import Toast from "../components/Toast";
import CartDrawer from "../components/CartDrawer";
import ProductCard from "../components/ProductCard";
import PageMeta from "../components/PageMeta";
import { formatRupiah } from "../utils/formatCurrency";

export default function ProductDetail() {
  const { slug } = useParams();

  const [toast, setToast] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const product = products.find((item) => item.slug === slug);
  const isSoldOut = product?.stockStatus === "Sold Out";

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(savedCart);
  }, []);

  if (!product) {
    return (
      <>
        <PageMeta
          title="Product Not Found"
          description="Produk yang kamu cari tidak ditemukan."
        />

        <main className="product-detail-page">
          <section className="cart-empty-box">
            <h2>Product not found</h2>
            <p>Produk yang kamu cari tidak ditemukan.</p>

            <Link to="/shop" className="cart-shop-btn">
              Back to Shop
            </Link>
          </section>
        </main>
      </>
    );
  }

  const recommendedProducts = products
    .filter(
      (item) =>
        item.id !== product.id &&
        item.category === product.category
    )
    .slice(0, 3);

  const fallbackRecommendedProducts = products
    .filter((item) => item.id !== product.id)
    .slice(0, 3);

  const finalRecommendedProducts =
    recommendedProducts.length > 0
      ? recommendedProducts
      : fallbackRecommendedProducts;

  const addToCart = (selectedProduct = product) => {
    if (!selectedProduct || selectedProduct.stockStatus === "Sold Out") return;

    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];

    const existingProduct = existingCart.find(
      (item) => item.id === selectedProduct.id
    );

    let updatedCart;

    if (existingProduct) {
      updatedCart = existingCart.map((item) =>
        item.id === selectedProduct.id
          ? { ...item, quantity: (item.quantity || 1) + 1 }
          : item
      );
    } else {
      updatedCart = [...existingCart, { ...selectedProduct, quantity: 1 }];
    }

    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));

    setCartItems(updatedCart);
    setDrawerOpen(true);
    setToast(true);

    setTimeout(() => {
      setToast(false);
    }, 2500);
  };

  return (
    <>
      <PageMeta
        title={product.name}
        description={product.description}
      />

      <main className="product-detail-page">
        <section className="product-detail-wrapper">
          <div className="product-detail-image">
            <img src={product.image} alt={product.name} />

            {product.badge && (
              <span className="product-badge">{product.badge}</span>
            )}
          </div>

          <div className="product-detail-content">
            <div className="product-detail-meta">
              <span>{product.category}</span>

              {product.badge && <strong>{product.badge}</strong>}

              {product.stockStatus && (
                <strong
                  className={
                    isSoldOut ? "detail-stock sold-out" : "detail-stock"
                  }
                >
                  {product.stockStatus}
                </strong>
              )}
            </div>

            <h1>{product.name}</h1>

            <p>{product.description}</p>

            <strong className="product-detail-price">
              {product.pricePrefix && <small>{product.pricePrefix}</small>}
              {formatRupiah(product.price)}
            </strong>

            <div className="product-detail-actions">
              <button
                type="button"
                onClick={() => addToCart(product)}
                className="product-detail-btn"
                disabled={isSoldOut}
              >
                {isSoldOut ? "Sold Out" : "Add to Cart"}
              </button>

              <Link to="/cart" className="product-detail-btn secondary">
                View Cart
              </Link>

              <Link to="/shop" className="product-detail-btn secondary">
                Continue Shopping
              </Link>
            </div>
          </div>
        </section>

        <section className="related-products">
          <div className="related-products-header">
            <p className="section-label">Recommended</p>
            <h2>You May Also Like</h2>
          </div>

          <div className="shop-grid">
            {finalRecommendedProducts.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        </section>

        <Toast
          show={toast}
          title="Added to Cart"
          message="Produk berhasil ditambahkan ke keranjang."
        />

        <CartDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          cartItems={cartItems}
        />
      </main>
    </>
  );
}