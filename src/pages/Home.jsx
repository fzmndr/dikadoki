import Hero from "../sections/Hero";
import ProjectsSection from "../sections/Projects";
import ServicesSection from "../sections/Services";
import About from "../sections/About";
import FAQ from "../sections/FAQ";
import Contact from "../sections/Contact";

export default function Home() {
  return (
    <main>
      <Hero />
      <ProjectsSection />
      <ServicesSection />
      <About />
      <FAQ />
      <Contact />
    </main>
  );
}