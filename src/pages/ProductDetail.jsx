import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Toast from "../components/Toast";
import CartDrawer from "../components/CartDrawer";
import ProductCard from "../components/ProductCard";
import PageMeta from "../components/PageMeta";

import { supabase } from "../lib/supabase";
import { formatRupiah } from "../utils/formatCurrency";

const STORAGE_BUCKET = "digital-assets";
const PLACEHOLDER_IMAGE = "/images/placeholder.jpg";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [toast, setToast] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const [product, setProduct] = useState(null);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailError, setDetailError] = useState("");

  const getStorageImageUrl = (path) => {
    if (!path) return PLACEHOLDER_IMAGE;

    if (path.startsWith("http") || path.startsWith("/")) {
      return path;
    }

    const cleanPath = path.replace(/^\/+/, "");

    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(cleanPath);

    return data?.publicUrl || PLACEHOLDER_IMAGE;
  };

  const getProductImage = (item) => {
    if (!item) return PLACEHOLDER_IMAGE;

    if (item.image_url) return getStorageImageUrl(item.image_url);
    if (item.image) return getStorageImageUrl(item.image);

    if (item.file_path_thumbnail) {
      return getStorageImageUrl(item.file_path_thumbnail);
    }

    if (item.thumbnail_path) {
      return getStorageImageUrl(item.thumbnail_path);
    }

    return PLACEHOLDER_IMAGE;
  };

  const isSoldOut =
    product?.stockStatus === "Sold Out" ||
    product?.stock_status === "Sold Out" ||
    product?.is_active === false;

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

  useEffect(() => {
    async function fetchProductDetail() {
      try {
        setLoading(true);
        setDetailError("");
        setProduct(null);
        setRecommendedProducts([]);
        setSelectedImage("");
        setQuantity(1);

        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("slug", slug)
          .eq("is_active", true)
          .single();

        if (error) throw error;

        const mainImage = getProductImage(data);

        setProduct(data);
        setSelectedImage(mainImage);

        const { data: relatedData, error: relatedError } = await supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .eq("category", data.category || "Digital Product")
          .neq("id", data.id)
          .limit(3);

        if (!relatedError && relatedData?.length > 0) {
          setRecommendedProducts(relatedData);
          return;
        }

        const { data: fallbackData, error: fallbackError } = await supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .neq("id", data.id)
          .limit(3);

        if (!fallbackError) {
          setRecommendedProducts(fallbackData || []);
        }
      } catch (error) {
        console.error("Fetch product detail error:", error);
        setDetailError("Produk yang kamu cari tidak ditemukan.");
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchProductDetail();
    }
  }, [slug]);

  const productGallery = useMemo(() => {
    if (!product) return [];

    const mainImage = getProductImage(product);

    const gallery = Array.isArray(product.gallery)
      ? product.gallery.map(getStorageImageUrl)
      : [];

    return [...new Set([mainImage, ...gallery].filter(Boolean))];
  }, [product]);

  const productBenefits = useMemo(() => {
    if (!product) return [];

    if (Array.isArray(product.benefits) && product.benefits.length > 0) {
      return product.benefits;
    }

    return [
      "File digital siap download",
      "Akses setelah pembayaran berhasil",
      "Pembayaran aman via QRIS / Midtrans",
      "Cocok untuk creator, editor, dan brand",
    ];
  }, [product]);

  const hasDiscount = useMemo(() => {
    if (!product) return false;

    return (
      product.compare_at_price &&
      Number(product.compare_at_price) > Number(product.price)
    );
  }, [product]);

  const discountPercent = useMemo(() => {
    if (!hasDiscount || !product) return 0;

    const price = Number(product.price || 0);
    const compareAtPrice = Number(product.compare_at_price || 0);

    if (!compareAtPrice) return 0;

    return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  }, [hasDiscount, product]);

  const normalizeCartProduct = (selectedProduct, selectedQuantity = 1) => {
    return {
      id: selectedProduct.id,
      name: selectedProduct.name,
      slug: selectedProduct.slug,
      category: selectedProduct.category || "Digital Product",
      description: selectedProduct.description || "",
      price: Number(selectedProduct.price || 0),
      compare_at_price: selectedProduct.compare_at_price || null,
      image: getProductImage(selectedProduct),
      file_path: selectedProduct.file_path || null,
      download_url: selectedProduct.download_url || null,
      quantity: selectedQuantity,
    };
  };

  const getExistingCart = () => {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      localStorage.removeItem("cart");
      return [];
    }
  };

  const createUpdatedCart = (selectedProduct, selectedQuantity = 1) => {
    const cartProduct = normalizeCartProduct(selectedProduct, selectedQuantity);
    const existingCart = getExistingCart();

    const existingProduct = existingCart.find(
      (item) => item.id === cartProduct.id
    );

    if (existingProduct) {
      return existingCart.map((item) =>
        item.id === cartProduct.id
          ? {
              ...item,
              quantity: Number(item.quantity || 1) + selectedQuantity,
            }
          : item
      );
    }

    return [...existingCart, cartProduct];
  };

  const saveCart = (updatedCart) => {
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
    setCartItems(updatedCart);
  };

  const addToCart = (selectedProduct = product, selectedQuantity = quantity) => {
    const productIsSoldOut =
      selectedProduct?.stockStatus === "Sold Out" ||
      selectedProduct?.stock_status === "Sold Out" ||
      selectedProduct?.is_active === false;

    if (!selectedProduct || productIsSoldOut) return;

    const updatedCart = createUpdatedCart(selectedProduct, selectedQuantity);

    saveCart(updatedCart);
    setDrawerOpen(true);
    setToast(true);

    setTimeout(() => {
      setToast(false);
    }, 2500);
  };

  const buyNow = () => {
    if (!product || isSoldOut) return;

    const updatedCart = createUpdatedCart(product, quantity);

    saveCart(updatedCart);
    navigate("/cart");
  };

  const decorateProduct = (item) => {
    return {
      ...item,
      image: getProductImage(item),
      category: item.category || "Digital Product",
      badge: item.badge || (item.is_sale ? "SALE" : null),
      stockStatus:
        item.stock_status ||
        item.stockStatus ||
        (item.is_active === false ? "Sold Out" : "Available"),
    };
  };

  if (loading) {
    return (
      <>
        <PageMeta title="Loading Product" description="Memuat detail produk." />

        <main className="product-detail-page">
          <section className="cart-empty-box">
            <h2>Loading product...</h2>
            <p>Mohon tunggu sebentar.</p>
          </section>
        </main>
      </>
    );
  }

  if (detailError || !product) {
    return (
      <>
        <PageMeta
          title="Product Not Found"
          description="Produk yang kamu cari tidak ditemukan."
        />

        <main className="product-detail-page">
          <section className="cart-empty-box">
            <h2>Product not found</h2>
            <p>{detailError || "Produk yang kamu cari tidak ditemukan."}</p>

            <Link to="/shop" className="cart-shop-btn">
              Back to Shop
            </Link>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <PageMeta
        title={product.name}
        description={
          product.short_description ||
          product.description ||
          "Detail produk digital dikadoki."
        }
      />

      <main className="product-detail-page">
        <section className="product-detail-wrapper">
          <div className="product-detail-gallery">
            <div className="product-detail-image">
              <img
                src={selectedImage || getProductImage(product)}
                alt={product.name}
                onError={(event) => {
                  event.currentTarget.src = PLACEHOLDER_IMAGE;
                }}
              />

              {(product.badge || product.is_sale) && (
                <span className="product-badge">
                  {product.badge || "SALE"}
                </span>
              )}

              {hasDiscount && (
                <span className="product-detail-floating-discount">
                  Save {discountPercent}%
                </span>
              )}
            </div>

            {productGallery.length > 1 && (
              <div className="product-gallery-thumbnails">
                {productGallery.map((image) => (
                  <button
                    type="button"
                    key={image}
                    onClick={() => setSelectedImage(image)}
                    className={selectedImage === image ? "active" : ""}
                  >
                    <img
                      src={image}
                      alt={product.name}
                      onError={(event) => {
                        event.currentTarget.src = PLACEHOLDER_IMAGE;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-detail-content">
            <div className="product-detail-meta">
              <span>{product.category || "Digital Product"}</span>

              {(product.badge || product.is_sale) && (
                <strong>{product.badge || "SALE"}</strong>
              )}

              <strong
                className={isSoldOut ? "detail-stock sold-out" : "detail-stock"}
              >
                {isSoldOut ? "Sold Out" : "Available"}
              </strong>
            </div>

            <h1>{product.name}</h1>

            <div className="product-rating-large">
              ★★★★★
              <span>
                {Number(product.rating || 4.9).toFixed(1)} rating
                {product.review_count
                  ? ` • ${product.review_count} reviews`
                  : ""}
                {product.sold_count ? ` • ${product.sold_count} sold` : ""}
              </span>
            </div>

            <p>
              {product.short_description ||
                product.description ||
                "Produk digital siap pakai untuk kebutuhan kreatif kamu."}
            </p>

            <div className="product-detail-price-wrap">
              <strong className="product-detail-price">
                {product.pricePrefix && <small>{product.pricePrefix}</small>}
                {formatRupiah(product.price || 0)}
              </strong>

              {hasDiscount && (
                <>
                  <span className="product-detail-compare-price">
                    {formatRupiah(product.compare_at_price)}
                  </span>

                  <em className="product-detail-discount">
                    Save {discountPercent}%
                  </em>
                </>
              )}
            </div>

            <div className="product-whats-inside">
              <h3>What's inside:</h3>

              <ul>
                {productBenefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            </div>

            <div className="product-quantity">
              <span>Quantity</span>

              <div>
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  disabled={isSoldOut}
                >
                  -
                </button>

                <strong>{quantity}</strong>

                <button
                  type="button"
                  onClick={() => setQuantity((value) => value + 1)}
                  disabled={isSoldOut}
                >
                  +
                </button>
              </div>
            </div>

            <div className="product-detail-actions">
              <button
                type="button"
                onClick={() => addToCart(product, quantity)}
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

            <div className="product-benefit-strip">
              <div>
                <strong>Instant Access</strong>
                <span>Download setelah pembayaran berhasil.</span>
              </div>

              <div>
                <strong>QRIS Payment</strong>
                <span>Pembayaran aman via Midtrans.</span>
              </div>

              <div>
                <strong>Digital Product</strong>
                <span>Tanpa ongkir dan langsung siap dipakai.</span>
              </div>
            </div>
          </div>
        </section>

        {recommendedProducts.length > 0 && (
          <section className="related-products">
            <div className="related-products-header">
              <p className="section-label">Recommended</p>
              <h2>You May Also Like</h2>
            </div>

            <div className="shop-grid">
              {recommendedProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  product={decorateProduct(item)}
                  onAddToCart={(selectedProduct) =>
                    addToCart(selectedProduct, 1)
                  }
                />
              ))}
            </div>
          </section>
        )}

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