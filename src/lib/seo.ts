import type { Metadata } from "next"

import { SITE_INFO } from "@/config/site"
import profile from "@/content/profile.json"

export const SITE_OG_IMAGE = {
  url: SITE_INFO.ogImage,
  width: 1920,
  height: 958,
  type: "image/png",
  alt: `${profile.displayName} portfolio - ${profile.jobTitle}`,
} as const

type PageMetadataOptions = {
  title: string
  description: string
  path: string
  keywords: string[]
}

export function createPageMetadata({
  title,
  description,
  path,
  keywords,
}: PageMetadataOptions): Metadata {
  return {
    title,
    description,
    keywords,
    authors: [{ name: profile.displayName, url: SITE_INFO.url }],
    creator: profile.displayName,
    publisher: profile.displayName,
    alternates: {
      canonical: path,
    },
    openGraph: {
      siteName: profile.displayName,
      url: path,
      type: "website",
      title,
      description,
      images: [SITE_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: `@${profile.username}`,
      images: [SITE_OG_IMAGE.url],
    },
  }
}
