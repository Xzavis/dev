// ponytail: minimal clean type definitions for admin dashboard content management

import type { TechnologyCategory } from "@/config/technology-catalog"
import type { Experience } from "@/features/portfolio/types/experiences"
import type { Project } from "@/features/portfolio/types/projects"
import type { User } from "@/features/portfolio/types/user"

export type ContentStatus = "draft" | "published" | "archived"

export interface AdminProject extends Project {
  status?: ContentStatus
  featured?: boolean
  displayOrder?: number
  updatedAt?: string
}

export interface AdminExperience extends Experience {
  status?: ContentStatus
  displayOrder?: number
  updatedAt?: string
}

export interface AdminSkill {
  id: string
  name: string
  type: "technology"
  category: TechnologyCategory
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert"
  icon?: string
  featured?: boolean
  displayOrder?: number
  isFlaggedForReview?: boolean
}

export interface AdminSocialLink {
  id: string
  platform: "GitHub" | "LinkedIn" | "Medium" | "Instagram" | "Email" | "Discord" | "Hugging Face" | "Other"
  label: string
  url: string
  icon?: string
  displayOrder: number
  visible: boolean
}

export interface AdminProfile extends User {
  headline?: string
  resumeUrl?: string
  availabilityStatus?: string
  shortBio?: string
  longBio?: string
  githubUrl?: string
  linkedinUrl?: string
  mediumUrl?: string
  instagramUrl?: string
}

export interface SiteSettings {
  siteTitle: string
  siteDescription: string
  favicon: string
  defaultOgImage: string
  metaTitle: string
  metaDescription: string
  keywords: string[]
  autoPublish: boolean
  previewDeployment: boolean
  lastSyncTime?: string
  githubRepo?: string
}

export interface RecentChange {
  id: string
  title: string
  type: "Profile" | "Project" | "Experience" | "Skill" | "Social Link" | "Settings"
  status: ContentStatus
  updatedAt: string
  editUrl: string
}

export interface DashboardMetrics {
  projectsCount: number
  experienceCount: number
  skillsCount: number
  draftsCount: number
  recentChanges: RecentChange[]
}

export interface SyncResult {
  success: boolean
  message: string
  commitSha?: string
  timestamp: string
}
