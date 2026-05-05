import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { routes } from "../config/routes";

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: "Home", id: "home", type: "section" },
    { name: "Projects", path: "/projects", type: "page" },
    { name: "Services", path: "/services", type: "page" },
    { name: "Shop", path: "/shop", type: "page" },
    { name: "Contact", id: "contact", type: "section" },
  ];

  const goToSection = (id) => {
    if (location.pathname !== "/") {
      navigate("/");

      setTimeout(() => {
        const section = document.getElementById(id);

        if (section) {
          section.scrollIntoView({ behavior: "smooth" });
        }
      }, 300);

      return;
    }

    const section = document.getElementById(id);

    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleNavClick = (link) => {
    if (link.type === "section") {
      goToSection(link.id);
      return;
    }

    navigate(link.path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative border-t border-white/10 mt-24 overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[320px] bg-white/10 blur-3xl" />
      </div>

      <div className="container-custom py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-center md:items-start gap-12"
        >
          <div className="text-center md:text-left max-w-sm">
            <button
              type="button"
              onClick={() => goToSection("home")}
              className="text-lg md:text-xl font-semibold tracking-[0.35em] mb-4"
            >
              dikadoki
            </button>

            <p className="text-gray-400 text-sm leading-relaxed">
              Crafting cinematic visuals through photography, videography, and
              creative storytelling.
            </p>
          </div>

          <ul className="flex flex-col md:flex-row items-center gap-5 md:gap-8 text-sm text-gray-400">
            {navLinks.map((link) => (
              <li key={link.name}>
                <button
                  type="button"
                  onClick={() => handleNavClick(link)}
                  className="hover:text-white transition"
                >
                  {link.name}
                </button>
              </li>
            ))}
          </ul>
        </motion.div>

        <div className="my-10 h-[1px] w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-500"
        >
          <p className="text-center">
            © {new Date().getFullYear()} dikadoki. All rights reserved.
          </p>

          <div className="flex flex-wrap justify-center gap-6">
            <a href="#" className="hover:text-white transition">
              Instagram
            </a>

            <a href="#" className="hover:text-white transition">
              TikTok
            </a>

            <a href="#" className="hover:text-white transition">
              LinkedIn
            </a>

            <Link to={routes.orders} className="hover:text-white transition">
              Admin Orders
            </Link>
          </div>
        </motion.div>
      </div>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="absolute right-5 bottom-5 md:right-8 md:bottom-8 w-11 h-11 rounded-full border border-white/20 
                   bg-black/40 backdrop-blur-md flex items-center justify-center text-sm
                   hover:bg-white hover:text-black transition"
        aria-label="Back to top"
      >
        ↑
      </button>
    </footer>
  );
}