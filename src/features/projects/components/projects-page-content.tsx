import type { Project } from "@/features/portfolio/types/projects"

import { ProjectGrid } from "./project-card"

export function ProjectsPageContent({ projects }: { projects: Project[] }) {
  return <ProjectGrid projects={projects} />
}
