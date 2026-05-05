import { Link, useSearchParams } from "react-router-dom";
import PageMeta from "../components/PageMeta";
import { routes } from "../config/routes";

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get("code");

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
            </div>
          )}

          <div className="order-success-actions">
            <Link to={routes.shop}>Back to Shop</Link>
            <Link to={routes.home}>Back Home</Link>
          </div>
        </section>
      </main>
    </>
  );
}