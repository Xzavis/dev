import "server-only"

import { LocalContentRepository } from "@/lib/content/local-repo"

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

let _recentChanges: RecentChange[] = []

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

export async function getAdminProfile(): Promise<AdminProfile> {
  return LocalContentRepository.getAdminProfile()
}

export async function getAdminProjects(): Promise<AdminProject[]> {
  return LocalContentRepository.getAdminProjects()
}

export async function getAdminProjectById(id: string): Promise<AdminProject | null> {
  const project = await LocalContentRepository.getProjectById(id)
  if (!project) return null
  return {
    ...project,
    status: (project.isExpanded ? "published" : "published") as "published" | "draft" | "archived",
    featured: true,
    displayOrder: 1,
    updatedAt: new Date().toISOString(),
  }
}

export async function getAdminExperiences(): Promise<AdminExperience[]> {
  return LocalContentRepository.getAdminExperiences()
}

export async function getAdminSkills(): Promise<AdminSkill[]> {
  return LocalContentRepository.getAdminSkills()
}

export async function getAdminSocialLinks(): Promise<AdminSocialLink[]> {
  return LocalContentRepository.getAdminSocialLinks()
}

export async function getAdminSettings(): Promise<SiteSettings> {
  return LocalContentRepository.getAdminSettings()
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [projects, experiences, skills] = await Promise.all([
    LocalContentRepository.getAdminProjects(),
    LocalContentRepository.getAdminExperiences(),
    LocalContentRepository.getAdminSkills(),
  ])
  const drafts = projects.filter((p: { status?: string }) => p.status === "draft").length

  const recent = _recentChanges.length > 0 ? _recentChanges : [
    {
      id: "rec-1",
      title: projects[0]?.title || "Custora AI",
      type: "Project" as const,
      status: "published" as const,
      updatedAt: new Date().toISOString(),
      editUrl: `/admin/projects/${projects[0]?.id || "custora"}`,
    },
    {
      id: "rec-2",
      title: "Profile Information",
      type: "Profile" as const,
      status: "published" as const,
      updatedAt: new Date().toISOString(),
      editUrl: "/admin/profile",
    },
    {
      id: "rec-3",
      title: experiences[0]?.companyName || "Experience",
      type: "Experience" as const,
      status: "published" as const,
      updatedAt: new Date().toISOString(),
      editUrl: "/admin/experience",
    },
    {
      id: "rec-4",
      title: "Skills & Tech Stack",
      type: "Skill" as const,
      status: "published" as const,
      updatedAt: new Date().toISOString(),
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

// ─── Mutations (Direct Filesystem Persistence) ──────────────────────────────

export async function saveProfileData(profile: AdminProfile): Promise<{ success: boolean; message: string }> {
  await LocalContentRepository.saveProfile(profile)
  recordRecentChange("profile", "Profile Information", "Profile", "published", "/admin/profile")
  return { success: true, message: "Profile updated successfully." }
}

export async function saveProjectData(project: AdminProject): Promise<{ success: boolean; message: string }> {
  const result = await LocalContentRepository.saveProject(project)
  recordRecentChange(result.id, project.title, "Project", project.status || "published", `/admin/projects/${result.id}`)
  return { success: true, message: "Project saved successfully." }
}

export async function deleteProjectData(id: string): Promise<{ success: boolean; message: string }> {
  await LocalContentRepository.deleteProject(id)
  _recentChanges = _recentChanges.filter((c) => c.editUrl !== `/admin/projects/${id}`)
  return { success: true, message: "Project deleted successfully." }
}

export async function saveExperienceData(experience: AdminExperience): Promise<{ success: boolean; message: string }> {
  const result = await LocalContentRepository.saveExperience(experience)
  recordRecentChange(result.id, experience.companyName, "Experience", "published", "/admin/experience")
  return { success: true, message: "Experience saved successfully." }
}

export async function reorderExperiencesData(experiences: AdminExperience[]): Promise<{ success: boolean; message: string; data?: AdminExperience[] }> {
  try {
    const updated = await LocalContentRepository.reorderExperiences(experiences)
    recordRecentChange("experiences-reorder", "Reordered Experiences", "Experience", "published", "/admin/experience")
    return { success: true, message: "Experience order saved successfully.", data: updated }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to reorder experiences."
    return { success: false, message: msg }
  }
}

export async function reorderProjectsData(projects: AdminProject[]): Promise<{ success: boolean; message: string; data?: AdminProject[] }> {
  try {
    const updated = await LocalContentRepository.reorderProjects(projects)
    recordRecentChange("projects-reorder", "Reordered Projects", "Project", "published", "/admin/projects")
    return { success: true, message: "Projects order saved successfully.", data: updated }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to reorder projects."
    return { success: false, message: msg }
  }
}

export async function reorderSocialLinksData(links: AdminSocialLink[]): Promise<{ success: boolean; message: string; data?: AdminSocialLink[] }> {
  try {
    const updated = await LocalContentRepository.reorderSocialLinks(links)
    recordRecentChange("social-links-reorder", "Reordered Social Links", "Social Link", "published", "/admin/social-links")
    return { success: true, message: "Social links reordered successfully.", data: updated }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to reorder social links."
    return { success: false, message: msg }
  }
}

export async function deleteExperienceData(id: string): Promise<{ success: boolean; message: string }> {
  await LocalContentRepository.deleteExperience(id)
  return { success: true, message: "Experience deleted successfully." }
}

export async function saveSkillData(skill: AdminSkill): Promise<{ success: boolean; message: string }> {
  try {
    await LocalContentRepository.saveSkill(skill)
    recordRecentChange(skill.id, skill.name, "Skill", "published", "/admin/skills")
    return { success: true, message: "Skill saved successfully." }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save skill."
    return { success: false, message: msg }
  }
}

export async function reorderSkillsData(skills: AdminSkill[]): Promise<{ success: boolean; message: string; data?: AdminSkill[] }> {
  try {
    const updated = await LocalContentRepository.saveAllSkills(skills)
    recordRecentChange("skills-reorder", "Reordered Skills", "Skill", "published", "/admin/skills")
    return { success: true, message: "Skills reordered successfully.", data: updated }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to reorder skills."
    return { success: false, message: msg }
  }
}

export async function deleteSkillData(id: string): Promise<{ success: boolean; message: string }> {
  await LocalContentRepository.deleteSkill(id)
  return { success: true, message: "Skill deleted successfully." }
}

export async function saveSocialLinkData(link: AdminSocialLink): Promise<{ success: boolean; message: string }> {
  await LocalContentRepository.saveSocialLink(link)
  recordRecentChange(link.id, link.label, "Social Link", "published", "/admin/social-links")
  return { success: true, message: "Social link saved successfully." }
}

export async function deleteSocialLinkData(id: string): Promise<{ success: boolean; message: string }> {
  await LocalContentRepository.deleteSocialLink(id)
  return { success: true, message: "Social link deleted successfully." }
}

export async function saveSettingsData(settings: SiteSettings): Promise<{ success: boolean; message: string }> {
  await LocalContentRepository.saveSettings(settings)
  recordRecentChange("settings", "Site Settings", "Settings", "published", "/admin/settings")
  return { success: true, message: "Settings updated successfully." }
}

// ─── Git Sync Placeholder for Phase 2 ────────────────────────────────────────

export async function commitToGitHub(message: string): Promise<SyncResult> {
  return {
    success: true,
    message: `[Local Mode] Changes saved locally: ${message}`,
    commitSha: "local-dev",
    timestamp: new Date().toISOString(),
  }
}
