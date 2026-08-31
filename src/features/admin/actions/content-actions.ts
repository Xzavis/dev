"use server"

// ponytail: Next.js Server Actions connecting Admin UI with Content Manager & GitHub API
import { revalidatePath } from "next/cache"

import {
  commitToGitHub,
  deleteExperienceData,
  deleteProjectData,
  deleteSkillData,
  deleteSocialLinkData,
  getAdminExperiences,
  getAdminProfile,
  getAdminProjects,
  getAdminSettings,
  getAdminSkills,
  getAdminSocialLinks,
  getDashboardMetrics,
  saveExperienceData,
  saveProfileData,
  saveProjectData,
  saveSettingsData,
  saveSkillData,
  saveSocialLinkData,
} from "../lib/content-manager"
import type {
  AdminExperience,
  AdminProfile,
  AdminProject,
  AdminSkill,
  AdminSocialLink,
  DashboardMetrics,
  SiteSettings,
  SyncResult,
} from "../types/admin"

export async function fetchDashboardOverviewAction(): Promise<DashboardMetrics> {
  return getDashboardMetrics()
}

// ─── Profile ──────────────────────────────────────────────────────────────────

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

// ─── Projects ─────────────────────────────────────────────────────────────────

export async function fetchProjectsAction(): Promise<AdminProject[]> {
  return getAdminProjects()
}

export async function fetchProjectByIdAction(id: string): Promise<AdminProject | null> {
  const projects = getAdminProjects()
  return projects.find((p) => p.id === id) || null
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

// ─── Experience ───────────────────────────────────────────────────────────────

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

export async function deleteExperienceAction(id: string): Promise<{ success: boolean; message: string }> {
  const res = await deleteExperienceData(id)
  revalidatePath("/admin")
  revalidatePath("/admin/experience")
  revalidatePath("/")
  return res
}

// ─── Skills ───────────────────────────────────────────────────────────────────

export async function fetchSkillsAction(): Promise<AdminSkill[]> {
  return getAdminSkills()
}

export async function saveSkillAction(skill: AdminSkill): Promise<{ success: boolean; message: string }> {
  const res = await saveSkillData(skill)
  revalidatePath("/admin")
  revalidatePath("/admin/skills")
  revalidatePath("/")
  return res
}

export async function deleteSkillAction(id: string): Promise<{ success: boolean; message: string }> {
  const res = await deleteSkillData(id)
  revalidatePath("/admin")
  revalidatePath("/admin/skills")
  revalidatePath("/")
  return res
}

// ─── Social Links ─────────────────────────────────────────────────────────────

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

export async function deleteSocialLinkAction(id: string): Promise<{ success: boolean; message: string }> {
  const res = await deleteSocialLinkData(id)
  revalidatePath("/admin")
  revalidatePath("/admin/social-links")
  revalidatePath("/")
  return res
}

// ─── Settings & GitHub Publish ────────────────────────────────────────────────

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

// ─── Admin Security Check ─────────────────────────────────────────────────────

export async function verifyAdminAuthAction(password: string): Promise<{ authorized: boolean; message?: string }> {
  const adminSecret = process.env.ADMIN_PASSWORD || process.env.ADMIN_PIN || "zickrian2026"
  if (password === adminSecret) {
    return { authorized: true }
  }
  return { authorized: false, message: "Invalid admin passphrase. Access denied." }
}
