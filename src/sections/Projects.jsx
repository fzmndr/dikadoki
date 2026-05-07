import { motion } from "framer-motion";
import { useState, useEffect } from "react"; // Tambahkan useEffect
import { supabase } from "../lib/supabase"; // Import koneksi supabase
import ProjectModal from "../components/ProjectModal";

export default function Projects() {
  const [selected, setSelected] = useState(null);
  const [dbProjects, setDbProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Ambil data portfolio dari Supabase
  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from("products") // Sesuaikan nama tabel kamu
        .select("*")
        .eq("category", "Portfolio") 
      
      if (!error && data) {
        setDbProjects(data);
      }
      setLoading(false);
    };

    fetchProjects();
  }, []);

  // 2. Fungsi helper untuk URL visual
  const getVisualUrl = (path) => {
    const { data } = supabase.storage.from("digital-assets").getPublicUrl(path);
    return data.publicUrl;
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
              onClick={() => setSelected({ ...item, visualUrl: visualUrl, isVideo: isVideo })}
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.8 }}
              viewport={{ once: true }}
              className="project-card group cursor-pointer relative h-[480px] overflow-hidden"
            >
              {/* LOGIKA: Jika file mp4 tampilkan video, jika bukan tampilkan image */}
              {isVideo ? (
                <video
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
                  alt={item.name}
                  className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-110"
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

              <div className="absolute top-6 left-6 text-xs tracking-[0.3em] text-gray-300 uppercase">
                0{index + 1}
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-xs tracking-[0.3em] text-gray-400 uppercase mb-3">
                  {item.category || "Creative Work"}
                </p>

                <h3 className="text-2xl font-semibold tracking-tight">
                  {item.name}
                </h3>

                <p className="text-sm text-gray-400 mt-3 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition duration-500 line-clamp-2">
                  {item.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal tetap menggunakan data yang dipilih */}
      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </section>
  );
}