"use server"

import fs from "node:fs/promises"
import path from "node:path"

import { revalidatePath } from "next/cache"

import {
  commitToGitHub,
  deleteAwardData,
  deleteBlogData,
  deleteCertificationData,
  deleteExperienceData,
  deleteGalleryData,
  deleteProjectData,
  deletePublicationData,
  deleteSkillData,
  deleteSocialLinkData,
  getAdminAwards,
  getAdminBlogPosts,
  getAdminCertifications,
  getAdminExperiences,
  getAdminGalleryItems,
  getAdminProfile,
  getAdminProjectById,
  getAdminProjects,
  getAdminPublications,
  getAdminSettings,
  getAdminSkills,
  getAdminSocialLinks,
  getDashboardMetrics,
  importMediumPostsData,
  reorderAwardsData,
  reorderBlogData,
  reorderCertificationsData,
  reorderExperiencesData,
  reorderGalleryData,
  reorderProjectsData,
  reorderPublicationsData,
  reorderSkillsData,
  reorderSocialLinksData,
  saveAwardData,
  saveBlogData,
  saveCertificationData,
  saveExperienceData,
  saveGalleryData,
  saveProfileData,
  saveProjectData,
  savePublicationData,
  saveSettingsData,
  saveSkillData,
  saveSocialLinkData,
} from "../lib/content-manager"
import type {
  AdminAward,
  AdminBlogPost,
  AdminCertification,
  AdminExperience,
  AdminGalleryItem,
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

// ─── Gallery Actions ─────────────────────────────────────────────────────────

export async function fetchGalleryAction(): Promise<AdminGalleryItem[]> {
  return getAdminGalleryItems()
}

export async function saveGalleryAction(
  item: AdminGalleryItem
): Promise<{ success: boolean; message: string }> {
  const res = await saveGalleryData(item)
  if (res.success) {
    revalidatePath("/admin")
    revalidatePath("/admin/gallery")
    revalidatePath("/gallery")
  }
  return res
}

export async function reorderGalleryAction(
  items: AdminGalleryItem[]
): Promise<{ success: boolean; message: string; data?: AdminGalleryItem[] }> {
  const res = await reorderGalleryData(items)
  if (res.success) {
    revalidatePath("/admin")
    revalidatePath("/admin/gallery")
    revalidatePath("/gallery")
  }
  return res
}

export async function deleteGalleryAction(id: string): Promise<{ success: boolean; message: string }> {
  const res = await deleteGalleryData(id)
  revalidatePath("/admin")
  revalidatePath("/admin/gallery")
  revalidatePath("/gallery")
  return res
}

// ─── Blog Actions ────────────────────────────────────────────────────────────

export async function fetchBlogAction(): Promise<AdminBlogPost[]> {
  return getAdminBlogPosts()
}

export async function saveBlogAction(
  post: AdminBlogPost
): Promise<{ success: boolean; message: string }> {
  const res = await saveBlogData(post)
  if (res.success) {
    revalidatePath("/admin")
    revalidatePath("/admin/blog")
    revalidatePath("/blog")
  }
  return res
}

export async function reorderBlogAction(
  posts: AdminBlogPost[]
): Promise<{ success: boolean; message: string; data?: AdminBlogPost[] }> {
  const res = await reorderBlogData(posts)
  if (res.success) {
    revalidatePath("/admin")
    revalidatePath("/admin/blog")
    revalidatePath("/blog")
  }
  return res
}

export async function deleteBlogAction(id: string): Promise<{ success: boolean; message: string }> {
  const res = await deleteBlogData(id)
  revalidatePath("/admin")
  revalidatePath("/admin/blog")
  revalidatePath("/blog")
  return res
}

export async function importMediumFeedAction(): Promise<{ success: boolean; message: string; count?: number }> {
  const res = await importMediumPostsData()
  if (res.success) {
    revalidatePath("/admin")
    revalidatePath("/admin/blog")
    revalidatePath("/blog")
  }
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

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
  "video/webm",
  "video/mp4",
  "video/ogg",
])
const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25 MB

export interface MediaItemInfo {
  url: string
  name: string
  size: number
  mtime: string
  isVideo: boolean
  folder: "image" | "banner" | "logos" | "projects"
  projectSlug?: string
}

// ponytail: ensures a dedicated directory for a project exists (public/projects/[slug])
export async function ensureProjectFolderAction(
  projectSlug: string
): Promise<{ success: boolean; folder?: string; message?: string }> {
  try {
    const cleanSlug = projectSlug.trim().replace(/[^a-zA-Z0-9_-]/g, "-").toLowerCase()
    if (!cleanSlug) {
      return { success: false, message: "Project slug tidak valid." }
    }
    const targetDir = path.join(process.cwd(), "public", "projects", cleanSlug)
    await fs.mkdir(targetDir, { recursive: true })
    return { success: true, folder: `/projects/${cleanSlug}` }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Gagal membuat folder project."
    return { success: false, message: msg }
  }
}

// ponytail: contextual media upload with deduplication into mapped directories
export async function uploadMediaAction(
  formData: FormData
): Promise<{ success: boolean; url?: string; message?: string; isExisting?: boolean }> {
  try {
    const file = formData.get("file") as File | null
    if (!file || typeof file === "string" || !file.name) {
      return { success: false, message: "No file was provided for upload." }
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        message: `File size exceeds the 25 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`,
      }
    }

    const mimeType = file.type.toLowerCase()
    const ext = path.extname(file.name).toLowerCase()
    const isAllowedExt = /\.(jpe?g|png|webp|gif|svg|avif|webm|mp4|ogg)$/i.test(ext)

    if (!ALLOWED_MIME_TYPES.has(mimeType) && !isAllowedExt) {
      return {
        success: false,
        message: "Unsupported file type. Please upload an image (WebP, PNG, JPG, GIF, SVG) or video (WebM, MP4).",
      }
    }

    const targetFolder = (formData.get("targetFolder") as string) || "image"
    const rawSlug = (formData.get("projectSlug") as string)?.trim() || ""
    const cleanSlug = rawSlug.replace(/[^a-zA-Z0-9_-]/g, "-").toLowerCase()

    let uploadDir = ""
    let publicUrlPrefix = ""

    if (targetFolder === "projects") {
      if (cleanSlug) {
        uploadDir = path.join(process.cwd(), "public", "projects", cleanSlug)
        publicUrlPrefix = `/projects/${cleanSlug}`
      } else {
        uploadDir = path.join(process.cwd(), "public", "projects")
        publicUrlPrefix = "/projects"
      }
    } else if (targetFolder === "logos") {
      uploadDir = path.join(process.cwd(), "public", "logos")
      publicUrlPrefix = "/logos"
    } else if (targetFolder === "banner") {
      uploadDir = path.join(process.cwd(), "public")
      publicUrlPrefix = ""
    } else {
      // default: "image"
      uploadDir = path.join(process.cwd(), "public", "image")
      publicUrlPrefix = "/image"
    }

    await fs.mkdir(uploadDir, { recursive: true })

    const safeBaseName =
      path
        .basename(file.name, ext)
        .replace(/[^a-zA-Z0-9_-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase() || "asset"

    const safeExt = ext || (mimeType.startsWith("video/") ? ".webm" : ".webp")
    const cleanFileName = `${safeBaseName}${safeExt}`
    const targetFilePath = path.join(/*turbopackIgnore: true*/ uploadDir, cleanFileName)
    const publicUrl = `${publicUrlPrefix}/${cleanFileName}`.replace(/\/+/g, "/")

    // Deduplication check: if file with identical name already exists in this folder, reuse it!
    try {
      const stat = await fs.stat(/*turbopackIgnore: true*/ targetFilePath)
      if (stat.isFile()) {
        return {
          success: true,
          url: publicUrl,
          message: `File "${cleanFileName}" sudah ada di folder ini. Menggunakan file yang sudah ada.`,
          isExisting: true,
        }
      }
    } catch {
      // File does not exist, proceed to write
    }

    const arrayBuffer = await file.arrayBuffer()
    await fs.writeFile(targetFilePath, Buffer.from(arrayBuffer))

    return {
      success: true,
      url: publicUrl,
      message: `File "${cleanFileName}" berhasil diunggah ke ${publicUrlPrefix || "/"}.`,
      isExisting: false,
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to upload file."
    return { success: false, message: msg }
  }
}

// ponytail: list media assets scoped to specific folder (projects/[slug], logos, image, banner)
export async function listMediaAction(
  targetFolder: "image" | "banner" | "logos" | "projects" | "all" = "all",
  projectSlug?: string
): Promise<{ success: boolean; data: MediaItemInfo[]; message?: string }> {
  try {
    const results: MediaItemInfo[] = []
    const mediaExtRegex = /\.(jpe?g|png|webp|gif|svg|avif|webm|mp4|ogg)$/i
    const cleanSlug = projectSlug?.trim().replace(/[^a-zA-Z0-9_-]/g, "-").toLowerCase()

    const scanDirectory = async (dirPath: string, urlPrefix: string, folderCategory: MediaItemInfo["folder"]) => {
      try {
        const files = await fs.readdir(dirPath)
        for (const file of files) {
          if (file === "uploads") continue
          if (mediaExtRegex.test(file)) {
            const filePath = path.join(dirPath, file)
            const stat = await fs.stat(filePath)
            if (stat.isFile()) {
              results.push({
                url: `${urlPrefix}/${file}`.replace(/\/+/g, "/"),
                name: file,
                size: stat.size,
                mtime: stat.mtime.toISOString(),
                isVideo: /\.(webm|mp4|ogg)$/i.test(file),
                folder: folderCategory,
                projectSlug: cleanSlug,
              })
            }
          }
        }
      } catch {
        // directory does not exist yet or cannot be read
      }
    }

    // 1. Projects (either project-specific or general projects)
    if (targetFolder === "projects" || targetFolder === "all") {
      if (cleanSlug) {
        const projectSpecificDir = path.join(process.cwd(), "public", "projects", cleanSlug)
        await scanDirectory(projectSpecificDir, `/projects/${cleanSlug}`, "projects")
      }
      // Also scan root public/projects for hero thumbs
      const generalProjectsDir = path.join(process.cwd(), "public", "projects")
      await scanDirectory(generalProjectsDir, "/projects", "projects")
    }

    // 2. Logos (public/logos)
    if (targetFolder === "logos" || targetFolder === "all") {
      const logosDir = path.join(process.cwd(), "public", "logos")
      await scanDirectory(logosDir, "/logos", "logos")
    }

    // 3. Image (public/image)
    if (targetFolder === "image" || targetFolder === "all") {
      const imageDir = path.join(process.cwd(), "public", "image")
      await scanDirectory(imageDir, "/image", "image")
    }

    // 4. Banner (public/)
    if (targetFolder === "banner" || targetFolder === "all") {
      const publicDir = path.join(process.cwd(), "public")
      try {
        const files = await fs.readdir(publicDir)
        const systemFiles = new Set(["favicon.ico", "robots.txt", "sitemap.xml", "manifest.webmanifest"])
        for (const file of files) {
          if (systemFiles.has(file)) continue
          if (mediaExtRegex.test(file)) {
            const filePath = path.join(publicDir, file)
            const stat = await fs.stat(filePath)
            if (stat.isFile()) {
              results.push({
                url: `/${file}`,
                name: file,
                size: stat.size,
                mtime: stat.mtime.toISOString(),
                isVideo: /\.(webm|mp4|ogg)$/i.test(file),
                folder: "banner",
              })
            }
          }
        }
      } catch {
        // ignore
      }
    }

    // Sort newest first
    results.sort((a, b) => new Date(b.mtime).getTime() - new Date(a.mtime).getTime())

    return { success: true, data: results }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to list media files."
    return { success: false, data: [], message: msg }
  }
}

// Protected critical files that can NEVER be deleted
const PROTECTED_FILES = new Set([
  "banner.webp",
  "profile.webp",
  "profile2.webp",
  "og.png",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "manifest.webmanifest",
  "preview-email.html",
  "preview-owner.html",
])

// ponytail: safely delete media files from public/image, public/logos, public/projects, or public/
export async function deleteMediaAction(
  urlOrPath: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (!urlOrPath || typeof urlOrPath !== "string") {
      return { success: false, message: "Path media tidak valid." }
    }

    const clean = urlOrPath.trim().split("?")[0] || ""
    if (clean.includes("..") || clean.includes("\0")) {
      return { success: false, message: "Path traversal tidak diizinkan." }
    }

    const fileName = path.basename(clean)
    if (PROTECTED_FILES.has(fileName)) {
      return {
        success: false,
        message: `File "${fileName}" adalah file sistem penting dan diproteksi dari penghapusan.`,
      }
    }

    // Must be a path starting with /
    if (!clean.startsWith("/")) {
      return { success: false, message: "Format path media tidak dikenali." }
    }

    // Remove leading slash and resolve relative to public/
    const relativePart = clean.replace(/^\/+/, "")
    const targetFilePath = path.join(process.cwd(), "public", relativePart)

    // Security check: ensure resolved path is strictly inside public directory
    const publicRoot = path.join(process.cwd(), "public")
    if (!targetFilePath.startsWith(publicRoot)) {
      return { success: false, message: "Akses di luar folder public ditolak." }
    }

    // Check existence
    try {
      await fs.access(targetFilePath)
    } catch {
      return { success: false, message: "File tidak ditemukan di disk." }
    }

    await fs.unlink(targetFilePath)
    return { success: true, message: `File "${fileName}" berhasil dihapus dari server.` }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Gagal menghapus file media."
    return { success: false, message: msg }
  }
}
