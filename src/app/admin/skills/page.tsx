"use client"

// ponytail: compact skills management with TechnologyPicker, category filtering and level badges
import {
  ArrowDownIcon,
  ArrowUpIcon,
  EditIcon,
  PlusIcon,
  SaveIcon,
  Trash2Icon,
} from "lucide-react"
import React, { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Tag } from "@/components/ui/tag"
import {
  normalizeTechName,
} from "@/config/technology-catalog"
import {
  deleteSkillAction,
  fetchSkillsAction,
  reorderSkillsAction,
  saveSkillAction,
} from "@/features/admin/actions/content-actions"
import { AdminAlertDialog, AdminDialog } from "@/features/admin/components/admin-dialog"
import {
  FormField,
  FormSelect,
  FormSwitch,
} from "@/features/admin/components/admin-form-elements"
import { AdminHeader } from "@/features/admin/components/admin-header"
import { useToast } from "@/features/admin/components/admin-toast"
import { TechnologyPicker } from "@/features/admin/components/technology-picker"
import type { AdminSkill } from "@/features/admin/types/admin"

const CATEGORIES: AdminSkill["category"][] = [
  "AI / ML",
  "Frontend",
  "Backend",
  "Database",
  "DevOps / Cloud",
  "Testing",
  "Design / UI",
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
      category: "AI / ML",
      level: "Advanced",
      type: "technology",
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

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= filteredSkills.length) return

    const currentItem = filteredSkills[index]
    const targetItem = filteredSkills[targetIndex]
    if (!currentItem || !targetItem) return

    const originalIdx = skills.findIndex((s) => s.id === currentItem.id)
    const targetOriginalIdx = skills.findIndex((s) => s.id === targetItem.id)
    if (originalIdx < 0 || targetOriginalIdx < 0) return

    const backup = [...skills]
    const updated = [...skills]
    const temp = updated[originalIdx]
    updated[originalIdx] = updated[targetOriginalIdx]
    updated[targetOriginalIdx] = temp

    updated.forEach((s, idx) => {
      s.displayOrder = idx + 1
    })

    // Optimistic UI update
    setSkills(updated)

    try {
      const res = await reorderSkillsAction(updated)
      if (res.success) {
        if (res.data) {
          setSkills(res.data)
        }
        success(res.message || "Skill reordered.")
      } else {
        // Rollback on persistence failure
        setSkills(backup)
        error(res.message || "Failed to save skill reordering.")
      }
    } catch {
      setSkills(backup)
      error("Failed to save skill reordering.")
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSkill || !editingSkill.name.trim()) {
      error("Technology name is required.")
      return
    }

    if (!editingSkill.type) {
      error("Technology type is required. Please select from the catalog.")
      return
    }

    // Client-side duplicate check
    const isDuplicate = skills.some(
      (s) =>
        normalizeTechName(s.name) === normalizeTechName(editingSkill.name) &&
        s.id !== editingSkill.id
    )

    if (isDuplicate) {
      error(`Technology "${editingSkill.name}" already exists in your skills list.`)
      return
    }

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
            {filteredSkills.map((skill, idx) => {
              return (
                <div
                  key={skill.id}
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
                      disabled={idx === filteredSkills.length - 1}
                      className="rounded p-1 hover:bg-muted disabled:opacity-25 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Move down"
                    >
                      <ArrowDownIcon className="size-3.5" />
                    </button>
                  </div>

                  {/* Center Column: Skill Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/50 text-muted-foreground">
                      {skill.icon ? (
                        <svg className="size-4.5 fill-current text-foreground" viewBox="0 0 24 24" aria-hidden>
                          <use href={`/icons/tech-stack-v1.svg?v=2#${skill.icon}`} />
                        </svg>
                      ) : (
                        <span className="text-[10px] font-bold text-destructive uppercase">
                          !?
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {skill.name}
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
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
                        {skill.isFlaggedForReview && (
                          <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[0.625rem] font-medium text-destructive">
                            Review Needed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Edit & Delete Actions */}
                  <div className="flex items-center gap-1 shrink-0 self-start">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEditModal(skill)}
                      aria-label="Edit skill"
                    >
                      <EditIcon className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(skill)}
                      aria-label="Delete skill"
                    >
                      <Trash2Icon className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })}
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
            <FormField label="Technology / Skill" required description="Search from the curated catalog.">
              <TechnologyPicker
                value={editingSkill.name}
                onChange={(name) =>
                  setEditingSkill({
                    ...editingSkill,
                    name,
                  })
                }
                onSelectCatalog={(item) =>
                  setEditingSkill({
                    ...editingSkill,
                    name: item.name,
                    category: item.adminCategory,
                    type: item.type,
                    icon: item.iconId,
                  })
                }
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

