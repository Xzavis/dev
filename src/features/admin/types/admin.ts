// ponytail: minimal clean type definitions for admin dashboard content management

import type { TechnologyCategory } from "@/config/technology-catalog"
import type { Award } from "@/features/portfolio/types/awards"
import type { Certification } from "@/features/portfolio/types/certifications"
import type { Experience } from "@/features/portfolio/types/experiences"
import type { Project } from "@/features/portfolio/types/projects"
import type { Publication } from "@/features/portfolio/types/publications"
import type { User } from "@/features/portfolio/types/user"

export type ContentStatus = "draft" | "published" | "archived"

export interface AdminProject extends Project {
  /**
   * Content status. Persisted when explicitly set to draft/archived.
   * Defaults to "published" when absent from the JSON file.
   */
  status?: ContentStatus
  featured?: boolean
  displayOrder?: number
  /** ISO timestamp of last save — written by saveProject, NOT generated on read. */
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
  /** technology = has iconId and catalog entry; soft-skill = no icon required */
  type: "technology" | "soft-skill"
  category: TechnologyCategory
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert"
  icon?: string
  featured?: boolean
  displayOrder?: number
  isFlaggedForReview?: boolean
}

export interface AdminSocialLink {
  id: string
  platform:
    | "GitHub"
    | "LinkedIn"
    | "Medium"
    | "Instagram"
    | "Email"
    | "Discord"
    | "Hugging Face"
    | "X (Twitter)"
    | "TikTok"
    | "Threads"
    | "YouTube"
    | "Telegram"
    | "Behance"
    | "Dribbble"
    | "Kaggle"
    | "Website"
    | "Other"
  label: string
  url: string
  icon?: string
  displayOrder: number
  visible: boolean
}

/**
 * Admin-facing Profile DTO.
 * Social URLs (GitHub, LinkedIn, etc.) are NOT included here — they are
 * canonical in social-links.json and must not be duplicated in profile.json.
 */
export interface AdminProfile extends User {
  headline?: string
  resumeUrl?: string
  /** Read from profile.availabilityStatus — persisted in profile.json */
  availabilityStatus?: string
  shortBio?: string
  longBio?: string
}

// ─── Awards ─────────────────────────────────────────────────────────────────

/** Admin DTO for Awards. Extends canonical Award with a displayOrder. */
export interface AdminAward extends Award {
  displayOrder?: number
}

// ─── Certifications ──────────────────────────────────────────────────────────

/**
 * Admin DTO for Certifications.
 * The public Certification type has no `id`. We derive a stable identity key
 * from credentialID (preferred) or a slug of title+issuer — without modifying
 * the canonical public Certification schema.
 */
export interface AdminCertification extends Certification {
  /** Stable admin-only key: derived from credentialID or title+issuer slug. */
  _adminId: string
  displayOrder?: number
}

// ─── Publications ────────────────────────────────────────────────────────────

/** Admin DTO for Publications. The public Publication already has `id`. */
export interface AdminPublication extends Publication {
  displayOrder?: number
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface SiteSettings {
  siteTitle: string
  siteDescription: string
  favicon: string
  ogImage?: string
  defaultOgImage?: string
  metaTitle?: string
  metaDescription?: string
  keywords: string[]
  autoPublish: boolean
  previewDeployment: boolean
  githubRepo?: string
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface RecentChange {
  id: string
  title: string
  type: "Profile" | "Project" | "Experience" | "Skill" | "Social Link" | "Settings" | "Award" | "Certification" | "Publication"
  status: ContentStatus
  updatedAt: string
  editUrl: string
}

export interface DashboardMetrics {
  projectsCount: number
  experienceCount: number
  skillsCount: number
  draftsCount: number
  awardsCount: number
  certificationsCount: number
  publicationsCount: number
  /**
   * Session-local recent activity.
   * NOT a durable audit log — resets on server restart.
   */
  recentActivity: RecentChange[]
}

export interface SyncResult {
  success: boolean
  message: string
  commitSha?: string
  timestamp: string
}


