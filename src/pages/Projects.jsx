import { useState } from "react";
import { projects } from "../data/projects";
import ProjectModal from "../components/ProjectModal";

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <main className="projects-page">
      <section className="projects-hero">
        <p className="section-label">Selected Works</p>
        <h1>Projects</h1>
        <p>
          Kumpulan karya visual cinematic dari wedding, commercial campaign,
          travel film, dan storytelling project lainnya.
        </p>
      </section>

      <section className="projects-page-grid">
        {projects.map((project) => (
          <article
            className="projects-page-card"
            key={project.id}
            onClick={() => setSelectedProject(project)}
          >
            <div className="projects-page-image">
              <img src={project.image} alt={project.title} />
            </div>

            <div className="projects-page-content">
              <span>{project.category}</span>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <button type="button">View Project</button>
            </div>
          </article>
        ))}
      </section>

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </main>
  );
}