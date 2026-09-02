import "@/styles/globals.css"

import type { Metadata, Viewport } from "next"
import dynamic from "next/dynamic"
import type { Person, ProfilePage, WebSite, WithContext } from "schema-dts"

import { Providers } from "@/components/providers"
import { META_THEME_COLORS, SITE_INFO } from "@/config/site"
import profile from "@/content/profile.json"
import settings from "@/content/settings.json"
import { SITE_OG_IMAGE } from "@/lib/seo"
import { decodeEmail } from "@/utils/string"

const Analytics =
  process.env.VERCEL === "1"
    ? dynamic(() => import("@vercel/analytics/next").then((m) => m.Analytics))
    : null
const SpeedInsights =
  process.env.VERCEL === "1"
    ? dynamic(() =>
        import("@vercel/speed-insights/next").then((m) => m.SpeedInsights)
      )
    : null

const fallbackProfileTitle = `${profile.displayName} | AI & Machine Learning Engineer`
const profileTitle = settings.seoTitle ?? fallbackProfileTitle
const profileDescription = settings.seoDescription ?? profile.bio

function absoluteUrl(pathOrUrl: string) {
  if (pathOrUrl.startsWith("http")) return pathOrUrl
  return `${SITE_INFO.url}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`
}

function getWebSiteJsonLd(): WebSite {
  return {
    "@type": "WebSite",
    "@id": `${SITE_INFO.url}/#website`,
    url: SITE_INFO.url,
    name: SITE_INFO.name,
    description: profileDescription,
    inLanguage: "en-US",
    publisher: {
      "@id": `${SITE_INFO.url}/#person`,
    },
  }
}

function getProfilePageJsonLd(): WithContext<ProfilePage> {
  const email = decodeEmail(profile.email)
  const person: Person = {
    "@type": "Person",
    "@id": `${SITE_INFO.url}/#person`,
    name: profile.displayName,
    alternateName: [profile.username],
    url: SITE_INFO.url,
    image: absoluteUrl(profile.avatar),
    jobTitle: profile.jobTitle,
    email: `mailto:${email}`,
    telephone: profile.phone,
    description: profileDescription,
    knowsAbout: settings.keywords,
    sameAs: profile.sameAs,
    worksFor: (profile.jobs ?? []).map((job) => ({
      "@type": "Organization",
      name: job.company,
      url: job.website,
    })),
    address: {
      "@type": "PostalAddress",
      addressCountry: profile.address,
    },
    mainEntityOfPage: `${SITE_INFO.url}/#profilepage`,
  }

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${SITE_INFO.url}/#profilepage`,
    url: SITE_INFO.url,
    name: profileTitle,
    description: profileDescription,
    mainEntity: person,
  }
}

function getRootJsonLd() {
  const profilePage = getProfilePageJsonLd()
  const { "@context": context, ...profilePageGraphNode } = profilePage

  return {
    "@context": context,
    "@graph": [getWebSiteJsonLd(), profilePageGraphNode],
  }
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_INFO.url),
  title: {
    template: `%s | ${profile.displayName}`,
    default: profileTitle,
  },
  description: profileDescription,
  keywords: settings.keywords,
  applicationName: SITE_INFO.name,
  authors: [
    {
      name: profile.displayName,
      url: SITE_INFO.url,
    },
  ],
  creator: profile.displayName,
  publisher: profile.displayName,
  openGraph: {
    siteName: profile.displayName,
    url: "/",
    type: "website",
    locale: "en_US",
    title: profileTitle,
    description: profileDescription,
    images: [{ ...SITE_OG_IMAGE, url: absoluteUrl(SITE_OG_IMAGE.url) }],
  },
  twitter: {
    card: "summary_large_image",
    title: profileTitle,
    description: profileDescription,
    creator: `@${profile.username}`,
    images: [absoluteUrl(SITE_OG_IMAGE.url)],
  },
  alternates: {
    canonical: "/",
  },
  appleWebApp: {
    title: SITE_INFO.name,
    capable: true,
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-visual",
  themeColor: META_THEME_COLORS.dark,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/fonts/geist-sans-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getRootJsonLd()).replace(/</g, "\\u003c"),
          }}
        />
      </head>

      <body className="bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
        {Analytics ? <Analytics /> : null}
        {SpeedInsights ? <SpeedInsights /> : null}
      </body>
    </html>
  )
}
