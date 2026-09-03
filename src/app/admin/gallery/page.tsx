"use client"

// ponytail: Gallery CRUD -- manage showcase images and videos with live preview & reordering
import {
  ArrowDownIcon,
  ArrowUpIcon,
  EditIcon,
  ImageIcon,
  PlusIcon,
  SaveIcon,
  Trash2Icon,
  VideoIcon,
  XIcon,
} from "lucide-react"
import React, { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Tag } from "@/components/ui/tag"
import {
  deleteGalleryAction,
  fetchGalleryAction,
  reorderGalleryAction,
  saveGalleryAction,
} from "@/features/admin/actions/content-actions"
import { AdminAlertDialog, AdminDialog } from "@/features/admin/components/admin-dialog"
import {
  FormField,
  FormInput,
  FormMediaUpload,
  FormSelect,
  FormTextarea,
} from "@/features/admin/components/admin-form-elements"
import { AdminHeader } from "@/features/admin/components/admin-header"
import { useToast } from "@/features/admin/components/admin-toast"
import type { AdminGalleryItem } from "@/features/admin/types/admin"

function emptyGalleryItem(): AdminGalleryItem {
  return {
    id: "",
    title: "",
    src: "",
    date: String(new Date().getFullYear()),
    type: "image",
    aspect: "square",
    description: "",
  }
}

export default function AdminGalleryPage() {
  const [items, setItems] = useState<AdminGalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<AdminGalleryItem | null>(null)
  const [deleting, setDeleting] = useState<AdminGalleryItem | null>(null)
  const toast = useToast()

  const load = () =>
    fetchGalleryAction().then((data) => {
      setItems(data)
      setLoading(false)
    })

  useEffect(() => {
    load()
  }, [])

  const openNew = () => setEditing(emptyGalleryItem())
  const openEdit = (item: AdminGalleryItem) => setEditing({ ...item })

  const handleSave = async () => {
    if (!editing) return
    if (!editing.title.trim() || !editing.src.trim()) {
      toast.error("Title and Media URL/Path are required.")
      return
    }
    setSaving(true)
    const res = await saveGalleryAction(editing)
    setSaving(false)
    if (res.success) {
      toast.success(res.message)
      setEditing(null)
      load()
    } else {
      toast.error(res.message)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    const res = await deleteGalleryAction(deleting.id)
    setDeleting(null)
    if (res.success) {
      toast.success(res.message)
      load()
    } else {
      toast.error(res.message)
    }
  }

  const move = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= items.length) return
    const next = [...items]
    const [moved] = next.splice(index, 1)
    next.splice(targetIndex, 0, moved)
    setItems(next)
    const res = await reorderGalleryAction(next)
    if (res.success && res.data) {
      setItems(res.data)
      toast.success("Gallery reordered.")
    } else if (!res.success) {
      toast.error(res.message)
      load()
    }
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Gallery Media"
        subtitle={`${items.length} item${items.length !== 1 ? "s" : ""} — showcase photos and videos displayed on your gallery.`}
        actions={
          <Button onClick={openNew} size="sm" className="gap-1.5">
            <PlusIcon className="size-4" />
            Add Media Item
          </Button>
        }
      />

      {loading ? (
        <div className="rounded-xl border border-border/80 bg-card p-8 text-center text-sm text-muted-foreground dark:border-line">
          Loading gallery items...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/80 bg-card/50 p-12 text-center dark:border-line">
          <ImageIcon className="mx-auto size-8 text-muted-foreground/60" />
          <p className="mt-2 text-sm font-medium text-foreground">No gallery items yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add photos or video showcases to display on your portfolio.
          </p>
          <Button onClick={openNew} size="sm" className="mt-4 gap-1.5">
            <PlusIcon className="size-4" /> Add Media Item
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-border dark:border-line space-y-3"
            >
              {/* Media Preview Box */}
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border/60 bg-muted/40 dark:border-line flex items-center justify-center">
                {item.type === "video" ? (
                  <div className="flex flex-col items-center gap-2 p-4 text-center">
                    <VideoIcon className="size-8 text-primary/80" />
                    <span className="text-xs text-muted-foreground line-clamp-1 max-w-full font-mono">
                      {item.src}
                    </span>
                  </div>
                ) : (
                  <img
                    src={item.src}
                    alt={item.title}
                    className="size-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none"
                    }}
                  />
                )}
                <div className="absolute top-2 left-2 flex gap-1.5">
                  <Tag className="text-[0.625rem] uppercase bg-background/80 backdrop-blur-xs">
                    {item.type === "video" ? "Video" : "Image"}
                  </Tag>
                  <Tag className="text-[0.625rem] uppercase bg-background/80 backdrop-blur-xs">
                    {item.aspect || "square"}
                  </Tag>
                </div>
              </div>

              {/* Information */}
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground line-clamp-1">
                    {item.title}
                  </h3>
                  <span className="text-xs text-muted-foreground font-mono shrink-0">
                    {item.date}
                  </span>
                </div>
                {item.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between border-t border-border/60 pt-3 dark:border-line">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    disabled={idx === 0}
                    onClick={() => move(idx, "up")}
                    title="Move up"
                  >
                    <ArrowUpIcon className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    disabled={idx === items.length - 1}
                    onClick={() => move(idx, "down")}
                    title="Move down"
                  >
                    <ArrowDownIcon className="size-3.5" />
                  </Button>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => openEdit(item)}
                    title="Edit"
                  >
                    <EditIcon className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setDeleting(item)}
                    className="text-rose-500 hover:text-rose-600 dark:hover:bg-rose-950/20"
                    title="Delete"
                  >
                    <Trash2Icon className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Dialog */}
      {editing && (
        <AdminDialog
          open={Boolean(editing)}
          onClose={() => setEditing(null)}
          title={editing.id ? "Edit Gallery Item" : "Add Media Item"}
          description="Showcase project milestones, event pictures, or journey videos."
        >
          <div className="space-y-4 py-2">
            <FormField label="Title" required description="Brief descriptive title or caption">
              <FormInput
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="Base Realms hackathon project showcase"
              />
            </FormField>

            <FormField
              label="Media URL or Local Path"
              required
              description="Pilih dari galeri, unggah file (WebP/PNG/WebM), atau masukkan link HTTPS"
            >
              <FormMediaUpload
                value={editing.src}
                onChange={(val) => setEditing({ ...editing, src: val })}
                placeholder="/image/btng.webp"
                accept="image/*,video/webm,video/mp4"
                targetFolder="image"
              />
            </FormField>

            {/* Live Media Preview inside Dialog */}
            {editing.src && editing.type !== "video" && (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted/30 p-1">
                <img
                  src={editing.src}
                  alt="Preview"
                  className="size-full object-contain rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none"
                  }}
                />
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <FormField label="Date / Year" description="e.g. 2026">
                <FormInput
                  value={editing.date}
                  onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                  placeholder="2026"
                />
              </FormField>

              <FormField label="Media Type">
                <FormSelect
                  value={editing.type || "image"}
                  onChange={(e) =>
                    setEditing({ ...editing, type: e.target.value as "image" | "video" })
                  }
                  options={[
                    { value: "image", label: "Image" },
                    { value: "video", label: "Video" },
                  ]}
                />
              </FormField>

              <FormField label="Aspect Ratio">
                <FormSelect
                  value={editing.aspect || "square"}
                  onChange={(e) =>
                    setEditing({ ...editing, aspect: e.target.value as "square" | "wide" })
                  }
                  options={[
                    { value: "square", label: "Square (1:1)" },
                    { value: "wide", label: "Wide (2:1)" },
                  ]}
                />
              </FormField>
            </div>

            <FormField label="Description (Optional)" description="Context or event note">
              <FormTextarea
                rows={2}
                value={editing.description || ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                placeholder="Behind-the-scenes engineering moment..."
              />
            </FormField>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/60 dark:border-line">
              <Button variant="outline" onClick={() => setEditing(null)}>
                <XIcon className="size-3.5" /> Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="gap-1.5">
                <SaveIcon className="size-3.5" />
                {saving ? "Saving..." : "Save Media"}
              </Button>
            </div>
          </div>
        </AdminDialog>
      )}

      {/* Delete Confirmation */}
      {deleting && (
        <AdminAlertDialog
          open={Boolean(deleting)}
          title="Delete Gallery Item"
          description={`Are you sure you want to remove "${deleting.title}"? This action cannot be undone.`}
          confirmText="Delete Media"
          variant="destructive"
          onClose={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}
