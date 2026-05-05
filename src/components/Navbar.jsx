import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { routes } from "../config/routes";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();

  const menu = [
    { name: "Home", path: routes.home, id: "home", type: "section" },
    { name: "Projects", path: routes.projects, id: "projects", type: "page" },
    { name: "Services", path: routes.services, id: "services", type: "page" },
    { name: "Shop", path: routes.shop, id: "shop", type: "page" },
    { name: "Contact", path: routes.home, id: "contact", type: "section" },
  ];

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    const totalItems = cart.reduce((sum, item) => {
      return sum + (item.quantity || 1);
    }, 0);

    setCartCount(totalItems);
  };

  useEffect(() => {
    updateCartCount();

    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      if (location.pathname !== "/") {
        if (location.pathname.startsWith("/shop")) {
          setActive("shop");
          return;
        }

        if (location.pathname === "/cart") {
          setActive("cart");
          return;
        }
        
        const currentPage = menu.find((item) => item.path === location.pathname);

        if (currentPage) {
          setActive(currentPage.id);
        }

        return;
      }

      menu.forEach((item) => {
        if (item.type !== "section") return;

        const section = document.getElementById(item.id);

        if (section) {
          const top = section.offsetTop - 140;
          const height = section.offsetHeight;

          if (window.scrollY >= top && window.scrollY < top + height) {
            setActive(item.id);
          }
        }
      });
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  const goToSection = (id) => {
    setOpen(false);

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

  const handleMenuClick = (item) => {
    setOpen(false);

    if (item.type === "section") {
      goToSection(item.id);
      return;
    }

    navigate(item.path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToCart = () => {
    setOpen(false);
    navigate("/cart");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 z-50 w-full px-4 md:px-8 py-4"
    >
      <div
        className={`mx-auto max-w-[1400px] flex items-center justify-between rounded-full px-6 md:px-8 py-4 transition-all duration-500 ${
          scrolled
            ? "bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl"
            : "bg-white/[0.03] backdrop-blur-md border border-white/5"
        }`}
      >
        <button
          onClick={() => goToSection("home")}
          className="text-sm md:text-base font-semibold tracking-[0.35em]"
        >
          dikadoki
        </button>

        <ul className="hidden md:flex items-center gap-10 text-sm text-gray-400">
          {menu.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleMenuClick(item)}
                className={`relative transition duration-300 ${
                  active === item.id ? "text-white" : "hover:text-white"
                }`}
              >
                {item.name}

                <span
                  className={`absolute left-0 -bottom-2 h-[1px] bg-white transition-all duration-300 ${
                    active === item.id ? "w-full" : "w-0"
                  }`}
                />
              </button>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={goToCart}
            className={`cart-nav-btn ${
              active === "cart" ? "cart-nav-btn-active" : ""
            }`}
          >
            Cart
            {cartCount > 0 && <span>{cartCount}</span>}
          </button>

          <button
            onClick={() => goToSection("contact")}
            className="rounded-full border border-white/20 px-5 py-2 text-xs tracking-[0.25em] uppercase text-white hover:bg-white hover:text-black transition"
          >
            Let’s Talk
          </button>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-xs tracking-[0.3em] uppercase"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden mx-4 mt-3 rounded-3xl border border-white/10 bg-black/80 backdrop-blur-xl p-6"
        >
          <div className="flex flex-col gap-5">
            {menu.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item)}
                className={`text-left text-lg ${
                  active === item.id ? "text-white" : "text-gray-400"
                }`}
              >
                {item.name}
              </button>
            ))}

            <button
              onClick={goToCart}
              className={`text-left text-lg ${
                active === "cart" ? "text-white" : "text-gray-400"
              }`}
            >
              Cart {cartCount > 0 ? `(${cartCount})` : ""}
            </button>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}