"use client"

// ponytail: social links CRUD with visibility toggle, reordering and platform icon mapping
import {
  Share2Icon,
  PlusIcon,
  EditIcon,
  Trash2Icon,
  EyeIcon,
  EyeOffIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SaveIcon,
  ExternalLinkIcon,
} from "lucide-react"
import React, { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Tag } from "@/components/ui/tag"
import {
  deleteSocialLinkAction,
  fetchSocialLinksAction,
  saveSocialLinkAction,
} from "@/features/admin/actions/content-actions"
import { AdminAlertDialog, AdminDialog } from "@/features/admin/components/admin-dialog"
import { FormField, FormInput, FormSelect, FormSwitch } from "@/features/admin/components/admin-form-elements"
import { AdminHeader } from "@/features/admin/components/admin-header"
import { useToast } from "@/features/admin/components/admin-toast"
import type { AdminSocialLink } from "@/features/admin/types/admin"

const PLATFORMS: AdminSocialLink["platform"][] = [
  "GitHub",
  "LinkedIn",
  "Medium",
  "Instagram",
  "Email",
  "Discord",
  "Hugging Face",
  "Other",
]

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
    const newLink: AdminSocialLink = {
      id: `social-${Date.now()}`,
      platform: "GitHub",
      label: "GitHub",
      url: "https://github.com/zickrian",
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
    const updated = { ...link, visible: !link.visible }
    try {
      const res = await saveSocialLinkAction(updated)
      if (res.success) {
        setLinks((prev) => prev.map((l) => (l.id === link.id ? updated : l)))
        success(`Social link visibility updated.`)
      }
    } catch {
      error("Failed to update visibility.")
    }
  }

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= links.length) return

    const updated = [...links]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp

    updated.forEach((l, idx) => {
      l.displayOrder = idx + 1
    })

    setLinks(updated)
    success("Social links reordered.")
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
                className="flex items-center justify-between gap-3 p-3.5 sm:px-5 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-foreground font-mono text-xs">
                    <Share2Icon className="size-4" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
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

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleToggleVisibility(link)}
                    aria-label={link.visible ? "Hide link" : "Show link"}
                  >
                    {link.visible ? (
                      <EyeIcon className="size-3 text-emerald-500" />
                    ) : (
                      <EyeOffIcon className="size-3 text-muted-foreground" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon-xs"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, "up")}
                    aria-label="Move up"
                  >
                    <ArrowUpIcon className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    disabled={idx === links.length - 1}
                    onClick={() => handleMove(idx, "down")}
                    aria-label="Move down"
                  >
                    <ArrowDownIcon className="size-3" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon-xs"
                    onClick={() => openEditModal(link)}
                    aria-label="Edit link"
                  >
                    <EditIcon className="size-3" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon-xs"
                    onClick={() => setDeleteTarget(link)}
                    aria-label="Delete link"
                  >
                    <Trash2Icon className="size-3" />
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
                onChange={(e) =>
                  setEditingLink({
                    ...editingLink,
                    platform: e.target.value as AdminSocialLink["platform"],
                    label: editingLink.label || e.target.value,
                  })
                }
                options={PLATFORMS.map((p) => ({ label: p, value: p }))}
              />
            </FormField>

            <FormField label="Display Label" required>
              <FormInput
                value={editingLink.label}
                onChange={(e) => setEditingLink({ ...editingLink, label: e.target.value })}
                placeholder="GitHub"
              />
            </FormField>

            <FormField label="Destination URL" required description="e.g. https://github.com/username">
              <FormInput
                value={editingLink.url}
                onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                placeholder="https://github.com/zickrian"
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
