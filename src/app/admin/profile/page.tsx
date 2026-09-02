"use client"

// ponytail: singleton profile editor with instant preview and validation
import {
  BriefcaseIcon,
  EyeIcon,
  ImageIcon,
  Link2Icon,
  RotateCcwIcon,
  SaveIcon,
  UserIcon,
} from "lucide-react"
import Link from "next/link"
import React, { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { fetchProfileAction, updateProfileAction } from "@/features/admin/actions/content-actions"
import { AdminDialog } from "@/features/admin/components/admin-dialog"
import { FormField, FormInput, FormTextarea } from "@/features/admin/components/admin-form-elements"
import { AdminHeader } from "@/features/admin/components/admin-header"
import { useToast } from "@/features/admin/components/admin-toast"
import type { AdminProfile } from "@/features/admin/types/admin"
import { ProfileHeader } from "@/features/portfolio/components/profile-header"
import type { Profile } from "@/lib/content/types"
import { validateImageUrl } from "@/lib/media/image-url"

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [original, setOriginal] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { success, error } = useToast()

  useEffect(() => {
    fetchProfileAction().then((data) => {
      setProfile(data)
      setOriginal(data)
      setLoading(false)
    })
  }, [])

  const handleChange = <K extends keyof AdminProfile>(field: K, value: AdminProfile[K]) => {
    if (!profile) return
    setProfile({ ...profile, [field]: value })
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleReset = () => {
    if (original) {
      setProfile({ ...original })
      setErrors({})
      success("Profile reset to last saved state.")
    }
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!profile?.displayName?.trim()) errs.displayName = "Name is required."
    if (!profile?.username?.trim()) errs.username = "Username / Handle is required."
    if (!profile?.jobTitle?.trim()) errs.jobTitle = "Role / Headline is required."
    if (!profile?.bio?.trim()) errs.bio = "Short Bio is required."

    if (profile?.avatar?.trim()) {
      const avatarCheck = validateImageUrl(profile.avatar)
      if (!avatarCheck.isValid) {
        errs.avatar = avatarCheck.error || "Invalid avatar path or URL."
      }
    }

    if (profile?.banner?.trim()) {
      const bannerCheck = validateImageUrl(profile.banner)
      if (!bannerCheck.isValid) {
        errs.banner = bannerCheck.error || "Invalid cover banner path or URL."
      }
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !profile) return

    setSaving(true)
    try {
      const res = await updateProfileAction(profile)
      if (res.success) {
        setOriginal({ ...profile })
        success(res.message)
      } else {
        error(res.message)
      }
    } catch {
      error("Failed to save profile changes.")
    } finally {
      setSaving(false)
    }
  }

  if (loading || !profile) {
    return (
      <div className="space-y-6">
        <AdminHeader title="Profile Settings" subtitle="Edit your personal details and social presence." />
        <div className="rounded-xl border border-border bg-card p-8 text-center text-xs text-muted-foreground">
          Loading profile information...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Profile Information"
        subtitle="Manage personal bio, headline, availability, and public identity."
        actions={
          <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)} className="gap-1.5">
            <EyeIcon className="size-3.5" /> Preview
          </Button>
        }
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Photo & Cover Banner Card */}
        <div className="rounded-xl border border-border/80 bg-card p-5 dark:border-line space-y-6">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <ImageIcon className="size-4 text-primary" /> Profile Photo & Cover Banner
          </h2>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Avatar Photo */}
            <div className="rounded-lg border border-border/70 bg-muted/20 p-4 space-y-3 dark:border-line">
              <label className="text-xs font-semibold text-foreground">
                Avatar Photo
              </label>
              <div className="flex items-center gap-4">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-full border-2 border-border bg-muted flex items-center justify-center">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.displayName}
                      className="size-full object-cover"
                      onError={(e) => {
                        ;(e.currentTarget as HTMLElement).style.display = "none"
                      }}
                    />
                  ) : (
                    <UserIcon className="size-7 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <FormField
                    label="Avatar Path / URL"
                    description="Use a local public path such as /image/profile.webp or a direct HTTPS image URL."
                    error={errors.avatar}
                  >
                    <FormInput
                      value={profile.avatar}
                      onChange={(e) => handleChange("avatar", e.target.value)}
                      placeholder="/image/profile.webp"
                      error={errors.avatar}
                    />
                  </FormField>
                </div>
              </div>
            </div>

            {/* Cover Banner */}
            <div className="rounded-lg border border-border/70 bg-muted/20 p-4 space-y-3 dark:border-line">
              <label className="text-xs font-semibold text-foreground">
                Cover Banner
              </label>
              <div className="space-y-3">
                <div className="relative h-20 w-full overflow-hidden rounded-md border border-border bg-muted">
                  <img
                    src={profile.banner || "/banner.webp"}
                    alt="Cover banner preview"
                    className="size-full object-cover object-center"
                    onError={(e) => {
                      ;(e.currentTarget as HTMLElement).style.display = "none"
                    }}
                  />
                </div>
                <FormField
                  label="Banner Path / URL"
                  description="Use a local public path such as /banner.webp or a direct HTTPS image URL."
                  error={errors.banner}
                >
                  <FormInput
                    value={profile.banner ?? "/banner.webp"}
                    onChange={(e) => handleChange("banner", e.target.value)}
                    placeholder="/banner.webp"
                    error={errors.banner}
                  />
                </FormField>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Identity */}
        <div className="rounded-xl border border-border/80 bg-card p-5 dark:border-line space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <UserIcon className="size-4 text-primary" /> Identity & Headline
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Display Name" required error={errors.displayName}>
              <FormInput
                value={profile.displayName}
                onChange={(e) => handleChange("displayName", e.target.value)}
                placeholder="Xza Abdul Malik Ibrahim"
                error={errors.displayName}
              />
            </FormField>

            <FormField
              label="Username / Handle"
              required
              error={errors.username}
              description="Displays as @username under your name"
            >
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs font-semibold text-muted-foreground select-none">
                  @
                </span>
                <FormInput
                  value={profile.username}
                  onChange={(e) => handleChange("username", e.target.value.replace(/^@/, ""))}
                  placeholder="zickrian"
                  error={errors.username}
                  className="pl-7"
                />
              </div>
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Role / Headline" required error={errors.jobTitle}>
              <FormInput
                value={profile.jobTitle}
                onChange={(e) => handleChange("jobTitle", e.target.value)}
                placeholder="AI & Machine Learning Engineer"
                error={errors.jobTitle}
              />
            </FormField>

            <FormField label="Location" description="Country or city displayed on header">
              <FormInput
                value={profile.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Indonesia"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Availability Status" description="e.g. Open to opportunities">
              <FormInput
                value={profile.availabilityStatus ?? "Open to opportunities"}
                onChange={(e) => handleChange("availabilityStatus", e.target.value)}
                placeholder="Open to opportunities"
              />
            </FormField>

            <FormField label="Website URL" description="Personal domain / portfolio URL">
              <FormInput
                value={profile.website}
                onChange={(e) => handleChange("website", e.target.value)}
                placeholder="https://www.zickrian.dev"
              />
            </FormField>
          </div>
        </div>

        {/* Bio & About */}
        <div className="rounded-xl border border-border/80 bg-card p-5 dark:border-line space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <BriefcaseIcon className="size-4 text-primary" /> Bio & Narrative
          </h2>

          <FormField
            label="Short Bio"
            required
            error={errors.bio}
            description="Brief introduction shown in hero & search snippets"
          >
            <FormTextarea
              rows={3}
              value={profile.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              placeholder="I'm Firdaus Khotibul Zickrian, an AI Engineer..."
              error={errors.bio}
            />
          </FormField>

          <FormField
            label="Long Bio (About Section)"
            description="Detailed Markdown narrative shown in the About panel"
          >
            <FormTextarea
              rows={6}
              value={profile.about}
              onChange={(e) => handleChange("about", e.target.value)}
              placeholder="I'm an AI Engineer based in Indonesia, specializing in..."
            />
          </FormField>
        </div>

        {/* Social Links & Web */}
        <div className="rounded-xl border border-border/80 bg-card p-5 dark:border-line space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Link2Icon className="size-4 text-primary" /> Social Links & External Profiles
            </h2>
            <Link
              href="/admin/social-links"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Manage Social Links &rarr;
            </Link>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Public social buttons (GitHub, LinkedIn, Discord, Medium, Hugging Face, etc.) are managed canonically in the{" "}
            <Link href="/admin/social-links" className="text-foreground underline underline-offset-2">
              Social Links manager
            </Link>{" "}
            to ensure ordering, visibility toggles, and icon registry synchronization are always preserved.
          </p>
        </div>

        {/* Form Actions */}
        <div className="sticky bottom-4 z-20 flex items-center justify-end gap-3 rounded-xl border border-border bg-card/90 p-4 shadow-xl backdrop-blur-md dark:border-line">
          <Button type="button" variant="outline" size="sm" onClick={handleReset} disabled={saving} className="gap-1.5">
            <RotateCcwIcon className="size-3.5" /> Reset Changes
          </Button>
          <Button type="submit" size="sm" disabled={saving} className="gap-1.5">
            <SaveIcon className="size-3.5" /> {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>

      {/* Live Profile Preview Modal (1:1 identical with public homepage header) */}
      <AdminDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Live Profile Preview"
        maxWidth="lg"
      >
        <div className="overflow-hidden rounded-xl border border-line bg-card">
          <ProfileHeader profile={profile as unknown as Profile} />
        </div>
      </AdminDialog>
    </div>
  )
}
