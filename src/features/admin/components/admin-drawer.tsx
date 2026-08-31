"use client"

// ponytail: mobile-first slide-up drawer for navigation and responsive editing
import { XIcon } from "lucide-react"
import React, { useEffect } from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"

export interface AdminDrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  position?: "bottom" | "left"
}

export function AdminDrawer({
  open,
  onClose,
  title,
  children,
  position = "left",
}: AdminDrawerProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [open])

  if (!open || typeof window === "undefined") return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div
        className={cn(
          "relative z-10 flex flex-col bg-card border-border shadow-2xl transition-transform animate-in dark:border-line dark:bg-card",
          position === "left"
            ? "h-full w-4/5 max-w-xs border-r slide-in-from-left duration-300"
            : "fixed bottom-0 left-0 right-0 max-h-[85vh] rounded-t-2xl border-t slide-in-from-bottom duration-300"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 dark:border-line">
          {title ? (
            <h2 className="text-sm font-semibold text-foreground tracking-tight">{title}</h2>
          ) : (
            <div className="h-4" />
          )}
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close menu"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>,
    document.body
  )
}
