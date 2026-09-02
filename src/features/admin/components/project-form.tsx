"use client"

// ponytail: progressive disclosure project editor with tabbed sections, live preview and delete confirmation
import {
  ArrowLeftIcon,
  BookOpenIcon,
  CodeIcon,
  EyeIcon,
  ImageIcon,
  LayersIcon,
  PlusIcon,
  SaveIcon,
  SparklesIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useState } from "react"

import { Button } from "@/components/ui/button"
import { Tag } from "@/components/ui/tag"

import { deleteProjectAction, saveProjectAction } from "../actions/content-actions"
import type { AdminProject, ContentStatus } from "../types/admin"
import { AdminAlertDialog, AdminDialog } from "./admin-dialog"
import {
  FormField,
  FormInput,
  FormSelect,
  FormTextarea,
} from "./admin-form-elements"
import { AdminHeader } from "./admin-header"
import { useToast } from "./admin-toast"

export interface ProjectFormProps {
  initialData?: AdminProject | null
  isNew?: boolean
}

type TabKey = "basic" | "casestudy" | "media" | "technical" | "publishing"

export function ProjectForm({ initialData, isNew = false }: ProjectFormProps) {
  const router = useRouter()
  const { success, error } = useToast()

  const defaultProject: AdminProject = {
    id: initialData?.id || "",
    title: initialData?.title || "",
    category: initialData?.category || "AI / Full Stack",
    tagline: initialData?.tagline || "",
    seoDescription: initialData?.seoDescription || "",
    year: initialData?.year || "2026",
    period: initialData?.period || { start: "2026" },
    image: initialData?.image || "/image/projects/custora.webp",
    link: initialData?.link || "https://github.com/zickrian",
    links: {
      repo: initialData?.links?.repo || "https://github.com/zickrian",
      live: initialData?.links?.live || "",
    },
    skills: initialData?.skills || ["Python", "Next.js", "PyTorch"],
    coverSkills: initialData?.coverSkills || ["Next.js", "AI"],
    features: initialData?.features || ["AI Model Inference", "Interactive Dashboard"],
    impact: initialData?.impact || ["Improved decision accuracy by 35%"],
    collaboration: {
      ownership: initialData?.collaboration?.ownership || "Solo project",
      label: initialData?.collaboration?.label || "Solo",
      team: initialData?.collaboration?.team || "Personal Project",
      role: initialData?.collaboration?.role || "Full Stack AI Engineer",
      contributions: initialData?.collaboration?.contributions || [
        "Architected end-to-end AI workflow",
        "Built responsive UI and server actions",
      ],
    },
    description: initialData?.description || "",
    notes: initialData?.notes || "",
    badge: initialData?.badge || "",
    gallery: initialData?.gallery || [],
    status: initialData?.status || "published",
    displayOrder: initialData?.displayOrder || 1,
  }

  const [project, setProject] = useState<AdminProject>(defaultProject)
  const [activeTab, setActiveTab] = useState<TabKey>("basic")
  const [isSaving, setIsSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Array inputs helpers
  const [newSkill, setNewSkill] = useState("")
  const [newFeature, setNewFeature] = useState("")
  const [newImpact, setNewImpact] = useState("")

  const handleChange = <K extends keyof AdminProject>(field: K, value: AdminProject[K]) => {
    setProject((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!project.title.trim()) errs.title = "Project title is required."
    if (!project.id.trim()) errs.id = "Project Slug / ID is required."
    if (!project.tagline.trim()) errs.tagline = "Tagline is required."
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (targetStatus?: ContentStatus) => {
    if (!validate()) {
      setActiveTab("basic")
      return
    }

    setIsSaving(true)
    const payload: AdminProject = {
      ...project,
      status: targetStatus ?? project.status ?? "published",
    }

    try {
      const res = await saveProjectAction(payload)
      if (res.success) {
        success(res.message)
        if (isNew) {
          router.push(`/admin/projects/${payload.id}`)
        }
      } else {
        error(res.message)
      }
    } catch {
      error("Failed to save project.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await deleteProjectAction(project.id)
      if (res.success) {
        success(res.message)
        setDeleteOpen(false)
        router.push("/admin/projects")
      } else {
        error(res.message)
      }
    } catch {
      error("Failed to delete project.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title={isNew ? "Create New Project" : `Edit: ${project.title || "Project"}`}
        subtitle="Manage project case study, screenshots, technical stack, and publication status."
        backHref="/admin/projects"
        backLabel="Back to Projects"
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPreviewOpen(true)}
              className="gap-1.5"
            >
              <EyeIcon className="size-3.5" /> Preview
            </Button>
            {!isNew && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setDeleteOpen(true)}
                className="gap-1.5"
              >
                <Trash2Icon className="size-3.5" /> Delete
              </Button>
            )}
          </div>
        }
      />

      {/* Tabs Navigation */}
      <div className="flex border-b border-border/80 overflow-x-auto no-scrollbar gap-2 dark:border-line">
        {[
          { key: "basic", label: "Basic Info", icon: BookOpenIcon },
          { key: "casestudy", label: "Case Study", icon: SparklesIcon },
          { key: "media", label: "Media & Gallery", icon: ImageIcon },
          { key: "technical", label: "Technical", icon: CodeIcon },
          { key: "publishing", label: "Publishing", icon: LayersIcon },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        {/* 1. BASIC INFO */}
        {activeTab === "basic" && (
          <div className="rounded-xl border border-border/80 bg-card p-5 dark:border-line space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Basic Information</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Project Title" required error={errors.title}>
                <FormInput
                  value={project.title}
                  onChange={(e) => {
                    handleChange("title", e.target.value)
                    if (isNew && !project.id) {
                      handleChange(
                        "id",
                        e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
                      )
                    }
                  }}
                  placeholder="Narratio AI"
                  error={errors.title}
                />
              </FormField>

              <FormField label="Slug / ID" required error={errors.id} description="URL slug e.g. /projects/naratioai">
                <FormInput
                  value={project.id}
                  onChange={(e) => handleChange("id", e.target.value.toLowerCase())}
                  placeholder="naratioai"
                  disabled={!isNew}
                  error={errors.id}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Category">
                <FormInput
                  value={project.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  placeholder="AI / Full Stack"
                />
              </FormField>

              <FormField label="Highlight Badge (Optional)" description="e.g. Winner, Top 5 Finalist">
                <FormInput
                  value={project.badge ?? ""}
                  onChange={(e) => handleChange("badge", e.target.value)}
                  placeholder="Best AI Project 2026"
                />
              </FormField>
            </div>

            <FormField label="Tagline / Short Pitch" required error={errors.tagline}>
              <FormInput
                value={project.tagline}
                onChange={(e) => handleChange("tagline", e.target.value)}
                placeholder="AI-powered deck generator turning raw web research into executive presentations."
                error={errors.tagline}
              />
            </FormField>

            <FormField label="Full Description / Markdown">
              <FormTextarea
                rows={5}
                value={project.description ?? ""}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Detailed explanation of the project context, capabilities, and highlights..."
              />
            </FormField>
          </div>
        )}

        {/* 2. CASE STUDY */}
        {activeTab === "casestudy" && (
          <div className="rounded-xl border border-border/80 bg-card p-5 dark:border-line space-y-6">
            <h2 className="text-sm font-semibold text-foreground">Case Study & Key Highlights</h2>

            {/* Key Features */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-foreground">Core Features</label>
              <div className="flex gap-2">
                <FormInput
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a notable feature..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      if (newFeature.trim()) {
                        handleChange("features", [...project.features, newFeature.trim()])
                        setNewFeature("")
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (newFeature.trim()) {
                      handleChange("features", [...project.features, newFeature.trim()])
                      setNewFeature("")
                    }
                  }}
                >
                  <PlusIcon className="size-3.5" /> Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {project.features.map((feat, idx) => (
                  <Tag key={idx} className="flex items-center gap-1.5 py-1 px-2.5 text-xs">
                    <span>{feat}</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleChange(
                          "features",
                          project.features.filter((_, i) => i !== idx)
                        )
                      }
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <XIcon className="size-3" />
                    </button>
                  </Tag>
                ))}
              </div>
            </div>

            {/* Impact & Results */}
            <div className="space-y-3 border-t border-border/60 pt-4 dark:border-line">
              <label className="text-xs font-medium text-foreground">Impact & Measurable Results</label>
              <div className="flex gap-2">
                <FormInput
                  value={newImpact}
                  onChange={(e) => setNewImpact(e.target.value)}
                  placeholder="e.g. Handled 10,000+ API requests with 99.8% uptime..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      if (newImpact.trim()) {
                        handleChange("impact", [...project.impact, newImpact.trim()])
                        setNewImpact("")
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (newImpact.trim()) {
                      handleChange("impact", [...project.impact, newImpact.trim()])
                      setNewImpact("")
                    }
                  }}
                >
                  <PlusIcon className="size-3.5" /> Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {project.impact.map((imp, idx) => (
                  <Tag key={idx} className="flex items-center gap-1.5 py-1 px-2.5 text-xs">
                    <span>{imp}</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleChange(
                          "impact",
                          project.impact.filter((_, i) => i !== idx)
                        )
                      }
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <XIcon className="size-3" />
                    </button>
                  </Tag>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. MEDIA */}
        {activeTab === "media" && (
          <div className="rounded-xl border border-border/80 bg-card p-5 dark:border-line space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Media & Assets</h2>

            <FormField label="Hero Image / Thumbnail Path" description="Image under /public (e.g. /image/projects/custora.webp) or HTTPS URL">
              <FormInput
                value={project.image}
                onChange={(e) => handleChange("image", e.target.value)}
                placeholder="/image/projects/narratio.webp"
              />
            </FormField>

            {project.image && (
              <div className="overflow-hidden rounded-lg border border-border max-w-md bg-muted/30 p-2">
                <img
                  src={project.image}
                  alt="Thumbnail preview"
                  className="aspect-video w-full rounded object-cover"
                />
              </div>
            )}

            <FormField label="Monochrome Logo Path (Optional)">
              <FormInput
                value={project.logo ?? ""}
                onChange={(e) => handleChange("logo", e.target.value)}
                placeholder="/logos/projects/custompedia.svg"
              />
            </FormField>
          </div>
        )}

        {/* 4. TECHNICAL */}
        {activeTab === "technical" && (
          <div className="rounded-xl border border-border/80 bg-card p-5 dark:border-line space-y-6">
            <h2 className="text-sm font-semibold text-foreground">Technical Stack & Repository</h2>

            {/* Skills */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-foreground">Technologies Used</label>
              <div className="flex gap-2">
                <FormInput
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="e.g. Next.js, FastAPI, PostgreSQL..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      if (newSkill.trim()) {
                        handleChange("skills", [...project.skills, newSkill.trim()])
                        setNewSkill("")
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (newSkill.trim()) {
                      handleChange("skills", [...project.skills, newSkill.trim()])
                      setNewSkill("")
                    }
                  }}
                >
                  <PlusIcon className="size-3.5" /> Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {project.skills.map((skill, idx) => (
                  <Tag key={idx} className="flex items-center gap-1.5 py-1 px-2.5 text-xs">
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleChange(
                          "skills",
                          project.skills.filter((_, i) => i !== idx)
                        )
                      }
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <XIcon className="size-3" />
                    </button>
                  </Tag>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-border/60 pt-4 dark:border-line">
              <FormField label="GitHub Repository URL">
                <FormInput
                  value={project.links?.repo ?? ""}
                  onChange={(e) =>
                    handleChange("links", { ...project.links, repo: e.target.value })
                  }
                  placeholder="https://github.com/zickrian/project"
                />
              </FormField>

              <FormField label="Live Demo URL">
                <FormInput
                  value={project.links?.live ?? ""}
                  onChange={(e) =>
                    handleChange("links", { ...project.links, live: e.target.value })
                  }
                  placeholder="https://demo.zickrian.dev"
                />
              </FormField>
            </div>
          </div>
        )}

        {/* 5. PUBLISHING */}
        {activeTab === "publishing" && (
          <div className="rounded-xl border border-border/80 bg-card p-5 dark:border-line space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h2 className="text-sm font-semibold text-foreground">Publishing & Visibility</h2>
              <span
                className={`rounded px-2 py-0.5 text-xs font-medium uppercase ${
                  project.status === "draft"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : project.status === "archived"
                    ? "bg-zinc-500/10 text-zinc-500"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                Status: {project.status ?? "published"}
              </span>
            </div>

            <div>
              <FormField
                label="Publication Status"
                description="Tentukan visibilitas proyek ini. Proyek dengan status Published akan ditampilkan di portfolio publik."
              >
                <FormSelect
                  value={project.status ?? "published"}
                  onChange={(e) => handleChange("status", e.target.value as ContentStatus)}
                  options={[
                    { label: "Published (Visible on Portfolio)", value: "published" },
                    { label: "Draft (Saved privately, hidden from public)", value: "draft" },
                    { label: "Archived (Hidden from main portfolio list)", value: "archived" },
                  ]}
                />
              </FormField>
            </div>
          </div>
        )}
      </div>

      {/* Actions Bottom Bar */}
      <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/90 p-4 shadow-xl backdrop-blur-md dark:border-line">
        <Link href="/admin/projects">
          <Button variant="outline" size="sm" className="gap-1.5">
            <ArrowLeftIcon className="size-3.5" /> Back to Projects
          </Button>
        </Link>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            size="sm"
            onClick={() => handleSubmit()}
            disabled={isSaving}
            className="gap-1.5 min-w-[130px]"
          >
            <SaveIcon className="size-3.5" />
            {isSaving
              ? "Saving..."
              : isNew
              ? "Create Project"
              : project.status === "draft"
              ? "Save Draft"
              : project.status === "archived"
              ? "Save (Archived)"
              : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Alert */}
      <AdminAlertDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Project?"
        description={`This action cannot be undone. Are you sure you want to permanently delete "${project.title}" from your portfolio?`}
        confirmText="Delete Project"
        variant="destructive"
        isLoading={isDeleting}
      />

      {/* Live Preview Modal */}
      <AdminDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={`Preview: ${project.title || "Project"}`}
        maxWidth="lg"
      >
        <div className="space-y-4 rounded-xl border border-line bg-card p-5">
          {project.image && (
            <img
              src={project.image}
              alt={project.title}
              className="aspect-video w-full rounded-lg object-cover"
            />
          )}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">{project.title || "Untitled"}</h3>
              {project.badge && <Tag className="text-[0.625rem] text-primary">{project.badge}</Tag>}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{project.tagline}</p>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-line">
            {project.skills.map((skill, i) => (
              <Tag key={i} className="text-[0.625rem]">{skill}</Tag>
            ))}
          </div>
        </div>
      </AdminDialog>
    </div>
  )
}
