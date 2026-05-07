import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import ProjectModal from "../components/ProjectModal";

export default function Projects() {
  const [selected, setSelected] = useState(null);
  const [dbProjects, setDbProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      // Mengambil data dari tabel 'portfolio'
      const { data, error } = await supabase
        .from("portfolio")
        .select("*")
        .order("id", { ascending: true });

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

  // Fungsi sakti untuk generate URL 3 video secara otomatis
  const getVisualUrl = (path) => {
    if (!path) return "";
    const cleanPath = path.trim().replace(/^\/+/, "");
    // Mengarahkan ke link publik Supabase kamu
    return `https://eivmzdhhkxfhsbjihnug.supabase.co/storage/v1/object/public/digital-assets/${cleanPath}`;
  };

  return (
    <section id="projects" className="section container-custom">
      {/* HEADER: Area Teks Selected Work */}
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

      {/* GRID: Menampilkan 3 kartu portfolio */}
      <div className="grid md:grid-cols-3 gap-6">
        {dbProjects.map((item, index) => {
          const visualUrl = getVisualUrl(item.file_path);
          const isVideo = item.file_path?.toLowerCase().endsWith(".mp4");

          return (
            <motion.div
              key={item.id}
              // Kita kirim data title ke modal sebagai 'name' agar sinkron
              onClick={() => setSelected({ ...item, name: item.title, visualUrl, isVideo })}
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.8 }}
              viewport={{ once: true }}
              className="project-card group cursor-pointer relative h-[480px] overflow-hidden rounded-2xl bg-neutral-900"
            >
              {/* Logika Media: Jika file .mp4 maka putar video, jika bukan tampilkan gambar */}
              {isVideo ? (
                <video
                  src={visualUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-110"
                />
              ) : (
                <img
                  src={visualUrl}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-110"
                />
              )}

              {/* Overlay Gradient Premium */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

              {/* Penomoran (01, 02, 03) */}
              <div className="absolute top-6 left-6 text-xs tracking-[0.3em] text-gray-400 uppercase">
                0{index + 1}
              </div>

              {/* Teks Informasi Project */}
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-[10px] tracking-[0.3em] text-gray-400 uppercase mb-3">
                  {item.category}
                </p>

                <h3 className="text-2xl font-medium tracking-tight text-white">
                  {item.title}
                </h3>

                {/* Deskripsi yang muncul saat kursor diarahkan ke kartu (hover) */}
                <p className="text-sm text-gray-400 mt-3 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition duration-500 line-clamp-2">
                  {item.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal detail yang muncul saat salah satu kartu diklik */}
      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </section>
  );
}