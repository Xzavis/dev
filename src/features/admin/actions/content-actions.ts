"use server"

// ponytail: Next.js Server Actions connecting Admin UI with Content Manager
import { revalidatePath } from "next/cache"

import {
  commitToGitHub,
  deleteAwardData,
  deleteCertificationData,
  deleteExperienceData,
  deleteProjectData,
  deletePublicationData,
  deleteSkillData,
  deleteSocialLinkData,
  getAdminAwards,
  getAdminCertifications,
  getAdminExperiences,
  getAdminProfile,
  getAdminProjectById,
  getAdminProjects,
  getAdminPublications,
  getAdminSettings,
  getAdminSkills,
  getAdminSocialLinks,
  getDashboardMetrics,
  reorderAwardsData,
  reorderCertificationsData,
  reorderExperiencesData,
  reorderProjectsData,
  reorderPublicationsData,
  reorderSkillsData,
  reorderSocialLinksData,
  saveAwardData,
  saveCertificationData,
  saveExperienceData,
  saveProfileData,
  saveProjectData,
  savePublicationData,
  saveSettingsData,
  saveSkillData,
  saveSocialLinkData,
} from "../lib/content-manager"
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
  SiteSettings,
  SyncResult,
} from "../types/admin"

export async function fetchDashboardOverviewAction(): Promise<DashboardMetrics> {
  return getDashboardMetrics()
}

// Profile
export async function fetchProfileAction(): Promise<AdminProfile> {
  return getAdminProfile()
}

export async function updateProfileAction(profile: AdminProfile): Promise<{ success: boolean; message: string }> {
  const res = await saveProfileData(profile)
  revalidatePath("/admin")
  revalidatePath("/admin/profile")
  revalidatePath("/")
  return res
}

// Projects
export async function fetchProjectsAction(): Promise<AdminProject[]> {
  return getAdminProjects()
}

export async function fetchProjectByIdAction(id: string): Promise<AdminProject | null> {
  return getAdminProjectById(id)
}

export async function saveProjectAction(project: AdminProject): Promise<{ success: boolean; message: string }> {
  const res = await saveProjectData(project)
  revalidatePath("/admin")
  revalidatePath("/admin/projects")
  revalidatePath("/projects")
  revalidatePath("/")
  return res
}

export async function deleteProjectAction(id: string): Promise<{ success: boolean; message: string }> {
  const res = await deleteProjectData(id)
  revalidatePath("/admin")
  revalidatePath("/admin/projects")
  revalidatePath("/projects")
  revalidatePath("/")
  return res
}

export async function reorderProjectsAction(
  projects: AdminProject[]
): Promise<{ success: boolean; message: string; data?: AdminProject[] }> {
  const res = await reorderProjectsData(projects)
  if (res.success) {
    revalidatePath("/admin")
    revalidatePath("/admin/projects")
    revalidatePath("/projects")
    revalidatePath("/")
  }
  return res
}

// Experience
export async function fetchExperiencesAction(): Promise<AdminExperience[]> {
  return getAdminExperiences()
}

export async function saveExperienceAction(experience: AdminExperience): Promise<{ success: boolean; message: string }> {
  const res = await saveExperienceData(experience)
  revalidatePath("/admin")
  revalidatePath("/admin/experience")
  revalidatePath("/")
  return res
}

export async function reorderExperiencesAction(
  experiences: AdminExperience[]
): Promise<{ success: boolean; message: string; data?: AdminExperience[] }> {
  const res = await reorderExperiencesData(experiences)
  if (res.success) {
    revalidatePath("/admin")
    revalidatePath("/admin/experience")
    revalidatePath("/")
  }
  return res
}

export async function deleteExperienceAction(id: string): Promise<{ success: boolean; message: string }> {
  const res = await deleteExperienceData(id)
  revalidatePath("/admin")
  revalidatePath("/admin/experience")
  revalidatePath("/")
  return res
}

// Skills
export async function fetchSkillsAction(): Promise<AdminSkill[]> {
  return getAdminSkills()
}

export async function saveSkillAction(skill: AdminSkill): Promise<{ success: boolean; message: string }> {
  const res = await saveSkillData(skill)
  if (res.success) {
    revalidatePath("/admin")
    revalidatePath("/admin/skills")
    revalidatePath("/")
  }
  return res
}

export async function reorderSkillsAction(
  skills: AdminSkill[]
): Promise<{ success: boolean; message: string; data?: AdminSkill[] }> {
  const res = await reorderSkillsData(skills)
  if (res.success) {
    revalidatePath("/admin")
    revalidatePath("/admin/skills")
    revalidatePath("/")
  }
  return res
}

export async function deleteSkillAction(id: string): Promise<{ success: boolean; message: string }> {
  const res = await deleteSkillData(id)
  revalidatePath("/admin")
  revalidatePath("/admin/skills")
  revalidatePath("/")
  return res
}

// Social Links
export async function fetchSocialLinksAction(): Promise<AdminSocialLink[]> {
  return getAdminSocialLinks()
}

export async function saveSocialLinkAction(link: AdminSocialLink): Promise<{ success: boolean; message: string }> {
  const res = await saveSocialLinkData(link)
  revalidatePath("/admin")
  revalidatePath("/admin/social-links")
  revalidatePath("/")
  return res
}

export async function reorderSocialLinksAction(
  links: AdminSocialLink[]
): Promise<{ success: boolean; message: string; data?: AdminSocialLink[] }> {
  const res = await reorderSocialLinksData(links)
  if (res.success) {
    revalidatePath("/admin")
    revalidatePath("/admin/social-links")
    revalidatePath("/")
  }
  return res
}

export async function deleteSocialLinkAction(id: string): Promise<{ success: boolean; message: string }> {
  const res = await deleteSocialLinkData(id)
  revalidatePath("/admin")
  revalidatePath("/admin/social-links")
  revalidatePath("/")
  return res
}

// Settings & GitHub Publish
export async function fetchSettingsAction(): Promise<SiteSettings> {
  return getAdminSettings()
}

export async function updateSettingsAction(settings: SiteSettings): Promise<{ success: boolean; message: string }> {
  const res = await saveSettingsData(settings)
  revalidatePath("/admin")
  revalidatePath("/admin/settings")
  return res
}

export async function publishToGitHubAction(message: string): Promise<SyncResult> {
  const res = await commitToGitHub(message)
  revalidatePath("/", "layout")
  return res
}

// Awards
export async function fetchAwardsAction(): Promise<AdminAward[]> {
  return getAdminAwards()
}

export async function saveAwardAction(award: AdminAward): Promise<{ success: boolean; message: string }> {
  const res = await saveAwardData(award)
  if (res.success) {
    revalidatePath("/admin")
    revalidatePath("/admin/awards")
    revalidatePath("/")
  }
  return res
}

export async function reorderAwardsAction(
  awards: AdminAward[]
): Promise<{ success: boolean; message: string; data?: AdminAward[] }> {
  const res = await reorderAwardsData(awards)
  if (res.success) {
    revalidatePath("/admin")
    revalidatePath("/admin/awards")
    revalidatePath("/")
  }
  return res
}

export async function deleteAwardAction(id: string): Promise<{ success: boolean; message: string }> {
  const res = await deleteAwardData(id)
  revalidatePath("/admin")
  revalidatePath("/admin/awards")
  revalidatePath("/")
  return res
}

// Certifications
export async function fetchCertificationsAction(): Promise<AdminCertification[]> {
  return getAdminCertifications()
}

export async function saveCertificationAction(cert: AdminCertification): Promise<{ success: boolean; message: string }> {
  const res = await saveCertificationData(cert)
  if (res.success) {
    revalidatePath("/admin")
    revalidatePath("/admin/certifications")
    revalidatePath("/")
  }
  return res
}

export async function reorderCertificationsAction(
  certs: AdminCertification[]
): Promise<{ success: boolean; message: string; data?: AdminCertification[] }> {
  const res = await reorderCertificationsData(certs)
  if (res.success) {
    revalidatePath("/admin")
    revalidatePath("/admin/certifications")
    revalidatePath("/")
  }
  return res
}

export async function deleteCertificationAction(adminId: string): Promise<{ success: boolean; message: string }> {
  const res = await deleteCertificationData(adminId)
  revalidatePath("/admin")
  revalidatePath("/admin/certifications")
  revalidatePath("/")
  return res
}

// Publications
export async function fetchPublicationsAction(): Promise<AdminPublication[]> {
  return getAdminPublications()
}

export async function savePublicationAction(pub: AdminPublication): Promise<{ success: boolean; message: string }> {
  const res = await savePublicationData(pub)
  if (res.success) {
    revalidatePath("/admin")
    revalidatePath("/admin/publications")
    revalidatePath("/")
  }
  return res
}

export async function reorderPublicationsAction(
  pubs: AdminPublication[]
): Promise<{ success: boolean; message: string; data?: AdminPublication[] }> {
  const res = await reorderPublicationsData(pubs)
  if (res.success) {
    revalidatePath("/admin")
    revalidatePath("/admin/publications")
    revalidatePath("/")
  }
  return res
}

export async function deletePublicationAction(id: string): Promise<{ success: boolean; message: string }> {
  const res = await deletePublicationData(id)
  revalidatePath("/admin")
  revalidatePath("/admin/publications")
  revalidatePath("/")
  return res
}

// Admin Security Check
export async function verifyAdminAuthAction(password: string): Promise<{ authorized: boolean; message?: string }> {
  const adminSecret = process.env.ADMIN_PASSWORD || process.env.ADMIN_PIN || "zickrian2026"
  if (password === adminSecret) {
    return { authorized: true }
  }
  return { authorized: false, message: "Invalid admin passphrase. Access denied." }
}
