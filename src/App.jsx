import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CustomCursor from "./components/CustomCursor";
import SmoothScroll from "./components/SmoothScroll";
import Loader from "./components/Loader";
import RevealOnScroll from "./components/RevealOnScroll";
import { routes } from "./config/routes";
import ScrollToTop from "./components/ScrollToTop";

import Home from "./pages/Home";
import ProjectsPage from "./pages/Projects";
import ServicesPage from "./pages/Services";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import ProductDetail from "./pages/ProductDetail";
import Orders from "./pages/Orders";
import NotFound from "./pages/NotFound";


export default function App() {
  return (
    <div className="bg-black text-white overflow-x-hidden">
      <Loader />
      <SmoothScroll />
      <RevealOnScroll />
      <Navbar />
      <CustomCursor />
      <ScrollToTop />

      <Routes>
        <Route path={routes.home} element={<Home />} />
        <Route path={routes.projects} element={<ProjectsPage />} />
        <Route path={routes.services} element={<ServicesPage />} />
        <Route path={routes.shop} element={<Shop />} />
        <Route path={`${routes.shop}/:slug`} element={<ProductDetail />} />
        <Route path={routes.cart} element={<Cart />} />
        <Route path={routes.orders} element={<Orders />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </div>
  );
}