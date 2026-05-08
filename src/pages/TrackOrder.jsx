import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import PageMeta from "../components/PageMeta";

import { supabase } from "../lib/supabase";
import { routes } from "../config/routes";
import {
  orderStatuses,
  orderStatusDescriptions,
  orderStatusSteps,
} from "../config/orderStatus";

import { formatRupiah } from "../utils/formatCurrency";
import { formatDateTimeID } from "../utils/formatDate";

export default function TrackOrder() {
  const [searchParams] = useSearchParams();

  const initialCode = searchParams.get("code") || "";

  const [orderCode, setOrderCode] = useState(initialCode);
  const [order, setOrder] = useState(null);
  const [trackError, setTrackError] = useState("");
  const [isTracking, setIsTracking] = useState(false);

  const fetchOrderByCode = async (code) => {
    const cleanCode = code.trim();

    if (!cleanCode) {
      setTrackError("Masukkan kode order terlebih dahulu.");
      setOrder(null);
      return;
    }

    setIsTracking(true);
    setTrackError("");
    setOrder(null);

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        order_code,
        customer_name,
        customer_phone,
        customer_date,
        order_type,
        customer_note,
        status,
        order_status,
        payment_method,
        payment_status,
        midtrans_order_id,
        midtrans_transaction_status,
        total,
        total_items,
        items,
        paid_at,
        created_at
      `
      )
      .eq("order_code", cleanCode)
      .maybeSingle();

    setIsTracking(false);

    if (error) {
      console.error("Track order error:", error);
      setTrackError("Gagal mengecek order. Coba lagi beberapa saat.");
      return;
    }

    if (!data) {
      setTrackError("Order tidak ditemukan. Pastikan kode order benar.");
      return;
    }

    setOrder(data);
  };

  const trackOrder = async (e) => {
    e.preventDefault();
    await fetchOrderByCode(orderCode);
  };

  useEffect(() => {
    if (!initialCode) return;

    fetchOrderByCode(initialCode);
  }, [initialCode]);

  useEffect(() => {
    if (!order?.order_code) return;

    const channel = supabase
      .channel(`track-order-${order.order_code}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `order_code=eq.${order.order_code}`,
        },
        (payload) => {
          setOrder(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order?.order_code]);

  const getDisplayStatus = (currentOrder) => {
    if (!currentOrder) return orderStatuses.whatsapp;

    if (currentOrder.status) return currentOrder.status;

    if (currentOrder.order_status === "processing") return "Processing";
    if (currentOrder.order_status === "completed") return "Completed";
    if (currentOrder.order_status === "cancelled") return "Cancelled";

    return orderStatuses.whatsapp;
  };

  const getPaymentLabel = (paymentStatus) => {
    if (paymentStatus === "paid") return "Lunas";
    if (paymentStatus === "failed") return "Gagal";
    if (paymentStatus === "pending") return "Menunggu Pembayaran";

    return "Belum Dibayar";
  };

  const getPaymentClass = (paymentStatus) => {
    if (paymentStatus === "paid") return "completed";
    if (paymentStatus === "failed") return "cancelled";

    return "whatsapp";
  };

  const getStatusClass = (status) => {
    const normalizedStatus = String(status || "").toLowerCase();

    if (
      normalizedStatus === String(orderStatuses.completed || "").toLowerCase() ||
      normalizedStatus === "completed"
    ) {
      return "completed";
    }

    if (
      normalizedStatus === String(orderStatuses.processing || "").toLowerCase() ||
      normalizedStatus === "processing" ||
      normalizedStatus === "process"
    ) {
      return "processing";
    }

    if (
      normalizedStatus === String(orderStatuses.cancelled || "").toLowerCase() ||
      normalizedStatus === "cancelled"
    ) {
      return "cancelled";
    }

    return "whatsapp";
  };

  const getCurrentStepIndex = (currentOrder) => {
    const status = getDisplayStatus(currentOrder);
    const normalizedStatus = String(status || "").toLowerCase();
    const normalizedOrderStatus = String(
      currentOrder?.order_status || ""
    ).toLowerCase();

    if (
      normalizedStatus === "cancelled" ||
      normalizedOrderStatus === "cancelled"
    ) {
      return -1;
    }

    if (
      normalizedStatus === "completed" ||
      normalizedOrderStatus === "completed"
    ) {
      return 3;
    }

    if (
      normalizedStatus === "processing" ||
      normalizedStatus === "process" ||
      normalizedOrderStatus === "processing"
    ) {
      return 2;
    }

    if (currentOrder?.payment_status === "paid") {
      return 2;
    }

    return 1;
  };

  const displayStatus = getDisplayStatus(order);
  const activeIndex = getCurrentStepIndex(order);
  const isCancelled = activeIndex === -1;

  return (
    <>
      <PageMeta
        title="Track Order"
        description="Cek status pesanan dikadoki berdasarkan kode order."
      />

      <main className="track-order-page">
        <section className="track-order-box">
          <p className="section-label">Track Order</p>

          <h1>Cek Status Pesanan</h1>

          <p>
            Masukkan kode order yang kamu dapat setelah checkout untuk melihat
            status pesanan dan status pembayaran.
          </p>

          <form onSubmit={trackOrder} className="track-order-form">
            <input
              type="text"
              value={orderCode}
              onChange={(e) => {
                setOrderCode(e.target.value);
                setTrackError("");
              }}
              placeholder="Contoh: DK-20260505-1234"
            />

            <button type="submit" disabled={isTracking}>
              {isTracking ? "Checking..." : "Track Order"}
            </button>
          </form>

          {trackError && <div className="track-order-error">{trackError}</div>}

          {order && (
            <>
              <div className="track-order-timeline">
                {isCancelled ? (
                  <div className="track-order-cancelled">
                    Pesanan ini berstatus Cancelled.
                  </div>
                ) : (
                  orderStatusSteps.map((step, index) => {
                    const isActive = index <= activeIndex;

                    return (
                      <div
                        className={`track-order-step ${
                          isActive ? "active" : ""
                        }`}
                        key={`${step.label}-${index}`}
                      >
                        <span>{index + 1}</span>
                        <p>{step.label}</p>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="track-order-result">
                <div>
                  <span>Kode Order</span>
                  <strong>{order.order_code}</strong>
                </div>

                <div>
                  <span>Status Pembayaran</span>

                  <strong
                    className={`track-status-badge ${getPaymentClass(
                      order.payment_status
                    )}`}
                  >
                    {getPaymentLabel(order.payment_status)}
                  </strong>

                  <p className="track-status-description">
                    {order.payment_status === "paid"
                      ? "Pembayaran sudah berhasil diterima."
                      : order.payment_status === "failed"
                      ? "Pembayaran gagal atau kedaluwarsa."
                      : "Pembayaran masih menunggu konfirmasi Midtrans."}
                  </p>
                </div>

                <div>
                  <span>Status Pesanan</span>

                  <strong
                    className={`track-status-badge ${getStatusClass(
                      displayStatus
                    )}`}
                  >
                    {displayStatus}
                  </strong>

                  <p className="track-status-description">
                    {orderStatusDescriptions?.[displayStatus] ||
                      orderStatusDescriptions?.[order.status] ||
                      "Status pesanan sedang diperbarui."}
                  </p>
                </div>

                <div>
                  <span>Metode Pembayaran</span>
                  <strong>{order.payment_method || "-"}</strong>
                </div>

                <div>
                  <span>Status Midtrans</span>
                  <strong>{order.midtrans_transaction_status || "-"}</strong>
                </div>

                {order.paid_at && (
                  <div>
                    <span>Tanggal Pembayaran</span>
                    <strong>{formatDateTimeID(order.paid_at)}</strong>
                  </div>
                )}

                <div>
                  <span>Nama</span>
                  <strong>{order.customer_name || "-"}</strong>
                </div>

                <div>
                  <span>Nomor WhatsApp</span>
                  <strong>{order.customer_phone || "-"}</strong>
                </div>

                <div>
                  <span>Tanggal Kebutuhan</span>
                  <strong>{order.customer_date || "-"}</strong>
                </div>

                <div>
                  <span>Jenis Pesanan</span>
                  <strong>{order.order_type || "-"}</strong>
                </div>

                <div>
                  <span>Tanggal Order</span>
                  <strong>{formatDateTimeID(order.created_at)}</strong>
                </div>

                <div>
                  <span>Total Item</span>
                  <strong>{order.total_items || 0}</strong>
                </div>

                <div className="track-order-total">
                  <span>Total</span>
                  <strong>{formatRupiah(order.total || 0)}</strong>
                </div>
              </div>
            </>
          )}

          <div className="track-order-actions">
            <Link to={routes.shop}>Back to Shop</Link>
            <Link to={routes.home}>Back Home</Link>
          </div>
        </section>
      </main>
    </>
  );
}