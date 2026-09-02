"use client"

// ponytail: Awards CRUD -- domain-specific form following Award schema (id, prize, title, date, grade, description, descriptionId, referenceLink)
import {
  ArrowDownIcon,
  ArrowUpIcon,
  EditIcon,
  ExternalLinkIcon,
  PlusIcon,
  SaveIcon,
  Trash2Icon,
  TrophyIcon,
  XIcon,
} from "lucide-react"
import React, { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Tag } from "@/components/ui/tag"
import {
  deleteAwardAction,
  fetchAwardsAction,
  reorderAwardsAction,
  saveAwardAction,
} from "@/features/admin/actions/content-actions"
import { AdminAlertDialog, AdminDialog } from "@/features/admin/components/admin-dialog"
import {
  FormField,
  FormInput,
  FormTextarea,
} from "@/features/admin/components/admin-form-elements"
import { AdminHeader } from "@/features/admin/components/admin-header"
import { useToast } from "@/features/admin/components/admin-toast"
import type { AdminAward } from "@/features/admin/types/admin"

const GRADE_OPTIONS = ["National", "Provincial", "Regional", "University", "International", "Personal"]

function emptyAward(): AdminAward {
  return {
    id: "",
    prize: "",
    title: "",
    date: new Date().toISOString().slice(0, 10),
    grade: "National",
    description: "",
    descriptionId: "",
    referenceLink: "",
  }
}

export default function AdminAwardsPage() {
  const [awards, setAwards] = useState<AdminAward[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<AdminAward | null>(null)
  const [deleting, setDeleting] = useState<AdminAward | null>(null)
  const toast = useToast()

  const load = () =>
    fetchAwardsAction().then((data) => {
      setAwards(data)
      setLoading(false)
    })

  useEffect(() => {
    load()
  }, [])

  const openNew = () => setEditing(emptyAward())
  const openEdit = (a: AdminAward) => setEditing({ ...a })

  const handleSave = async () => {
    if (!editing) return
    if (!editing.prize.trim() || !editing.title.trim() || !editing.date) {
      toast.error("Prize, Title, and Date are required.")
      return
    }
    setSaving(true)
    const res = await saveAwardAction(editing)
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
    const res = await deleteAwardAction(deleting.id)
    setDeleting(null)
    if (res.success) {
      toast.success(res.message)
      load()
    } else {
      toast.error(res.message)
    }
  }

  const move = async (idx: number, dir: -1 | 1) => {
    const next = [...awards]
    const target = idx + dir
    if (target < 0 || target >= next.length) return
    ;[next[idx], next[target]] = [next[target], next[idx]]
    setAwards(next)
    const res = await reorderAwardsAction(next)
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
        title="Awards"
        subtitle={`${awards.length} award${awards.length !== 1 ? "s" : ""} — competitions, programs, and recognitions.`}
        actions={
          <Button size="sm" className="gap-1.5" onClick={openNew}>
            <PlusIcon className="size-3.5" /> Add Award
          </Button>
        }
      />

      {loading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading awards...</div>
      ) : awards.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <TrophyIcon className="mx-auto size-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">No awards yet. Add your first recognition.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {awards.map((award, idx) => (
            <div
              key={award.id}
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
                  disabled={idx === awards.length - 1}
                  className="rounded p-1 hover:bg-muted disabled:opacity-30"
                  aria-label="Move down"
                >
                  <ArrowDownIcon className="size-3.5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{award.prize}</span>
                  <Tag className="text-[0.625rem]">{award.grade}</Tag>
                  <span className="text-[0.6875rem] text-muted-foreground">{award.date}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{award.title}</p>
                {award.referenceLink && (
                  <a
                    href={award.referenceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-[0.6875rem] text-primary hover:underline"
                  >
                    Reference <ExternalLinkIcon className="size-3" />
                  </a>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon-sm" onClick={() => openEdit(award)} aria-label="Edit">
                  <EditIcon className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleting(award)}
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
          title={editing.id ? "Edit Award" : "Add Award"}
          description="Fill in the award details. Prize and Title are required."
          open={!!editing}
          onClose={() => setEditing(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => setEditing(null)}>
                <XIcon className="size-3.5 mr-1.5" /> Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <SaveIcon className="size-3.5 mr-1.5" /> {saving ? "Saving..." : "Save Award"}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Prize / Award Name" required>
                <FormInput
                  id="award-prize"
                  value={editing.prize}
                  onChange={(e) => setEditing({ ...editing, prize: e.target.value })}
                  placeholder="Best Capstone Project"
                />
              </FormField>
              <FormField label="Grade / Level" required>
                <select
                  id="award-grade"
                  value={editing.grade}
                  onChange={(e) => setEditing({ ...editing, grade: e.target.value })}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs"
                >
                  {GRADE_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
            <FormField label="Full Title" required>
              <FormInput
                id="award-title"
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="Best Capstone Project – Program in Collaboration with IBM"
              />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Date" required>
                <FormInput
                  id="award-date"
                  type="date"
                  value={editing.date}
                  onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                />
              </FormField>
              <FormField label="Reference URL">
                <FormInput
                  id="award-ref"
                  value={editing.referenceLink || ""}
                  onChange={(e) => setEditing({ ...editing, referenceLink: e.target.value })}
                  placeholder="https://..."
                />
              </FormField>
            </div>
            <FormField label="Description (English)" description="Markdown supported">
              <FormTextarea
                id="award-desc"
                rows={4}
                value={editing.description || ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                placeholder="What was the project about? What did you achieve?"
              />
            </FormField>
            <FormField label="Description (Indonesian)" description="Optional translation">
              <FormTextarea
                id="award-desc-id"
                rows={4}
                value={editing.descriptionId || ""}
                onChange={(e) => setEditing({ ...editing, descriptionId: e.target.value })}
              />
            </FormField>
          </div>
        </AdminDialog>
      )}

      {/* Delete Confirmation */}
      {deleting && (
        <AdminAlertDialog
          title="Delete Award"
          description={`Are you sure you want to delete "${deleting.prize}"? This cannot be undone.`}
          open={!!deleting}
          onClose={() => setDeleting(null)}
          onConfirm={handleDelete}
          confirmText="Delete Award"
          variant="destructive"
        />
      )}
    </div>
  )
}
