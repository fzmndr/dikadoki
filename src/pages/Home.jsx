import Hero from "../sections/Hero";
import ProjectsSection from "../sections/Projects";
import ServicesSection from "../sections/Services";
import About from "../sections/About";
import FAQ from "../sections/FAQ";
import Contact from "../sections/Contact";
import PageMeta from "../components/PageMeta";
import FeaturedProducts from "../sections/FeaturedProducts";

export default function Home() {
  return (
    <>
      <PageMeta
        title="Home"
        description="dikadoki menyediakan produk digital, jasa kreatif, dan layanan visual untuk kebutuhan dokumentasi, konten, dan brand."
      />

      <main>
        <Hero />
        <FeaturedProducts />
        <ProjectsSection />
        <ServicesSection />
        <About />
        <FAQ />
        <Contact />
      </main>
    </>
  );
}