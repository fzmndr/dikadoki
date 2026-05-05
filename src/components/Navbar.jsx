import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { routes } from "../config/routes";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [lastOrderCode, setLastOrderCode] = useState("");
  const [navHidden, setNavHidden] = useState(false);

  const lastScrollY = useRef(0);

  const location = useLocation();
  const navigate = useNavigate();

  const menu = [
    { name: "Home", path: routes.home, id: "home", type: "section" },
    { name: "Projects", path: routes.projects, id: "projects", type: "page" },
    { name: "Services", path: routes.services, id: "services", type: "page" },
    { name: "Shop", path: routes.shop, id: "shop", type: "page" },
    {
      name: "Track Order",
      path: routes.trackOrder,
      id: "track-order",
      type: "page",
    },
    { name: "Contact", path: routes.home, id: "contact", type: "section" },
  ];

  const updateCartData = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const savedLastOrderCode = localStorage.getItem("lastOrderCode") || "";

    const totalItems = cart.reduce((sum, item) => {
      return sum + (item.quantity || 1);
    }, 0);

    setCartCount(totalItems);
    setLastOrderCode(savedLastOrderCode);
  };

  useEffect(() => {
    updateCartData();

    window.addEventListener("storage", updateCartData);
    window.addEventListener("cartUpdated", updateCartData);
    window.addEventListener("lastOrderUpdated", updateCartData);

    return () => {
      window.removeEventListener("storage", updateCartData);
      window.removeEventListener("cartUpdated", updateCartData);
      window.removeEventListener("lastOrderUpdated", updateCartData);
    };
  }, []);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    setNavHidden(false);
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setScrolled(currentScrollY > 50);

      if (currentScrollY < 80) {
        setNavHidden(false);
      } else if (currentScrollY > lastScrollY.current + 8) {
        setNavHidden(true);

        if (open) {
          setOpen(false);
        }
      } else if (currentScrollY < lastScrollY.current - 8) {
        setNavHidden(false);
      }

      lastScrollY.current = currentScrollY;

      if (location.pathname !== routes.home) {
        if (location.pathname.startsWith(routes.shop)) {
          setActive("shop");
          return;
        }

        if (location.pathname === routes.cart) {
          setActive("cart");
          return;
        }

        if (location.pathname === routes.trackOrder) {
          setActive("track-order");
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

        if (!section) return;

        const top = section.offsetTop - 140;
        const height = section.offsetHeight;

        if (currentScrollY >= top && currentScrollY < top + height) {
          setActive(item.id);
        }
      });
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [location.pathname, open]);

  const goToSection = (id) => {
    setOpen(false);
    setNavHidden(false);

    if (location.pathname !== routes.home) {
      navigate(routes.home);

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
    setNavHidden(false);

    if (item.type === "section") {
      goToSection(item.id);
      return;
    }

    navigate(item.path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToCart = () => {
    setOpen(false);
    setNavHidden(false);

    navigate(routes.cart);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToLastOrder = () => {
    if (!lastOrderCode) return;

    setOpen(false);
    setNavHidden(false);

    navigate(`${routes.trackOrder}?code=${lastOrderCode}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{
        y: navHidden ? -120 : 0,
        opacity: navHidden ? 0 : 1,
      }}
      transition={{ duration: 0.35, ease: "easeOut" }}
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
          type="button"
          onClick={() => goToSection("home")}
          className="text-sm md:text-base font-semibold tracking-[0.35em]"
        >
          dikadoki
        </button>

        <ul className="hidden md:flex items-center gap-10 text-sm text-gray-400">
          {menu.map((item) => (
            <li key={item.id}>
              <button
                type="button"
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
          {lastOrderCode && (
            <button
              type="button"
              onClick={goToLastOrder}
              className="last-order-nav-btn"
            >
              Last Order
            </button>
          )}

          <button
            type="button"
            onClick={goToCart}
            className={`cart-nav-btn ${
              active === "cart" ? "cart-nav-btn-active" : ""
            }`}
          >
            Cart
            {cartCount > 0 && <span>{cartCount}</span>}
          </button>

          <button
            type="button"
            onClick={() => goToSection("contact")}
            className="rounded-full border border-white/20 px-5 py-2 text-xs tracking-[0.25em] uppercase text-white hover:bg-white hover:text-black transition"
          >
            Let’s Talk
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setOpen(!open);
            setNavHidden(false);
          }}
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
                type="button"
                key={item.id}
                onClick={() => handleMenuClick(item)}
                className={`text-left text-lg ${
                  active === item.id ? "text-white" : "text-gray-400"
                }`}
              >
                {item.name}
              </button>
            ))}

            {lastOrderCode && (
              <button
                type="button"
                onClick={goToLastOrder}
                className={`text-left text-lg ${
                  active === "track-order" ? "text-white" : "text-gray-400"
                }`}
              >
                Last Order
              </button>
            )}

            <button
              type="button"
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