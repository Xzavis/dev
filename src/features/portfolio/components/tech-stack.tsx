"use client"

import defaultSkills from "@/content/skills.json"
import type { TechStack as TechStackType } from "@/lib/content/types"
import { useTranslation } from "@/lib/i18n/use-translation"

import { Panel, PanelHeader, PanelTitle } from "./panel"

export const STACK_CATEGORIES = [
  "AI / ML",
  "Frontend",
  "Backend",
  "DevOps / Cloud",
]

export function TechStack({ skills = defaultSkills as unknown as TechStackType[] }: { skills?: TechStackType[] } = {}) {
  const { t } = useTranslation()
  const grouped = groupByCategory(skills)

  return (
    <Panel id="stack">
      <PanelHeader>
        <PanelTitle>{t.techStack.title}</PanelTitle>
      </PanelHeader>

      <div className="relative [--badge-height:--spacing(6)] [--col-left-width:--spacing(48)]">
        <div
          className="pointer-events-none absolute inset-y-0 left-(--col-left-width) -z-1 w-px bg-[linear-gradient(to_bottom,var(--line)_4px,transparent_2px)] bg-size-[1px_6px] bg-repeat-y max-sm:hidden"
          aria-hidden
        />

        {STACK_CATEGORIES.map((category, index) => {
          const items = grouped[category]
          if (!items || items.length === 0) return null

          return (
            <div
              key={category}
              className="grid items-start gap-y-2 border-b border-line py-4 last:border-none sm:grid-cols-[var(--col-left-width)_1fr]"
            >
              <div className="pl-4 text-sm/[--badge-height] text-muted-foreground">
                <span className="mr-1.5 font-mono text-muted-foreground select-none">
                  {(index + 1).toString().padStart(2, "0")}
                </span>
                {category}
              </div>

              <ul className="flex flex-wrap gap-1.5 px-4">
                {items.map((tech) => {
                  return (
                    <li key={tech.key} className="flex">
                      <a
                        href={tech.href}
                        target="_blank"
                        rel="noopener"
                        className="flex h-(--badge-height) items-center justify-center gap-1.5 rounded-lg bg-muted/60 px-1.75 font-mono text-xs text-foreground inset-ring-1 inset-ring-border transition-colors hover:bg-muted/90 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:text-muted-foreground/80"
                      >
                        {tech.iconId ? (
                          <svg viewBox="0 0 24 24" aria-hidden>
                            <use href={`/icons/tech-stack-v1.svg?v=2#${tech.iconId}`} />
                          </svg>
                        ) : null}
                        {tech.title}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

function groupByCategory(
  items: TechStackType[]
): Record<string, TechStackType[]> {
  return items.reduce<Record<string, TechStackType[]>>((acc, item) => {
    for (const category of item.categories) {
      ;(acc[category] ??= []).push(item)
    }
    return acc
  }, {})
}
