import { useEffect, useMemo, useState } from "react";

import ProductCard from "../components/ProductCard";
import CartDrawer from "../components/CartDrawer";
import Toast from "../components/Toast";
import PageMeta from "../components/PageMeta";

import { supabase } from "../lib/supabase";

export default function Shop() {
  const [toast, setToast] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shopError, setShopError] = useState("");

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(savedCart);

    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setShopError("");

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setProducts(data || []);
    } catch (error) {
      console.error("Fetch products error:", error);
      setShopError("Gagal memuat produk. Coba refresh halaman.");
    } finally {
      setLoading(false);
    }
  };

  const getProductImage = (product) => {
    if (product.image_url) {
      return product.image_url;
    }

    if (product.image) {
      return product.image;
    }

    if (product.file_path_thumbnail) {
      const { data } = supabase.storage
        .from("digital-assets")
        .getPublicUrl(product.file_path_thumbnail);

      return data.publicUrl;
    }

    if (product.thumbnail_path) {
      const { data } = supabase.storage
        .from("digital-assets")
        .getPublicUrl(product.thumbnail_path);

      return data.publicUrl;
    }

    return "/images/placeholder.jpg";
  };

  const categories = useMemo(() => {
    const categoryList = products
      .map((product) => product.category || "Digital Product")
      .filter(Boolean);

    return ["All", ...new Set(categoryList)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return products
      .filter((product) => {
        const category = product.category || "Digital Product";

        const matchesCategory =
          activeCategory === "All" || category === activeCategory;

        const matchesSearch =
          !keyword ||
          product.name?.toLowerCase().includes(keyword) ||
          product.description?.toLowerCase().includes(keyword) ||
          category.toLowerCase().includes(keyword);

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        const priceA = Number(a.price || 0);
        const priceB = Number(b.price || 0);

        if (sortBy === "lowest") return priceA - priceB;
        if (sortBy === "highest") return priceB - priceA;
        if (sortBy === "name") {
          return String(a.name || "").localeCompare(String(b.name || ""));
        }

        return 0;
      });
  }, [products, activeCategory, searchTerm, sortBy]);

  const resetFilter = () => {
    setSearchTerm("");
    setActiveCategory("All");
    setSortBy("default");
  };

  const addToCart = (product) => {
    if (!product) return;

    const isSoldOut =
      product.stockStatus === "Sold Out" ||
      product.stock_status === "Sold Out" ||
      product.is_active === false;

    if (isSoldOut) return;

    const cartProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category || "Digital Product",
      description: product.description || "",
      price: Number(product.price || 0),
      compare_at_price: product.compare_at_price || null,
      image: getProductImage(product),
      file_path: product.file_path || null,
      quantity: 1,
    };

    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];

    const existingProduct = existingCart.find(
      (item) => item.id === cartProduct.id
    );

    let updatedCart;

    if (existingProduct) {
      updatedCart = existingCart.map((item) =>
        item.id === cartProduct.id
          ? {
              ...item,
              quantity: Number(item.quantity || 1) + 1,
            }
          : item
      );
    } else {
      updatedCart = [...existingCart, cartProduct];
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
        title="Shop"
        description="Belanja produk digital, preset, LUT, template, dan paket jasa kreatif dari dikadoki."
      />

      <main className="shop-page">
        <section className="shop-hero">
          <p className="section-label">dikadoki</p>

          <h1>Shop Creative Products & Services</h1>

          <p>
            Pilih produk digital, preset, LUT, template, atau paket dokumentasi
            cinematic untuk kebutuhan visual kamu.
          </p>
        </section>

        <section className="shop-tools">
          <div className="shop-search">
            <input
              type="text"
              placeholder="Search product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="shop-filter">
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                onClick={() => setActiveCategory(category)}
                className={activeCategory === category ? "active" : ""}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="shop-sort">
            <label htmlFor="sort-product">Sort by</label>

            <select
              id="sort-product"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Default</option>
              <option value="lowest">Harga Termurah</option>
              <option value="highest">Harga Termahal</option>
              <option value="name">Nama A-Z</option>
            </select>
          </div>
        </section>

        {loading ? (
          <section className="shop-empty-result">
            <h2>Memuat produk...</h2>
            <p>Mohon tunggu sebentar.</p>
          </section>
        ) : shopError ? (
          <section className="shop-empty-result">
            <h2>Terjadi Kesalahan</h2>
            <p>{shopError}</p>

            <button type="button" onClick={fetchProducts}>
              Coba Lagi
            </button>
          </section>
        ) : filteredProducts.length > 0 ? (
          <section className="shop-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  image: getProductImage(product),
                  category: product.category || "Digital Product",
                  badge: product.badge || (product.is_sale ? "SALE" : null),
                  stockStatus:
                    product.stock_status ||
                    product.stockStatus ||
                    (product.is_active === false ? "Sold Out" : "Available"),
                }}
                onAddToCart={addToCart}
              />
            ))}
          </section>
        ) : (
          <section className="shop-empty-result">
            <h2>Produk tidak ditemukan</h2>
            <p>Coba gunakan kata kunci lain atau reset filter.</p>

            <button type="button" onClick={resetFilter}>
              Reset Filter
            </button>
          </section>
        )}

        <Toast
          show={toast}
          title="Added to Cart"
          message="Produk berhasil ditambahkan."
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