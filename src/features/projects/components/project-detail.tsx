"use client"

import { ExternalLinkIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Icons } from "@/components/icons"
import { Markdown } from "@/components/markdown"
import { SectionSeparator } from "@/components/section-separator"
import { Tag } from "@/components/ui/tag"
import { Prose } from "@/components/ui/typography"
import type { Project } from "@/features/portfolio/types/projects"
import { useTranslation } from "@/lib/i18n/use-translation"

import { ProjectGallery } from "./project-gallery"

function isExternalUrl(value: string) {
  return /^https?:\/\//.test(value)
}

export function ProjectDetail({ project }: { project: Project }) {
  const { t, l } = useTranslation()

  return (
    <article className="relative z-1 -mt-px border-x border-line bg-background max-md:border-x-0">
      {/* Sticky back nav */}
      <div className="sticky top-14 z-30 border-b border-line bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/75">
        <div className="flex h-12 items-center justify-between gap-3 px-4 md:px-8">
          <Link
            href="/projects"
            prefetch={false}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            {t.projectDetail.backToProjects}
          </Link>

          <span className="min-w-0 truncate font-handwritten text-[1.1rem] tracking-wide text-muted-foreground">
            {l(project.category, project.categoryId)}
          </span>
        </div>
      </div>

      {/* Hero section */}
      <header className="space-y-6 px-4 pt-6 pb-8 md:px-8">
        {/* Title */}
        <h1 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
          {project.title}
        </h1>

        {/* Tagline */}
        <p className="max-w-2xl leading-7 text-muted-foreground">
          {l(project.tagline, project.taglineId)}
        </p>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {project.links.live && isExternalUrl(project.links.live) && (
            <a
              href={project.links.live}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-card px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-foreground/25 hover:bg-muted dark:border-transparent dark:bg-foreground dark:text-background dark:hover:opacity-90"
            >
              <ExternalLinkIcon className="size-4" />
              {t.projectDetail.liveDemo}
            </a>
          )}
          {project.links.live && !isExternalUrl(project.links.live) && (
            <span className="inline-flex items-center gap-2 rounded-lg border border-line bg-card/50 px-4 py-2 text-sm font-medium text-muted-foreground">
              <ExternalLinkIcon className="size-4" />
              {project.links.live}
            </span>
          )}
          {project.links.repo && isExternalUrl(project.links.repo) && (
            <a
              href={project.links.repo}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-card px-4 py-2 text-sm font-medium text-foreground transition-[background-color,color,border-color,transform] hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <Icons.github className="size-4" />
              {t.projectDetail.sourceCode}
            </a>
          )}
          {project.links.repo && !isExternalUrl(project.links.repo) && (
            <span className="inline-flex items-center gap-2 rounded-lg border border-line bg-card/50 px-4 py-2 text-sm font-medium text-muted-foreground">
              <Icons.github className="size-4" />
              {project.links.repo}
            </span>
          )}
        </div>
      </header>

      {/* Image / Gallery */}
      <section className="relative border-b border-line px-4 py-6 md:px-8">
        {/* Ambient background glow */}
        <div className="pointer-events-none absolute inset-0 -z-1 flex items-center justify-center">
          <div className="h-[60%] w-[80%] rounded-[50%] bg-foreground/15 blur-[60px] sm:blur-[80px] dark:bg-white/25" />
        </div>

        {project.videoEmbed ? (
          <figure className="relative aspect-video overflow-hidden rounded-xl border border-line bg-background shadow-sm">
            {project.videoEmbed.src.endsWith(".mp4") ? (
              <video
                src={project.videoEmbed.src}
                controls
                preload="none"
                poster={project.image}
                muted
                loop
                playsInline
                className="absolute inset-0 size-full object-contain"
              />
            ) : (
              <iframe
                src={project.videoEmbed.src}
                title={project.videoEmbed.title}
                className="absolute inset-0 size-full"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            )}
          </figure>
        ) : project.gallery && project.gallery.length > 0 ? (
          <ProjectGallery images={project.gallery} title={project.title} />
        ) : (
          <figure className="relative aspect-video overflow-hidden rounded-xl border border-line bg-background shadow-sm">
            <Image
              src={project.image}
              alt={project.title}
              fill
              sizes="(min-width: 768px) 720px, 100vw"
              loading="eager"
              fetchPriority="high"
              className="object-contain"
              quality={85}
            />
          </figure>
        )}
      </section>

      {/* Project metadata grid */}
      <section className="relative grid gap-px border-b border-line bg-line sm:grid-cols-3">
        <MetaCard
          label={t.projectDetail.ownership}
          value={l(project.collaboration.ownership, project.collaboration.ownershipId)}
        />
        <MetaCard
          label={t.projectDetail.role}
          value={l(project.collaboration.role, project.collaboration.roleId)}
        />
        <MetaCard label={t.projectDetail.team} value={project.collaboration.team} />
      </section>

      {/* My contributions */}
      <Section title={t.projectDetail.myRole}>
        <ul className="space-y-3">
          {l(project.collaboration.contributions, project.collaboration.contributionsId).map(
            (item, i) => (
              <li key={i} className="flex items-baseline gap-3 text-sm leading-7">
                <span className="mt-0.5 shrink-0 font-handwritten text-[1.1rem] tracking-wide text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{item}</span>
              </li>
            )
          )}
        </ul>
      </Section>

      {/* Features */}
      <Section title={t.projectDetail.features}>
        <ul className="space-y-3">
          {l(project.features, project.featuresId).map((item, i) => (
            <li key={i} className="flex items-baseline gap-3 text-sm leading-7">
              <span className="mt-0.5 shrink-0 font-handwritten text-[1.1rem] tracking-wide text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Impact */}
      <Section title={t.projectDetail.impact}>
        <ul className="space-y-3">
          {l(project.impact, project.impactId).map((item, i) => (
            <li key={i} className="flex items-baseline gap-3 text-sm leading-7">
              <span className="size-1.5 shrink-0 -translate-y-px rounded-full bg-foreground" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Tech Stack */}
      <Section title={t.projectDetail.stack}>
        <div className="flex flex-wrap gap-1.5">
          {project.skills.map((skill) => (
            <Tag key={skill} className="px-2.5 py-1 text-xs">
              {skill}
            </Tag>
          ))}
        </div>
      </Section>

      {/* Notes */}
      {project.notes && (
        <Section title={t.projectDetail.notes}>
          <Prose className="text-sm leading-7 text-muted-foreground">
            <Markdown>{l(project.notes, project.notesId)}</Markdown>
          </Prose>
        </Section>
      )}

      {/* Was a bare 48px void: the last section's bottom rule plus the
          article's side rules boxed in an empty rectangle before the footer.
          The hatched band fills it and turns that rule into its top edge, the
          same way every other page now closes. */}
      <SectionSeparator sides={false} />
    </article>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="relative border-b border-line px-4 py-8 md:px-8">
      <h2 className="mb-5 font-handwritten text-[1.1rem] tracking-[0.18em] text-muted-foreground uppercase">
        {title}
      </h2>
      {children}
    </section>
  )
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background px-4 py-5 md:px-6">
      <dt className="mb-1 font-handwritten text-[1rem] tracking-[0.18em] text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="text-sm leading-6 font-medium">{value}</dd>
    </div>
  )
}
