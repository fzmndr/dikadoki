import { motion } from "framer-motion";
import { products } from "../data/products";
import MagneticButton from "../components/MagneticButton";
import { formatRupiah } from "../utils/formatCurrency";

export default function FeaturedProducts() {
  const featuredProducts = products.slice(0, 3);

    const goToProductDetail = (slug) => {
    window.location.href = `/shop/${slug}`;
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
              Shop Collection
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl text-4xl font-black tracking-tight md:text-6xl lg:text-7xl"
            >
              Featured Visual Products
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.8 }}
            className="max-w-md text-sm leading-relaxed text-gray-400 md:text-base"
          >
            Produk digital dan paket layanan visual untuk kreator, brand,
            wedding, event, dan kebutuhan komersial.
          </motion.p>
        </div>

        {/* Product Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {featuredProducts.map((product, index) => (
            <motion.article
              key={product.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12, duration: 0.8 }}
              className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03]"
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

                {/* Stock Status */}
                {product.stockStatus && (
                  <div className="absolute right-5 top-5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-white backdrop-blur-md">
                    {product.stockStatus}
                  </div>
                )}

                {/* Hover CTA */}
                <button
                  onClick={() => {
                    window.location.href = `/product/${product.slug}`;
                  }}
                  className="absolute bottom-5 left-5 right-5 translate-y-4 rounded-full bg-white px-6 py-4 text-sm font-semibold text-black opacity-0 transition-all duration-300 hover:bg-gray-200 group-hover:translate-y-0 group-hover:opacity-100"
                >
                  View Product
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

                  <p className="whitespace-nowrap text-sm text-gray-300">
                    {product.pricePrefix && (
                      <span className="mr-1 text-gray-500">
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
          ))}
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