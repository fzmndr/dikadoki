import { Link } from "react-router-dom";
import { routes } from "../config/routes";
import PageMeta from "../components/PageMeta";

export default function NotFound() {
  return (
    <>
      <PageMeta
        title="404"
        description="Halaman yang kamu cari tidak ditemukan di dikadoki."
      />
    <main className="not-found-page">
      <section className="not-found-box">
        <p className="section-label">404</p>
        <h1>Page Not Found</h1>
        <p>
          Halaman yang kamu cari tidak ditemukan atau mungkin sudah dipindahkan.
        </p>

        <div className="not-found-actions">
          <Link to={routes.home}>Back Home</Link>
          <Link to={routes.shop}>Explore Shop</Link>
        </div>
      </section>
    </main>
    </>
  );
}