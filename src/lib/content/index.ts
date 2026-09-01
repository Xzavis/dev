import "server-only"

import fs from "node:fs/promises"
import path from "node:path"

import type {
  Award,
  Certification,
  Experience,
  Profile,
  Project,
  Publication,
  SiteSettings,
  SocialLink,
  TechStack,
} from "./types"

const CONTENT_DIR = path.join(process.cwd(), "content")

// Canonical project ordering to preserve showcase sequence
const PROJECT_ORDER = [
  "naratioai",
  "custora",
  "base-realms",
  "leadsup",
  "qmeal",
  "polsekrembang",
  "brazilian-ecommerce-dashboard",
  "financial-assistant-bot",
  "machine-learning-system",
  "lostandfound",
  "floodsegmen",
  "diabetes-classification",
  "imageclas",
]

// Canonical experience ordering
const EXPERIENCE_ORDER = [
  "custompedia",
  "pijak-ibm",
  "dinus-lab-assistant",
  "asah-dicoding-accenture",
  "blockvizo",
  "gdgoc-dinus",
  "education",
]

async function readJsonFile<T>(filePath: string): Promise<T> {
  const content = await fs.readFile(filePath, "utf-8")
  return JSON.parse(content) as T
}

/**
 * Server-only Content Loader for zickrian.dev
 * Reads bundled JSON content directly from /content/
 */
export async function getProfile(): Promise<Profile> {
  return readJsonFile<Profile>(path.join(CONTENT_DIR, "profile.json"))
}

export async function getSettings(): Promise<SiteSettings> {
  return readJsonFile<SiteSettings>(path.join(CONTENT_DIR, "settings.json"))
}

export async function getProjects(): Promise<Project[]> {
  const dir = path.join(CONTENT_DIR, "projects")
  const files = await fs.readdir(dir)
  const jsonFiles = files.filter((f) => f.endsWith(".json"))

  const projects = await Promise.all(
    jsonFiles.map(async (file) => {
      return readJsonFile<Project>(path.join(dir, file))
    })
  )

  // Sort according to canonical project order, then by title
  return projects.sort((a, b) => {
    const idxA = PROJECT_ORDER.indexOf(a.id)
    const idxB = PROJECT_ORDER.indexOf(b.id)
    if (idxA !== -1 && idxB !== -1) return idxA - idxB
    if (idxA !== -1) return -1
    if (idxB !== -1) return 1
    return a.title.localeCompare(b.title)
  })
}

export async function getProjectById(slug: string): Promise<Project | undefined> {
  try {
    const filePath = path.join(CONTENT_DIR, "projects", `${slug}.json`)
    return await readJsonFile<Project>(filePath)
  } catch {
    return undefined
  }
}

export async function getExperiences(): Promise<Experience[]> {
  const dir = path.join(CONTENT_DIR, "experiences")
  const files = await fs.readdir(dir)
  const jsonFiles = files.filter((f) => f.endsWith(".json"))

  const experiences = await Promise.all(
    jsonFiles.map(async (file) => {
      return readJsonFile<Experience>(path.join(dir, file))
    })
  )

  // Sort according to canonical experience order
  return experiences.sort((a, b) => {
    const idxA = EXPERIENCE_ORDER.indexOf(a.id)
    const idxB = EXPERIENCE_ORDER.indexOf(b.id)
    if (idxA !== -1 && idxB !== -1) return idxA - idxB
    if (idxA !== -1) return -1
    if (idxB !== -1) return 1
    return 0
  })
}

export async function getSkills(): Promise<TechStack[]> {
  return readJsonFile<TechStack[]>(path.join(CONTENT_DIR, "skills.json"))
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  return readJsonFile<SocialLink[]>(path.join(CONTENT_DIR, "social-links.json"))
}

export async function getAwards(): Promise<Award[]> {
  return readJsonFile<Award[]>(path.join(CONTENT_DIR, "awards.json"))
}

export async function getCertifications(): Promise<Certification[]> {
  return readJsonFile<Certification[]>(path.join(CONTENT_DIR, "certifications.json"))
}

export async function getPublications(): Promise<Publication[]> {
  return readJsonFile<Publication[]>(path.join(CONTENT_DIR, "publications.json"))
}
