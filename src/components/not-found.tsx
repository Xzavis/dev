"use client"

import { ArrowRightIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n/use-translation"
import { cn } from "@/lib/utils"

export function NotFound({ className }: { className?: string }) {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        "flex h-[calc(100svh-5.5rem)] flex-col items-center justify-center",
        className
      )}
    >
      <svg
        className="h-28 w-full text-border"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 514 258"
        fill="none"
      >
        <path
          d="M65 193v64h128v-64H65Zm0 0H1V65h64m0 128V65m384 0H321v128h128m0-128V1H257v256h192v-64m0-128v128m0-128h64v128h-64M65 65h128V1H65v64Z"
          stroke="currentColor"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <h1 className="mt-6 mb-3 text-8xl font-medium tracking-tighter tabular-nums">
        404
      </h1>

      {/* The page used to offer a number and a button and no sentence - no
          statement of what happened, and no second route out. */}
      <p className="mb-6 max-w-xs px-4 text-center text-sm text-balance text-muted-foreground">
        {t.notFound.message}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2 px-4">
        <Button asChild>
          <Link href="/" prefetch={false}>
            {t.notFound.goHome}
            <ArrowRightIcon />
          </Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/projects" prefetch={false}>
            {t.notFound.browseProjects}
          </Link>
        </Button>
      </div>
    </div>
  )
}
