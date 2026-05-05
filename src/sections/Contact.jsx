import { motion } from "framer-motion";
import MagneticButton from "../components/MagneticButton";

export default function Contact() {
  return (
    <section id="contact" className="relative section container-custom overflow-hidden">
      <div className="glow top-20 left-1/2 -translate-x-1/2" />

      <div className="relative z-10 text-center">
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-xs tracking-[0.45em] text-gray-500 uppercase mb-6"
        >
          Contact
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-[clamp(3.5rem,9vw,9rem)] font-extrabold leading-[0.9] tracking-[-0.08em] mb-10"
        >
          Let’s Create <br /> Something Iconic
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          viewport={{ once: true }}
          className="subtext max-w-xl mx-auto mb-12"
        >
          Ready to create something cinematic and impactful? Let’s collaborate
          and bring your vision to life.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 70 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-8"
        >
          <a href="mailto:your@email.com">
            <MagneticButton>Contact Me</MagneticButton>
          </a>

          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-sm text-gray-400">
            <a href="mailto:your@email.com" className="hover:text-white">
              your@email.com
            </a>
            <a href="#" className="hover:text-white">
              Instagram
            </a>
            <a href="#" className="hover:text-white">
              WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}