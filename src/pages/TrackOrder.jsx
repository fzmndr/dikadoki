import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { orderStatuses } from "../config/orderStatus";

import PageMeta from "../components/PageMeta";

import { supabase } from "../lib/supabase";
import { routes } from "../config/routes";

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
    if (!code.trim()) {
        setTrackError("Masukkan kode order terlebih dahulu.");
        setOrder(null);
        return;
    }

    setIsTracking(true);
    setTrackError("");
    setOrder(null);

    const { data, error } = await supabase
        .from("public_order_tracking")
        .select("*")
        .eq("order_code", code.trim())
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

const getStatusClass = (status) => {
  if (status === orderStatuses.completed) return "completed";
  if (status === orderStatuses.processing) return "processing";
  if (status === orderStatuses.cancelled) return "cancelled";

  return "whatsapp";
};

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
            status pesanan.
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
            <div className="track-order-result">
              <div>
                <span>Kode Order</span>
                <strong>{order.order_code}</strong>
              </div>

              <div>
                <span>Status</span>
                <strong className={`track-status-badge ${getStatusClass(order.status)}`}>
                    {order.status}
                </strong>
              </div>

              <div>
                <span>Nama</span>
                <strong>{order.customer_name || "-"}</strong>
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

              <div className="track-order-total">
                <span>Total</span>
                <strong>{formatRupiah(order.total || 0)}</strong>
              </div>
            </div>
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