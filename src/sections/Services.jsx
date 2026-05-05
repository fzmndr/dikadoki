import { motion } from "framer-motion";
import { services } from "../data/services";

export default function Services() {
  return (
    <section id="services" className="section container-custom">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-20">
        <div>
          <p className="text-xs tracking-[0.4em] text-gray-500 uppercase mb-4">
            What I Do
          </p>

          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="heading"
          >
            Services
          </motion.h2>
        </div>

        <p className="subtext max-w-md">
          Delivering high-end visual production and storytelling tailored for brands, events, and creative needs.
        </p>
      </div>

      {/* LIST STYLE (lebih premium dari grid card biasa) */}
      <div className="border-t border-white/10">
        {services.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            viewport={{ once: true }}
            className="group flex flex-col md:flex-row md:items-center justify-between gap-6 py-10 border-b border-white/10 cursor-pointer"
          >

            {/* LEFT */}
            <div className="flex items-start gap-6">
              <span className="text-gray-500 text-sm tracking-widest">
                0{i + 1}
              </span>

              <div>
                <h3 className="text-2xl font-medium tracking-tight group-hover:translate-x-2 transition duration-300">
                  {item.title}
                </h3>

                <p className="text-gray-400 text-sm mt-2 max-w-md">
                  {item.description ||
                    `Professional ${item.title.toLowerCase()} with cinematic and modern approach.`}
                </p>
              </div>
            </div>

            {/* RIGHT ICON */}
            <div className="text-gray-500 group-hover:translate-x-2 group-hover:text-white transition duration-300">
              →
            </div>

          </motion.div>
        ))}
      </div>

    </section>
  );
}