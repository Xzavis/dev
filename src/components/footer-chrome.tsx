"use client"

import Link from "next/link"

import { useTranslation } from "@/lib/i18n/use-translation"

const INDEX_LABEL_KEYS: Record<string, "home" | "projects" | "blog" | "gallery"> = {
  "/": "home",
  "/projects": "projects",
  "/blog": "blog",
  "/gallery": "gallery",
}

export function FooterLabel({ k }: { k: "contact" | "index" }) {
  const { t } = useTranslation()
  return <>{t.footer[k]}</>
}

export function FooterIndexList({
  links,
}: {
  links: { title: string; href: string }[]
}) {
  const { t } = useTranslation()

  return (
    <ul>
      {links.map(({ title, href }) => {
        const key = INDEX_LABEL_KEYS[href]
        return (
          <li key={href}>
            <Link
              href={href}
              prefetch={false}
              className="inline-flex w-fit transition-[color] hover:text-foreground"
            >
              {key ? t.nav[key] : title}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
