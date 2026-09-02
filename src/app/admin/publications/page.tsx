"use client"

// ponytail: Publications CRUD -- domain-specific form following Publication schema (id, title, journal, date, url, description)
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BookOpenIcon,
  EditIcon,
  ExternalLinkIcon,
  PlusIcon,
  SaveIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import React, { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  deletePublicationAction,
  fetchPublicationsAction,
  reorderPublicationsAction,
  savePublicationAction,
} from "@/features/admin/actions/content-actions"
import { AdminAlertDialog, AdminDialog } from "@/features/admin/components/admin-dialog"
import {
  FormField,
  FormInput,
  FormTextarea,
} from "@/features/admin/components/admin-form-elements"
import { AdminHeader } from "@/features/admin/components/admin-header"
import { useToast } from "@/features/admin/components/admin-toast"
import type { AdminPublication } from "@/features/admin/types/admin"

function emptyPub(): AdminPublication {
  return {
    id: "",
    title: "",
    journal: "",
    date: new Date().toISOString().slice(0, 10),
    url: "",
    description: "",
    displayOrder: undefined,
  }
}

export default function AdminPublicationsPage() {
  const [pubs, setPubs] = useState<AdminPublication[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<AdminPublication | null>(null)
  const [deleting, setDeleting] = useState<AdminPublication | null>(null)
  const toast = useToast()

  const load = () =>
    fetchPublicationsAction().then((data) => {
      setPubs(data)
      setLoading(false)
    })

  useEffect(() => {
    load()
  }, [])

  const openNew = () => setEditing(emptyPub())
  const openEdit = (p: AdminPublication) => setEditing({ ...p })

  const handleSave = async () => {
    if (!editing) return
    if (!editing.title.trim() || !editing.journal.trim() || !editing.date || !editing.url.trim()) {
      toast.error("Title, Journal, Date, and URL are required.")
      return
    }
    setSaving(true)
    const res = await savePublicationAction(editing)
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
    const res = await deletePublicationAction(deleting.id)
    setDeleting(null)
    if (res.success) {
      toast.success(res.message)
      load()
    } else {
      toast.error(res.message)
    }
  }

  const move = async (idx: number, dir: -1 | 1) => {
    const next = [...pubs]
    const target = idx + dir
    if (target < 0 || target >= next.length) return
    ;[next[idx], next[target]] = [next[target], next[idx]]
    setPubs(next)
    const res = await reorderPublicationsAction(next)
    if (res.success) {
      toast.success(res.message)
    } else {
      toast.error(res.message)
    }
    load()
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Publications"
        subtitle={`${pubs.length} publication${pubs.length !== 1 ? "s" : ""} — academic papers, journals, and articles.`}
        actions={
          <Button size="sm" className="gap-1.5" onClick={openNew}>
            <PlusIcon className="size-3.5" /> Add Publication
          </Button>
        }
      />

      {loading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading publications...</div>
      ) : pubs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <BookOpenIcon className="mx-auto size-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">No publications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pubs.map((pub, idx) => (
            <div
              key={pub.id}
              className="flex items-start gap-3 rounded-xl border border-border/80 bg-card p-4 dark:border-line"
            >
              {/* Reorder */}
              <div className="flex flex-col gap-1 pt-0.5">
                <button
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0}
                  className="rounded p-1 hover:bg-muted disabled:opacity-30"
                  aria-label="Move up"
                >
                  <ArrowUpIcon className="size-3.5" />
                </button>
                <button
                  onClick={() => move(idx, 1)}
                  disabled={idx === pubs.length - 1}
                  className="rounded p-1 hover:bg-muted disabled:opacity-30"
                  aria-label="Move down"
                >
                  <ArrowDownIcon className="size-3.5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{pub.title}</span>
                  <span className="text-[0.6875rem] text-muted-foreground font-mono">{pub.date}</span>
                </div>
                <p className="mt-1 text-xs text-primary/90 font-medium">{pub.journal}</p>
                {pub.description && (
                  <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{pub.description}</p>
                )}
                {pub.url && (
                  <a
                    href={pub.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-[0.6875rem] text-primary hover:underline"
                  >
                    View Publication <ExternalLinkIcon className="size-3" />
                  </a>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon-sm" onClick={() => openEdit(pub)} aria-label="Edit">
                  <EditIcon className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleting(pub)}
                  aria-label="Delete"
                >
                  <Trash2Icon className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create Dialog */}
      {editing && (
        <AdminDialog
          title={editing.id ? "Edit Publication" : "Add Publication"}
          description="Fill in the research or journal publication details."
          open={!!editing}
          onClose={() => setEditing(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => setEditing(null)}>
                <XIcon className="size-3.5 mr-1.5" /> Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <SaveIcon className="size-3.5 mr-1.5" /> {saving ? "Saving..." : "Save Publication"}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <FormField label="Paper / Article Title" required>
              <FormInput
                id="pub-title"
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="Implementasi Sistem Lost and Found Kampus Berbasis Web..."
              />
            </FormField>
            <FormField label="Journal / Publisher / Conference" required>
              <FormInput
                id="pub-journal"
                value={editing.journal}
                onChange={(e) => setEditing({ ...editing, journal: e.target.value })}
                placeholder="JUTISI (Jurnal Teknik Informatika dan Sistem Informasi)"
              />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Publication Date" required>
                <FormInput
                  id="pub-date"
                  type="date"
                  value={editing.date}
                  onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                />
              </FormField>
              <FormField label="Publication / DOI URL" required>
                <FormInput
                  id="pub-url"
                  value={editing.url}
                  onChange={(e) => setEditing({ ...editing, url: e.target.value })}
                  placeholder="https://doi.org/... or https://..."
                />
              </FormField>
            </div>
            <FormField label="Abstract / Summary" description="Overview of the research and findings">
              <FormTextarea
                id="pub-desc"
                rows={4}
                value={editing.description || ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                placeholder="Penelitian ini merancang dan mengimplementasikan..."
              />
            </FormField>
          </div>
        </AdminDialog>
      )}

      {/* Delete Confirmation */}
      {deleting && (
        <AdminAlertDialog
          title="Delete Publication"
          description={`Are you sure you want to delete "${deleting.title}"? This cannot be undone.`}
          open={!!deleting}
          onClose={() => setDeleting(null)}
          onConfirm={handleDelete}
          confirmText="Delete Publication"
          variant="destructive"
        />
      )}
    </div>
  )
}
