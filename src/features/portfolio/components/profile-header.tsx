"use client"

import { BriefcaseBusiness, Globe2, MapPin } from "lucide-react"
import Image from "next/image"

import { VerifiedIcon } from "@/features/portfolio/components/verified-icon"
import { SOCIAL_LINKS } from "@/features/portfolio/data/social-links"
import { USER } from "@/features/portfolio/data/user"
import { useTranslation } from "@/lib/i18n/use-translation"

export function ProfileHeader() {
  const { l } = useTranslation()

  return (
    <header
      id="about"
      className="relative z-1 border border-line bg-card max-md:border-x-0"
    >
      <div className="relative h-36 overflow-hidden border-b border-line sm:h-44">
        <Image
          src="/banner.webp"
          alt="Profile Banner"
          fill
          loading="eager"
          fetchPriority="high"
          sizes="(min-width: 768px) 720px, 100vw"
          className="object-cover object-center"
        />
      </div>

      <div className="relative px-5 pb-5 sm:px-6 sm:pb-6">
        <div className="relative -mt-12 size-24 overflow-hidden rounded-full border-4 border-card bg-muted shadow-sm sm:-mt-14 sm:size-28">
          <Image
            src={USER.avatar}
            alt={`Portrait of ${USER.displayName}`}
            fill
            sizes="(min-width: 640px) 104px, 88px"
            className="size-full object-cover object-[center_35%]"
          />
        </div>

        <div className="mt-3 min-w-0">
          <h1 className="flex items-center gap-1.5 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            <span>{USER.displayName}</span>
            <VerifiedIcon
              className="size-[0.9em] shrink-0 text-[#1d9bf0]"
              aria-label="Verified profile"
              role="img"
            />
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            @{USER.username}
          </p>
        </div>

        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground sm:text-base">
          {l(USER.about, USER.aboutId)}
        </p>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <BriefcaseBusiness className="size-4" aria-hidden />
            {USER.jobTitle}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-4" aria-hidden />
            {USER.address}
          </span>
          <a
            href={USER.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <Globe2 className="size-4" aria-hidden />
            zickrian.dev
          </a>
        </div>

        <div className="mt-5 border-t border-line pt-4">
          <h2 className="sr-only">Social links</h2>
          <ul className="flex flex-wrap gap-2">
            {SOCIAL_LINKS.map((link) => (
              <li key={link.title}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  aria-label={link.title}
                  title={link.title}
                  className="flex size-10 items-center justify-center rounded-lg border border-line bg-card text-muted-foreground transition-[background-color,color,border-color,transform] hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card focus-visible:outline-none"
                >
                  <span className="size-[18px] [&>svg]:size-full">
                    {link.icon}
                  </span>
                  <span className="sr-only">{link.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  )
}
