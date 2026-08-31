"use client"

// ponytail: singleton profile editor with instant preview and validation
import {
  SaveIcon,
  RotateCcwIcon,
  EyeIcon,
  UserIcon,
  ImageIcon,
  Link2Icon,
  MapPinIcon,
  BriefcaseIcon,
} from "lucide-react"
import Image from "next/image"
import React, { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Tag } from "@/components/ui/tag"
import { fetchProfileAction, updateProfileAction } from "@/features/admin/actions/content-actions"
import { AdminDialog } from "@/features/admin/components/admin-dialog"
import { FormField, FormInput, FormTextarea } from "@/features/admin/components/admin-form-elements"
import { AdminHeader } from "@/features/admin/components/admin-header"
import { useToast } from "@/features/admin/components/admin-toast"
import type { AdminProfile } from "@/features/admin/types/admin"

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

  const handleChange = (field: keyof AdminProfile, value: any) => {
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
    if (!profile?.jobTitle?.trim()) errs.jobTitle = "Role / Headline is required."
    if (!profile?.bio?.trim()) errs.bio = "Short Bio is required."
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
        {/* Profile Avatar Card */}
        <div className="rounded-xl border border-border/80 bg-card p-5 dark:border-line">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-4">
            <ImageIcon className="size-4 text-primary" /> Profile Photo & Media
          </h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-full border-2 border-border bg-muted">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.displayName}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground">
                  <UserIcon className="size-8" />
                </div>
              )}
            </div>
            <div className="flex-1 w-full space-y-2">
              <FormField label="Avatar Image Path / URL" description="Local path in /public or absolute URL">
                <FormInput
                  value={profile.avatar}
                  onChange={(e) => handleChange("avatar", e.target.value)}
                  placeholder="/image/profile.webp"
                />
              </FormField>
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
                placeholder="Firdaus Khotibul Zickrian"
                error={errors.displayName}
              />
            </FormField>

            <FormField label="Role / Headline" required error={errors.jobTitle}>
              <FormInput
                value={profile.jobTitle}
                onChange={(e) => handleChange("jobTitle", e.target.value)}
                placeholder="AI & Machine Learning Engineer"
                error={errors.jobTitle}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Location" description="Country or city displayed on header">
              <FormInput
                value={profile.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Indonesia"
              />
            </FormField>

            <FormField label="Availability Status" description="e.g. Open to opportunities">
              <FormInput
                value={profile.availabilityStatus ?? "Open to opportunities"}
                onChange={(e) => handleChange("availabilityStatus", e.target.value)}
                placeholder="Open to opportunities"
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
        <div className="rounded-xl border border-border/80 bg-card p-5 dark:border-line space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Link2Icon className="size-4 text-primary" /> Connected Links & URLs
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="GitHub Profile URL">
              <FormInput
                value={profile.githubUrl ?? "https://github.com/zickrian"}
                onChange={(e) => handleChange("githubUrl", e.target.value)}
                placeholder="https://github.com/zickrian"
              />
            </FormField>

            <FormField label="LinkedIn Profile URL">
              <FormInput
                value={profile.linkedinUrl ?? "https://linkedin.com/in/firdauskhotibulzickrian/"}
                onChange={(e) => handleChange("linkedinUrl", e.target.value)}
                placeholder="https://linkedin.com/in/firdauskhotibulzickrian/"
              />
            </FormField>

            <FormField label="Medium Profile URL">
              <FormInput
                value={profile.mediumUrl ?? "https://medium.com/@zickriann"}
                onChange={(e) => handleChange("mediumUrl", e.target.value)}
                placeholder="https://medium.com/@zickriann"
              />
            </FormField>

            <FormField label="Instagram Profile URL">
              <FormInput
                value={profile.instagramUrl ?? "https://instagram.com/zickrian"}
                onChange={(e) => handleChange("instagramUrl", e.target.value)}
                placeholder="https://instagram.com/zickrian"
              />
            </FormField>
          </div>
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

      {/* Live Preview Modal */}
      <AdminDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Live Profile Preview"
        maxWidth="lg"
      >
        <div className="space-y-4 rounded-xl border border-line bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="size-16 overflow-hidden rounded-full border border-border">
              {profile.avatar && (
                <img src={profile.avatar} alt={profile.displayName} className="size-full object-cover" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">{profile.displayName}</h3>
              <p className="text-xs text-muted-foreground">{profile.jobTitle}</p>
              <div className="mt-1 flex items-center gap-2">
                <Tag className="text-[0.625rem]">{profile.address}</Tag>
                <Tag className="text-[0.625rem]">{profile.availabilityStatus ?? "Open to opportunities"}</Tag>
              </div>
            </div>
          </div>

          <div className="border-t border-line pt-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Short Bio</h4>
            <p className="text-xs text-foreground leading-relaxed">{profile.bio}</p>
          </div>

          {profile.about && (
            <div className="border-t border-line pt-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">About Narrative</h4>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{profile.about}</p>
            </div>
          )}
        </div>
      </AdminDialog>
    </div>
  )
}
