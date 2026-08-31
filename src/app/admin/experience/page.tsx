"use client"

// ponytail: streamlined experience CRUD with current-position toggle, modal editor and reordering
import {
  BriefcaseIcon,
  PlusIcon,
  EditIcon,
  Trash2Icon,
  ArrowUpIcon,
  ArrowDownIcon,
  Building2Icon,
  CalendarIcon,
  MapPinIcon,
  SaveIcon,
  XIcon,
} from "lucide-react"
import React, { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Tag } from "@/components/ui/tag"
import {
  deleteExperienceAction,
  fetchExperiencesAction,
  saveExperienceAction,
} from "@/features/admin/actions/content-actions"
import { AdminAlertDialog, AdminDialog } from "@/features/admin/components/admin-dialog"
import {
  FormField,
  FormInput,
  FormSelect,
  FormSwitch,
  FormTextarea,
} from "@/features/admin/components/admin-form-elements"
import { AdminHeader } from "@/features/admin/components/admin-header"
import { useToast } from "@/features/admin/components/admin-toast"
import type { AdminExperience } from "@/features/admin/types/admin"

export default function AdminExperiencePage() {
  const [experiences, setExperiences] = useState<AdminExperience[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingExp, setEditingExp] = useState<AdminExperience | null>(null)
  const [isCurrent, setIsCurrent] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminExperience | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { success, error } = useToast()

  const loadData = () => {
    fetchExperiencesAction().then((data) => {
      setExperiences(data)
      setLoading(false)
    })
  }

  useEffect(() => {
    loadData()
  }, [])

  const openCreateModal = () => {
    const newExp: AdminExperience = {
      id: `exp-${Date.now()}`,
      companyName: "",
      companyLogo: "/logos/company.webp",
      companyWebsite: "",
      positions: [
        {
          id: `pos-${Date.now()}`,
          title: "",
          employmentPeriod: {
            start: "01.2026",
            end: undefined,
          },
          employmentType: "Full-time",
          description: "",
          skills: ["Machine Learning", "Python"],
        },
      ],
      isCurrentEmployer: true,
      displayOrder: experiences.length + 1,
    }
    setEditingExp(newExp)
    setIsCurrent(true)
    setErrors({})
    setModalOpen(true)
  }

  const openEditModal = (exp: AdminExperience) => {
    setEditingExp(JSON.parse(JSON.stringify(exp)))
    setIsCurrent(exp.isCurrentEmployer ?? !exp.positions[0]?.employmentPeriod?.end)
    setErrors({})
    setModalOpen(true)
  }

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= experiences.length) return

    const updated = [...experiences]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp

    updated.forEach((item, idx) => {
      item.displayOrder = idx + 1
    })

    setExperiences(updated)
    success("Experience reordered.")
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingExp) return

    const pos = editingExp.positions[0]
    const errs: Record<string, string> = {}
    if (!editingExp.companyName.trim()) errs.companyName = "Company/Organization name is required."
    if (!pos?.title?.trim()) errs.title = "Role / Position title is required."
    if (!pos?.employmentPeriod?.start?.trim()) errs.start = "Start date is required."

    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setIsSaving(true)
    const payload: AdminExperience = {
      ...editingExp,
      isCurrentEmployer: isCurrent,
      positions: [
        {
          ...pos,
          employmentPeriod: {
            start: pos.employmentPeriod.start,
            end: isCurrent ? undefined : pos.employmentPeriod.end,
          },
        },
      ],
    }

    try {
      const res = await saveExperienceAction(payload)
      if (res.success) {
        success(res.message)
        setModalOpen(false)
        loadData()
      } else {
        error(res.message)
      }
    } catch {
      error("Failed to save experience.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const res = await deleteExperienceAction(deleteTarget.id)
      if (res.success) {
        success(res.message)
        setDeleteTarget(null)
        loadData()
      } else {
        error(res.message)
      }
    } catch {
      error("Failed to delete experience.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Experience Management"
        subtitle="Manage professional background, roles, achievements, and employment timeline."
        actions={
          <Button size="sm" onClick={openCreateModal} className="gap-1.5">
            <PlusIcon className="size-3.5" /> Add Experience
          </Button>
        }
      />

      {/* Experience List */}
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden dark:border-line">
        {loading ? (
          <div className="p-8 text-center text-xs text-muted-foreground">Loading experiences...</div>
        ) : experiences.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-xs text-muted-foreground">No experience records added yet.</p>
            <Button size="xs" onClick={openCreateModal} className="gap-1">
              <PlusIcon className="size-3" /> Add Experience
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border/60 dark:divide-line">
            {experiences.map((exp, idx) => {
              const pos = exp.positions[0]
              return (
                <div
                  key={exp.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/50 text-foreground font-bold text-xs">
                      {exp.companyName.charAt(0)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">
                          {exp.companyName}
                        </span>
                        {exp.isCurrentEmployer && (
                          <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[0.625rem] font-medium text-emerald-600 dark:text-emerald-400">
                            Current Role
                          </span>
                        )}
                        <Tag className="text-[0.625rem]">{pos?.employmentType || "Full-time"}</Tag>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{pos?.title}</span> •{" "}
                        <span>
                          {pos?.employmentPeriod?.start} –{" "}
                          {exp.isCurrentEmployer || !pos?.employmentPeriod?.end
                            ? "Present"
                            : pos?.employmentPeriod?.end}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    {/* Reorder Buttons */}
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
                      disabled={idx === experiences.length - 1}
                      onClick={() => handleMove(idx, "down")}
                      aria-label="Move down"
                    >
                      <ArrowDownIcon className="size-3" />
                    </Button>

                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => openEditModal(exp)}
                      className="gap-1 ml-1"
                    >
                      <EditIcon className="size-3" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon-xs"
                      onClick={() => setDeleteTarget(exp)}
                      aria-label="Delete experience"
                    >
                      <Trash2Icon className="size-3" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Experience Edit / Create Modal */}
      {editingExp && (
        <AdminDialog
          open={modalOpen}
          onClose={() => !isSaving && setModalOpen(false)}
          title={editingExp.companyName ? `Edit: ${editingExp.companyName}` : "Add Work Experience"}
          maxWidth="lg"
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
                {isSaving ? "Saving..." : "Save Experience"}
              </Button>
            </>
          }
        >
          <form onSubmit={handleSave} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Company / Organization" required error={errors.companyName}>
                <FormInput
                  value={editingExp.companyName}
                  onChange={(e) =>
                    setEditingExp({ ...editingExp, companyName: e.target.value })
                  }
                  placeholder="PT Custompedia Creative Group"
                  error={errors.companyName}
                />
              </FormField>

              <FormField label="Role / Position" required error={errors.title}>
                <FormInput
                  value={editingExp.positions[0]?.title || ""}
                  onChange={(e) => {
                    const positions = [...editingExp.positions]
                    positions[0] = { ...positions[0], title: e.target.value }
                    setEditingExp({ ...editingExp, positions })
                  }}
                  placeholder="AI Engineer Intern"
                  error={errors.title}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Employment Type">
                <FormSelect
                  value={editingExp.positions[0]?.employmentType || "Full-time"}
                  onChange={(e) => {
                    const positions = [...editingExp.positions]
                    positions[0] = { ...positions[0], employmentType: e.target.value }
                    setEditingExp({ ...editingExp, positions })
                  }}
                  options={[
                    { label: "Full-time", value: "Full-time" },
                    { label: "Part-time", value: "Part-time" },
                    { label: "Contract", value: "Contract" },
                    { label: "Internship", value: "Internship" },
                    { label: "Cohort", value: "Cohort" },
                    { label: "Volunteer", value: "Volunteer" },
                    { label: "Freelance", value: "Freelance" },
                  ]}
                />
              </FormField>

              <FormField label="Company Website (Optional)">
                <FormInput
                  value={editingExp.companyWebsite || ""}
                  onChange={(e) =>
                    setEditingExp({ ...editingExp, companyWebsite: e.target.value })
                  }
                  placeholder="https://company.com"
                />
              </FormField>
            </div>

            {/* Current Position Toggle & Dates */}
            <div className="rounded-lg border border-border/80 bg-muted/30 p-3 space-y-3 dark:border-line">
              <FormSwitch
                checked={isCurrent}
                onChange={(val) => setIsCurrent(val)}
                label="Currently Working Here"
                description="Marks this position as ongoing (End Date will display as 'Present')"
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2 border-t border-border/50">
                <FormField label="Start Date" required error={errors.start} description="Format: MM.YYYY or YYYY">
                  <FormInput
                    value={editingExp.positions[0]?.employmentPeriod?.start || ""}
                    onChange={(e) => {
                      const positions = [...editingExp.positions]
                      positions[0] = {
                        ...positions[0],
                        employmentPeriod: {
                          ...positions[0].employmentPeriod,
                          start: e.target.value,
                        },
                      }
                      setEditingExp({ ...editingExp, positions })
                    }}
                    placeholder="07.2026"
                    error={errors.start}
                  />
                </FormField>

                {!isCurrent && (
                  <FormField label="End Date" description="Format: MM.YYYY or YYYY">
                    <FormInput
                      value={editingExp.positions[0]?.employmentPeriod?.end || ""}
                      onChange={(e) => {
                        const positions = [...editingExp.positions]
                        positions[0] = {
                          ...positions[0],
                          employmentPeriod: {
                            ...positions[0].employmentPeriod,
                            end: e.target.value,
                          },
                        }
                        setEditingExp({ ...editingExp, positions })
                      }}
                      placeholder="12.2026"
                    />
                  </FormField>
                )}
              </div>
            </div>

            <FormField
              label="Responsibilities & Achievements (Markdown)"
              description="Use bullet points and bold text to highlight key contributions"
            >
              <FormTextarea
                rows={5}
                value={editingExp.positions[0]?.description || ""}
                onChange={(e) => {
                  const positions = [...editingExp.positions]
                  positions[0] = { ...positions[0], description: e.target.value }
                  setEditingExp({ ...editingExp, positions })
                }}
                placeholder="- Built and deployed AI models for sentiment analysis\n- Improved data pipeline latency by 40%"
              />
            </FormField>
          </form>
        </AdminDialog>
      )}

      {/* Delete Confirmation Alert */}
      <AdminAlertDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Experience?"
        description={`Are you sure you want to delete "${deleteTarget?.companyName}" from your work history? This action cannot be undone.`}
        confirmText="Delete Experience"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  )
}
