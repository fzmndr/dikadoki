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
        .from("products") 
        .select("*")
        // Pastikan koma dan tanda kutipnya benar: .eq("nama_kolom", "isi_filter")
        .eq("category", "Portfolio"); 
      
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

  const getVisualUrl = (path) => {
  // 1. Cek jika path kosong atau null agar tidak kirim request rusak ke server
  if (!path) return "";

  // 2. Bersihkan path dari spasi yang tidak sengaja terketik di database
  const cleanPath = path.trim();

  // 3. Ambil URL Publik
  const { data } = supabase.storage
    .from("digital-assets")
    .getPublicUrl(cleanPath);

  return data?.publicUrl || "";
};

  return (
    <section id="projects" className="section container-custom">
      {/* HEADER: Ini yang bikin teks Selected Work muncul lagi di tempatnya */}
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

      {/* GRID: Tempat 3 kartu (atau lebih) muncul */}
      <div className="grid md:grid-cols-3 gap-6">
        {dbProjects.map((item, index) => {
          const visualUrl = getVisualUrl(item.file_path);
          const isVideo = item.file_path?.toLowerCase().endsWith(".mp4");

          return (
            <motion.div
              key={item.id}
              onClick={() => setSelected({ ...item, visualUrl, isVideo })}
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.8 }}
              viewport={{ once: true }}
              className="project-card group cursor-pointer relative h-[480px] overflow-hidden rounded-2xl"
            >
              {/* Media Handling */}
              {isVideo ? (
                <video 
                  src={visualUrl} 
                  autoPlay muted loop playsInline 
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
                  {item.category}
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

      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </section>
  );
}