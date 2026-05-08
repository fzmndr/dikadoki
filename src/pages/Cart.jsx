import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import PageMeta from "../components/PageMeta";

import {
  insertOrderToSupabase,
  updateOrderPaymentInSupabase,
} from "../services/orderService";

import { siteConfig } from "../config/site";
import { routes } from "../config/routes";
import { orderStatuses } from "../config/orderStatus";
import { orderTypes, orderTypeOptions } from "../config/orderType";

import { formatRupiah } from "../utils/formatCurrency";
import { generateOrderMessage } from "../utils/orderMessage";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [lastOrderCode, setLastOrderCode] = useState("");

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

  const navigate = useNavigate();

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

  useEffect(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
      const savedLastOrderCode = localStorage.getItem("lastOrderCode") || "";

      setCartItems(savedCart);
      setLastOrderCode(savedLastOrderCode);
      syncOrderType(savedCart);
    } catch {
      localStorage.removeItem("cart");
      setCartItems([]);
      syncOrderType([]);
    }
  }, []);

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

  const resetCheckoutState = () => {
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

  const hasServiceProduct = cartItems.some((item) => {
    return (
      item.category === "Service Package" ||
      item.category === "Video Production"
    );
  });

  const hasDigitalOnly =
    cartItems.length > 0 &&
    cartItems.every((item) => item.category === "Digital Product");

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
      payment: {
        method: "midtrans",
        status: "pending",
        midtransOrderId: orderCode,
      },
    };

    const updatedOrders = [newOrder, ...existingOrders];

    localStorage.setItem("orders", JSON.stringify(updatedOrders));
  };

  const todayDate = new Date().toISOString().split("T")[0];

  const normalizePhoneNumber = (phone) => {
    return phone.replace(/\D/g, "");
  };

  const isValidPhoneNumber = (phone) => {
    const normalizedPhone = normalizePhoneNumber(phone);

    return normalizedPhone.length >= 10 && normalizedPhone.length <= 15;
  };

  const validateCheckout = () => {
    if (!customer.name.trim()) {
      return "Nama wajib diisi dulu ya.";
    }

    if (!customer.phone.trim()) {
      return "Nomor WhatsApp wajib diisi dulu ya.";
    }

    if (!isValidPhoneNumber(customer.phone)) {
      return "Nomor WhatsApp tidak valid. Gunakan 10–15 digit angka.";
    }

    if (hasServiceProduct && !customer.date.trim()) {
      return "Tanggal kebutuhan wajib diisi untuk booking service.";
    }

    if (hasServiceProduct && customer.date < todayDate) {
      return "Tanggal kebutuhan tidak boleh kurang dari hari ini.";
    }

    if (cartItems.length === 0) {
      return "Keranjang masih kosong.";
    }

    return "";
  };

  const checkoutMidtrans = async () => {
    if (isCheckingOut) return;

    setCheckoutSuccess("");

    const validationError = validateCheckout();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsCheckingOut(true);
    setFormError("");

    try {
      const orderCode = generateOrderCode();

      const order = await insertOrderToSupabase({
        code: orderCode,
        customer,
        items: cartItems,
        total,
        totalItems,
        status: orderStatuses.whatsapp,
        payment: {
          method: "midtrans",
          status: "pending",
          midtransOrderId: orderCode,
        },
      });

      const response = await fetch("/api/create-midtrans-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: order.code,
          gross_amount: order.total,
          customer: {
            name: order.customer.name,
            phone: order.customer.phone,
            email: "customer@example.com",
          },
          items: order.items.map((item) => ({
            id: item.id,
            price: item.price,
            quantity: item.quantity || item.qty || 1,
            name: item.name || item.title || "Produk",
          })),
        }),
      });

      const payment = await response.json();

      if (!response.ok) {
        throw new Error(payment.message || "Gagal membuat pembayaran Midtrans");
      }

      await updateOrderPaymentInSupabase(order.code, {
        payment_method: "midtrans",
        payment_status: "pending",
        midtrans_order_id: order.code,
        midtrans_token: payment.token,
        midtrans_redirect_url: payment.redirect_url,
        midtrans_transaction_status: "pending",
      });

      saveOrderHistory(order.code);
      localStorage.setItem("lastOrderCode", order.code);
      setLastOrderCode(order.code);
      window.dispatchEvent(new Event("lastOrderUpdated"));

      window.location.href = payment.redirect_url;
    } catch (error) {
      console.error("Midtrans checkout error:", error);
      setFormError(error.message || "Checkout Midtrans gagal.");
      setIsCheckingOut(false);
    }
  };

  const checkoutWhatsapp = async () => {
    if (isCheckingOut) return;

    setCheckoutSuccess("");

    const validationError = validateCheckout();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsCheckingOut(true);
    setFormError("");

    const whatsappWindow = window.open("", "_blank");
    const orderCode = generateOrderCode();

    try {
      await insertOrderToSupabase({
        code: orderCode,
        customer,
        items: cartItems,
        total,
        totalItems,
        status: orderStatuses.whatsapp,
        payment: {
          method: "whatsapp",
          status: "pending",
          midtransOrderId: null,
        },
      });

      saveOrderHistory(orderCode);
      localStorage.setItem("lastOrderCode", orderCode);
      setLastOrderCode(orderCode);
      window.dispatchEvent(new Event("lastOrderUpdated"));
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

      resetCheckoutState();

      navigate(`${routes.orderSuccess}?code=${orderCode}`);
    } catch (error) {
      console.error("Supabase insert order error:", error);

      if (whatsappWindow) {
        whatsappWindow.document.write(`
          <html>
            <head>
              <title>Checkout Failed</title>
            </head>
            <body style="font-family: Arial, sans-serif; padding: 40px;">
              <h2>Order gagal disimpan</h2>
              <p>Silakan kembali ke halaman checkout dan coba lagi.</p>
            </body>
          </html>
        `);
      }

      setFormError("Order gagal disimpan ke database. Coba lagi beberapa saat.");
      setCheckoutSuccess("");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Cart"
        description="Tinjau keranjang belanja dikadoki dan lanjutkan checkout melalui WhatsApp atau QRIS Midtrans."
      />

      <main className="cart-page">
        <section className="cart-hero">
          <p className="section-label">Your Cart</p>
          <h1>Shopping Cart</h1>
          <p>
            Review produk atau layanan yang kamu pilih, lalu isi data checkout
            sebelum lanjut pembayaran.
          </p>
        </section>

        <section className="cart-content">
          {cartItems.length === 0 ? (
            <div className="cart-empty-box">
              <h2>Keranjang masih kosong</h2>

              <p>
                Silakan pilih produk digital, preset, LUT, atau paket
                dokumentasi dari halaman shop. Jika kamu sudah checkout, kamu
                bisa cek status pesanan lewat Track Order.
              </p>

              <div className="cart-empty-actions">
                <Link to={routes.shop} className="cart-shop-btn">
                  Explore Shop
                </Link>

                <Link to={routes.trackOrder} className="cart-track-btn">
                  Track Order
                </Link>

                {lastOrderCode && (
                  <Link
                    to={`${routes.trackOrder}?code=${lastOrderCode}`}
                    className="cart-track-btn"
                  >
                    Track Last Order
                  </Link>
                )}
              </div>
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
                  {formError && (
                    <div className="checkout-error">{formError}</div>
                  )}

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
                    <label>
                      Tanggal Kebutuhan {hasServiceProduct ? "*" : ""}
                    </label>

                    <input
                      type="date"
                      name="date"
                      value={customer.date}
                      min={todayDate}
                      onChange={handleCustomerChange}
                    />

                    {hasDigitalOnly && (
                      <small>
                        Optional untuk produk digital seperti preset atau LUT.
                      </small>
                    )}

                    {hasServiceProduct && (
                      <small>
                        Wajib diisi untuk booking service, wedding, event, atau
                        video production.
                      </small>
                    )}
                  </div>

                  <div className="checkout-field">
                    <label>Nomor WhatsApp *</label>

                    <input
                      type="tel"
                      name="phone"
                      value={customer.phone}
                      onChange={handleCustomerChange}
                      placeholder="Contoh: 0895xxxxxxx"
                    />

                    <small>
                      Digunakan untuk konfirmasi pesanan dan komunikasi lanjutan.
                    </small>
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
                  onClick={checkoutMidtrans}
                  className="cart-whatsapp-btn"
                  disabled={isCheckingOut}
                >
                  {isCheckingOut
                    ? "Memproses Pembayaran..."
                    : "Bayar QRIS / Midtrans"}
                </button>

                <button
                  type="button"
                  onClick={checkoutWhatsapp}
                  className="clear-cart-btn"
                  disabled={isCheckingOut}
                  style={{ width: "100%", marginTop: "12px" }}
                >
                  Checkout via WhatsApp
                </button>
              </aside>
            </div>
          )}
        </section>
      </main>
    </>
  );
}