"use client"

// ponytail: projects list view with fast client-side filtering, mobile card stack and delete dialog
import {
  ArrowDownIcon,
  ArrowUpIcon,
  EditIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react"
import Link from "next/link"
import React, { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Tag } from "@/components/ui/tag"
import {
  deleteProjectAction,
  fetchProjectsAction,
  reorderProjectsAction,
} from "@/features/admin/actions/content-actions"
import { AdminAlertDialog } from "@/features/admin/components/admin-dialog"
import { FormInput } from "@/features/admin/components/admin-form-elements"
import { AdminHeader } from "@/features/admin/components/admin-header"
import { useToast } from "@/features/admin/components/admin-toast"
import type { AdminProject } from "@/features/admin/types/admin"

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<AdminProject[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy] = useState<"order" | "title" | "date">("order")
  const [projectToDelete, setProjectToDelete] = useState<AdminProject | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { success, error } = useToast()

  const loadProjects = () => {
    fetchProjectsAction().then((data) => {
      setProjects(data)
      setLoading(false)
    })
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= projects.length) return

    const previous = [...projects]
    const updated = [...projects]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp

    updated.forEach((item, idx) => {
      item.displayOrder = idx + 1
    })

    setProjects(updated)

    try {
      const res = await reorderProjectsAction(updated)
      if (res.success) {
        if (res.data) setProjects(res.data)
        success("Projects reordered.")
      } else {
        setProjects(previous)
        error(res.message || "Failed to save projects order.")
      }
    } catch {
      setProjects(previous)
      error("Failed to save projects order.")
    }
  }

  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        const matchesSearch =
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.tagline.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase())
        const matchesStatus =
          statusFilter === "all" || (p.status ?? "published") === statusFilter
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        if (sortBy === "title") return a.title.localeCompare(b.title)
        if (sortBy === "date") return (b.updatedAt || "").localeCompare(a.updatedAt || "")
        return (a.displayOrder || 0) - (b.displayOrder || 0)
      })
  }, [projects, search, statusFilter, sortBy])

  const handleDelete = async () => {
    if (!projectToDelete) return
    setIsDeleting(true)
    try {
      const res = await deleteProjectAction(projectToDelete.id)
      if (res.success) {
        success(res.message)
        setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id))
        setProjectToDelete(null)
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
        title="Projects Management"
        subtitle="Create, edit, showcase, and archive portfolio case studies."
        actions={
          <Link href="/admin/projects/new">
            <Button size="sm" className="gap-1.5">
              <PlusIcon className="size-3.5" /> Add Project
            </Button>
          </Link>
        }
      />

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <FormInput
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center rounded-lg border border-border/70 p-0.5 bg-muted/30 dark:border-line">
            {["all", "published", "draft"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                  statusFilter === status
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table / List View */}
      <div className="rounded-xl border border-border/70 bg-card overflow-hidden dark:border-line">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No projects found matching your criteria.
          </div>
        ) : (
          <div className="divide-y divide-border/60 dark:divide-line">
            {filteredProjects.map((p, idx) => (
              <div
                key={p.id}
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
                    disabled={idx === filteredProjects.length - 1}
                    className="rounded p-1 hover:bg-muted disabled:opacity-25 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Move down"
                  >
                    <ArrowDownIcon className="size-3.5" />
                  </button>
                </div>

                {/* Center Column: Project Info */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt=""
                      className="size-11 rounded-lg object-cover border border-border shrink-0 bg-muted"
                      onError={(e) => {
                        ;(e.currentTarget as HTMLElement).style.display = "none"
                      }}
                    />
                  ) : (
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-border bg-muted font-bold text-xs text-muted-foreground uppercase">
                      {p.title.charAt(0) || "P"}
                    </div>
                  )}

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">{p.title}</span>
                      <Tag className="text-[0.625rem]">{p.category}</Tag>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[0.625rem] font-medium uppercase ${
                          p.status === "draft"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : p.status === "archived"
                            ? "bg-zinc-500/10 text-zinc-500"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {p.status ?? "published"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{p.tagline}</p>
                  </div>
                </div>

                {/* Right Column: Edit & Delete Actions */}
                <div className="flex items-center gap-1 shrink-0 self-start">
                  <Link href={`/admin/projects/${p.id}`}>
                    <Button variant="ghost" size="icon-sm" aria-label="Edit project">
                      <EditIcon className="size-3.5" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setProjectToDelete(p)}
                    aria-label="Delete project"
                  >
                    <Trash2Icon className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Alert Dialog */}
      <AdminAlertDialog
        open={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Project?"
        description={`This action cannot be undone. Are you sure you want to delete "${projectToDelete?.title}" from your portfolio?`}
        confirmText="Delete Project"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  )
}
