import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import ProjectModal from "../components/ProjectModal";

export default function Projects() {
  const [selected, setSelected] = useState(null);
  const [dbProjects, setDbProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      // Ambil data dari Supabase
      const { data, error } = await supabase
        .from("products") 
        .select("*")
        .eq("category", "Portfolio"); // Pastikan kategori di Supabase adalah 'Portfolio'
      
      if (!error && data) {
        setDbProjects(data);
      }
    };
    fetchProjects();
  }, []);

  const getVisualUrl = (path) => {
    if (!path) return "";
    const { data } = supabase.storage.from("digital-assets").getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {dbProjects.map((item, index) => {
        const visualUrl = getVisualUrl(item.file_path);
        const isVideo = item.file_path?.toLowerCase().endsWith(".mp4");

        return (
          <motion.div
            key={item.id}
            onClick={() => setSelected({ ...item, visualUrl, isVideo })}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.8 }}
            viewport={{ once: true }}
            className="project-card group cursor-pointer relative h-[480px] overflow-hidden rounded-2xl"
          >
            {isVideo ? (
              <video src={visualUrl} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-110" />
            ) : (
              <img src={visualUrl} alt={item.name} className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-110" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-[10px] tracking-[0.3em] text-gray-400 uppercase mb-2">{item.category}</p>
              <h3 className="text-xl font-light tracking-wide text-white">{item.name}</h3>
            </div>
          </motion.div>
        );
      })}
      
      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </div>
  );
}