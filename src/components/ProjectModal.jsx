import { motion, AnimatePresence } from "framer-motion";

export default function ProjectModal({ project, onClose }) {
  return (
    <AnimatePresence>
      {project && (
        <motion.div
          onClick={onClose}
          className="fixed inset-0 z- flex items-center justify-center bg-black/85 backdrop-blur-xl px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="absolute right-6 top-6 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white backdrop-blur-md hover:bg-white hover:text-black"
            aria-label="Close modal"
          >
            ✕
          </button>

          {/* MODAL BOX */}
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
            className="relative w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-[#050505] shadow-2xl"
          >
            {/* MEDIA (IMAGE OR VIDEO) */}
            <div className="relative h-[360px] md:h-[520px] overflow-hidden bg-black">
              {project.isVideo ? (
                <video
                  src={project.visualUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={project.visualUrl}
                  alt={project.name}
                  className="h-full w-full object-cover"
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

              <div className="absolute left-6 top-6 rounded-full border border-white/20 bg-black/30 px-4 py-2 text-xs uppercase tracking-[0.3em] text-gray-300 backdrop-blur-md">
                {project.category || "Creative Work"}
              </div>
            </div>

            {/* CONTENT */}
            <div className="grid gap-8 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-10">
              <div>
                <p className="mb-4 text-xs uppercase tracking-[0.4em] text-gray-500">
                  Selected Project
                </p>

                <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
                  {project.name} {/* Menggunakan .name dari database */}
                </h2>
              </div>

              <div className="flex flex-col justify-end">
                <p className="text-sm leading-relaxed text-gray-400 md:text-base">
                  {project.description}
                </p>

                <button
                  onClick={onClose}
                  className="mt-8 w-fit rounded-full border border-white/20 px-6 py-3 text-xs uppercase tracking-[0.25em] text-white hover:bg-white hover:text-black transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}