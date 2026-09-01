import type { Metadata } from "next"

import { SectionSeparator } from "@/components/section-separator"
import { Awards } from "@/features/portfolio/components/awards"
import { Certifications } from "@/features/portfolio/components/certifications"
import { Experiences } from "@/features/portfolio/components/experiences"
import { GitHubContributions } from "@/features/portfolio/components/github-contributions"
import { Projects } from "@/features/portfolio/components/projects"
import { Publications } from "@/features/portfolio/components/publications"
import { TechStack } from "@/features/portfolio/components/tech-stack"
import {
  getAwards,
  getCertifications,
  getExperiences,
  getProfile,
  getProjects,
  getPublications,
  getSettings,
  getSkills,
} from "@/lib/content"

export async function generateMetadata(): Promise<Metadata> {
  const [profile, settings] = await Promise.all([getProfile(), getSettings()])

  return {
    title: {
      absolute: settings.seoTitle ?? profile.displayName,
    },
    description: settings.seoDescription ?? profile.bio,
    keywords: settings.keywords,
    authors: [{ name: profile.displayName, url: profile.website }],
    creator: profile.displayName,
    publisher: profile.displayName,
    alternates: {
      canonical: "/",
    },
  }
}

export default async function Page() {
  const [experiences, projects, skills, awards, publications, certifications] =
    await Promise.all([
      getExperiences(),
      getProjects(),
      getSkills(),
      getAwards(),
      getPublications(),
      getCertifications(),
    ])

  return (
    <>
      <SectionSeparator />

      <Experiences experiences={experiences} />
      <SectionSeparator />

      <Projects projects={projects} />
      <SectionSeparator />

      <TechStack skills={skills} />
      <SectionSeparator />

      <GitHubContributions />
      <SectionSeparator />

      <Awards awards={awards} />
      <SectionSeparator />

      <Publications publications={publications} />
      <SectionSeparator />

      <Certifications certifications={certifications} />
      <SectionSeparator />
    </>
  )
}
