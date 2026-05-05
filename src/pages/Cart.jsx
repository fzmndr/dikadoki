import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { insertOrderToSupabase } from "../services/orderService";

import { siteConfig } from "../config/site";
import { routes } from "../config/routes";
import { orderStatuses } from "../config/orderStatus";
import { orderTypes, orderTypeOptions } from "../config/orderType";

import { formatRupiah } from "../utils/formatCurrency";
import { generateOrderMessage } from "../utils/orderMessage";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);

  const [customer, setCustomer] = useState({
    name: "",
    date: "",
    phone: "",
    orderType: orderTypes.bookingService,
    note: "",
  });

  const [formError, setFormError] = useState("");
  const [checkoutSuccess, setCheckoutSuccess] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];

    setCartItems(savedCart);
    syncOrderType(savedCart);
  }, []);

  const syncOrderType = (items) => {
    const hasServiceProduct = items.some((item) => {
      return (
        item.category === "Service Package" ||
        item.category === "Video Production"
      );
    });

    const hasDigitalProduct = items.some((item) => {
      return item.category === "Digital Product";
    });

    if (hasServiceProduct) {
      setCustomer((prev) => ({
        ...prev,
        orderType: orderTypes.bookingService,
      }));
      return;
    }

    if (hasDigitalProduct) {
      setCustomer((prev) => ({
        ...prev,
        orderType: orderTypes.digitalProduct,
      }));
      return;
    }

    setCustomer((prev) => ({
      ...prev,
      orderType: orderTypes.bookingService,
    }));
  };

  const updateQuantity = (id, action) => {
    const updatedCart = cartItems
      .map((item) => {
        if (item.id !== id) return item;

        const currentQuantity = item.quantity || 1;

        const newQuantity =
          action === "increase" ? currentQuantity + 1 : currentQuantity - 1;

        return {
          ...item,
          quantity: newQuantity,
        };
      })
      .filter((item) => item.quantity > 0);

    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));

    syncOrderType(updatedCart);
    setFormError("");
    setCheckoutSuccess("");
  };

  const removeItem = (id) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);

    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));

    syncOrderType(updatedCart);
    setFormError("");
    setCheckoutSuccess("");
  };

  const clearCart = () => {
    const confirmClear = window.confirm(
      "Yakin ingin mengosongkan semua isi keranjang?"
    );

    if (!confirmClear) return;

    setCartItems([]);
    localStorage.removeItem("cart");
    window.dispatchEvent(new Event("cartUpdated"));

    setFormError("");
    setCheckoutSuccess("");
    syncOrderType([]);
  };

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;

    setCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFormError("");
    setCheckoutSuccess("");
  };

  const total = cartItems.reduce((sum, item) => {
    return sum + item.price * (item.quantity || 1);
  }, 0);

  const totalItems = cartItems.reduce((sum, item) => {
    return sum + (item.quantity || 1);
  }, 0);

  const generateOrderCode = () => {
    const now = new Date();

    const date = now.toISOString().slice(0, 10).replaceAll("-", "");
    const random = Math.floor(1000 + Math.random() * 9000);

    return `DK-${date}-${random}`;
  };

  const saveOrderHistory = (orderCode) => {
    const existingOrders = JSON.parse(localStorage.getItem("orders")) || [];

    const newOrder = {
      code: orderCode,
      date: new Date().toISOString(),
      customer,
      items: cartItems,
      total,
      totalItems,
      status: orderStatuses.whatsapp,
    };

    const updatedOrders = [newOrder, ...existingOrders];

    localStorage.setItem("orders", JSON.stringify(updatedOrders));
  };

  const saveOrderToSupabase = async (orderCode) => {
    try {
      await insertOrderToSupabase({
        code: orderCode,
        customer,
        items: cartItems,
        total,
        totalItems,
        status: orderStatuses.whatsapp,
      });

      return true;
    } catch (error) {
      console.error("Supabase insert order error:", error);
      return false;
    }
  };

  const checkoutWhatsapp = async () => {
    if (isCheckingOut) return;

    setCheckoutSuccess("");

    if (!customer.name.trim()) {
      setFormError("Nama wajib diisi dulu ya.");
      return;
    }

    if (!customer.date.trim()) {
      setFormError("Tanggal kebutuhan wajib diisi dulu ya.");
      return;
    }

    if (cartItems.length === 0) {
      setFormError("Keranjang masih kosong.");
      return;
    }

    setIsCheckingOut(true);
    setFormError("");

    const whatsappWindow = window.open("", "_blank");
    const orderCode = generateOrderCode();

    const savedToSupabase = await saveOrderToSupabase(orderCode);

    if (!savedToSupabase) {
      if (whatsappWindow) {
        whatsappWindow.close();
      }

      setFormError("Order gagal disimpan ke database. Coba lagi beberapa saat.");
      setCheckoutSuccess("");
      setIsCheckingOut(false);
      return;
    }

    saveOrderHistory(orderCode);
    setCheckoutSuccess("Order berhasil dibuat. WhatsApp sedang dibuka...");

    const phone = siteConfig.whatsappNumber;

    const message = generateOrderMessage({
      code: orderCode,
      customer,
      items: cartItems,
      total,
    });

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
      message
    )}`;

    if (whatsappWindow) {
      whatsappWindow.location.href = whatsappUrl;
    } else {
      window.location.href = whatsappUrl;
    }

    setIsCheckingOut(false);

    setTimeout(() => {
      const confirmClearAfterCheckout = window.confirm(
        "Pesanan sudah diarahkan ke WhatsApp. Kosongkan keranjang sekarang?"
      );

      if (confirmClearAfterCheckout) {
        setCartItems([]);
        localStorage.removeItem("cart");
        window.dispatchEvent(new Event("cartUpdated"));

        setCustomer({
          name: "",
          date: "",
          phone: "",
          orderType: orderTypes.bookingService,
          note: "",
        });

        setFormError("");
        setCheckoutSuccess("");
        syncOrderType([]);
      }
    }, 700);
  };

  return (
    <main className="cart-page">
      <section className="cart-hero">
        <p className="section-label">Your Cart</p>
        <h1>Shopping Cart</h1>
        <p>
          Review produk atau layanan yang kamu pilih, lalu isi data checkout
          sebelum lanjut ke WhatsApp.
        </p>
      </section>

      <section className="cart-content">
        {cartItems.length === 0 ? (
          <div className="cart-empty-box">
            <h2>Keranjang masih kosong</h2>
            <p>
              Silakan pilih produk digital, preset, LUT, atau paket dokumentasi
              dari halaman shop.
            </p>

            <Link to={routes.shop} className="cart-shop-btn">
              Explore Shop
            </Link>
          </div>
        ) : (
          <div className="cart-checkout-layout">
            <div className="cart-list-box">
              <div className="cart-list">
                {cartItems.map((item) => (
                  <div className="cart-list-item" key={item.id}>
                    <img src={item.image} alt={item.name} />

                    <div className="cart-list-info">
                      <span>{item.category}</span>
                      <h3>{item.name}</h3>

                      <p>
                        {item.pricePrefix && `${item.pricePrefix} `}
                        {formatRupiah(item.price * (item.quantity || 1))}
                      </p>

                      <div className="cart-qty">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, "decrease")}
                        >
                          -
                        </button>

                        <strong>{item.quantity || 1}</strong>

                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, "increase")}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="cart-remove"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <aside className="checkout-panel">
              <div className="checkout-heading">
                <span>Order Summary</span>
                <h3>
                  {totalItems} Item{totalItems > 1 ? "s" : ""}
                </h3>
              </div>

              <div className="checkout-total">
                <span>Total Payment</span>
                <strong>{formatRupiah(total)}</strong>
              </div>

              <div className="checkout-actions-top">
                <Link to={routes.shop} className="back-shop-btn">
                  Back to Shop
                </Link>

                <button
                  type="button"
                  onClick={clearCart}
                  className="clear-cart-btn"
                >
                  Clear Cart
                </button>
              </div>

              <div className="checkout-form">
                {formError && <div className="checkout-error">{formError}</div>}

                {checkoutSuccess && (
                  <div className="checkout-success">{checkoutSuccess}</div>
                )}

                <div className="checkout-field">
                  <label>Nama Lengkap *</label>
                  <input
                    type="text"
                    name="name"
                    value={customer.name}
                    onChange={handleCustomerChange}
                    placeholder="Contoh: Dika"
                  />
                </div>

                <div className="checkout-field">
                  <label>Tanggal Kebutuhan *</label>
                  <input
                    type="date"
                    name="date"
                    value={customer.date}
                    onChange={handleCustomerChange}
                  />
                </div>

                <div className="checkout-field">
                  <label>Nomor WhatsApp</label>
                  <input
                    type="text"
                    name="phone"
                    value={customer.phone}
                    onChange={handleCustomerChange}
                    placeholder="Contoh: 0895xxxxxxx"
                  />
                </div>

                <div className="checkout-field">
                  <label>Jenis Pesanan</label>
                  <select
                    name="orderType"
                    value={customer.orderType}
                    onChange={handleCustomerChange}
                  >
                    {orderTypeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="checkout-field">
                  <label>Catatan</label>
                  <textarea
                    name="note"
                    value={customer.note}
                    onChange={handleCustomerChange}
                    placeholder="Tulis detail kebutuhan, lokasi, konsep, atau request khusus..."
                    rows="4"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={checkoutWhatsapp}
                className="cart-whatsapp-btn"
                disabled={isCheckingOut}
              >
                {isCheckingOut ? "Processing Order..." : "Checkout via WhatsApp"}
              </button>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}