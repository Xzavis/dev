import profile from "@/content/profile.json"
import settings from "@/content/settings.json"
import type { NavItem } from "@/types/nav"

const DEFAULT_SITE_URL = "https://www.zickrian.dev"

function normalizeSiteUrl(value?: string) {
  if (!value) return DEFAULT_SITE_URL

  const url = value.startsWith("http") ? value : `https://${value}`
  return url.replace(/\/+$/, "")
}

export const SITE_INFO = {
  name: profile.displayName,
  url: normalizeSiteUrl(process.env.APP_URL),
  ogImage: settings.ogImage,
  description: settings.seoDescription ?? profile.bio,
  keywords: settings.keywords,
}

export const META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#000000",
}

export const MAIN_NAV: NavItem[] = [
  {
    title: "Projects",
    href: "/projects",
  },
  {
    title: "Blog",
    href: "/blog",
  },
  {
    title: "Gallery",
    href: "/gallery",
  },
]

export const X_HANDLE = "@zickrian"
export const GITHUB_USERNAME = "zickrian"
export const UTM_PARAMS = {
  utm_source: "zickrian",
}
