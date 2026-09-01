"use client"

// ponytail: admin top header with fast GitHub publish trigger and sync indicator
import { CheckCircle2Icon, GitCommitIcon, Loader2Icon, SparklesIcon } from "lucide-react"
import React, { useState } from "react"

import { Button } from "@/components/ui/button"

import { publishToGitHubAction } from "../actions/content-actions"
import { AdminDialog } from "./admin-dialog"
import { FormInput } from "./admin-form-elements"
import { useToast } from "./admin-toast"

export function AdminHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}) {
  const [publishOpen, setPublishOpen] = useState(false)
  const [commitMessage, setCommitMessage] = useState("")
  const [isPublishing, setIsPublishing] = useState(false)
  const { success, error } = useToast()

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPublishing(true)
    const msg = commitMessage.trim() || `Update portfolio content via Admin Dashboard (${new Date().toLocaleDateString()})`

    try {
      const res = await publishToGitHubAction(msg)
      if (res.success) {
        success(res.message)
        setPublishOpen(false)
        setCommitMessage("")
      } else {
        error(res.message)
      }
    } catch {
      error("Failed to commit changes to GitHub.")
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 dark:border-line">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {actions}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPublishOpen(true)}
            className="gap-1.5 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
          >
            <GitCommitIcon className="size-3.5" />
            <span>Publish to Git</span>
          </Button>
        </div>
      </div>

      {/* Publish Dialog */}
      <AdminDialog
        open={publishOpen}
        onClose={() => !isPublishing && setPublishOpen(false)}
        title="Publish to GitHub & Deploy"
        description="This creates a Git commit and automatically triggers your Vercel deployment pipeline."
        maxWidth="md"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPublishOpen(false)}
              disabled={isPublishing}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handlePublish}
              disabled={isPublishing}
              className="gap-1.5"
            >
              {isPublishing ? (
                <>
                  <Loader2Icon className="size-3.5 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <GitCommitIcon className="size-3.5" />
                  <span>Commit & Deploy</span>
                </>
              )}
            </Button>
          </>
        }
      >
        <form onSubmit={handlePublish} className="space-y-3">
          <div className="rounded-lg border border-border/80 bg-muted/40 p-3 text-xs text-muted-foreground space-y-1 dark:border-line">
            <div className="font-medium text-foreground flex items-center gap-1.5">
              <SparklesIcon className="size-3 text-primary" /> CI/CD Automation Flow:
            </div>
            <p>1. Validates all content changes</p>
            <p>2. Commits content updates to GitHub repository</p>
            <p>3. Vercel automatically deploys new build to live site</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Commit Message (Optional)
            </label>
            <FormInput
              placeholder="e.g. Update project case studies and profile bio"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              disabled={isPublishing}
            />
          </div>
        </form>
      </AdminDialog>
    </>
  )
}
