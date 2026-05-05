import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="about" className="relative section container-custom overflow-hidden">

      {/* ✨ GLOW */}
      <div className="glow absolute top-20 right-20"></div>

      <div className="grid md:grid-cols-2 gap-16 items-center">

        {/* 📸 IMAGE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="overflow-hidden rounded-3xl">
            <img
              src="/images/profile.jpg"
              alt="Profile"
              className="w-full h-[500px] object-cover"
            />
          </div>

          {/* overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-3xl" />
        </motion.div>

        {/* 🧠 TEXT */}
        <div>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-xs tracking-[0.4em] text-gray-500 uppercase mb-6"
          >
            About Me
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight mb-8"
          >
            Visual Storyteller <br /> & Creative Director
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-gray-400 leading-relaxed mb-6"
          >
            I craft cinematic visuals that go beyond aesthetics — telling
            stories that connect, inspire, and leave lasting impressions.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="text-gray-500 text-sm leading-relaxed"
          >
            From weddings to commercial campaigns, every project is approached
            with precision, emotion, and a strong creative vision.
          </motion.p>

          {/* ✨ STATS */}
          <motion.div
            initial={{ opacity: 0, y: 70 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
            className="flex gap-10 mt-10"
          >
            <div>
              <h3 className="text-2xl font-semibold">5+</h3>
              <p className="text-gray-500 text-sm">Years Experience</p>
            </div>

            <div>
              <h3 className="text-2xl font-semibold">50+</h3>
              <p className="text-gray-500 text-sm">Projects</p>
            </div>

            <div>
              <h3 className="text-2xl font-semibold">20+</h3>
              <p className="text-gray-500 text-sm">Clients</p>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}