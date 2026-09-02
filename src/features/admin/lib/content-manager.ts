import "server-only"

import { LocalContentRepository } from "@/lib/content/local-repo"

import type {
  AdminAward,
  AdminCertification,
  AdminExperience,
  AdminProfile,
  AdminProject,
  AdminPublication,
  AdminSkill,
  AdminSocialLink,
  DashboardMetrics,
  RecentChange,
  SiteSettings,
  SyncResult,
} from "../types/admin"

/**
 * Session-local recent activity.
 * NOT a durable audit log -- resets on server restart.
 * Do not present to users as persistent history.
 */
let _sessionActivity: RecentChange[] = []

export function recordRecentActivity(
  id: string,
  title: string,
  type: RecentChange["type"],
  status: RecentChange["status"],
  editUrl: string
) {
  const item: RecentChange = {
    id: `act-${Date.now()}`,
    title,
    type,
    status,
    updatedAt: new Date().toISOString(),
    editUrl,
  }
  _sessionActivity = [item, ..._sessionActivity.filter((c) => c.editUrl !== editUrl)].slice(0, 10)
}

// Profile
export async function getAdminProfile(): Promise<AdminProfile> {
  return LocalContentRepository.getAdminProfile()
}

// Projects
export async function getAdminProjects(): Promise<AdminProject[]> {
  return LocalContentRepository.getAdminProjects()
}

export async function getAdminProjectById(id: string): Promise<AdminProject | null> {
  const project = await LocalContentRepository.getProjectById(id)
  if (!project) return null
  const all = await LocalContentRepository.getAdminProjects()
  const idx = all.findIndex((p) => p.id === project.id)
  return {
    ...project,
    status: ((project as AdminProject).status) || "published",
    displayOrder: idx >= 0 ? idx + 1 : undefined,
    updatedAt: (project as AdminProject).updatedAt,
  }
}

// Experience
export async function getAdminExperiences(): Promise<AdminExperience[]> {
  return LocalContentRepository.getAdminExperiences()
}

// Skills
export async function getAdminSkills(): Promise<AdminSkill[]> {
  return LocalContentRepository.getAdminSkills()
}

// Social Links
export async function getAdminSocialLinks(): Promise<AdminSocialLink[]> {
  return LocalContentRepository.getAdminSocialLinks()
}

// Settings
export async function getAdminSettings(): Promise<SiteSettings> {
  return LocalContentRepository.getAdminSettings()
}

// Awards
export async function getAdminAwards(): Promise<AdminAward[]> {
  const awards = await LocalContentRepository.getAwards()
  return awards.map((a, idx) => ({ ...a, displayOrder: idx + 1 }))
}

// Certifications
export async function getAdminCertifications(): Promise<AdminCertification[]> {
  const certs = await LocalContentRepository.getCertifications()
  const seen = new Map<string, number>()
  return certs.map((c, idx) => {
    const baseId = LocalContentRepository.certAdminId(c)
    const count = seen.get(baseId) || 0
    seen.set(baseId, count + 1)
    const uniqueAdminId = count === 0 ? baseId : `${baseId}-${count}`
    return {
      ...c,
      _adminId: uniqueAdminId,
      displayOrder: idx + 1,
    }
  })
}

// Publications
export async function getAdminPublications(): Promise<AdminPublication[]> {
  const pubs = await LocalContentRepository.getPublications()
  return pubs.map((p, idx) => ({ ...p, displayOrder: idx + 1 }))
}

// Dashboard
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [projects, experiences, skills, awards, certifications, publications] = await Promise.all([
    LocalContentRepository.getAdminProjects(),
    LocalContentRepository.getAdminExperiences(),
    LocalContentRepository.getAdminSkills(),
    LocalContentRepository.getAwards(),
    LocalContentRepository.getCertifications(),
    LocalContentRepository.getPublications(),
  ])
  const drafts = projects.filter((p: { status?: string }) => p.status === "draft").length

  return {
    projectsCount: projects.length,
    experienceCount: experiences.length,
    skillsCount: skills.length,
    draftsCount: drafts,
    awardsCount: awards.length,
    certificationsCount: certifications.length,
    publicationsCount: publications.length,
    recentActivity: _sessionActivity,
  }
}

// Mutations
export async function saveProfileData(profile: AdminProfile): Promise<{ success: boolean; message: string }> {
  await LocalContentRepository.saveProfile(profile)
  recordRecentActivity("profile", "Profile Information", "Profile", "published", "/admin/profile")
  return { success: true, message: "Profile updated successfully." }
}

export async function saveProjectData(project: AdminProject): Promise<{ success: boolean; message: string }> {
  const result = await LocalContentRepository.saveProject(project)
  recordRecentActivity(result.id, project.title, "Project", project.status || "published", `/admin/projects/${result.id}`)
  return { success: true, message: "Project saved successfully." }
}

export async function deleteProjectData(id: string): Promise<{ success: boolean; message: string }> {
  await LocalContentRepository.deleteProject(id)
  _sessionActivity = _sessionActivity.filter((c) => c.editUrl !== `/admin/projects/${id}`)
  return { success: true, message: "Project deleted successfully." }
}

export async function saveExperienceData(experience: AdminExperience): Promise<{ success: boolean; message: string }> {
  const result = await LocalContentRepository.saveExperience(experience)
  recordRecentActivity(result.id, experience.companyName, "Experience", "published", "/admin/experience")
  return { success: true, message: "Experience saved successfully." }
}

export async function reorderExperiencesData(experiences: AdminExperience[]): Promise<{ success: boolean; message: string; data?: AdminExperience[] }> {
  try {
    const updated = await LocalContentRepository.reorderExperiences(experiences)
    recordRecentActivity("experiences-reorder", "Reordered Experiences", "Experience", "published", "/admin/experience")
    return { success: true, message: "Experience order saved successfully.", data: updated }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to reorder experiences."
    return { success: false, message: msg }
  }
}

export async function reorderProjectsData(projects: AdminProject[]): Promise<{ success: boolean; message: string; data?: AdminProject[] }> {
  try {
    const updated = await LocalContentRepository.reorderProjects(projects)
    recordRecentActivity("projects-reorder", "Reordered Projects", "Project", "published", "/admin/projects")
    return { success: true, message: "Projects order saved successfully.", data: updated }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to reorder projects."
    return { success: false, message: msg }
  }
}

export async function reorderSocialLinksData(links: AdminSocialLink[]): Promise<{ success: boolean; message: string; data?: AdminSocialLink[] }> {
  try {
    const updated = await LocalContentRepository.reorderSocialLinks(links)
    recordRecentActivity("social-links-reorder", "Reordered Social Links", "Social Link", "published", "/admin/social-links")
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
    recordRecentActivity(skill.id, skill.name, "Skill", "published", "/admin/skills")
    return { success: true, message: "Skill saved successfully." }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save skill."
    return { success: false, message: msg }
  }
}

export async function reorderSkillsData(skills: AdminSkill[]): Promise<{ success: boolean; message: string; data?: AdminSkill[] }> {
  try {
    const updated = await LocalContentRepository.saveAllSkills(skills)
    recordRecentActivity("skills-reorder", "Reordered Skills", "Skill", "published", "/admin/skills")
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
  recordRecentActivity(link.id, link.label, "Social Link", "published", "/admin/social-links")
  return { success: true, message: "Social link saved successfully." }
}

export async function deleteSocialLinkData(id: string): Promise<{ success: boolean; message: string }> {
  await LocalContentRepository.deleteSocialLink(id)
  return { success: true, message: "Social link deleted successfully." }
}

export async function saveSettingsData(settings: SiteSettings): Promise<{ success: boolean; message: string }> {
  await LocalContentRepository.saveSettings(settings)
  recordRecentActivity("settings", "Site Settings", "Settings", "published", "/admin/settings")
  return { success: true, message: "Settings updated successfully." }
}

// Awards Mutations
export async function saveAwardData(award: AdminAward): Promise<{ success: boolean; message: string }> {
  try {
    const result = await LocalContentRepository.saveAward(award)
    recordRecentActivity(result.id, award.title, "Award", "published", "/admin/awards")
    return { success: true, message: "Award saved successfully." }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save award."
    return { success: false, message: msg }
  }
}

export async function reorderAwardsData(awards: AdminAward[]): Promise<{ success: boolean; message: string; data?: AdminAward[] }> {
  try {
    const updated = await LocalContentRepository.reorderAwards(awards)
    recordRecentActivity("awards-reorder", "Reordered Awards", "Award", "published", "/admin/awards")
    return { success: true, message: "Awards reordered successfully.", data: updated.map((a, idx) => ({ ...a, displayOrder: idx + 1 })) }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to reorder awards."
    return { success: false, message: msg }
  }
}

export async function deleteAwardData(id: string): Promise<{ success: boolean; message: string }> {
  await LocalContentRepository.deleteAward(id)
  return { success: true, message: "Award deleted successfully." }
}

// Certifications Mutations
export async function saveCertificationData(cert: AdminCertification): Promise<{ success: boolean; message: string }> {
  try {
    await LocalContentRepository.saveCertification(cert)
    recordRecentActivity(cert._adminId, cert.title, "Certification", "published", "/admin/certifications")
    return { success: true, message: "Certification saved successfully." }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save certification."
    return { success: false, message: msg }
  }
}

export async function reorderCertificationsData(certs: AdminCertification[]): Promise<{ success: boolean; message: string; data?: AdminCertification[] }> {
  try {
    const updated = await LocalContentRepository.reorderCertifications(certs)
    recordRecentActivity("certifications-reorder", "Reordered Certifications", "Certification", "published", "/admin/certifications")
    return { success: true, message: "Certifications reordered successfully.", data: updated.map((c, idx) => ({ ...c, _adminId: LocalContentRepository.certAdminId(c), displayOrder: idx + 1 })) }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to reorder certifications."
    return { success: false, message: msg }
  }
}

export async function deleteCertificationData(adminId: string): Promise<{ success: boolean; message: string }> {
  await LocalContentRepository.deleteCertification(adminId)
  return { success: true, message: "Certification deleted successfully." }
}

// Publications Mutations
export async function savePublicationData(pub: AdminPublication): Promise<{ success: boolean; message: string }> {
  try {
    const result = await LocalContentRepository.savePublication(pub)
    recordRecentActivity(result.id, pub.title, "Publication", "published", "/admin/publications")
    return { success: true, message: "Publication saved successfully." }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save publication."
    return { success: false, message: msg }
  }
}

export async function reorderPublicationsData(pubs: AdminPublication[]): Promise<{ success: boolean; message: string; data?: AdminPublication[] }> {
  try {
    const updated = await LocalContentRepository.reorderPublications(pubs)
    recordRecentActivity("publications-reorder", "Reordered Publications", "Publication", "published", "/admin/publications")
    return { success: true, message: "Publications reordered successfully.", data: updated.map((p, idx) => ({ ...p, displayOrder: idx + 1 })) }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to reorder publications."
    return { success: false, message: msg }
  }
}

export async function deletePublicationData(id: string): Promise<{ success: boolean; message: string }> {
  await LocalContentRepository.deletePublication(id)
  return { success: true, message: "Publication deleted successfully." }
}

// Git Sync Placeholder
export async function commitToGitHub(message: string): Promise<SyncResult> {
  return {
    success: true,
    message: `[Local Mode] Changes saved locally: ${message}`,
    commitSha: "local-dev",
    timestamp: new Date().toISOString(),
  }
}
