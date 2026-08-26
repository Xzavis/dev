import type { MetadataRoute } from "next"

import { META_THEME_COLORS, SITE_INFO } from "@/config/site"
import { USER } from "@/features/portfolio/data/user"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${USER.displayName} - AI & Machine Learning Portfolio`,
    short_name: USER.displayName,
    description: SITE_INFO.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: META_THEME_COLORS.light,
    theme_color: META_THEME_COLORS.light,
    categories: ["portfolio", "technology", "productivity"],
    lang: "en-US",
    icons: [
      {
        src: "/icons/seo.webp",
        sizes: "900x900",
        type: "image/webp",
        purpose: "maskable",
      },
    ],
  }
}
