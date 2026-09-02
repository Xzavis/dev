import "server-only"

import fs from "node:fs/promises"
import path from "node:path"

import { normalizeTechName } from "@/config/technology-catalog"
import type {
  AdminExperience,
  AdminProfile,
  AdminProject,
  AdminSkill,
  AdminSocialLink,
  SiteSettings as AdminSiteSettings,
} from "@/features/admin/types/admin"

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
const PROJECTS_DIR = path.join(CONTENT_DIR, "projects")
const EXPERIENCES_DIR = path.join(CONTENT_DIR, "experiences")

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

async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath)
  } catch {
    await fs.mkdir(dirPath, { recursive: true })
  }
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const content = await fs.readFile(filePath, "utf-8")
  return JSON.parse(content) as T
}

async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  await ensureDir(path.dirname(filePath))
  const content = JSON.stringify(data, null, 2) + "\n"
  const tempPath = `${filePath}.tmp.${Date.now()}`
  try {
    await fs.writeFile(tempPath, content, "utf-8")
    await fs.rename(tempPath, filePath)
  } catch {
    await fs.writeFile(filePath, content, "utf-8")
    try {
      await fs.unlink(tempPath)
    } catch {
      // ignore temp cleanup error
    }
  }
}

function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function mapSkillCategory(cats: string[] | string | undefined): AdminSkill["category"] {
  const primary = Array.isArray(cats) ? cats[0] || "" : cats || ""
  if (primary.includes("AI") || primary.includes("ML") || primary.includes("Machine Learning")) return "AI / ML"
  if (primary.includes("DevOps") || primary.includes("Cloud")) return "DevOps / Cloud"
  if (primary.includes("Design") || primary.includes("UI")) return "Design / UI"
  if (primary.includes("Test")) return "Testing"
  if (primary.includes("Data")) return "Database"
  if (primary.includes("Backend")) return "Backend"
  if (primary.includes("Frontend")) return "Frontend"
  return "Tools"
}

function mapAdminCategoryToPublic(cat: AdminSkill["category"]): string {
  return cat
}

// LocalContentRepository: Single source of truth for reading and writing content JSON files directly on disk.
export const LocalContentRepository = {
  // ─── Profile ───────────────────────────────────────────────────────────────

  async getProfile(): Promise<Profile> {
    return readJsonFile<Profile>(path.join(CONTENT_DIR, "profile.json"))
  },

  async getAdminProfile(): Promise<AdminProfile> {
    const [profile, settings] = await Promise.all([
      this.getProfile(),
      this.getSettings(),
    ])

    return {
      ...profile,
      dateCreated: profile.dateCreated || "2024-01-01",
      sameAs: profile.sameAs || [],
      gender: (profile.gender as AdminProfile["gender"]) || "male",
      headline: profile.jobTitle,
      resumeUrl: "/resume.pdf",
      availabilityStatus: "Open to opportunities",
      shortBio: profile.bio,
      longBio: profile.about,
      githubUrl: "https://github.com/zickrian",
      linkedinUrl: "https://linkedin.com/in/firdauskhotibulzickrian/",
      mediumUrl: "https://medium.com/@zickriann",
      instagramUrl: "https://instagram.com/zickrian",
      keywords: settings.keywords || [],
      ogImage: settings.ogImage || "/og.png",
      seoTitle: settings.seoTitle || profile.displayName,
      seoDescription: settings.seoDescription || profile.bio,
    }
  },

  async saveProfile(profile: Partial<AdminProfile> & { displayName: string }): Promise<void> {
    const current = await this.getProfile()
    const settings = await this.getSettings()

    const updatedProfile: Profile = {
      displayName: profile.displayName ?? current.displayName,
      firstName: profile.firstName ?? current.firstName,
      lastName: profile.lastName ?? current.lastName,
      username: profile.username ?? current.username,
      gender: profile.gender ?? current.gender,
      pronouns: profile.pronouns ?? current.pronouns,
      bio: profile.shortBio ?? profile.bio ?? current.bio,
      bioId: profile.bioId ?? current.bioId,
      flipSentences: profile.flipSentences ?? current.flipSentences,
      flipSentencesId: profile.flipSentencesId ?? current.flipSentencesId,
      address: profile.address ?? current.address,
      phone: profile.phone ?? current.phone,
      email: profile.email ?? current.email,
      website: profile.website ?? current.website,
      jobTitle: profile.headline ?? profile.jobTitle ?? current.jobTitle,
      jobs: profile.jobs ?? current.jobs,
      about: profile.longBio ?? profile.about ?? current.about,
      aboutId: profile.aboutId ?? current.aboutId,
      avatar: profile.avatar ?? current.avatar,
      sameAs: profile.sameAs ?? current.sameAs ?? [],
      timeZone: profile.timeZone ?? current.timeZone,
      dateCreated: profile.dateCreated ?? current.dateCreated ?? "2024-01-01",
      dateModified: new Date().toISOString(),
    }

    await writeJsonFile(path.join(CONTENT_DIR, "profile.json"), updatedProfile)

    // Sync SEO keywords/title if provided in the admin profile form
    if (profile.keywords || profile.seoTitle || profile.seoDescription || profile.ogImage) {
      const updatedSettings: SiteSettings = {
        ...settings,
        seoTitle: profile.seoTitle ?? settings.seoTitle,
        seoDescription: profile.seoDescription ?? settings.seoDescription,
        ogImage: profile.ogImage ?? settings.ogImage,
        keywords: profile.keywords ?? settings.keywords,
      }
      await writeJsonFile(path.join(CONTENT_DIR, "settings.json"), updatedSettings)
    }
  },

  // ─── Settings ──────────────────────────────────────────────────────────────

  async getSettings(): Promise<SiteSettings> {
    return readJsonFile<SiteSettings>(path.join(CONTENT_DIR, "settings.json"))
  },

  async getAdminSettings(): Promise<AdminSiteSettings> {
    const [settings, profile] = await Promise.all([
      this.getSettings(),
      this.getProfile(),
    ])

    return {
      siteTitle: settings.seoTitle ?? `${profile.displayName} | Portfolio`,
      siteDescription: settings.seoDescription ?? profile.bio,
      favicon: "/favicon.ico",
      defaultOgImage: settings.ogImage,
      metaTitle: settings.seoTitle ?? profile.displayName,
      metaDescription: settings.seoDescription ?? profile.bio,
      keywords: settings.keywords || [],
      autoPublish: false,
      previewDeployment: true,
      lastSyncTime: new Date().toISOString(),
      githubRepo: "zickrian/portfolio",
    }
  },

  async saveSettings(settings: Partial<AdminSiteSettings>): Promise<void> {
    const current = await this.getSettings()
    const updated: SiteSettings = {
      ...current,
      seoTitle: settings.metaTitle ?? settings.siteTitle ?? current.seoTitle,
      seoDescription: settings.metaDescription ?? settings.siteDescription ?? current.seoDescription,
      ogImage: settings.defaultOgImage ?? current.ogImage,
      keywords: settings.keywords ?? current.keywords,
    }
    await writeJsonFile(path.join(CONTENT_DIR, "settings.json"), updated)
  },

  // ─── Projects ──────────────────────────────────────────────────────────────

  async getProjects(): Promise<Project[]> {
    await ensureDir(PROJECTS_DIR)
    const files = await fs.readdir(PROJECTS_DIR)
    const jsonFiles = files.filter((f) => f.endsWith(".json"))

    const projects = await Promise.all(
      jsonFiles.map(async (file) => {
        return readJsonFile<Project>(path.join(PROJECTS_DIR, file))
      })
    )

    return projects.sort((a, b) => {
      const idxA = PROJECT_ORDER.indexOf(a.id)
      const idxB = PROJECT_ORDER.indexOf(b.id)
      if (idxA !== -1 && idxB !== -1) return idxA - idxB
      if (idxA !== -1) return -1
      if (idxB !== -1) return 1
      return a.title.localeCompare(b.title)
    })
  },

  async getAdminProjects(): Promise<AdminProject[]> {
    const projects = await this.getProjects()
    return projects.map((p, idx) => ({
      ...p,
      status: (p.isExpanded ? "published" : "published") as "published" | "draft" | "archived",
      featured: idx < 4,
      displayOrder: idx + 1,
      updatedAt: new Date(Date.now() - idx * 86400000).toISOString(),
    }))
  },

  async getProjectById(id: string): Promise<Project | null> {
    try {
      const slug = normalizeSlug(id)
      const filePath = path.join(PROJECTS_DIR, `${slug}.json`)
      return await readJsonFile<Project>(filePath)
    } catch {
      return null
    }
  },

  async saveProject(project: AdminProject | Project): Promise<{ id: string }> {
    const slug = normalizeSlug(project.id || project.title)
    if (!slug) {
      throw new Error("Project ID or title is required to generate a slug.")
    }

    const cleanProject: Project = {
      id: slug,
      title: project.title,
      category: project.category || "AI / Full Stack",
      categoryId: project.categoryId,
      tagline: project.tagline || "",
      taglineId: project.taglineId,
      seoDescription: project.seoDescription || project.tagline,
      year: String(project.year || new Date().getFullYear()),
      image: project.image || "/banner.webp",
      logo: project.logo,
      videoEmbed: project.videoEmbed,
      period: project.period || { start: String(new Date().getFullYear()) },
      link: project.link || "https://github.com/zickrian",
      links: project.links || { repo: project.link, live: "" },
      skills: project.skills || [],
      coverSkills: project.coverSkills || [],
      features: project.features || [],
      featuresId: project.featuresId,
      impact: project.impact || [],
      impactId: project.impactId,
      collaboration: project.collaboration || {
        ownership: "Solo project",
        label: "Solo",
        team: "Personal Project",
        role: "Full Stack AI Engineer",
        contributions: ["Architected and built end-to-end solution"],
      },
      description: project.description || "",
      notes: project.notes,
      notesId: project.notesId,
      isExpanded: project.isExpanded ?? true,
      badge: project.badge,
      badgeId: project.badgeId,
      gallery: project.gallery || [],
    }

    const filePath = path.join(PROJECTS_DIR, `${slug}.json`)
    await writeJsonFile(filePath, cleanProject)
    return { id: slug }
  },

  async deleteProject(id: string): Promise<void> {
    const slug = normalizeSlug(id)
    const filePath = path.join(PROJECTS_DIR, `${slug}.json`)
    try {
      await fs.unlink(filePath)
    } catch (err: unknown) {
      const nodeErr = err as { code?: string }
      if (nodeErr.code !== "ENOENT") {
        throw err
      }
    }
  },

  // ─── Experiences ───────────────────────────────────────────────────────────

  async getExperiences(): Promise<Experience[]> {
    await ensureDir(EXPERIENCES_DIR)
    const files = await fs.readdir(EXPERIENCES_DIR)
    const jsonFiles = files.filter((f) => f.endsWith(".json"))

    const experiences = await Promise.all(
      jsonFiles.map(async (file) => {
        return readJsonFile<Experience>(path.join(EXPERIENCES_DIR, file))
      })
    )

    return experiences.sort((a, b) => {
      const idxA = EXPERIENCE_ORDER.indexOf(a.id)
      const idxB = EXPERIENCE_ORDER.indexOf(b.id)
      if (idxA !== -1 && idxB !== -1) return idxA - idxB
      if (idxA !== -1) return -1
      if (idxB !== -1) return 1
      return 0
    })
  },

  async getAdminExperiences(): Promise<AdminExperience[]> {
    const experiences = await this.getExperiences()
    return experiences.map((exp, idx) => ({
      ...exp,
      status: "published",
      displayOrder: idx + 1,
      updatedAt: new Date(Date.now() - idx * 172800000).toISOString(),
    }))
  },

  async getExperienceById(id: string): Promise<Experience | null> {
    try {
      const slug = normalizeSlug(id)
      const filePath = path.join(EXPERIENCES_DIR, `${slug}.json`)
      return await readJsonFile<Experience>(filePath)
    } catch {
      return null
    }
  },

  async saveExperience(experience: AdminExperience | Experience): Promise<{ id: string }> {
    const slug = normalizeSlug(experience.id || experience.companyName)
    if (!slug) {
      throw new Error("Experience ID or company name is required.")
    }

    const cleanExperience: Experience = {
      id: slug,
      companyName: experience.companyName,
      companyLogo: experience.companyLogo || "/logos/company.webp",
      companyWebsite: experience.companyWebsite || "",
      positions: experience.positions.map((pos, idx) => ({
        id: pos.id || `${slug}-${idx + 1}`,
        title: pos.title,
        employmentPeriod: pos.employmentPeriod,
        employmentType: pos.employmentType,
        icon: typeof pos.icon === "string" ? pos.icon : "briefcase",
        description: pos.description || "",
        descriptionId: pos.descriptionId,
        skills: pos.skills,
      })),
      isCurrentEmployer: experience.isCurrentEmployer ?? false,
    }

    const filePath = path.join(EXPERIENCES_DIR, `${slug}.json`)
    await writeJsonFile(filePath, cleanExperience)
    return { id: slug }
  },

  async deleteExperience(id: string): Promise<void> {
    const slug = normalizeSlug(id)
    const filePath = path.join(EXPERIENCES_DIR, `${slug}.json`)
    try {
      await fs.unlink(filePath)
    } catch (err: unknown) {
      const nodeErr = err as { code?: string }
      if (nodeErr.code !== "ENOENT") {
        throw err
      }
    }
  },

  // ─── Skills ────────────────────────────────────────────────────────────────

  async getSkills(): Promise<TechStack[]> {
    return readJsonFile<TechStack[]>(path.join(CONTENT_DIR, "skills.json"))
  },

  async getAdminSkills(): Promise<AdminSkill[]> {
    const skills = await this.getSkills()
    return skills.map((item, idx) => ({
      id: item.key,
      name: item.title,
      type: item.type,
      category: mapSkillCategory(item.categories),
      level: idx < 5 ? "Expert" : idx < 12 ? "Advanced" : "Intermediate",
      icon: item.type === "technology" ? item.iconId : undefined,
      featured: idx < 8,
      displayOrder: idx + 1,
    }))
  },

  async saveSkill(skill: AdminSkill): Promise<{ id: string }> {
    const skills = await this.getSkills()
    const targetKey = normalizeTechName(skill.name) || normalizeSlug(skill.id || skill.name)
    const originalKey = normalizeSlug(skill.id)

    // Prevent duplicates (case-insensitive & alias-normalized)
    const duplicateIdx = skills.findIndex(
      (s) =>
        (normalizeTechName(s.title) === normalizeTechName(skill.name) || s.key === targetKey) &&
        s.key !== originalKey
    )

    if (duplicateIdx >= 0) {
      throw new Error(`Technology "${skill.name}" already exists in your skills list.`)
    }

    const baseItem = {
      key: targetKey,
      title: skill.name,
      href: `https://www.google.com/search?q=${encodeURIComponent(skill.name)}`,
      categories: [mapAdminCategoryToPublic(skill.category)],
    }

    const updatedItem: TechStack = {
      ...baseItem,
      type: "technology",
      iconId: skill.icon || targetKey,
    }

    const existingIdx = skills.findIndex((s) => s.key === originalKey || s.key === targetKey)
    if (existingIdx >= 0) {
      skills[existingIdx] = {
        ...skills[existingIdx],
        ...updatedItem,
      } as TechStack
    } else {
      skills.push(updatedItem)
    }

    await writeJsonFile(path.join(CONTENT_DIR, "skills.json"), skills)
    return { id: targetKey }
  },

  async saveAllSkills(adminSkills: AdminSkill[]): Promise<AdminSkill[]> {
    const currentSkills = await this.getSkills()
    const currentMap = new Map(currentSkills.map((s) => [s.key, s]))

    const newSkills: TechStack[] = adminSkills.map((skill) => {
      const key = normalizeTechName(skill.name) || normalizeSlug(skill.id || skill.name)
      const existing = currentMap.get(key) || currentMap.get(normalizeSlug(skill.id))
      
      const baseItem = {
        key,
        title: skill.name,
        href: existing?.href || `https://www.google.com/search?q=${encodeURIComponent(skill.name)}`,
        categories: [mapAdminCategoryToPublic(skill.category)],
      }

      return {
        ...baseItem,
        type: "technology",
        iconId: skill.icon || key,
      } as TechStack
    })

    await writeJsonFile(path.join(CONTENT_DIR, "skills.json"), newSkills)
    return await this.getAdminSkills()
  },

  async deleteSkill(id: string): Promise<void> {
    const skills = await this.getSkills()
    const key = normalizeSlug(id)
    const normName = normalizeTechName(id)
    const filtered = skills.filter(
      (s) => s.key !== key && normalizeTechName(s.title) !== normName
    )
    await writeJsonFile(path.join(CONTENT_DIR, "skills.json"), filtered)
  },

  // ─── Social Links ──────────────────────────────────────────────────────────

  async getSocialLinks(): Promise<SocialLink[]> {
    return readJsonFile<SocialLink[]>(path.join(CONTENT_DIR, "social-links.json"))
  },

  async getAdminSocialLinks(): Promise<AdminSocialLink[]> {
    const links = await this.getSocialLinks()
    return links.map((link, idx) => ({
      id: normalizeSlug(link.title),
      platform: (link.title as AdminSocialLink["platform"]) || "Other",
      label: link.title,
      url: link.href,
      icon: typeof link.icon === "string" ? link.icon : normalizeSlug(link.title),
      displayOrder: idx + 1,
      visible: true,
    }))
  },

  async saveSocialLink(link: AdminSocialLink): Promise<void> {
    const links = await this.getSocialLinks()
    const id = normalizeSlug(link.id || link.label || link.platform)

    const updatedLink: SocialLink = {
      icon: link.icon || link.platform.toLowerCase(),
      title: link.label || link.platform,
      href: link.url,
    }

    const existingIdx = links.findIndex(
      (l) => normalizeSlug(l.title) === id || l.href === link.url
    )

    if (existingIdx >= 0) {
      links[existingIdx] = updatedLink
    } else {
      links.push(updatedLink)
    }

    await writeJsonFile(path.join(CONTENT_DIR, "social-links.json"), links)
  },

  async saveAllSocialLinks(adminLinks: AdminSocialLink[]): Promise<void> {
    const visibleLinks = adminLinks
      .filter((l) => l.visible !== false)
      .map((l) => ({
        icon: l.icon || l.platform.toLowerCase(),
        title: l.label || l.platform,
        href: l.url,
      }))

    await writeJsonFile(path.join(CONTENT_DIR, "social-links.json"), visibleLinks)
  },

  async deleteSocialLink(id: string): Promise<void> {
    const links = await this.getSocialLinks()
    const targetSlug = normalizeSlug(id)
    const filtered = links.filter((l) => normalizeSlug(l.title) !== targetSlug)
    await writeJsonFile(path.join(CONTENT_DIR, "social-links.json"), filtered)
  },

  // ─── Awards, Certifications, Publications ──────────────────────────────────

  async getAwards(): Promise<Award[]> {
    return readJsonFile<Award[]>(path.join(CONTENT_DIR, "awards.json"))
  },

  async getCertifications(): Promise<Certification[]> {
    return readJsonFile<Certification[]>(path.join(CONTENT_DIR, "certifications.json"))
  },

  async getPublications(): Promise<Publication[]> {
    return readJsonFile<Publication[]>(path.join(CONTENT_DIR, "publications.json"))
  },
}
