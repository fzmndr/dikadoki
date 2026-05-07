import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase"; // Import koneksi supabase kamu

import ProductCard from "../components/ProductCard";
import CartDrawer from "../components/CartDrawer";
import Toast from "../components/Toast";
// import { products } from "../data/products"; // Kita matikan data statis ini
import PageMeta from "../components/PageMeta";

export default function Shop() {
  const [toast, setToast] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");

  // --- STATE BARU UNTUK SUPABASE ---
  const [dbProducts, setDbProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Ambil data keranjang dari LocalStorage
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(savedCart);

    // 2. AMBIL DATA DARI SUPABASE
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("products") // Nama tabel di supabase kamu
        .select("*");

      if (!error && data) {
        setDbProducts(data);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  // Kita gunakan dbProducts sebagai sumber data
  const categories = [
    "All",
    ...new Set(dbProducts.map((product) => product.category)),
  ];

  const filteredProducts = dbProducts
    .filter((product) => {
      const matchesCategory =
        activeCategory === "All" || product.category === activeCategory;

      const keyword = searchTerm.trim().toLowerCase();

      const matchesSearch =
        product.name.toLowerCase().includes(keyword) ||
        (product.category && product.category.toLowerCase().includes(keyword)) ||
        (product.description && product.description.toLowerCase().includes(keyword));

      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "lowest") return a.price - b.price;
      if (sortBy === "highest") return b.price - b.price;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  // --- FUNGSI HELPER UNTUK GAMBAR SUPABASE ---
  const getProductImage = (path) => {
    if (!path) return "/placeholder-image.jpg"; // Fallback jika tidak ada path
    const { data } = supabase.storage.from("digital-assets").getPublicUrl(path);
    return data.publicUrl;
  };

  const resetFilter = () => {
    setSearchTerm("");
    setActiveCategory("All");
    setSortBy("default");
  };

  const addToCart = (product) => {
    if (!product || product.stockStatus === "Sold Out") return;

    // Pastikan kita mengirim URL gambar yang benar ke keranjang
    const productWithImage = {
      ...product,
      image: getProductImage(product.file_path_thumbnail) // Sesuaikan nama kolom di DB
    };

    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingProduct = existingCart.find((item) => item.id === product.id);

    let updatedCart;
    if (existingProduct) {
      updatedCart = existingCart.map((item) =>
        item.id === product.id
          ? { ...item, quantity: (item.quantity || 1) + 1 }
          : item
      );
    } else {
      updatedCart = [...existingCart, { ...productWithImage, quantity: 1 }];
    }

    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
    setCartItems(updatedCart);
    setDrawerOpen(true);
    setToast(true);

    setTimeout(() => setToast(false), 2500);
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
          <p>Pilih produk digital atau paket dokumentasi cinematic untuk kebutuhan visual kamu.</p>
        </section>

        {/* ... (Bagian shop-tools tetap sama) ... */}
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
          <div className="text-center p-20">Memuat produk cinematic...</div>
        ) : filteredProducts.length > 0 ? (
          <section className="shop-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                // Kita kirim URL gambar hasil dari Supabase Storage ke ProductCard
                product={{
                  ...product,
                  image: getProductImage(product.file_path_thumbnail) 
                }}
                onAddToCart={addToCart}
              />
            ))}
          </section>
        ) : (
          <section className="shop-empty-result">
            <h2>Produk tidak ditemukan</h2>
            <button type="button" onClick={resetFilter}>Reset Filter</button>
          </section>
        )}

        <Toast show={toast} title="Added to Cart" message="Produk berhasil ditambahkan." />
        <CartDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} cartItems={cartItems} />
      </main>
    </>
  );
}