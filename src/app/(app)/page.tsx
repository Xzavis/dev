import type { Metadata } from "next"

import { SectionSeparator } from "@/components/section-separator"
import { Awards } from "@/features/portfolio/components/awards"
import { Certifications } from "@/features/portfolio/components/certifications"
import { Experiences } from "@/features/portfolio/components/experiences"
import { GitHubContributions } from "@/features/portfolio/components/github-contributions"
import { Projects } from "@/features/portfolio/components/projects"
import { Publications } from "@/features/portfolio/components/publications"
import { TechStack } from "@/features/portfolio/components/tech-stack"
import { USER } from "@/features/portfolio/data/user"

export const metadata: Metadata = {
  title: {
    absolute: USER.seoTitle ?? USER.displayName,
  },
  description: USER.seoDescription,
  keywords: USER.keywords,
  authors: [{ name: USER.displayName, url: USER.website }],
  creator: USER.displayName,
  publisher: USER.displayName,
  alternates: {
    canonical: "/",
  },
}

export default function Page() {
  return (
    <>
      <SectionSeparator />

      <Experiences />
      <SectionSeparator />

      <Projects />
      <SectionSeparator />

      <TechStack />
      <SectionSeparator />

      <GitHubContributions />
      <SectionSeparator />

      <Awards />
      <SectionSeparator />

      <Publications />
      <SectionSeparator />

      <Certifications />
      <SectionSeparator />
    </>
  )
}
