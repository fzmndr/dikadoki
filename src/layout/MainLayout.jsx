import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CustomCursor from "../components/CustomCursor";

export default function MainLayout({ children }) {
  return (
    <>
      <CustomCursor />
      <Navbar />

      <motion.main
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-black text-white min-h-screen"
      >
        {children}
      </motion.main>

      <Footer />
    </>
  );
}