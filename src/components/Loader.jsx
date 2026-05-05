import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function Loader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-black"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30, letterSpacing: "0.2em" }}
            animate={{ opacity: 1, y: 0, letterSpacing: "0.45em" }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 1 }}
            className="text-xl md:text-3xl font-semibold"
          >
            dikadoki
          </motion.h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
}