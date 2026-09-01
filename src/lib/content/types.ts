import type { Award } from "@/features/portfolio/types/awards"
import type { Certification } from "@/features/portfolio/types/certifications"
import type { Experience, ExperiencePosition } from "@/features/portfolio/types/experiences"
import type {
  Project,
  ProjectCollaboration,
  ProjectLinks,
  ProjectVideoEmbed,
} from "@/features/portfolio/types/projects"
import type { Publication } from "@/features/portfolio/types/publications"
import type { SocialLink } from "@/features/portfolio/types/social-links"
import type { TechStack } from "@/features/portfolio/types/tech-stack"
import type { User } from "@/features/portfolio/types/user"

export type {
  Award,
  Certification,
  Experience,
  ExperiencePosition,
  Project,
  ProjectCollaboration,
  ProjectLinks,
  ProjectVideoEmbed,
  Publication,
  SocialLink,
  TechStack,
  User,
}

export interface Profile {
  displayName: string
  firstName: string
  lastName: string
  username: string
  gender: string
  pronouns: string
  bio: string
  bioId: string
  flipSentences: string[]
  flipSentencesId: string[]
  address: string
  email: string
  phone: string
  website: string
  jobTitle: string
  jobs?: {
    title: string
    company: string
    website: string
    experienceId: string
  }[]
  about: string
  aboutId: string
  avatar: string
  sameAs: string[]
  timeZone: string
  dateCreated: string
  dateModified: string
}

export interface SiteSettings {
  seoTitle: string
  seoDescription: string
  keywords: string[]
  ogImage: string
  favicon: string
}
