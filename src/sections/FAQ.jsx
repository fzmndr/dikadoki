import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { faq } from "../data/faq";

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <section id="faq" className="section container-custom">
      <div className="flex flex-col md:flex-row md:justify-between gap-8 mb-16">
        <div>
          <p className="text-xs tracking-[0.4em] text-gray-500 uppercase mb-4">
            Questions
          </p>
          <h2 className="heading">FAQ</h2>
        </div>

        <p className="subtext max-w-md">
          Common questions about workflow, booking, and creative production.
        </p>
      </div>

      <div className="border-t border-white/10">
        {faq.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            className="border-b border-white/10"
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex justify-between items-center gap-6 py-7 text-left"
            >
              <span className="text-lg md:text-xl font-medium">
                {item.q}
              </span>

              <span
                className={`text-2xl transition duration-300 ${
                  open === i ? "rotate-45" : ""
                }`}
              >
                +
              </span>
            </button>

            <AnimatePresence>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="overflow-hidden"
                >
                  <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl pb-7">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}