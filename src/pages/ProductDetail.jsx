import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { products } from "../data/products";
import Toast from "../components/Toast";
import CartDrawer from "../components/CartDrawer";
import ProductCard from "../components/ProductCard";
import PageMeta from "../components/PageMeta";
import { formatRupiah } from "../utils/formatCurrency";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [toast, setToast] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const product = products.find((item) => item.slug === slug);
  const isSoldOut = product?.stockStatus === "Sold Out";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  useEffect(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartItems(savedCart);
    } catch {
      localStorage.removeItem("cart");
      setCartItems([]);
    }
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
      (item) => item.id !== product.id && item.category === product.category
    )
    .slice(0, 3);

  const fallbackRecommendedProducts = products
    .filter((item) => item.id !== product.id)
    .slice(0, 3);

  const finalRecommendedProducts =
    recommendedProducts.length > 0
      ? recommendedProducts
      : fallbackRecommendedProducts;

  const getExistingCart = () => {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      localStorage.removeItem("cart");
      return [];
    }
  };

  const createUpdatedCart = (selectedProduct) => {
    const existingCart = getExistingCart();

    const existingProduct = existingCart.find(
      (item) => item.id === selectedProduct.id
    );

    if (existingProduct) {
      return existingCart.map((item) =>
        item.id === selectedProduct.id
          ? { ...item, quantity: (item.quantity || 1) + 1 }
          : item
      );
    }

    return [...existingCart, { ...selectedProduct, quantity: 1 }];
  };

  const saveCart = (updatedCart) => {
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
    setCartItems(updatedCart);
  };

  const addToCart = (selectedProduct = product) => {
    if (!selectedProduct || selectedProduct.stockStatus === "Sold Out") return;

    const updatedCart = createUpdatedCart(selectedProduct);

    saveCart(updatedCart);
    setDrawerOpen(true);
    setToast(true);

    setTimeout(() => {
      setToast(false);
    }, 2500);
  };

  const buyNow = () => {
    if (!product || product.stockStatus === "Sold Out") return;

    const updatedCart = createUpdatedCart(product);

    saveCart(updatedCart);
    navigate("/cart");
  };

  return (
    <>
      <PageMeta title={product.name} description={product.description} />

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

              <button
                type="button"
                onClick={buyNow}
                className="product-detail-btn secondary"
                disabled={isSoldOut}
              >
                Buy Now
              </button>

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