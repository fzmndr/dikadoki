import { services } from "../data/services";

export default function Services() {
  return (
    <main className="services-page">
      <section className="services-page-hero">
        <p className="section-label">What We Do</p>
        <h1>Services</h1>
        <p>
          Layanan visual cinematic untuk kebutuhan wedding, commercial, event,
          creative campaign, dan storytelling brand.
        </p>
      </section>

      <section className="services-page-grid">
        {services.map((service, index) => (
          <article className="services-page-card" key={service.id || index}>
            <span className="services-page-number">
              {String(index + 1).padStart(2, "0")}
            </span>

            <div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}