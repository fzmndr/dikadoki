import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

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
  const [order, setOrder] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [orderStatus, setOrderStatus] = useState(orderStatuses.whatsapp);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const orderCode = searchParams.get("code");

  const isPaid = paymentStatus === "paid";

  useEffect(() => {
    if (!orderCode) {
      setIsLoading(false);
      return;
    }

    const fetchInitialOrder = async () => {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("order_code", orderCode)
        .single();

      if (!error && data) {
        setOrder(data);
        setPaymentStatus(data.payment_status || "pending");
        setOrderStatus(data.status || orderStatuses.whatsapp);
      }

      setIsLoading(false);
    };

    fetchInitialOrder();

    const channel = supabase
      .channel(`order-success-${orderCode}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `order_code=eq.${orderCode}`,
        },
        (payload) => {
          setOrder(payload.new);
          setPaymentStatus(payload.new.payment_status || "pending");
          setOrderStatus(payload.new.status || orderStatuses.whatsapp);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderCode]);

  const getDownloadableFile = () => {
    const items = order?.items || [];

    const downloadableItem = items.find((item) => {
      return item.file_path || item.filePath || item.download_url;
    });

    if (!downloadableItem) return null;

    return {
      name: downloadableItem.name || downloadableItem.title || "File Produk",
      filePath: downloadableItem.file_path || downloadableItem.filePath,
      downloadUrl: downloadableItem.download_url,
    };
  };

  const handleDownload = async () => {
    if (!isPaid) {
      alert(
        "Pembayaran belum terkonfirmasi otomatis. Silakan tunggu atau hubungi admin via WhatsApp."
      );
      return;
    }

    const file = getDownloadableFile();

    if (!file) {
      alert(
        "File download belum ditemukan di data order. Pastikan item produk punya file_path."
      );
      return;
    }

    if (file.downloadUrl) {
      window.location.href = file.downloadUrl;
      return;
    }

    setIsDownloading(true);

    try {
      const { data, error } = await supabase.storage
        .from("digital-assets")
        .createSignedUrl(file.filePath, 60);

      if (error) throw error;

      window.location.href = data.signedUrl;
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

  const whatsappUrl = `https://wa.me/${
    siteConfig.whatsappNumber
  }?text=${encodeURIComponent(whatsappMessage)}`;

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

  const statusLabel = isPaid
    ? "LUNAS"
    : paymentStatus === "failed"
    ? "GAGAL"
    : "MENUNGGU PEMBAYARAN";

  const statusDescription = isPaid
    ? "Pembayaran telah kami terima. Jika ini produk digital, file siap diunduh."
    : paymentStatus === "failed"
    ? "Pembayaran gagal atau kedaluwarsa. Silakan lakukan checkout ulang."
    : "Pembayaran sedang menunggu konfirmasi otomatis dari Midtrans.";

  return (
    <>
      <PageMeta
        title="Order Success"
        description="Pesanan dikadoki berhasil dibuat dan menunggu konfirmasi pembayaran."
      />

      <main className="order-success-page">
        <section className="order-success-box">
          <p className="section-label">Checkout Success</p>

          <h1>Order Berhasil Dibuat</h1>

          {isLoading ? (
            <p>Memuat status pesanan...</p>
          ) : (
            <>
              {isPaid ? (
                <div
                  className="download-section"
                  style={{
                    background: "#f0fff4",
                    padding: "20px",
                    borderRadius: "12px",
                    marginBottom: "20px",
                    border: "1px solid #c6f6d5",
                  }}
                >
                  <h2
                    style={{
                      color: "#2f855a",
                      fontSize: "1.2rem",
                      marginBottom: "10px",
                    }}
                  >
                    Pembayaran Terverifikasi!
                  </h2>

                  <p>Klik tombol di bawah untuk mengunduh aset kamu.</p>

                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="btn-download"
                    style={{
                      background: "#000",
                      color: "#fff",
                      padding: "10px 25px",
                      borderRadius: "99px",
                      marginTop: "10px",
                    }}
                  >
                    {isDownloading
                      ? "Menyiapkan File..."
                      : "Download File Sekarang"}
                  </button>
                </div>
              ) : (
                <p>
                  Pesanan kamu sudah tersimpan. Silakan selesaikan pembayaran
                  melalui halaman Midtrans. Jika sudah bayar, status akan
                  berubah otomatis.
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
                <span>Status Pembayaran</span>

                <strong className={`track-status-badge ${paymentStatus}`}>
                  {statusLabel}
                </strong>

                <p>{statusDescription}</p>
              </div>

              <div className="order-success-status">
                <span>Status Pesanan</span>

                <strong className={`track-status-badge ${orderStatus}`}>
                  {orderStatus}
                </strong>

                <p>
                  {orderStatusDescriptions?.[orderStatus] ||
                    orderStatusDescriptions?.[orderStatuses.whatsapp] ||
                    "Status pesanan sedang diproses."}
                </p>
              </div>

              <div className="order-success-actions">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp"
                >
                  Open WhatsApp
                </a>

                {orderCode && (
                  <Link to={`${routes.trackOrder}?code=${orderCode}`}>
                    Track Order
                  </Link>
                )}

                <Link to={routes.shop}>Back to Shop</Link>
              </div>
            </>
          )}
        </section>
      </main>
    </>
  );
}