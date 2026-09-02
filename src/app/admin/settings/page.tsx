"use client"

// ponytail: compact settings panel covering Site, SEO, Publishing and Git Sync without token leaks
import {
  CheckCircle2Icon,
  GitBranchIcon,
  GlobeIcon,
  SaveIcon,
  SearchIcon,
  ShieldCheckIcon,
} from "lucide-react"
import React, { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Tag } from "@/components/ui/tag"
import { fetchSettingsAction, updateSettingsAction } from "@/features/admin/actions/content-actions"
import { FormField, FormInput, FormSwitch, FormTextarea } from "@/features/admin/components/admin-form-elements"
import { AdminHeader } from "@/features/admin/components/admin-header"
import { useToast } from "@/features/admin/components/admin-toast"
import type { SiteSettings } from "@/features/admin/types/admin"

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { success, error } = useToast()

  useEffect(() => {
    fetchSettingsAction().then((data) => {
      setSettings(data)
      setLoading(false)
    })
  }, [])

  const handleChange = <K extends keyof SiteSettings>(field: K, value: SiteSettings[K]) => {
    if (!settings) return
    setSettings({ ...settings, [field]: value })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings) return

    setSaving(true)
    try {
      const res = await updateSettingsAction(settings)
      if (res.success) {
        success(res.message)
      } else {
        error(res.message)
      }
    } catch {
      error("Failed to update settings.")
    } finally {
      setSaving(false)
    }
  }

  if (loading || !settings) {
    return (
      <div className="space-y-6">
        <AdminHeader title="Site Settings" subtitle="Configure metadata, SEO, and publishing workflows." />
        <div className="rounded-xl border border-border bg-card p-8 text-center text-xs text-muted-foreground">
          Loading settings...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Settings & CI/CD"
        subtitle="Manage website metadata, search engine configuration, and deployment sync."
        backHref="/admin"
        backLabel="Back to Overview"
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Site Settings */}
        <div className="rounded-xl border border-border/80 bg-card p-5 dark:border-line space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <GlobeIcon className="size-4 text-primary" /> General Site Configuration
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Site Title">
              <FormInput
                value={settings.siteTitle}
                onChange={(e) => handleChange("siteTitle", e.target.value)}
                placeholder="Firdaus Khotibul Zickrian | Portfolio"
              />
            </FormField>

            <FormField label="Favicon Path">
              <FormInput
                value={settings.favicon}
                onChange={(e) => handleChange("favicon", e.target.value)}
                placeholder="/favicon.ico"
              />
            </FormField>
          </div>

          <FormField label="Default OG Image URL" description="Social card image for Twitter and Open Graph">
            <FormInput
              value={settings.defaultOgImage}
              onChange={(e) => handleChange("defaultOgImage", e.target.value)}
              placeholder="/image/og.png"
            />
          </FormField>
        </div>

        {/* 2. SEO Settings */}
        <div className="rounded-xl border border-border/80 bg-card p-5 dark:border-line space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <SearchIcon className="size-4 text-primary" /> Search Engine Optimization (SEO)
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Meta Title" description="Used for browser tab and Google search results">
              <FormInput
                value={settings.metaTitle}
                onChange={(e) => handleChange("metaTitle", e.target.value)}
                placeholder="Firdaus Khotibul Zickrian | AI Engineer"
              />
            </FormField>

            <FormField label="Keywords (Comma separated)">
              <FormInput
                value={settings.keywords?.join(", ") || ""}
                onChange={(e) =>
                  handleChange(
                    "keywords",
                    e.target.value.split(",").map((k) => k.trim()).filter(Boolean)
                  )
                }
                placeholder="AI, Machine Learning, Next.js, Portfolio"
              />
            </FormField>
          </div>

          <FormField label="Meta Description" description="150-160 characters summary for search engine snippet">
            <FormTextarea
              rows={3}
              value={settings.metaDescription}
              onChange={(e) => handleChange("metaDescription", e.target.value)}
              placeholder="Firdaus Khotibul Zickrian portfolio showcasing AI, machine learning and full-stack projects."
            />
          </FormField>
        </div>

        {/* 3. Publishing & Deployments */}
        <div className="rounded-xl border border-border/80 bg-card p-5 dark:border-line space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <GitBranchIcon className="size-4 text-primary" /> Publishing & Pipeline Automation
          </h2>

          <div className="space-y-3">
            <FormSwitch
              checked={settings.autoPublish}
              onChange={(val) => handleChange("autoPublish", val)}
              label="Auto Commit on Content Save"
              description="Automatically trigger GitHub commit and Vercel build whenever a change is saved in admin"
            />

            <div className="border-t border-border/50 pt-3">
              <FormSwitch
                checked={settings.previewDeployment}
                onChange={(val) => handleChange("previewDeployment", val)}
                label="Enable Live Preview Mode"
                description="Allow draft preview before committing to GitHub repository"
              />
            </div>
          </div>
        </div>

        {/* 4. Admin & GitHub Connection Status */}
        <div className="rounded-xl border border-border/80 bg-card p-5 dark:border-line space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <ShieldCheckIcon className="size-4 text-primary" /> GitHub Connection & Security Status
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1 dark:border-line">
              <span className="text-[0.6875rem] text-muted-foreground uppercase font-mono">
                Source of Truth
              </span>
              <div className="flex items-center gap-2 font-semibold text-xs text-foreground">
                <CheckCircle2Icon className="size-3.5 text-emerald-500" />
                <span>GitHub Repository (zickrian/portfolio)</span>
              </div>
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1 dark:border-line">
              <span className="text-[0.6875rem] text-muted-foreground uppercase font-mono">
                Hosting & Deployment
              </span>
              <div className="flex items-center gap-2 font-semibold text-xs text-foreground">
                <CheckCircle2Icon className="size-3.5 text-emerald-500" />
                <span>Vercel Edge Network (Auto-deploy on commit)</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground space-y-1 dark:border-line">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Security Note:</span>
              <Tag className="text-[0.625rem] text-emerald-500">Server-Side Only</Tag>
            </div>
            <p>
              GitHub credentials and secrets are kept strictly server-side inside environment variables
              and are never exposed to the client or browser storage.
            </p>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="sticky bottom-4 z-20 flex items-center justify-end rounded-xl border border-border bg-card/90 p-4 shadow-xl backdrop-blur-md dark:border-line">
          <Button type="submit" size="sm" disabled={saving} className="gap-1.5">
            <SaveIcon className="size-3.5" /> {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </div>
  )
}
