"use client"

// ponytail: compact skills management with inline addition, category filtering and level badges
import {
  CpuIcon,
  PlusIcon,
  Trash2Icon,
  EditIcon,
  StarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SaveIcon,
} from "lucide-react"
import React, { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Tag } from "@/components/ui/tag"
import { deleteSkillAction, fetchSkillsAction, saveSkillAction } from "@/features/admin/actions/content-actions"
import { AdminAlertDialog, AdminDialog } from "@/features/admin/components/admin-dialog"
import { FormField, FormInput, FormSelect, FormSwitch } from "@/features/admin/components/admin-form-elements"
import { AdminHeader } from "@/features/admin/components/admin-header"
import { useToast } from "@/features/admin/components/admin-toast"
import type { AdminSkill } from "@/features/admin/types/admin"

const CATEGORIES: AdminSkill["category"][] = [
  "AI",
  "Machine Learning",
  "Deep Learning",
  "MLOps",
  "Backend",
  "Frontend",
  "Data",
  "Tools",
  "Other",
]

const LEVELS: AdminSkill["level"][] = ["Beginner", "Intermediate", "Advanced", "Expert"]

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<AdminSkill[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState<AdminSkill | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminSkill | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { success, error } = useToast()

  const loadSkills = () => {
    fetchSkillsAction().then((data) => {
      setSkills(data)
      setLoading(false)
    })
  }

  useEffect(() => {
    loadSkills()
  }, [])

  const filteredSkills = useMemo(() => {
    return skills.filter(
      (s) => categoryFilter === "all" || s.category === categoryFilter
    )
  }, [skills, categoryFilter])

  const openCreateModal = () => {
    const newSkill: AdminSkill = {
      id: `skill-${Date.now()}`,
      name: "",
      category: "AI",
      level: "Advanced",
      icon: "",
      featured: true,
      displayOrder: skills.length + 1,
    }
    setEditingSkill(newSkill)
    setModalOpen(true)
  }

  const openEditModal = (skill: AdminSkill) => {
    setEditingSkill({ ...skill })
    setModalOpen(true)
  }

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= skills.length) return

    const updated = [...skills]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp

    updated.forEach((s, idx) => {
      s.displayOrder = idx + 1
    })

    setSkills(updated)
    success("Skill reordered.")
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSkill || !editingSkill.name.trim()) return

    setIsSaving(true)
    try {
      const res = await saveSkillAction(editingSkill)
      if (res.success) {
        success(res.message)
        setModalOpen(false)
        loadSkills()
      } else {
        error(res.message)
      }
    } catch {
      error("Failed to save skill.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const res = await deleteSkillAction(deleteTarget.id)
      if (res.success) {
        success(res.message)
        setDeleteTarget(null)
        loadSkills()
      } else {
        error(res.message)
      }
    } catch {
      error("Failed to delete skill.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Skills & Tech Stack"
        subtitle="Manage technical competencies, proficiency levels, and category badges."
        actions={
          <Button size="sm" onClick={openCreateModal} className="gap-1.5">
            <PlusIcon className="size-3.5" /> Add Skill
          </Button>
        }
      />

      {/* Category Filter Pills */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <button
          type="button"
          onClick={() => setCategoryFilter("all")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
            categoryFilter === "all"
              ? "bg-primary text-primary-foreground font-semibold"
              : "bg-muted/60 text-muted-foreground hover:text-foreground"
          }`}
        >
          All Categories ({skills.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = skills.filter((s) => s.category === cat).length
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                categoryFilter === cat
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat} ({count})
            </button>
          )
        })}
      </div>

      {/* Skills Grid */}
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden dark:border-line">
        {loading ? (
          <div className="p-8 text-center text-xs text-muted-foreground">Loading skills...</div>
        ) : filteredSkills.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-xs text-muted-foreground">No skills in this category yet.</p>
            <Button size="xs" onClick={openCreateModal} className="gap-1">
              <PlusIcon className="size-3" /> Add First Skill
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border/60 dark:divide-line">
            {filteredSkills.map((skill, idx) => (
              <div
                key={skill.id}
                className="flex items-center justify-between gap-3 p-3 sm:px-5 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground text-xs font-mono font-bold">
                    {skill.name.charAt(0)}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {skill.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Tag className="text-[0.625rem]">{skill.category}</Tag>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[0.625rem] font-medium ${
                          skill.level === "Expert"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : skill.level === "Advanced"
                            ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {skill.level}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
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
                    disabled={idx === filteredSkills.length - 1}
                    onClick={() => handleMove(idx, "down")}
                    aria-label="Move down"
                  >
                    <ArrowDownIcon className="size-3" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon-xs"
                    onClick={() => openEditModal(skill)}
                    aria-label="Edit skill"
                  >
                    <EditIcon className="size-3" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon-xs"
                    onClick={() => setDeleteTarget(skill)}
                    aria-label="Delete skill"
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
      {editingSkill && (
        <AdminDialog
          open={modalOpen}
          onClose={() => !isSaving && setModalOpen(false)}
          title={editingSkill.name ? `Edit: ${editingSkill.name}` : "Add New Skill"}
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
                {isSaving ? "Saving..." : "Save Skill"}
              </Button>
            </>
          }
        >
          <form onSubmit={handleSave} className="space-y-4">
            <FormField label="Skill / Technology Name" required>
              <FormInput
                value={editingSkill.name}
                onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                placeholder="PyTorch"
                autoFocus
              />
            </FormField>

            <FormField label="Category">
              <FormSelect
                value={editingSkill.category}
                onChange={(e) =>
                  setEditingSkill({
                    ...editingSkill,
                    category: e.target.value as AdminSkill["category"],
                  })
                }
                options={CATEGORIES.map((c) => ({ label: c, value: c }))}
              />
            </FormField>

            <FormField label="Proficiency Level">
              <FormSelect
                value={editingSkill.level}
                onChange={(e) =>
                  setEditingSkill({
                    ...editingSkill,
                    level: e.target.value as AdminSkill["level"],
                  })
                }
                options={LEVELS.map((l) => ({ label: l, value: l }))}
              />
            </FormField>

            <div className="pt-2 border-t border-border/60 dark:border-line">
              <FormSwitch
                checked={editingSkill.featured ?? false}
                onChange={(val) => setEditingSkill({ ...editingSkill, featured: val })}
                label="Featured Tech"
                description="Highlight this technology in your top stack"
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
        title="Delete Skill?"
        description={`Are you sure you want to remove "${deleteTarget?.name}" from your skills list?`}
        confirmText="Delete Skill"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  )
}
