import { motion, useScroll, useTransform } from "framer-motion";
import MagneticButton from "../components/MagneticButton";

export default function Hero() {
  const { scrollY } = useScroll();

  const scale = useTransform(scrollY, [0, 600], [1, 1.12]);
  const opacity = useTransform(scrollY, [0, 450], [1, 0]);

  const scrollToProjects = () => {
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
        className="absolute inset-0 w-full h-full object-cover brightness-[0.55] contrast-[1.15]"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </motion.video>

      {/* Soft Blur */}
      <div className="absolute inset-0 backdrop-blur-[1.5px]" />

      {/* Overlay */}
      <motion.div
        style={{ opacity }}
        className="absolute inset-0 bg-black/60"
      />

      {/* Cinematic Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black" />

      {/* Side Shadow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.25)_45%,rgba(0,0,0,0.95)_100%)]" />

      {/* Glow */}
      <div className="glow top-24 left-16" />
      <div className="glow bottom-24 right-16" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center container-custom">
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-5 text-[10px] md:text-xs tracking-[0.45em] text-gray-400 uppercase"
        >
          Photographer • Videographer • Storyteller
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 70 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="hero-title mb-8"
        >
          Crafting <br /> Visual Experience
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.8 }}
          className="max-w-xl text-gray-400 text-sm md:text-base leading-relaxed mb-5"
        >
          Photography, videography, and cinematic storytelling crafted with
          precision, emotion, and creativity.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8 }}
          className="mb-10 text-[10px] tracking-[0.3em] text-gray-500 uppercase"
        >
          Based in Indonesia • Available Worldwide
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 90 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.8 }}
        >
          <div onClick={scrollToProjects} className="group">
            <MagneticButton>
              <span className="group-hover:tracking-widest transition-all duration-300">
                Explore Work
              </span>
            </MagneticButton>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: [10, 0, 10] }}
        transition={{ delay: 1.1, duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 text-[10px] md:text-xs text-gray-400 tracking-[0.4em]"
      >
      </motion.div>
    </section>
  );
}