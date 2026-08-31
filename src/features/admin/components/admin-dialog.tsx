"use client"

// ponytail: lightweight accessible modal and alert dialog primitive
import { AlertTriangleIcon, XIcon } from "lucide-react"
import React, { useEffect, useRef } from "react"
import { createPortal } from "react-dom"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface AdminDialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: React.ReactNode
  footer?: React.ReactNode
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl"
}

export function AdminDialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "md",
}: AdminDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose()
      }
    }
    if (open) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.body.style.overflow = "unset"
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, onClose])

  if (!open || typeof window === "undefined") return null

  const widthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  }[maxWidth]

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Dialog box */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 w-full rounded-xl border border-border bg-card p-6 shadow-2xl transition-all animate-in zoom-in-95 dark:border-line dark:bg-card",
          widthClasses
        )}
      >
        <div className="flex items-start justify-between gap-4 pb-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
            {description && (
              <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close dialog"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        {children && <div className="py-2 text-sm text-foreground">{children}</div>}

        {footer && <div className="mt-6 flex items-center justify-end gap-2.5 pt-2">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}

export interface AdminAlertDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "destructive" | "default"
  isLoading?: boolean
}

export function AdminAlertDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Continue",
  cancelText = "Cancel",
  variant = "destructive",
  isLoading = false,
}: AdminAlertDialogProps) {
  return (
    <AdminDialog
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3 text-xs text-muted-foreground leading-relaxed">
        {variant === "destructive" && (
          <AlertTriangleIcon className="size-5 shrink-0 text-destructive mt-0.5" />
        )}
        <div>{description}</div>
      </div>
    </AdminDialog>
  )
}
