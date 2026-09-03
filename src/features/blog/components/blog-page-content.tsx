// Server Component - no client JS, rendered at build/ISR time.

import { BookOpenIcon } from "lucide-react"
import Image from "next/image"

import { Reveal } from "@/components/core/reveal"
import type { MediumPost } from "@/features/blog/lib/fetch-medium-posts"
import { fetchMediumPosts } from "@/features/blog/lib/fetch-medium-posts"
import { getBlogPosts } from "@/lib/content"

import { BlogEmptyState } from "./blog-empty-state"

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    })
  } catch {
    return dateStr
  }
}

function BlogListItem({ post, eager }: { post: MediumPost; eager?: boolean }) {
  return (
    <Reveal>
      <div className="group border-b border-line bg-background transition-[background-color] ease-out hover:bg-accent-muted">
        <a
          href={post.link}
          target={post.link.startsWith("http") ? "_blank" : undefined}
          rel={post.link.startsWith("http") ? "noopener noreferrer" : undefined}
          aria-label={`Read "${post.title}"`}
          className="flex items-start gap-4 px-4 py-5 transition-[background-color] ease-out hover:bg-accent-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset sm:px-6"
        >
          {/* Left: text content */}
          <div className="min-w-0 flex-1">
            {/* Author row - avatar + name + dot + date */}
            <div className="mb-2.5 flex items-center gap-2">
              <div className="relative size-5 shrink-0 overflow-hidden rounded-full border border-line bg-muted">
                <Image
                  src="/image/profile.webp"
                  alt=""
                  fill
                  sizes="20px"
                  className="object-cover"
                />
              </div>
              <span className="text-[13px] text-foreground/80">
                Firdaus Khotibul Zickrian
              </span>
              <span className="text-muted-foreground/60 select-none">·</span>
              <time
                dateTime={post.pubDate}
                className="text-xs text-muted-foreground"
              >
                {formatDate(post.pubDate)}
              </time>
            </div>

            {/* Title */}
            <h2 className="mb-1.5 font-sans text-base font-medium tracking-tight text-foreground transition-colors duration-150 group-hover:text-primary sm:text-lg">
              {post.title}
            </h2>

            {/* Excerpt - single line on mobile, 2 lines from sm */}
            <p className="line-clamp-1 text-[13px] leading-relaxed text-muted-foreground sm:line-clamp-2 sm:text-sm">
              {post.description}
            </p>

            {/* Category tag */}
            {post.categories && post.categories.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {post.categories.slice(0, 3).map((category) => (
                  <span
                    key={category}
                    className="rounded-full bg-surface-primary px-2.5 py-0.5 text-xs text-muted-foreground"
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right: thumbnail image */}
          {post.thumbnail && (
            <div className="relative mt-7 h-17 w-26 shrink-0 overflow-hidden rounded-md border border-line bg-muted sm:mt-7.5 sm:h-21 sm:w-32">
              <Image
                src={post.thumbnail}
                alt=""
                fill
                sizes="128px"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                loading={eager ? "eager" : "lazy"}
                fetchPriority={eager ? "high" : "auto"}
              />
            </div>
          )}
        </a>
      </div>
    </Reveal>
  )
}

export async function BlogPageContent() {
  const [localPosts, mediumPosts] = await Promise.all([
    getBlogPosts().catch(() => []),
    fetchMediumPosts().catch(() => []),
  ])

  // Filter published local posts
  const publishedLocal: MediumPost[] = localPosts
    .filter((p) => p.status !== "draft")
    .map((p) => ({
      title: p.title,
      link: p.link || `/blog#${p.slug}`,
      pubDate: p.publishedAt,
      description: p.description,
      thumbnail: p.thumbnail || null,
      categories: p.categories || [],
      guid: p.id || p.slug,
    }))

  // If local posts exist, combine them with any non-duplicate Medium posts
  let posts: MediumPost[] = []
  if (publishedLocal.length > 0) {
    const existingTitles = new Set(publishedLocal.map((p) => p.title.toLowerCase().trim()))
    const nonDuplicateMedium = mediumPosts.filter(
      (mp) => !existingTitles.has(mp.title.toLowerCase().trim())
    )
    posts = [...publishedLocal, ...nonDuplicateMedium]
  } else {
    posts = mediumPosts
  }

  if (!posts.length) {
    return (
      <div className="flex flex-col items-center gap-3 border-b border-line px-4 py-14 text-center">
        <BookOpenIcon className="size-5 text-muted-foreground" />
        <BlogEmptyState />
      </div>
    )
  }

  return (
    <div>
      {posts.map((post, index) => (
        <BlogListItem key={post.guid} post={post} eager={index === 0} />
      ))}
    </div>
  )
}
