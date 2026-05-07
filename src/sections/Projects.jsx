import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import ProjectModal from "../components/ProjectModal";

export default function Projects() {
  const [selected, setSelected] = useState(null);
  const [dbProjects, setDbProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from("portfolio")
        .select("*")
        .order("id", { ascending: true }); // Mengurutkan dari 01, 02, 03

      if (error) {
        console.error("Detail Error Supabase:", error.message);
        return;
      }

      if (data) {
        setDbProjects(data);
      }
    };
    fetchProjects();
  }, []);

  // Format final untuk Vercel: Menggunakan link langsung ke bucket public kamu
  const getVisualUrl = (path) => {
    if (!path) return "";
    const cleanPath = path.trim().replace(/^\/+/, "");
    return `https://eivmzdhhkxfhsbjihnug.supabase.co/storage/v1/object/public/digital-assets/${cleanPath}`;
  };

  return (
    <section id="projects" className="section container-custom">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
        <div>
          <p className="text-xs tracking-[0.4em] text-gray-500 uppercase mb-4">
            Portfolio
          </p>
          <h2 className="heading">
            Selected <br /> Work
          </h2>
        </div>

        <p className="subtext max-w-md">
          A curated collection of cinematic visuals, brand stories, and creative
          productions.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {dbProjects.map((item, index) => {
          const visualUrl = getVisualUrl(item.file_path);
          const isVideo = item.file_path?.toLowerCase().endsWith(".mp4");

          return (
            <motion.div
              key={item.id}
              onClick={() => setSelected({ ...item, name: item.title, visualUrl, isVideo })}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              viewport={{ once: true }}
              className="project-card group cursor-pointer relative h-[480px] overflow-hidden rounded-2xl bg-[#0a0a0a]"
            >
              {/* Render Video / Gambar */}
              {isVideo ? (
                <video
                  key={visualUrl}
                  src={visualUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-110"
                />
              ) : (
                <img
                  src={visualUrl}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-110"
                />
              )}

              {/* Overlay gelap untuk kontras teks */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

              {/* Nomor Urut */}
              <div className="absolute top-6 left-6 text-[10px] tracking-[0.3em] text-gray-400">
                0{index + 1}
              </div>

              {/* Teks di bawah kartu */}
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-[10px] tracking-[0.3em] text-gray-400 uppercase mb-2">
                  {item.category}
                </p>
                <h3 className="text-xl font-medium tracking-wide text-white">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-400 mt-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition duration-500 line-clamp-2">
                  {item.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal Detail */}
      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </section>
  );
}