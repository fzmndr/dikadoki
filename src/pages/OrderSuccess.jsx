import { useState, useEffect } from "react"; // Tambah useEffect
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase"; // Import supabase kamu

import PageMeta from "../components/PageMeta";
import { routes } from "../config/routes";
import { siteConfig } from "../config/site";
import {
  orderStatuses,
  orderStatusDescriptions,
} from "../config/orderStatus";

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState("pending"); // State untuk status pembayaran
  const [isDownloading, setIsDownloading] = useState(false);

  const orderCode = searchParams.get("code");

  // 1. Logika Realtime & Fetch Status Awal
  useEffect(() => {
    if (!orderCode) return;

    const fetchInitialStatus = async () => {
      const { data } = await supabase
        .from("orders")
        .select("status")
        .eq("id", orderCode) // Gunakan kolom id (order_id midtrans)
        .single();
      if (data) setStatus(data.status);
    };

    fetchInitialStatus();

    // Berlangganan perubahan status secara Realtime
    const channel = supabase
      .channel("status-check")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderCode}` },
        (payload) => {
          setStatus(payload.new.status);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [orderCode]);

  // 2. Fungsi Download File
  const handleDownload = async () => {
    if (status !== "settlement") {
      alert("Pembayaran belum terkonfirmasi otomatis. Silakan hubungi admin via WhatsApp.");
      return;
    }

    setIsDownloading(true);
    try {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select(`products ( file_path )`)
        .eq("id", orderCode)
        .single();

      if (orderError) throw orderError;

      const { data: signData, error: signError } = await supabase
        .storage
        .from("digital-assets") // Pastikan nama bucket sesuai
        .createSignedUrl(orderData.products.file_path, 60);

      if (signError) throw signError;

      window.location.href = signData.signedUrl;
    } catch (error) {
      console.error("Download error:", error.message);
      alert("Gagal mengambil link download.");
    } finally {
      setIsDownloading(false);
    }
  };

  const whatsappMessage = orderCode
    ? `Halo ${siteConfig.brandName}, saya ingin konfirmasi pesanan dengan kode order ${orderCode}.`
    : `Halo ${siteConfig.brandName}, saya ingin konfirmasi pesanan saya.`;

  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  const copyOrderCode = async () => {
    if (!orderCode) return;
    try {
      await navigator.clipboard.writeText(orderCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error("Failed to copy order code:", error);
    }
  };

  return (
    <>
      <PageMeta
        title="Order Success"
        description="Pesanan dikadoki berhasil dibuat dan diarahkan ke WhatsApp."
      />

      <main className="order-success-page">
        <section className="order-success-box">
          <p className="section-label">Checkout Success</p>

          <h1>Order Berhasil Dibuat</h1>

          {/* AREA DOWNLOAD (Hanya Muncul jika lunas) */}
          {status === "settlement" ? (
            <div className="download-section" style={{ background: '#f0fff4', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #c6f6d5' }}>
              <h2 style={{ color: '#2f855a', fontSize: '1.2rem', marginBottom: '10px' }}>Pembayaran Terverifikasi!</h2>
              <p>Klik tombol di bawah untuk mengunduh aset kamu langsung.</p>
              <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className="btn-download" 
                style={{ background: '#000', color: '#fff', padding: '10px 25px', borderRadius: '99px', marginTop: '10px' }}
              >
                {isDownloading ? "Menyiapkan File..." : "Download File Sekarang"}
              </button>
            </div>
          ) : (
            <p>
              Pesanan kamu sudah tersimpan. Silakan lanjutkan konfirmasi melalui
              WhatsApp agar admin bisa segera memproses pesanan.
            </p>
          )}

          {orderCode && (
            <div className="order-success-code">
              <span>Kode Order</span>
              <strong>{orderCode}</strong>
              <button type="button" onClick={copyOrderCode}>
                {copied ? "Copied" : "Copy Code"}
              </button>
            </div>
          )}

          <div className="order-success-status">
            <span>Status Pesanan</span>
            {/* Status dinamis berdasarkan database */}
            <strong className={`track-status-badge ${status}`}>
                {status === "settlement" ? "LUNAS / SELESAI" : orderStatuses.whatsapp}
            </strong>
            <p>
                {status === "settlement" 
                  ? "Pembayaran telah kami terima. File siap diunduh." 
                  : orderStatusDescriptions[orderStatuses.whatsapp]}
            </p>
          </div>

          <div className="order-success-actions">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
              Open WhatsApp
            </a>
            {orderCode && (
                <Link to={`${routes.trackOrder}?code=${orderCode}`}>Track Order</Link>
            )}
            <Link to={routes.shop}>Back to Shop</Link>
          </div>
        </section>
      </main>
    </>
  );
}