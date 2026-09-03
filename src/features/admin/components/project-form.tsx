"use client"

// ponytail: progressive disclosure project editor with tabbed sections, live preview and delete confirmation
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BookOpenIcon,
  CodeIcon,
  EyeIcon,
  ImageIcon,
  LayersIcon,
  PlusIcon,
  SaveIcon,
  SendIcon,
  SparklesIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Tag } from "@/components/ui/tag"

import {
  deleteProjectAction,
  ensureProjectFolderAction,
  saveProjectAction,
} from "../actions/content-actions"
import type { AdminProject, ContentStatus } from "../types/admin"
import { AdminAlertDialog, AdminDialog } from "./admin-dialog"
import {
  FormField,
  FormInput,
  FormMediaUpload,
  FormSelect,
  FormSwitch,
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
    featured: initialData?.featured ?? true,
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
  const [newGalleryImage, setNewGalleryImage] = useState("")

  // Automatically create dedicated project media folder (public/projects/[slug]/)
  useEffect(() => {
    if (project.id?.trim()) {
      void ensureProjectFolderAction(project.id.trim())
    }
  }, [project.id])

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
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${isActive
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
          <div className="rounded-xl border border-border/80 bg-card p-5 dark:border-line space-y-6">
            <h2 className="text-sm font-semibold text-foreground">Media & Assets</h2>

            {/* Hero Image */}
            <div className="space-y-3">
              <FormField
                label="Hero Image / Thumbnail Path"
                description={`Unggah gambar atau pilih dari galeri folder proyek (public/projects/${project.id || "[slug]"}/)`}
              >
                <FormMediaUpload
                  value={project.image}
                  onChange={(val) => handleChange("image", val)}
                  placeholder={`/projects/${project.id || "custora"}/1.webp`}
                  accept="image/*"
                  targetFolder="projects"
                  projectSlug={project.id}
                />
              </FormField>

              {project.image && (
                <div className="overflow-hidden rounded-lg border border-border max-w-md bg-muted/30 p-2">
                  <img
                    src={project.image}
                    alt="Thumbnail preview"
                    className="aspect-video w-full rounded object-cover"
                    onError={(e) => {
                      ;(e.currentTarget as HTMLElement).style.display = "none"
                    }}
                  />
                </div>
              )}
            </div>

            {/* Monochrome Logo */}
            <FormField label="Monochrome Logo Path (Optional)" description="Unggah logo proyek ke folder public/logos/ atau pilih dari katalog logo">
              <FormMediaUpload
                value={project.logo ?? ""}
                onChange={(val) => handleChange("logo", val)}
                placeholder="/logos/custompedia.webp"
                accept="image/*"
                targetFolder="logos"
              />
            </FormField>

            {/* Project Gallery Showcase */}
            <div className="border-t border-border/60 pt-5 space-y-4 dark:border-line">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <ImageIcon className="size-3.5 text-primary" /> Project Gallery Showcase ({project.gallery?.length || 0})
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Foto-foto galeri detail proyek (tersimpan di folder khusus <code className="text-primary font-mono text-[10px]">public/projects/{project.id || "[slug]"}/</code>)
                  </p>
                </div>
              </div>

              {/* Add to Gallery Section */}
              <div className="rounded-lg border border-border/70 bg-muted/20 p-3 space-y-2 dark:border-input dark:bg-input/10">
                <label className="text-xs font-medium text-foreground">Tambah Foto ke Galeri Proyek</label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex-1">
                    <FormMediaUpload
                      value={newGalleryImage}
                      onChange={(val) => setNewGalleryImage(val)}
                      placeholder={`/projects/${project.id || "slug"}/1.webp`}
                      accept="image/*"
                      targetFolder="projects"
                      projectSlug={project.id}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!newGalleryImage.trim()}
                    onClick={() => {
                      if (newGalleryImage.trim()) {
                        handleChange("gallery", [...(project.gallery || []), newGalleryImage.trim()])
                        setNewGalleryImage("")
                      }
                    }}
                    className="shrink-0 text-xs gap-1"
                  >
                    <PlusIcon className="size-3.5" /> Tambah ke Galeri
                  </Button>
                </div>
              </div>

              {/* Gallery Items Grid */}
              {(!project.gallery || project.gallery.length === 0) ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                  Belum ada foto di galeri proyek ini. Unggah atau pilih foto di atas untuk mengisi galeri.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
                  {project.gallery.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card dark:border-input"
                    >
                      <div className="relative aspect-video w-full overflow-hidden bg-muted flex items-center justify-center">
                        <img
                          src={imgUrl}
                          alt={`Gallery ${idx + 1}`}
                          className="size-full object-cover"
                          onError={(e) => {
                            ;(e.currentTarget as HTMLElement).style.display = "none"
                          }}
                        />
                        <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1 py-0.5 text-[9px] text-white font-mono">
                          #{idx + 1}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-1.5 bg-background/80 gap-1 border-t border-border/50">
                        <span className="truncate text-[10px] text-muted-foreground font-mono flex-1" title={imgUrl}>
                          {imgUrl.split("/").pop()}
                        </span>
                        <div className="flex items-center gap-0.5 shrink-0">
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...(project.gallery || [])]
                                const temp = next[idx]
                                next[idx] = next[idx - 1]
                                next[idx - 1] = temp
                                handleChange("gallery", next)
                              }}
                              className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                              title="Pindah ke kiri/atas"
                            >
                              <ArrowUpIcon className="size-3" />
                            </button>
                          )}
                          {idx < (project.gallery?.length || 0) - 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...(project.gallery || [])]
                                const temp = next[idx]
                                next[idx] = next[idx + 1]
                                next[idx + 1] = temp
                                handleChange("gallery", next)
                              }}
                              className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                              title="Pindah ke kanan/bawah"
                            >
                              <ArrowDownIcon className="size-3" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              handleChange(
                                "gallery",
                                project.gallery?.filter((_, i) => i !== idx) || []
                              )
                            }}
                            className="rounded p-0.5 text-muted-foreground hover:text-destructive transition-colors ml-0.5"
                            title="Hapus dari galeri proyek"
                          >
                            <Trash2Icon className="size-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
            <h2 className="text-sm font-semibold text-foreground">Publishing & Visibility</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Publication Status">
                <FormSelect
                  value={project.status ?? "published"}
                  onChange={(e) => handleChange("status", e.target.value as ContentStatus)}
                  options={[
                    { label: "Published (Visible on Portfolio)", value: "published" },
                    { label: "Draft (Saved privately)", value: "draft" },
                    { label: "Archived (Hidden from main list)", value: "archived" },
                  ]}
                />
              </FormField>

              <FormField label="Display Order (Sort weight)">
                <FormInput
                  type="number"
                  value={project.displayOrder ?? 1}
                  onChange={(e) => handleChange("displayOrder", parseInt(e.target.value, 10) || 1)}
                />
              </FormField>
            </div>

            <div className="border-t border-border/60 pt-4 dark:border-line">
              <FormSwitch
                checked={project.featured ?? false}
                onChange={(checked) => handleChange("featured", checked)}
                label="Featured Project"
                description="Highlight this project at the top of your portfolio homepage."
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions Bottom Bar */}
      <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/90 p-4 shadow-xl backdrop-blur-md dark:border-line">
        <Link href="/admin/projects">
          <Button variant="ghost" size="sm">
            Cancel
          </Button>
        </Link>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSubmit("draft")}
            disabled={isSaving}
            className="gap-1.5"
          >
            <SaveIcon className="size-3.5" /> Save Draft
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => handleSubmit("published")}
            disabled={isSaving}
            className="gap-1.5"
          >
            <SendIcon className="size-3.5" /> {isSaving ? "Saving..." : "Publish & Save"}
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
