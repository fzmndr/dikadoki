import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { supabase } from "../lib/supabase";
import { siteConfig } from "../config/site";
import { adminConfig } from "../config/admin";
import { routes } from "../config/routes";
import PageMeta from "../components/PageMeta";

import { formatRupiah } from "../utils/formatCurrency";
import { formatDateTimeID } from "../utils/formatDate";
import { generateOrderMessage } from "../utils/orderMessage";

import {
  clearOrdersFromSupabase,
  deleteOrderFromSupabase,
  fetchOrdersFromSupabase,
  updateOrderNoteInSupabase,
  updateOrderStatusInSupabase,
  upsertOrdersToSupabase,
} from "../services/orderService";

import {
  editableOrderStatuses,
  orderStatuses,
} from "../config/orderStatus";

import {
  getCurrentAdminSession,
  loginAdmin,
  logoutAdmin,
} from "../services/authService";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [openOrderCode, setOpenOrderCode] = useState(null);
  const [copiedCode, setCopiedCode] = useState("");
  const [copiedMessageCode, setCopiedMessageCode] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All Time");
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const fileInputRef = useRef(null);
  const noteTimersRef = useRef({});
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    setOrdersError("");

    try {
      const fetchedOrders = await fetchOrdersFromSupabase();
      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Fetch orders error:", error);
      setOrdersError(
        "Gagal mengambil data order dari Supabase. Periksa koneksi, API key, atau policy database."
      );
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
  const checkAdminSession = async () => {
    try {
      const session = await getCurrentAdminSession();

      if (session) {
        setIsAdminUnlocked(true);
      }
    } catch (error) {
      console.error("Check admin session error:", error);
    } finally {
      setIsCheckingSession(false);
    }
  };

  checkAdminSession();
}, []);

  useEffect(() => {
    if (!isAdminUnlocked) return;

    fetchOrders();

    const channel = supabase
      .channel("orders-realtime-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdminUnlocked]);

  useEffect(() => {
    return () => {
      Object.values(noteTimersRef.current).forEach((timer) => {
        clearTimeout(timer);
      });
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  const clearOrders = async () => {
    const confirmClear = window.confirm(
      "Yakin ingin menghapus semua riwayat order?"
    );

    if (!confirmClear) return;

    try {
      await clearOrdersFromSupabase();

      setOrders([]);
      setOpenOrderCode(null);
      setSearchTerm("");
      setDebouncedSearch("");
      setStatusFilter("All");
      setDateFilter("All Time");
    } catch (error) {
      console.error("Clear orders error:", error);
      alert("Gagal menghapus semua order.");
    }
  };

  const exportOrders = () => {
    if (orders.length === 0) return;

    const data = JSON.stringify(orders, null, 2);
    const blob = new Blob([data], { type: "application/json" });

    const url = URL.createObjectURL(blob);
    const today = new Date().toISOString().slice(0, 10);
    const filename = `dikadoki-orders-${today}.json`;

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
  };

  const importOrders = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const importedOrders = JSON.parse(reader.result);

        if (!Array.isArray(importedOrders)) {
          alert("File JSON tidak valid.");
          return;
        }

        await upsertOrdersToSupabase(importedOrders);

        setSearchTerm("");
        setDebouncedSearch("");
        setStatusFilter("All");
        setDateFilter("All Time");

        await fetchOrders();

        alert("Order berhasil diimport.");
      } catch (error) {
        alert("Gagal membaca atau mengimport file JSON.");
        console.error("Import orders error:", error);
      } finally {
        event.target.value = "";
      }
    };

    reader.readAsText(file);
  };

  const exportOrdersCSV = () => {
    if (orders.length === 0) return;

    const headers = [
      "Kode Order",
      "Tanggal Order",
      "Nama",
      "Tanggal Kebutuhan",
      "WhatsApp",
      "Jenis Pesanan",
      "Status",
      "Produk",
      "Total Item",
      "Total",
      "Catatan Customer",
      "Internal Notes",
    ];

    const rows = orders.map((order) => {
      const productNames =
        order.items
          ?.map((item) => `${item.name} x${item.quantity || 1}`)
          .join(" | ") || "";

      const totalItems =
        order.items?.reduce((sum, item) => {
          return sum + (item.quantity || 1);
        }, 0) || 0;

      return [
        order.code || "",
        formatDateTimeID(order.date),
        order.customer?.name || "",
        order.customer?.date || "",
        order.customer?.phone || "",
        order.customer?.orderType || "",
        order.status || "",
        productNames,
        totalItems,
        order.total || 0,
        order.customer?.note || "",
        order.internalNote || "",
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((field) => {
            const value = String(field).replaceAll('"', '""');
            return `"${value}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const today = new Date().toISOString().slice(0, 10);
    const filename = `dikadoki-orders-${today}.csv`;

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
  };

  const deleteOrder = async (orderCode) => {
    const confirmDelete = window.confirm(
      "Yakin ingin menghapus riwayat order ini?"
    );

    if (!confirmDelete) return;

    try {
      await deleteOrderFromSupabase(orderCode);

      const updatedOrders = orders.filter((order) => order.code !== orderCode);
      setOrders(updatedOrders);

      if (openOrderCode === orderCode) {
        setOpenOrderCode(null);
      }
    } catch (error) {
      console.error("Delete order error:", error);
      alert("Gagal menghapus order.");
    }
  };

  const updateOrderNote = (orderCode, note) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.code === orderCode
          ? {
              ...order,
              internalNote: note,
            }
          : order
      )
    );

    if (noteTimersRef.current[orderCode]) {
      clearTimeout(noteTimersRef.current[orderCode]);
    }

    noteTimersRef.current[orderCode] = setTimeout(async () => {
      try {
        await updateOrderNoteInSupabase(orderCode, note);
      } catch (error) {
        console.error("Update order note error:", error);
      }
    }, 600);
  };

  const updateOrderStatus = async (orderCode, newStatus) => {
    try {
      await updateOrderStatusInSupabase(orderCode, newStatus);

      const updatedOrders = orders.map((order) =>
        order.code === orderCode
          ? {
              ...order,
              status: newStatus,
            }
          : order
      );

      setOrders(updatedOrders);
    } catch (error) {
      console.error("Update order status error:", error);
      alert("Gagal mengubah status order.");
    }
  };

  const reorderItems = (items = []) => {
    if (items.length === 0) return;

    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    const updatedCart = [...existingCart];

    items.forEach((item) => {
      const existingItem = updatedCart.find(
        (cartItem) => cartItem.id === item.id
      );

      if (existingItem) {
        existingItem.quantity =
          (existingItem.quantity || 1) + (item.quantity || 1);
      } else {
        updatedCart.push({
          ...item,
          quantity: item.quantity || 1,
        });
      }
    });

    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));

    navigate(routes.cart);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleOrderDetails = (orderCode) => {
    setOpenOrderCode((currentCode) =>
      currentCode === orderCode ? null : orderCode
    );
  };

  const copyOrderCode = async (orderCode) => {
    try {
      await navigator.clipboard.writeText(orderCode);
      setCopiedCode(orderCode);

      setTimeout(() => {
        setCopiedCode("");
      }, 1800);
    } catch (error) {
      console.error("Failed to copy order code:", error);
    }
  };

  const copyOrderMessage = async (order) => {
    try {
      await navigator.clipboard.writeText(generateOrderMessage(order));
      setCopiedMessageCode(order.code);

      setTimeout(() => {
        setCopiedMessageCode("");
      }, 1800);
    } catch (error) {
      console.error("Failed to copy order message:", error);
    }
  };

  const openOrderWhatsapp = (order) => {
    const phone = siteConfig.whatsappNumber;
    const message = generateOrderMessage(order);

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const printOrder = (order) => {
    const orderList = order.items
      ?.map((item, index) => {
        return `
          <tr>
            <td>${index + 1}</td>
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${item.quantity || 1}</td>
            <td>${formatRupiah(item.price * (item.quantity || 1))}</td>
          </tr>
        `;
      })
      .join("");

    const printWindow = window.open("", "_blank");

    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Order ${order.code}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #111;
            }

            h1 {
              margin-bottom: 6px;
            }

            .muted {
              color: #666;
            }

            .section {
              margin-top: 28px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 14px;
            }

            th,
            td {
              border: 1px solid #ddd;
              padding: 10px;
              text-align: left;
              font-size: 14px;
            }

            th {
              background: #f5f5f5;
            }

            .total {
              margin-top: 24px;
              font-size: 20px;
              font-weight: bold;
              text-align: right;
            }

            .note {
              padding: 14px;
              background: #f5f5f5;
              border-radius: 10px;
              line-height: 1.6;
            }
          </style>
        </head>

        <body>
          <h1>Order ${order.code}</h1>
          <p class="muted">Status: ${order.status}</p>

          <div class="section">
            <h3>Data Pemesan</h3>
            <p><strong>Nama:</strong> ${order.customer?.name || "-"}</p>
            <p><strong>Tanggal Order:</strong> ${formatDateTimeID(
              order.date
            )}</p>
            <p><strong>Tanggal Kebutuhan:</strong> ${
              order.customer?.date || "-"
            }</p>
            <p><strong>No. WhatsApp:</strong> ${
              order.customer?.phone || "-"
            }</p>
            <p><strong>Jenis Pesanan:</strong> ${
              order.customer?.orderType || "-"
            }</p>
          </div>

          <div class="section">
            <h3>Detail Produk</h3>

            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Produk</th>
                  <th>Kategori</th>
                  <th>Qty</th>
                  <th>Harga</th>
                </tr>
              </thead>

              <tbody>
                ${orderList || ""}
              </tbody>
            </table>

            <div class="total">
              Total: ${formatRupiah(order.total || 0)}
            </div>
          </div>

          <div class="section">
            <h3>Catatan Customer</h3>
            <div class="note">${order.customer?.note || "-"}</div>
          </div>

          <div class="section">
            <h3>Internal Notes</h3>
            <div class="note">${order.internalNote || "-"}</div>
          </div>

          <script>
            window.print();
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const unlockAdmin = async (e) => {
  e.preventDefault();

  if (!adminEmail.trim() || !adminPassword.trim()) {
    setAdminError("Email dan password wajib diisi.");
    return;
  }

  setIsLoggingIn(true);
  setAdminError("");

  try {
    await loginAdmin({
      email: adminEmail,
      password: adminPassword,
    });

    setIsAdminUnlocked(true);
    setAdminEmail("");
    setAdminPassword("");
  } catch (error) {
    console.error("Admin login error:", error);
    setAdminError("Email atau password admin salah.");
  } finally {
    setIsLoggingIn(false);
  }
};

  const lockAdmin = async () => {
    try {
      await logoutAdmin();
    } catch (error) {
      console.error("Admin logout error:", error);
    }

    setIsAdminUnlocked(false);
    setAdminEmail("");
    setAdminPassword("");
    setAdminError("");
    setSearchTerm("");
    setDebouncedSearch("");
    setStatusFilter("All");
    setDateFilter("All Time");
  };

  const statusOptions = [
    "All",
    ...new Set(orders.map((order) => order.status).filter(Boolean)),
  ];

  const isOrderInDateFilter = (orderDate) => {
    if (dateFilter === "All Time") return true;
    if (!orderDate) return false;

    const orderTime = new Date(orderDate).getTime();
    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();

    if (dateFilter === "Today") {
      return orderTime >= startOfToday;
    }

    const daysMap = {
      "Last 7 Days": 7,
      "Last 30 Days": 30,
    };

    const selectedDays = daysMap[dateFilter];

    if (!selectedDays) return true;

    const rangeStart = now.getTime() - selectedDays * 24 * 60 * 60 * 1000;

    return orderTime >= rangeStart;
  };

  const filteredOrders = orders.filter((order) => {
    const keyword = debouncedSearch.toLowerCase();

    const code = order.code?.toLowerCase() || "";
    const name = order.customer?.name?.toLowerCase() || "";
    const orderType = order.customer?.orderType?.toLowerCase() || "";
    const status = order.status?.toLowerCase() || "";

    const matchesSearch =
      code.includes(keyword) ||
      name.includes(keyword) ||
      orderType.includes(keyword) ||
      status.includes(keyword);

    const matchesStatus =
      statusFilter === "All" || order.status === statusFilter;

    const matchesDate = isOrderInDateFilter(order.date);

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalRevenue = orders.reduce((sum, order) => {
    return sum + (order.total || 0);
  }, 0);

  const completedOrders = orders.filter((order) => {
  return order.status === orderStatuses.completed;
}).length;

const processingOrders = orders.filter((order) => {
  return order.status === orderStatuses.processing;
}).length;

  const getStatusClass = (status) => {
  if (status === orderStatuses.completed) return "completed";
  if (status === orderStatuses.processing) return "processing";
  if (status === orderStatuses.cancelled) return "cancelled";

  return "whatsapp";
};

if (isCheckingSession) {
  return (
    <main className="orders-page">
      <section className="orders-hero">
        <p className="section-label">Admin Area</p>
        <h1>Orders</h1>
        <p>Memeriksa sesi admin...</p>
      </section>

      <section className="admin-lock-box">
        <div className="admin-lock-form">
          <p>Loading admin session...</p>
        </div>
      </section>
    </main>
  );
}


  if (!isAdminUnlocked) {
    return (
        <>
        <PageMeta
            title="Admin Login"
            description="Login admin dikadoki untuk mengakses dashboard orders."
          />
      <main className="orders-page">
        <section className="orders-hero">
          <p className="section-label">Admin Area</p>
          <h1>Orders</h1>
          <p>Masukkan kode admin untuk membuka riwayat order.</p>
        </section>

        <section className="admin-lock-box">
          <form onSubmit={unlockAdmin} className="admin-lock-form">
            <label>Email Admin</label>

            <input
              type="email"
              value={adminEmail}
              onChange={(e) => {
                setAdminEmail(e.target.value);
                setAdminError("");
              }}
              placeholder="admin@dikadoki.com"
            />

            <label>Password Admin</label>

            <input
              type="password"
              value={adminPassword}
              onChange={(e) => {
                setAdminPassword(e.target.value);
                setAdminError("");
              }}
              placeholder="Masukkan password admin"
            />

            {adminError && <p>{adminError}</p>}

            <button type="submit" disabled={isLoggingIn}>
              {isLoggingIn ? "Logging in..." : "Login Admin"}
            </button>
          </form>
        </section>
      </main>
      </>
    );
  }

  return (
    <>
    <PageMeta
      title="Admin Orders"
      description="Dashboard admin untuk mengelola riwayat order dikadoki."
    />
    <main className="orders-page">
      <section className="orders-hero">
        <p className="section-label">Order History</p>
        <h1>Orders</h1>
        <p>Riwayat checkout yang pernah dibuat melalui website dikadoki.</p>
      </section>

      <section className="orders-content">
        {isLoadingOrders && orders.length === 0 ? (
          <div className="orders-loading-box">
            <h2>Loading orders...</h2>
            <p>Sedang mengambil data order dari Supabase.</p>
          </div>
        ) : ordersError ? (
          <div className="orders-error-box">
            <h2>Database Error</h2>
            <p>{ordersError}</p>

            <button type="button" onClick={fetchOrders}>
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="orders-empty-box">
            <h2>Belum ada riwayat order</h2>
            <p>
              Order yang dibuat lewat checkout WhatsApp akan tampil di halaman
              ini.
            </p>

            <Link to={routes.shop} className="cart-shop-btn">
              Back to Shop
            </Link>
          </div>
        ) : (
          <>
            <div className="orders-stats-grid">
              <div className="orders-stat-card">
                <span>Total Orders</span>
                <strong>{orders.length}</strong>
              </div>

              <div className="orders-stat-card">
                <span>Total Revenue</span>
                <strong>{formatRupiah(totalRevenue)}</strong>
              </div>

              <div className="orders-stat-card">
                <span>Completed</span>
                <strong>{completedOrders}</strong>
              </div>

              <div className="orders-stat-card">
                <span>Processing</span>
                <strong>{processingOrders}</strong>
              </div>
            </div>

            <div className="orders-topbar">
              <span>
                {isLoadingOrders
                  ? "Refreshing orders..."
                  : `${filteredOrders.length} dari ${orders.length} Order`}
              </span>

              <div className="orders-topbar-actions">
                <input
                  type="text"
                  placeholder="Search order..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <option value="All Time">All Time</option>
                  <option value="Today">Today</option>
                  <option value="Last 7 Days">Last 7 Days</option>
                  <option value="Last 30 Days">Last 30 Days</option>
                </select>

                <button type="button" onClick={exportOrders}>
                  Export JSON
                </button>

                <button type="button" onClick={exportOrdersCSV}>
                  Export CSV
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Import JSON
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json"
                  onChange={importOrders}
                  hidden
                />

                <button
                  type="button"
                  onClick={fetchOrders}
                  disabled={isLoadingOrders}
                >
                  {isLoadingOrders ? "Loading..." : "Refresh Orders"}
                </button>

                <button type="button" onClick={clearOrders}>
                  Clear History
                </button>

                <button type="button" onClick={lockAdmin}>
                  Lock Admin
                </button>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="orders-empty-box">
                <h2>Order tidak ditemukan</h2>
                <p>Coba gunakan kata kunci lain atau hapus pencarian.</p>

                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setDebouncedSearch("");
                    setStatusFilter("All");
                    setDateFilter("All Time");
                  }}
                  className="cart-shop-btn"
                >
                  Reset Search
                </button>
              </div>
            ) : (
              <div className="orders-list">
                {filteredOrders.map((order) => {
                  const isOpen = openOrderCode === order.code;

                  return (
                    <article className="order-card" key={order.code}>
                      <div className="order-card-header">
                        <div>
                          <span>Kode Order</span>
                          <h3>{order.code}</h3>
                        </div>

                        <div className="order-header-actions">
                          <button
                            type="button"
                            onClick={() => copyOrderCode(order.code)}
                          >
                            {copiedCode === order.code
                              ? "Copied"
                              : "Copy Code"}
                          </button>

                          <select
                            className={`order-status-select ${getStatusClass(
                              order.status
                            )}`}
                            value={order.status}
                            onChange={(e) =>
                              updateOrderStatus(order.code, e.target.value)
                            }
                          >
                            {editableOrderStatuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="order-info-grid">
                        <div>
                          <span>Nama</span>
                          <p>{order.customer?.name || "-"}</p>
                        </div>

                        <div>
                          <span>Tanggal Order</span>
                          <p>{formatDateTimeID(order.date)}</p>
                        </div>

                        <div>
                          <span>Tanggal Kebutuhan</span>
                          <p>{order.customer?.date || "-"}</p>
                        </div>

                        <div>
                          <span>Jenis Pesanan</span>
                          <p>{order.customer?.orderType || "-"}</p>
                        </div>

                        <div>
                          <span>Total</span>
                          <p>{formatRupiah(order.total)}</p>
                        </div>
                      </div>

                      <div className="order-internal-note">
                        <label>Internal Notes</label>

                        <textarea
                          value={order.internalNote || ""}
                          onChange={(e) =>
                            updateOrderNote(order.code, e.target.value)
                          }
                          placeholder="Contoh: sudah dihubungi, menunggu DP, file sudah dikirim..."
                          rows="3"
                        />
                      </div>

                      {isOpen && (
                        <div className="order-items">
                          {order.items?.map((item) => (
                            <div className="order-item" key={item.id}>
                              <img src={item.image} alt={item.name} />

                              <div>
                                <span>{item.category}</span>
                                <h4>{item.name}</h4>
                                <p>
                                  Qty: {item.quantity || 1} ·{" "}
                                  {formatRupiah(
                                    item.price * (item.quantity || 1)
                                  )}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="order-actions">
                        <button
                          type="button"
                          onClick={() => toggleOrderDetails(order.code)}
                          className="order-detail-toggle"
                        >
                          {isOpen ? "Hide Details" : "Show Details"}
                        </button>

                        <button
                          type="button"
                          onClick={() => copyOrderMessage(order)}
                          className="copy-message-btn"
                        >
                          {copiedMessageCode === order.code
                            ? "Copied"
                            : "Copy Message"}
                        </button>

                        <button
                          type="button"
                          onClick={() => openOrderWhatsapp(order)}
                          className="open-whatsapp-btn"
                        >
                          Open WhatsApp
                        </button>

                        <button
                          type="button"
                          onClick={() => printOrder(order)}
                          className="print-order-btn"
                        >
                          Print Order
                        </button>

                        <button
                          type="button"
                          onClick={() => reorderItems(order.items)}
                        >
                          Reorder
                        </button>

                        <Link to="/shop">Back to Shop</Link>

                        <button
                          type="button"
                          onClick={() => deleteOrder(order.code)}
                          className="delete-order-btn"
                        >
                          Delete Order
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>
    </main>
    </>
  );
}