"use client"

// ponytail: social links CRUD with visibility toggle, reordering and platform icon mapping
import {
  ArrowDownIcon,
  ArrowUpIcon,
  EditIcon,
  ExternalLinkIcon,
  EyeIcon,
  EyeOffIcon,
  PlusIcon,
  SaveIcon,
  Share2Icon,
  Trash2Icon,
} from "lucide-react"
import React, { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Tag } from "@/components/ui/tag"
import {
  deleteSocialLinkAction,
  fetchSocialLinksAction,
  reorderSocialLinksAction,
  saveSocialLinkAction,
} from "@/features/admin/actions/content-actions"
import { AdminAlertDialog, AdminDialog } from "@/features/admin/components/admin-dialog"
import { FormField, FormInput, FormSelect, FormSwitch } from "@/features/admin/components/admin-form-elements"
import { AdminHeader } from "@/features/admin/components/admin-header"
import { useToast } from "@/features/admin/components/admin-toast"
import type { AdminSocialLink } from "@/features/admin/types/admin"

// Platform config: label, icon key (maps to IconRegistry), and URL placeholder
type PlatformConfig = {
  label: string
  icon: string
  placeholder: string
}

const PLATFORM_CONFIG: Record<AdminSocialLink["platform"], PlatformConfig> = {
  "GitHub":       { label: "GitHub",       icon: "github",       placeholder: "https://github.com/username" },
  "LinkedIn":     { label: "LinkedIn",     icon: "linkedin",     placeholder: "https://linkedin.com/in/username" },
  "Instagram":    { label: "Instagram",    icon: "instagram",    placeholder: "https://instagram.com/username" },
  "X (Twitter)":  { label: "X (Twitter)",  icon: "x",           placeholder: "https://x.com/username" },
  "TikTok":       { label: "TikTok",       icon: "tiktok",      placeholder: "https://tiktok.com/@username" },
  "Threads":      { label: "Threads",      icon: "threads",     placeholder: "https://threads.net/@username" },
  "YouTube":      { label: "YouTube",      icon: "youtube",     placeholder: "https://youtube.com/@username" },
  "Telegram":     { label: "Telegram",     icon: "telegram",    placeholder: "https://t.me/username" },
  "Medium":       { label: "Medium",       icon: "medium",      placeholder: "https://medium.com/@username" },
  "Discord":      { label: "Discord",      icon: "discord",     placeholder: "https://discord.com/users/username" },
  "Behance":      { label: "Behance",      icon: "behance",     placeholder: "https://behance.net/username" },
  "Dribbble":     { label: "Dribbble",     icon: "dribbble",    placeholder: "https://dribbble.com/username" },
  "Kaggle":       { label: "Kaggle",       icon: "kaggle",      placeholder: "https://kaggle.com/username" },
  "Hugging Face": { label: "Hugging Face", icon: "huggingface", placeholder: "https://huggingface.co/username" },
  "Email":        { label: "Email",        icon: "email",       placeholder: "mailto:yourname@email.com" },
  "Website":      { label: "Website",      icon: "website",     placeholder: "https://yourwebsite.com" },
  "Other":        { label: "Other",        icon: "",            placeholder: "https://" },
}

const PLATFORMS = Object.keys(PLATFORM_CONFIG) as AdminSocialLink["platform"][]

export default function AdminSocialLinksPage() {
  const [links, setLinks] = useState<AdminSocialLink[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<AdminSocialLink | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminSocialLink | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { success, error } = useToast()

  const loadLinks = () => {
    fetchSocialLinksAction().then((data) => {
      setLinks(data)
      setLoading(false)
    })
  }

  useEffect(() => {
    loadLinks()
  }, [])

  const openCreateModal = () => {
    const cfg = PLATFORM_CONFIG["GitHub"]
    const newLink: AdminSocialLink = {
      id: `social-${Date.now()}`,
      platform: "GitHub",
      label: cfg.label,
      icon: cfg.icon,
      url: "",
      displayOrder: links.length + 1,
      visible: true,
    }
    setEditingLink(newLink)
    setModalOpen(true)
  }

  const openEditModal = (link: AdminSocialLink) => {
    setEditingLink({ ...link })
    setModalOpen(true)
  }

  const handleToggleVisibility = async (link: AdminSocialLink) => {
    const previous = [...links]
    const updated = links.map((l) =>
      l.id === link.id ? { ...l, visible: !l.visible } : l
    )
    setLinks(updated)

    try {
      const res = await reorderSocialLinksAction(updated)
      if (res.success) {
        if (res.data) setLinks(res.data)
        success(link.visible ? "Link hidden from portfolio." : "Link visible on portfolio.")
      } else {
        setLinks(previous)
        error(res.message || "Failed to update visibility.")
      }
    } catch {
      setLinks(previous)
      error("Failed to update visibility.")
    }
  }

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= links.length) return

    const previous = [...links]
    const updated = [...links]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp

    updated.forEach((l, idx) => {
      l.displayOrder = idx + 1
    })

    setLinks(updated)

    try {
      const res = await reorderSocialLinksAction(updated)
      if (res.success) {
        if (res.data) setLinks(res.data)
        success("Social links reordered.")
      } else {
        setLinks(previous)
        error(res.message || "Failed to save social links order.")
      }
    } catch {
      setLinks(previous)
      error("Failed to save social links order.")
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingLink || !editingLink.url.trim()) return

    setIsSaving(true)
    try {
      const res = await saveSocialLinkAction(editingLink)
      if (res.success) {
        success(res.message)
        setModalOpen(false)
        loadLinks()
      } else {
        error(res.message)
      }
    } catch {
      error("Failed to save social link.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const res = await deleteSocialLinkAction(deleteTarget.id)
      if (res.success) {
        success(res.message)
        setDeleteTarget(null)
        loadLinks()
      } else {
        error(res.message)
      }
    } catch {
      error("Failed to delete social link.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Social Links & Networks"
        subtitle="Manage public profiles, external contact channels, and footer links."
        actions={
          <Button size="sm" onClick={openCreateModal} className="gap-1.5">
            <PlusIcon className="size-3.5" /> Add Link
          </Button>
        }
      />

      {/* Social Links List */}
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden dark:border-line">
        {loading ? (
          <div className="p-8 text-center text-xs text-muted-foreground">Loading social links...</div>
        ) : links.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-xs text-muted-foreground">No social links configured yet.</p>
            <Button size="xs" onClick={openCreateModal} className="gap-1">
              <PlusIcon className="size-3" /> Add Link
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border/60 dark:divide-line">
            {links.map((link, idx) => (
              <div
                key={link.id}
                className="flex items-start gap-3.5 p-3.5 sm:px-5 hover:bg-muted/20 transition-colors"
              >
                {/* Left Column: Stacked Reorder Buttons */}
                <div className="flex flex-col gap-1 pt-0.5 shrink-0">
                  <button
                    onClick={() => handleMove(idx, "up")}
                    disabled={idx === 0}
                    className="rounded p-1 hover:bg-muted disabled:opacity-25 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Move up"
                  >
                    <ArrowUpIcon className="size-3.5" />
                  </button>
                  <button
                    onClick={() => handleMove(idx, "down")}
                    disabled={idx === links.length - 1}
                    className="rounded p-1 hover:bg-muted disabled:opacity-25 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Move down"
                  >
                    <ArrowDownIcon className="size-3.5" />
                  </button>
                </div>

                {/* Center Column: Social Link Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-foreground font-mono text-xs">
                    <Share2Icon className="size-4" />
                  </div>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">{link.label}</span>
                      <Tag className="text-[0.625rem]">{link.platform}</Tag>
                      {!link.visible && (
                        <span className="rounded bg-zinc-500/10 px-1.5 py-0.5 text-[0.625rem] text-muted-foreground">
                          Hidden
                        </span>
                      )}
                    </div>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:underline flex items-center gap-1 truncate"
                    >
                      <span className="truncate">{link.url}</span>
                      <ExternalLinkIcon className="size-3 shrink-0" />
                    </a>
                  </div>
                </div>

                {/* Right Column: Visibility Toggle, Edit & Delete Actions */}
                <div className="flex items-center gap-1 shrink-0 self-start">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleToggleVisibility(link)}
                    aria-label={link.visible ? "Hide link" : "Show link"}
                    title={link.visible ? "Visible on site (click to hide)" : "Hidden (click to show)"}
                  >
                    {link.visible ? (
                      <EyeIcon className="size-3.5 text-emerald-500" />
                    ) : (
                      <EyeOffIcon className="size-3.5 text-muted-foreground" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => openEditModal(link)}
                    aria-label="Edit link"
                  >
                    <EditIcon className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(link)}
                    aria-label="Delete link"
                  >
                    <Trash2Icon className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit / Create Dialog */}
      {editingLink && (
        <AdminDialog
          open={modalOpen}
          onClose={() => !isSaving && setModalOpen(false)}
          title={editingLink.label ? `Edit: ${editingLink.label}` : "Add Social Link"}
          maxWidth="sm"
          footer={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModalOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-1.5">
                <SaveIcon className="size-3.5" />
                {isSaving ? "Saving..." : "Save Link"}
              </Button>
            </>
          }
        >
          <form onSubmit={handleSave} className="space-y-4">
            <FormField label="Platform">
              <FormSelect
                value={editingLink.platform}
                onChange={(e) => {
                  const platform = e.target.value as AdminSocialLink["platform"]
                  const cfg = PLATFORM_CONFIG[platform]
                  setEditingLink({
                    ...editingLink,
                    platform,
                    label: cfg.label,
                    icon: cfg.icon,
                    // Only reset URL if it's still empty or the old placeholder
                    url: editingLink.url && editingLink.url !== "https://" ? editingLink.url : "",
                  })
                }}
                options={PLATFORMS.map((p) => ({ label: p, value: p }))}
              />
            </FormField>

            <FormField
              label="Destination URL"
              required
              description={`e.g. ${PLATFORM_CONFIG[editingLink.platform]?.placeholder ?? "https://"}`}
            >
              <FormInput
                value={editingLink.url}
                onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                placeholder={PLATFORM_CONFIG[editingLink.platform]?.placeholder ?? "https://"}
              />
            </FormField>

            <div className="pt-2 border-t border-border/60 dark:border-line">
              <FormSwitch
                checked={editingLink.visible}
                onChange={(val) => setEditingLink({ ...editingLink, visible: val })}
                label="Visible on Portfolio"
                description="Toggle whether this social icon appears on the live site"
              />
            </div>
          </form>
        </AdminDialog>
      )}

      {/* Delete Confirmation Alert */}
      <AdminAlertDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Social Link?"
        description={`Are you sure you want to remove "${deleteTarget?.label}"?`}
        confirmText="Delete Link"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  )
}
