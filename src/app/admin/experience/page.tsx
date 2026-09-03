"use client"

// ponytail: streamlined experience CRUD with company logo manager, role icon selector, skills tag manager, current-position toggle, modal editor and reordering
import { differenceInMonths, parse } from "date-fns"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  Building2Icon,
  EditIcon,
  ImageIcon,
  PlusIcon,
  SaveIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import React, { useEffect, useState } from "react"

import { IconRegistry } from "@/components/icon-registry"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tag } from "@/components/ui/tag"
import {
  deleteExperienceAction,
  fetchExperiencesAction,
  reorderExperiencesAction,
  saveExperienceAction,
} from "@/features/admin/actions/content-actions"
import { AdminAlertDialog, AdminDialog } from "@/features/admin/components/admin-dialog"
import {
  FormField,
  FormInput,
  FormMediaUpload,
  FormSelect,
  FormSwitch,
  FormTextarea,
} from "@/features/admin/components/admin-form-elements"
import { AdminHeader } from "@/features/admin/components/admin-header"
import { useToast } from "@/features/admin/components/admin-toast"
import type { AdminExperience } from "@/features/admin/types/admin"
import { cn } from "@/lib/utils"

function formatDuration(start: string, end?: string): string {
  if (!start) return ""
  const startHasMonth = start.includes(".")
  const endHasMonth = end ? end.includes(".") : true

  if (!startHasMonth && end && !endHasMonth) {
    const years = parseInt(end, 10) - parseInt(start, 10)
    if (years <= 0) return ""
    return `${years}y`
  }

  const parsePeriodDate = (str: string, fallbackMonth: "first" | "last"): Date => {
    if (str.includes(".")) {
      return parse(str, "MM.yyyy", new Date())
    }
    return parse(`${fallbackMonth === "last" ? "12" : "01"}.${str}`, "MM.yyyy", new Date())
  }

  const startDate = parsePeriodDate(start, "first")
  const endDate = end ? parsePeriodDate(end, "last") : new Date()

  const totalMonths = differenceInMonths(endDate, startDate) + 1
  if (totalMonths <= 0) return ""
  if (totalMonths < 12) return `${totalMonths}m`
  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12
  if (months === 0) return `${years}y`
  return `${years}y ${months}m`
}

const ROLE_ICONS = [
  { id: "astroid", label: "AI / Machine Learning", description: "AI Engineer, ML Cohort" },
  { id: "flask-conical", label: "Laboratory / Research", description: "Lab Assistant, Experiments" },
  { id: "graduation-cap", label: "University / Degree", description: "Higher Education, College" },
  { id: "school", label: "School / Academic", description: "High School, Academy" },
  { id: "network", label: "Network / Architecture", description: "Deep Learning, Systems" },
  { id: "bar-chart-3", label: "Data / Analytics", description: "Data Analyst, Statistics" },
  { id: "users", label: "Community / Organization", description: "GDGOC, Club, Team" },
  { id: "briefcase", label: "Work / Corporate", description: "Industry, Full-time, Business" },
]

const PRESET_LOGOS = [
  { label: "Custompedia", path: "/logos/custompedia.webp" },
  { label: "Pijak (Dicoding)", path: "/logos/pijak.webp" },
  { label: "Udinus", path: "/logos/udinus.webp" },
  { label: "GDGOC", path: "/logos/gdgoc.webp" },
  { label: "Asah", path: "/logos/asah.webp" },
  { label: "Dicoding", path: "/logos/dicoding.webp" },
  { label: "IBM", path: "/logos/ibm.webp" },
  { label: "Blockvizo", path: "/logos/blockvizo.svg" },
  { label: "DNCC", path: "/logos/dncc.webp" },
]

const SUGGESTED_SKILLS = [
  "Artificial Intelligence",
  "Machine Learning",
  "Deep Learning",
  "MLOps",
  "Teaching",
  "Mentorship",
  "Programming Fundamentals",
  "Software Development",
  "Debugging",
  "Data Analysis",
  "Team Leadership",
  "Communication",
  "Problem Solving",
]

export default function AdminExperiencePage() {
  const [experiences, setExperiences] = useState<AdminExperience[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingExp, setEditingExp] = useState<AdminExperience | null>(null)
  const [isCurrent, setIsCurrent] = useState(false)
  const [newSkill, setNewSkill] = useState("")
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
      companyLogo: "/logos/custompedia.webp",
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
          icon: "astroid",
          description: "",
          skills: ["Artificial Intelligence", "Machine Learning"],
        },
      ],
      isCurrentEmployer: true,
      displayOrder: experiences.length + 1,
    }
    setEditingExp(newExp)
    setIsCurrent(true)
    setNewSkill("")
    setErrors({})
    setModalOpen(true)
  }

  const openEditModal = (exp: AdminExperience) => {
    setEditingExp(JSON.parse(JSON.stringify(exp)))
    setIsCurrent(exp.isCurrentEmployer ?? !exp.positions[0]?.employmentPeriod?.end)
    setNewSkill("")
    setErrors({})
    setModalOpen(true)
  }

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= experiences.length) return

    const previous = [...experiences]
    const updated = [...experiences]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp

    updated.forEach((item, idx) => {
      item.displayOrder = idx + 1
    })

    setExperiences(updated)

    try {
      const res = await reorderExperiencesAction(updated)
      if (res.success) {
        if (res.data) setExperiences(res.data)
        success("Experience order updated.")
      } else {
        setExperiences(previous)
        error(res.message || "Failed to save experience order.")
      }
    } catch {
      setExperiences(previous)
      error("Failed to save experience order.")
    }
  }

  const handleAddSkill = (skillToAdd?: string) => {
    if (!editingExp) return
    const tag = (skillToAdd || newSkill).trim()
    if (!tag) return

    const positions = [...editingExp.positions]
    const currentSkills = positions[0]?.skills || []

    if (!currentSkills.includes(tag)) {
      positions[0] = {
        ...positions[0],
        skills: [...currentSkills, tag],
      }
      setEditingExp({ ...editingExp, positions })
    }
    if (!skillToAdd) {
      setNewSkill("")
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    if (!editingExp) return
    const positions = [...editingExp.positions]
    const currentSkills = positions[0]?.skills || []

    positions[0] = {
      ...positions[0],
      skills: currentSkills.filter((s) => s !== skillToRemove),
    }
    setEditingExp({ ...editingExp, positions })
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
      companyWebsite: editingExp.companyWebsite?.trim() || "",
      companyLogo: editingExp.companyLogo?.trim() || undefined,
      isCurrentEmployer: isCurrent,
      positions: [
        {
          ...pos,
          icon: pos.icon || "briefcase",
          skills: pos.skills || [],
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
        subtitle="Manage professional background, roles, achievements, skills, logos, and employment timeline."
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
              return (
                <div
                  key={exp.id}
                  className="flex items-start gap-3.5 p-4 sm:p-5 hover:bg-muted/20 transition-colors"
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
                      disabled={idx === experiences.length - 1}
                      className="rounded p-1 hover:bg-muted disabled:opacity-25 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Move down"
                    >
                      <ArrowDownIcon className="size-3.5" />
                    </button>
                  </div>

                  {/* Center Column: Homepage-Style Company + Timeline Node */}
                  <div className="flex-1 min-w-0 space-y-4">
                    {/* Company Header */}
                    <div className="flex items-center gap-3">
                      <div className="flex size-6 shrink-0 items-center justify-center select-none">
                        {exp.companyLogo ? (
                          <img
                            src={exp.companyLogo}
                            alt={`${exp.companyName} logo`}
                            width={24}
                            height={24}
                            className="size-6 rounded-full dark:bg-white dark:p-0.5 object-cover"
                            onError={(e) => {
                              ;(e.currentTarget as HTMLElement).style.display = "none"
                            }}
                          />
                        ) : (
                          <span className="flex size-2 rounded-full bg-muted-foreground/40" />
                        )}
                      </div>

                      <h3 className="text-lg leading-snug font-semibold text-foreground">
                        {exp.companyName}
                      </h3>
                    </div>

                    {/* Connected Timeline Positions */}
                    <div className="relative space-y-4 before:absolute before:left-3 before:h-full before:w-px before:bg-border">
                      {exp.positions.map((position, pIdx) => {
                        const pStart = position.employmentPeriod?.start || ""
                        const pEnd = position.employmentPeriod?.end
                        const pOngoing = exp.isCurrentEmployer || !pEnd
                        const pDuration = formatDuration(pStart, pOngoing ? undefined : pEnd)

                        return (
                          <div key={position.id || pIdx} className="group/experience-position relative">
                            <div
                              className="pointer-events-none absolute bottom-0 left-3 hidden size-4 bg-card group-last/experience-position:flex"
                              aria-hidden
                            >
                              <span className="size-full -translate-y-2.25 rounded-bl-sm border-b border-l border-border" />
                            </div>

                            <div>
                              <div className="relative z-1 mb-1 flex items-start gap-3">
                                <div
                                  className={cn(
                                    "flex size-6 shrink-0 items-center justify-center rounded-lg",
                                    "bg-muted text-muted-foreground",
                                    "border border-muted-foreground/15 ring-1 ring-line ring-offset-1 ring-offset-background",
                                    "[&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                                  )}
                                >
                                  <IconRegistry name={position.icon} />
                                </div>

                                <span className="flex-1 font-medium text-foreground text-balance">
                                  {position.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 pl-9 text-sm text-muted-foreground">
                                {position.employmentType && (
                                  <>
                                    <span>{position.employmentType}</span>
                                    <Separator
                                      className="data-vertical:h-4 data-vertical:self-center"
                                      orientation="vertical"
                                    />
                                  </>
                                )}

                                <span className="flex items-center gap-0.5 font-mono text-xs tabular-nums">
                                  <span>{pStart}</span>
                                  <span>-</span>
                                  <span>{pOngoing ? "Present" : pEnd}</span>
                                </span>

                                {pDuration && (
                                  <>
                                    <Separator
                                      className="data-vertical:h-4 data-vertical:self-center"
                                      orientation="vertical"
                                    />
                                    <span className="font-mono text-xs tabular-nums">{pDuration}</span>
                                  </>
                                )}
                              </div>

                              {Array.isArray(position.skills) && position.skills.length > 0 && (
                                <ul className="flex flex-wrap gap-1.5 pt-3 pl-9">
                                  {position.skills.map((skill, sIdx) => (
                                    <li key={sIdx} className="flex">
                                      <Tag>{skill}</Tag>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Right Column: Edit & Delete Actions */}
                  <div className="flex items-center gap-1 shrink-0 self-start">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEditModal(exp)}
                      aria-label="Edit experience"
                    >
                      <EditIcon className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(exp)}
                      aria-label="Delete experience"
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
          <form onSubmit={handleSave} className="space-y-4 max-h-[72vh] overflow-y-auto pr-1">
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

              <FormField label="Role / Position Title" required error={errors.title}>
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

            {/* Company Logo & Image Section (Same as Profile Photo pattern) */}
            <div className="rounded-lg border border-border/80 bg-muted/20 p-3 dark:border-line space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <ImageIcon className="size-3.5 text-primary" /> Company Logo / Image (Optional)
                </label>
                <span className="text-[11px] text-muted-foreground">
                  Displays on homepage next to title
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-full border-2 border-border bg-muted flex items-center justify-center">
                  {editingExp.companyLogo ? (
                    <img
                      src={editingExp.companyLogo}
                      alt={editingExp.companyName || "Logo preview"}
                      className="size-full object-cover"
                      onError={(e) => {
                        ;(e.currentTarget as HTMLElement).style.display = "none"
                      }}
                    />
                  ) : (
                    <Building2Icon className="size-6 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 w-full space-y-2">
                  <FormMediaUpload
                    value={editingExp.companyLogo || ""}
                    onChange={(val) => setEditingExp({ ...editingExp, companyLogo: val })}
                    placeholder="/logos/custompedia.webp or https://example.com/logo.png"
                    accept="image/*"
                    targetFolder="logos"
                  />

                  {/* Preset Quick Logos */}
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    <span className="text-[0.625rem] text-muted-foreground mr-1">Presets:</span>
                    {PRESET_LOGOS.map((preset) => {
                      const isCurrentLogo = editingExp.companyLogo === preset.path
                      return (
                        <button
                          key={preset.path}
                          type="button"
                          onClick={() => setEditingExp({ ...editingExp, companyLogo: preset.path })}
                          className={`rounded px-1.5 py-0.5 text-[0.625rem] font-mono transition-colors ${
                            isCurrentLogo
                              ? "bg-primary text-primary-foreground font-semibold"
                              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                          }`}
                        >
                          {preset.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Role Icon Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Role Icon <span className="text-muted-foreground font-normal">(displayed next to role)</span>
                </label>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>Selected:</span>
                  <div className="flex size-5 items-center justify-center rounded bg-muted text-foreground border border-border [&_svg]:size-3.5">
                    <IconRegistry name={editingExp.positions[0]?.icon || "briefcase"} />
                  </div>
                  <span className="font-mono text-[11px] text-foreground font-medium">
                    {editingExp.positions[0]?.icon || "briefcase"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ROLE_ICONS.map((iconItem) => {
                  const isSelected =
                    (editingExp.positions[0]?.icon || "briefcase").toLowerCase() === iconItem.id.toLowerCase()

                  return (
                    <button
                      key={iconItem.id}
                      type="button"
                      onClick={() => {
                        const positions = [...editingExp.positions]
                        positions[0] = { ...positions[0], icon: iconItem.id }
                        setEditingExp({ ...editingExp, positions })
                      }}
                      className={`flex items-center gap-2 rounded-lg border p-2 text-left transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary font-medium ring-1 ring-primary"
                          : "border-border/70 bg-card hover:bg-muted/60 text-foreground"
                      }`}
                    >
                      <div className="flex size-6 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground [&_svg]:size-3.5">
                        <IconRegistry name={iconItem.id} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium truncate">{iconItem.label}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
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

              <FormField
                label="Company Website (Optional)"
                description="If provided, clicking the title on the homepage opens this URL"
              >
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

            {/* Skills & Competency Badges Manager */}
            <div className="space-y-2 rounded-lg border border-border/80 bg-muted/20 p-3 dark:border-line">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Skills & Competency Badges <span className="text-muted-foreground font-normal">(displays under role on homepage)</span>
                </label>
                <span className="text-[11px] text-muted-foreground">
                  {(editingExp.positions[0]?.skills || []).length} badge(s)
                </span>
              </div>

              {/* Tag Input */}
              <div className="flex items-center gap-2">
                <FormInput
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddSkill()
                    }
                  }}
                  placeholder="Type skill tag (e.g. Artificial Intelligence, Mentorship) & press Enter..."
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddSkill()}
                  className="gap-1 shrink-0"
                >
                  <PlusIcon className="size-3.5" /> Add
                </Button>
              </div>

              {/* Active Badges List */}
              <div className="flex flex-wrap gap-1.5 pt-1 min-h-6">
                {(editingExp.positions[0]?.skills || []).map((skill, sIdx) => (
                  <Tag key={sIdx} className="flex items-center gap-1.5 py-1 px-2.5 text-xs font-mono">
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-muted-foreground hover:text-foreground ml-0.5"
                      aria-label={`Remove ${skill}`}
                    >
                      <XIcon className="size-3" />
                    </button>
                  </Tag>
                ))}
              </div>

              {/* Quick Suggestions Chips */}
              <div className="pt-2 border-t border-border/40">
                <div className="text-[0.6875rem] font-medium text-muted-foreground mb-1.5">
                  Quick Add Suggestions:
                </div>
                <div className="flex flex-wrap gap-1">
                  {SUGGESTED_SKILLS.map((suggestion) => {
                    const isAlreadyAdded = (editingExp.positions[0]?.skills || []).includes(suggestion)
                    return (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleAddSkill(suggestion)}
                        disabled={isAlreadyAdded}
                        className={`rounded-md px-2 py-0.5 text-[0.6875rem] font-mono transition-colors ${
                          isAlreadyAdded
                            ? "bg-muted/40 text-muted-foreground/50 cursor-not-allowed"
                            : "bg-muted text-muted-foreground hover:bg-muted/90 hover:text-foreground"
                        }`}
                      >
                        + {suggestion}
                      </button>
                    )
                  })}
                </div>
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

