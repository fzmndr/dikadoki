import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { products } from "../data/products";
import MagneticButton from "../components/MagneticButton";
import { formatRupiah } from "../utils/formatCurrency";

export default function FeaturedProducts() {
  const navigate = useNavigate();

  const featuredProducts = products.slice(0, 3);

  const goToShop = () => {
    navigate("/shop");
  };

  const goToProductDetail = (slug) => {
    navigate(`/shop/${slug}`);
  };

  return (
    <section
      id="shop"
      className="relative w-full overflow-hidden bg-black py-28 text-white"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_35%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-neutral-950" />

      <div className="container-custom relative z-10">
        {/* Header */}
        <div className="mb-16 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="mb-4 text-[10px] uppercase tracking-[0.45em] text-gray-500 md:text-xs"
            >
              Featured Products
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl text-4xl font-black tracking-tight md:text-6xl lg:text-7xl"
            >
              Shop Our Visual Essentials
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.8 }}
            className="max-w-md text-sm leading-relaxed text-gray-400 md:text-base"
          >
            Pilihan produk digital dan paket layanan visual untuk kebutuhan
            wedding, brand, event, content creator, dan bisnis komersial.
          </motion.p>
        </div>

        {/* Product Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {featuredProducts.map((product, index) => {
            const isSoldOut =
              product.stockStatus?.toLowerCase() === "sold out";

            return (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12, duration: 0.8 }}
                onClick={() => goToProductDetail(product.slug)}
                className="group relative cursor-pointer overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] transition-all duration-500 hover:-translate-y-2 hover:border-white/25 hover:bg-white/[0.06]"
              >
                {/* Image */}
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-110 group-hover:opacity-100"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute left-5 top-5 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-white backdrop-blur-md">
                      {product.badge}
                    </div>
                  )}

                  {/* Stock */}
                  {product.stockStatus && (
                    <div
                      className={`absolute right-5 top-5 rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.2em] backdrop-blur-md ${
                        isSoldOut
                          ? "border-red-400/30 bg-red-500/10 text-red-200"
                          : "border-white/20 bg-white/10 text-white"
                      }`}
                    >
                      {product.stockStatus}
                    </div>
                  )}

                  {/* Hover CTA */}
                  <button
                    type="button"
                    disabled={isSoldOut}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isSoldOut) {
                        goToProductDetail(product.slug);
                      }
                    }}
                    className={`absolute bottom-5 left-5 right-5 translate-y-4 rounded-full px-6 py-4 text-sm font-semibold opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 ${
                      isSoldOut
                        ? "cursor-not-allowed bg-gray-700 text-gray-400"
                        : "bg-white text-black hover:bg-gray-200"
                    }`}
                  >
                    {isSoldOut ? "Currently Sold Out" : "View Product"}
                  </button>
                </div>

                {/* Info */}
                <div className="p-6">
                  <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-gray-500">
                    {product.category}
                  </p>

                  <div className="mb-4 flex items-start justify-between gap-4">
                    <h3 className="text-xl font-bold tracking-tight text-white">
                      {product.name}
                    </h3>

                    <p className="whitespace-nowrap text-right text-sm text-gray-300">
                      {product.pricePrefix && (
                        <span className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-gray-500">
                          {product.pricePrefix}
                        </span>
                      )}

                      {formatRupiah(product.price)}
                    </p>
                  </div>

                  <p className="line-clamp-2 text-sm leading-relaxed text-gray-500">
                    {product.description}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 45 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25, duration: 0.8 }}
          className="mt-14 flex justify-center"
        >
          <div onClick={goToShop} className="cursor-pointer">
            <MagneticButton>
              <span>View All Products</span>
            </MagneticButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}