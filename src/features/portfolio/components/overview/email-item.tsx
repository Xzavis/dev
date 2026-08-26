"use client"

import { MailIcon } from "lucide-react"

import { CopyButton } from "@/components/copy-button"
import { decodeEmail } from "@/utils/string"

import {
  IntroItem,
  IntroItemContent,
  IntroItemIcon,
  IntroItemLink,
} from "./intro-item"

type EmailItemProps = {
  email: string
}

export function EmailItem({ email }: EmailItemProps) {
  const emailDecoded = decodeEmail(email)

  return (
    <IntroItem className="group">
      <IntroItemIcon>
        <MailIcon />
      </IntroItemIcon>

      <IntroItemContent className="flex">
        <IntroItemLink href={`mailto:${emailDecoded}`}>
          {emailDecoded}
        </IntroItemLink>
      </IntroItemContent>

      {/* Hover-only meant this control did not exist on a phone; coarse
          pointers get it permanently. */}
      <div className="-translate-x-3 translate-y-0.5 opacity-0 transition-opacity ease-out group-hover:opacity-100 focus-within:opacity-100 pointer-coarse:opacity-100">
        <CopyButton
          className="rounded-md border-none text-muted-foreground [&_svg:not([class*='size-'])]:size-4"
          variant="ghost"
          size="icon-xs"
          text={() => emailDecoded}
        />
      </div>
    </IntroItem>
  )
}
