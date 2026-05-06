import { motion, useScroll, useTransform } from "framer-motion";
import MagneticButton from "../components/MagneticButton";

export default function Hero() {
  const { scrollY } = useScroll();

  const scale = useTransform(scrollY, [0, 600], [1, 1.12]);
  const opacity = useTransform(scrollY, [0, 450], [1, 0]);

  const scrollToShop = () => {
    const section = document.getElementById("shop");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToProducts = () => {
    const section = document.getElementById("projects");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="relative h-screen w-full overflow-hidden bg-black"
    >
      {/* Background Video */}
      <motion.video
        style={{ scale }}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover brightness-[0.5] contrast-[1.15]"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </motion.video>

      {/* Soft Blur */}
      <div className="absolute inset-0 backdrop-blur-[1.5px]" />

      {/* Dark Overlay */}
      <motion.div
        style={{ opacity }}
        className="absolute inset-0 bg-black/60"
      />

      {/* Cinematic Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black" />

      {/* Side Shadow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.25)_45%,rgba(0,0,0,0.95)_100%)]" />

      {/* Decorative Glow */}
      <div className="glow left-16 top-24" />
      <div className="glow bottom-24 right-16" />

      {/* Content */}
      <div className="container-custom relative z-10 flex h-full flex-col items-center justify-center text-center">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-5 text-[10px] uppercase tracking-[0.45em] text-gray-400 md:text-xs"
        >
          Premium Visual Goods • Digital Products • Creative Services
        </motion.p>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 70 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="hero-title mb-8"
        >
          Cinematic Visual <br /> Essentials
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.8 }}
          className="mb-5 max-w-xl text-sm leading-relaxed text-gray-400 md:text-base"
        >
          Discover premium presets, visual products, and creative services
          designed for creators, brands, and storytellers.
        </motion.p>

        {/* Trust Signal */}
        <motion.p
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8 }}
          className="mb-10 text-[10px] uppercase tracking-[0.3em] text-gray-500"
        >
          Instant Access • Premium Quality • Made in Indonesia
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 90 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.8 }}
          className="flex flex-col items-center gap-5 sm:flex-row"
        >
          <div onClick={scrollToShop} className="group cursor-pointer">
            <MagneticButton>
              <span className="transition-all duration-300 group-hover:tracking-widest">
                Shop Collection
              </span>
            </MagneticButton>
          </div>

          <button
            onClick={scrollToProducts}
            className="rounded-full border border-white/20 px-7 py-4 text-sm font-semibold text-gray-200 transition-all duration-300 hover:border-white/50 hover:bg-white/10 hover:text-white"
          >
            View Featured Products
          </button>
        </motion.div>

        {/* Mini Commerce Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.8 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3 text-[10px] uppercase tracking-[0.25em] text-gray-400"
        >
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
            Best Seller Presets
          </span>

          <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
            From Rp 75.000
          </span>

          <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
            Limited Service Slot
          </span>
        </motion.div>
      </div>

      {/* Bottom Commerce Notes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-6 text-[10px] uppercase tracking-[0.3em] text-gray-500 md:flex"
      >
        <span>Digital Products</span>
        <span className="h-1 w-1 rounded-full bg-gray-600" />
        <span>Creative Assets</span>
        <span className="h-1 w-1 rounded-full bg-gray-600" />
        <span>Worldwide Access</span>
      </motion.div>
    </section>
  );
}