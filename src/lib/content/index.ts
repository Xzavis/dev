import "server-only"

import { LocalContentRepository } from "./local-repo"
import type {
  Award,
  BlogPost,
  Certification,
  Experience,
  GalleryItem,
  Profile,
  Project,
  Publication,
  SiteSettings,
  SocialLink,
  TechStack,
} from "./types"

export { LocalContentRepository }

/**
 * Server-only Content Loader for zickrian.dev
 * Reads bundled JSON content directly from /content/
 */
export async function getProfile(): Promise<Profile> {
  return LocalContentRepository.getProfile()
}

export async function getSettings(): Promise<SiteSettings> {
  return LocalContentRepository.getSettings()
}

export async function getProjects(): Promise<Project[]> {
  return LocalContentRepository.getProjects()
}

export async function getProjectById(slug: string): Promise<Project | undefined> {
  const project = await LocalContentRepository.getProjectById(slug)
  return project ?? undefined
}

export async function getExperiences(): Promise<Experience[]> {
  return LocalContentRepository.getExperiences()
}

export async function getSkills(): Promise<TechStack[]> {
  return LocalContentRepository.getSkills()
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  return LocalContentRepository.getSocialLinks()
}

export async function getAwards(): Promise<Award[]> {
  return LocalContentRepository.getAwards()
}

export async function getCertifications(): Promise<Certification[]> {
  return LocalContentRepository.getCertifications()
}

export async function getPublications(): Promise<Publication[]> {
  return LocalContentRepository.getPublications()
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  return LocalContentRepository.getGalleryItems()
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  return LocalContentRepository.getBlogPosts()
}

