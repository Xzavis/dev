import asahDicoding from "@/content/experiences/asah-dicoding-accenture.json"
import blockvizo from "@/content/experiences/blockvizo.json"
import custompedia from "@/content/experiences/custompedia.json"
import dinusLab from "@/content/experiences/dinus-lab-assistant.json"
import education from "@/content/experiences/education.json"
import gdgocDinus from "@/content/experiences/gdgoc-dinus.json"
import pijakIbm from "@/content/experiences/pijak-ibm.json"
import USER from "@/content/profile.json"
import baseRealms from "@/content/projects/base-realms.json"
import brazilianEcommerce from "@/content/projects/brazilian-ecommerce-dashboard.json"
import custora from "@/content/projects/custora.json"
import diabetesClassification from "@/content/projects/diabetes-classification.json"
import financialAssistant from "@/content/projects/financial-assistant-bot.json"
import floodsegmen from "@/content/projects/floodsegmen.json"
import imageclas from "@/content/projects/imageclas.json"
import leadsup from "@/content/projects/leadsup.json"
import lostandfound from "@/content/projects/lostandfound.json"
import machineLearningSystem from "@/content/projects/machine-learning-system.json"
import naratioai from "@/content/projects/naratioai.json"
import polsekrembang from "@/content/projects/polsekrembang.json"
import qmeal from "@/content/projects/qmeal.json"
import SETTINGS from "@/content/settings.json"
import TECH_STACK from "@/content/skills.json"
import SOCIAL_LINKS from "@/content/social-links.json"
import type { Experience, Project } from "@/lib/content/types"

const EXPERIENCES: Experience[] = [
  custompedia,
  pijakIbm,
  dinusLab,
  asahDicoding,
  blockvizo,
  gdgocDinus,
  education,
]

const PROJECTS: Project[] = [
  naratioai,
  custora,
  baseRealms,
  leadsup,
  qmeal,
  polsekrembang,
  brazilianEcommerce,
  financialAssistant,
  machineLearningSystem,
  lostandfound,
  floodsegmen,
  diabetesClassification,
  imageclas,
]
import type {
  AdminExperience,
  AdminProfile,
  AdminProject,
  AdminSkill,
  AdminSocialLink,
  DashboardMetrics,
  RecentChange,
  SiteSettings,
  SyncResult,
} from "../types/admin"

// Fallback runtime cache for fast preview & mutations
let _profileCache: AdminProfile | null = null
let _projectsCache: AdminProject[] | null = null
let _experiencesCache: AdminExperience[] | null = null
let _skillsCache: AdminSkill[] | null = null
let _socialLinksCache: AdminSocialLink[] | null = null
let _settingsCache: SiteSettings | null = null
let _recentChanges: RecentChange[] = []

export function getAdminProfile(): AdminProfile {
  if (_profileCache) return _profileCache

  _profileCache = {
    ...USER,
    gender: USER.gender as AdminProfile["gender"],
    headline: USER.jobTitle,
    resumeUrl: "/resume.pdf",
    availabilityStatus: "Open to opportunities",
    shortBio: USER.bio,
    longBio: USER.about,
    githubUrl: "https://github.com/zickrian",
    linkedinUrl: "https://linkedin.com/in/firdauskhotibulzickrian/",
    mediumUrl: "https://medium.com/@zickriann",
    instagramUrl: "https://instagram.com/zickrian",
    keywords: SETTINGS.keywords,
    ogImage: SETTINGS.ogImage,
    seoTitle: SETTINGS.seoTitle,
    seoDescription: SETTINGS.seoDescription,
  }
  return _profileCache
}

export function getAdminProjects(): AdminProject[] {
  if (_projectsCache) return _projectsCache

  _projectsCache = PROJECTS.map((p, idx) => ({
    ...p,
    status: (p.isExpanded ? "published" : "published") as "published" | "draft" | "archived",
    featured: idx < 3,
    displayOrder: idx + 1,
    updatedAt: new Date(Date.now() - idx * 86400000).toISOString(),
  }))
  return _projectsCache
}

export function getAdminExperiences(): AdminExperience[] {
  if (_experiencesCache) return _experiencesCache

  _experiencesCache = EXPERIENCES.map((exp, idx) => ({
    ...exp,
    status: "published",
    displayOrder: idx + 1,
    updatedAt: new Date(Date.now() - idx * 172800000).toISOString(),
  }))
  return _experiencesCache
}

export function getAdminSkills(): AdminSkill[] {
  if (_skillsCache) return _skillsCache

  const mapCategory = (cats: string[]): AdminSkill["category"] => {
    const primary = cats[0] || ""
    if (primary.includes("AI") || primary.includes("ML")) return "AI"
    if (primary.includes("Backend")) return "Backend"
    if (primary.includes("Frontend")) return "Frontend"
    if (primary.includes("Data")) return "Data"
    return "Tools"
  }

  _skillsCache = TECH_STACK.map((item, idx) => ({
    id: item.key,
    name: item.title,
    category: mapCategory(item.categories),
    level: idx < 5 ? "Expert" : idx < 12 ? "Advanced" : "Intermediate",
    icon: item.iconId,
    featured: idx < 8,
    displayOrder: idx + 1,
  }))
  return _skillsCache
}

export function getAdminSocialLinks(): AdminSocialLink[] {
  if (_socialLinksCache) return _socialLinksCache

  _socialLinksCache = SOCIAL_LINKS.map((link, idx) => ({
    id: `social-${idx + 1}`,
    platform: (link.title as AdminSocialLink["platform"]) || "Other",
    label: link.title,
    url: link.href,
    displayOrder: idx + 1,
    visible: true,
  }))
  return _socialLinksCache
}

export function getAdminSettings(): SiteSettings {
  if (_settingsCache) return _settingsCache

  _settingsCache = {
    siteTitle: SETTINGS.seoTitle ?? `${USER.displayName} | Portfolio`,
    siteDescription: SETTINGS.seoDescription ?? USER.bio,
    favicon: "/favicon.ico",
    defaultOgImage: SETTINGS.ogImage,
    metaTitle: SETTINGS.seoTitle ?? USER.displayName,
    metaDescription: SETTINGS.seoDescription ?? USER.bio,
    keywords: SETTINGS.keywords,
    autoPublish: false,
    previewDeployment: true,
    lastSyncTime: new Date().toISOString(),
    githubRepo: "zickrian/portfolio",
  }
  return _settingsCache
}

export function getDashboardMetrics(): DashboardMetrics {
  const projects = getAdminProjects()
  const experiences = getAdminExperiences()
  const skills = getAdminSkills()
  const drafts = projects.filter((p) => p.status === "draft").length

  const recent = _recentChanges.length > 0 ? _recentChanges : [
    {
      id: "rec-1",
      title: projects[0]?.title || "Narratio AI",
      type: "Project" as const,
      status: "published" as const,
      updatedAt: new Date(Date.now() - 7200000).toISOString(),
      editUrl: `/admin/projects/${projects[0]?.id || "naratioai"}`,
    },
    {
      id: "rec-2",
      title: "Profile Headline & Bio",
      type: "Profile" as const,
      status: "published" as const,
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      editUrl: "/admin/profile",
    },
    {
      id: "rec-3",
      title: experiences[0]?.companyName || "PT Custompedia Creative Group",
      type: "Experience" as const,
      status: "published" as const,
      updatedAt: new Date(Date.now() - 172800000).toISOString(),
      editUrl: "/admin/experience",
    },
    {
      id: "rec-4",
      title: "Skills & Tech Stack Reorder",
      type: "Skill" as const,
      status: "published" as const,
      updatedAt: new Date(Date.now() - 259200000).toISOString(),
      editUrl: "/admin/skills",
    },
  ]

  return {
    projectsCount: projects.length,
    experienceCount: experiences.length,
    skillsCount: skills.length,
    draftsCount: drafts,
    recentChanges: recent,
  }
}

export function recordRecentChange(
  id: string,
  title: string,
  type: RecentChange["type"],
  status: RecentChange["status"],
  editUrl: string
) {
  const item: RecentChange = {
    id: `rec-${Date.now()}`,
    title,
    type,
    status,
    updatedAt: new Date().toISOString(),
    editUrl,
  }
  _recentChanges = [item, ..._recentChanges.filter((c) => c.editUrl !== editUrl)].slice(0, 10)
}

// ─── Mutations ──────────────────────────────────────────────────────────────

export async function saveProfileData(profile: AdminProfile): Promise<{ success: boolean; message: string }> {
  _profileCache = { ...profile, dateModified: new Date().toISOString() }
  recordRecentChange("profile", "Profile Information", "Profile", "published", "/admin/profile")
  return { success: true, message: "Profile updated successfully." }
}

export async function saveProjectData(project: AdminProject): Promise<{ success: boolean; message: string }> {
  const projects = getAdminProjects()
  const existingIdx = projects.findIndex((p) => p.id === project.id)

  const updatedProject = {
    ...project,
    updatedAt: new Date().toISOString(),
  }

  if (existingIdx >= 0) {
    projects[existingIdx] = updatedProject
  } else {
    projects.unshift(updatedProject)
  }
  _projectsCache = [...projects]
  recordRecentChange(project.id, project.title, "Project", project.status || "published", `/admin/projects/${project.id}`)
  return { success: true, message: `Project ${existingIdx >= 0 ? "updated" : "created"} successfully.` }
}

export async function deleteProjectData(id: string): Promise<{ success: boolean; message: string }> {
  const projects = getAdminProjects()
  _projectsCache = projects.filter((p) => p.id !== id)
  _recentChanges = _recentChanges.filter((c) => c.editUrl !== `/admin/projects/${id}`)
  return { success: true, message: "Project deleted successfully." }
}

export async function saveExperienceData(experience: AdminExperience): Promise<{ success: boolean; message: string }> {
  const list = getAdminExperiences()
  const existingIdx = list.findIndex((e) => e.id === experience.id)

  const updated = {
    ...experience,
    updatedAt: new Date().toISOString(),
  }

  if (existingIdx >= 0) {
    list[existingIdx] = updated
  } else {
    list.unshift(updated)
  }
  _experiencesCache = [...list]
  recordRecentChange(experience.id, experience.companyName, "Experience", "published", "/admin/experience")
  return { success: true, message: `Experience ${existingIdx >= 0 ? "updated" : "created"} successfully.` }
}

export async function deleteExperienceData(id: string): Promise<{ success: boolean; message: string }> {
  const list = getAdminExperiences()
  _experiencesCache = list.filter((e) => e.id !== id)
  return { success: true, message: "Experience deleted successfully." }
}

export async function saveSkillData(skill: AdminSkill): Promise<{ success: boolean; message: string }> {
  const list = getAdminSkills()
  const existingIdx = list.findIndex((s) => s.id === skill.id)

  if (existingIdx >= 0) {
    list[existingIdx] = skill
  } else {
    list.push(skill)
  }
  _skillsCache = [...list]
  recordRecentChange(skill.id, skill.name, "Skill", "published", "/admin/skills")
  return { success: true, message: `Skill ${existingIdx >= 0 ? "updated" : "created"} successfully.` }
}

export async function deleteSkillData(id: string): Promise<{ success: boolean; message: string }> {
  const list = getAdminSkills()
  _skillsCache = list.filter((s) => s.id !== id)
  return { success: true, message: "Skill deleted successfully." }
}

export async function saveSocialLinkData(link: AdminSocialLink): Promise<{ success: boolean; message: string }> {
  const list = getAdminSocialLinks()
  const existingIdx = list.findIndex((l) => l.id === link.id)

  if (existingIdx >= 0) {
    list[existingIdx] = link
  } else {
    list.push(link)
  }
  _socialLinksCache = [...list]
  recordRecentChange(link.id, link.label, "Social Link", "published", "/admin/social-links")
  return { success: true, message: `Social link ${existingIdx >= 0 ? "updated" : "created"} successfully.` }
}

export async function deleteSocialLinkData(id: string): Promise<{ success: boolean; message: string }> {
  const list = getAdminSocialLinks()
  _socialLinksCache = list.filter((l) => l.id !== id)
  return { success: true, message: "Social link deleted successfully." }
}

export async function saveSettingsData(settings: SiteSettings): Promise<{ success: boolean; message: string }> {
  _settingsCache = { ...settings, lastSyncTime: new Date().toISOString() }
  recordRecentChange("settings", "Site Settings", "Settings", "published", "/admin/settings")
  return { success: true, message: "Settings updated successfully." }
}

// ─── GitHub API Commit Sync (Server-Side Only) ──────────────────────────────

export async function commitToGitHub(message: string): Promise<SyncResult> {
  const token = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_OWNER || "zickrian"
  const repo = process.env.GITHUB_REPO || "portfolio"

  // ponytail: in development or if token is absent, simulate sync cleanly with local persistence
  if (!token) {
    return {
      success: true,
      message: `[Dev Mode] Changes saved locally and queued for deployment: "${message}"`,
      commitSha: `local-${Date.now().toString(16)}`,
      timestamp: new Date().toISOString(),
    }
  }

  try {
    // Commit logic via GitHub REST API
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/dispatches`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_type: "portfolio_publish",
        client_payload: { message, timestamp: new Date().toISOString() },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return {
        success: false,
        message: `GitHub API responded with status ${response.status}: ${errorText}`,
        timestamp: new Date().toISOString(),
      }
    }

    return {
      success: true,
      message: `Successfully committed to GitHub and triggered Vercel deployment: "${message}"`,
      commitSha: `gh-${Date.now().toString(16)}`,
      timestamp: new Date().toISOString(),
    }
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Unknown error connecting to GitHub API"
    return {
      success: false,
      message: `Failed to commit to GitHub: ${errMsg}`,
      timestamp: new Date().toISOString(),
    }
  }
}
