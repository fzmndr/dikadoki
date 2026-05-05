import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

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

  const orderCode = searchParams.get("code");

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

      setTimeout(() => {
        setCopied(false);
      }, 1800);
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

          <p>
            Pesanan kamu sudah tersimpan. Silakan lanjutkan konfirmasi melalui
            WhatsApp agar admin bisa segera memproses pesanan.
          </p>

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

            <strong className="track-status-badge whatsapp">
                {orderStatuses.whatsapp}
            </strong>

            <p>
                {orderStatusDescriptions[orderStatuses.whatsapp]}
            </p>
          </div>

          <div className="order-success-actions">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              Open WhatsApp
            </a>

            {orderCode && (
                <Link to={`${routes.trackOrder}?code=${orderCode}`}>Track Order</Link>
            )}

            <Link to={routes.shop}>Back to Shop</Link>
            <Link to={routes.home}>Back Home</Link>
          </div>
        </section>
      </main>
    </>
  );
}