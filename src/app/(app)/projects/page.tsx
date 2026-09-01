import { SectionSeparator } from "@/components/section-separator"
import { SITE_INFO } from "@/config/site"
import { ProjectsPageContent } from "@/features/projects/components/projects-page-content"
import { getProjects } from "@/lib/content"
import type { Project } from "@/lib/content/types"
import { createPageMetadata } from "@/lib/seo"

const title = "AI & Machine Learning Projects"
const description =
  "A selection of projects I've built across AI, machine learning, data, and full-stack development."
const keywords = [
  "Firdaus Khotibul Zickrian projects",
  "zickrian projects",
  "AI projects",
  "machine learning projects",
  "full-stack development projects",
]

function getProjectsJsonLd(projects: Project[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_INFO.url}/projects#collection`,
    url: `${SITE_INFO.url}/projects`,
    name: title,
    description,
    inLanguage: "en-US",
    isPartOf: {
      "@id": `${SITE_INFO.url}/#website`,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: projects.length,
      itemListElement: projects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_INFO.url}/projects/${project.id}`,
        name: project.title,
        description: project.seoDescription ?? project.tagline,
      })),
    },
    author: {
      "@id": `${SITE_INFO.url}/#person`,
    },
  }
}

export const metadata = createPageMetadata({
  title,
  description,
  path: "/projects",
  keywords,
})

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getProjectsJsonLd(projects)).replace(/</g, "\\u003c"),
        }}
      />
      <SectionSeparator />
      <div className="relative z-1 -mt-px border-x border-t border-line bg-background max-md:border-x-0">
        <ProjectsPageContent projects={projects} />

        {/* Butts straight against the last row's rule, with no gap - that rule
            becomes the band's top edge and closes the box, which is what the
            home page's sections do. A spacer here left the band floating. */}
        <SectionSeparator sides={false} />
      </div>
    </>
  )
}
