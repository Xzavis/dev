"use client"

// ponytail: projects list view with fast client-side filtering, mobile card stack and delete dialog
import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  EditIcon,
  Trash2Icon,
  StarIcon,
  ExternalLinkIcon,
  MoreVerticalIcon,
  ArrowUpDownIcon,
} from "lucide-react"
import Link from "next/link"
import React, { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Tag } from "@/components/ui/tag"
import { deleteProjectAction, fetchProjectsAction } from "@/features/admin/actions/content-actions"
import { AdminAlertDialog } from "@/features/admin/components/admin-dialog"
import { FormInput } from "@/features/admin/components/admin-form-elements"
import { AdminHeader } from "@/features/admin/components/admin-header"
import { useToast } from "@/features/admin/components/admin-toast"
import type { AdminProject, ContentStatus } from "@/features/admin/types/admin"

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<AdminProject[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [sortBy, setSortBy] = useState<"order" | "title" | "date">("order")
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

  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        const matchesSearch =
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.tagline.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase())
        const matchesStatus =
          statusFilter === "all" || (p.status ?? "published") === statusFilter
        const matchesFeatured = !featuredOnly || p.featured
        return matchesSearch && matchesStatus && matchesFeatured
      })
      .sort((a, b) => {
        if (sortBy === "title") return a.title.localeCompare(b.title)
        if (sortBy === "date") return (b.updatedAt || "").localeCompare(a.updatedAt || "")
        return (a.displayOrder || 0) - (b.displayOrder || 0)
      })
  }, [projects, search, statusFilter, featuredOnly, sortBy])

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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name, category..."
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter Tabs */}
          <div className="flex rounded-lg border border-border bg-card p-1 text-xs dark:border-line">
            {["all", "published", "draft", "archived"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`rounded px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                  statusFilter === st
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <Button
            variant={featuredOnly ? "default" : "outline"}
            size="xs"
            onClick={() => setFeaturedOnly(!featuredOnly)}
            className="gap-1 text-xs"
          >
            <StarIcon className="size-3" />
            <span>Featured</span>
          </Button>
        </div>
      </div>

      {/* Projects Container: Desktop Table / Mobile Stacked Cards */}
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden dark:border-line">
        {loading ? (
          <div className="p-8 text-center text-xs text-muted-foreground">Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-xs text-muted-foreground">No projects matching your search criteria.</p>
            <Link href="/admin/projects/new">
              <Button size="xs" className="gap-1">
                <PlusIcon className="size-3" /> Add Project
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-foreground">
                <thead className="border-b border-border bg-muted/30 text-muted-foreground uppercase text-[0.6875rem] font-mono dark:border-line">
                  <tr>
                    <th className="px-4 py-3">Project</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Featured</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 dark:divide-line">
                  {filteredProjects.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-3">
                          {p.image && (
                            <img
                              src={p.image}
                              alt=""
                              className="size-8 rounded object-cover border border-border"
                            />
                          )}
                          <div>
                            <div className="font-semibold text-foreground flex items-center gap-1.5">
                              {p.title}
                              {p.badge && <Tag className="text-[0.625rem]">{p.badge}</Tag>}
                            </div>
                            <span className="text-[0.6875rem] text-muted-foreground line-clamp-1">
                              {p.tagline}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Tag className="text-[0.625rem]">{p.category}</Tag>
                      </td>
                      <td className="px-4 py-3">
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
                      </td>
                      <td className="px-4 py-3">
                        {p.featured ? (
                          <StarIcon className="size-3.5 fill-amber-400 text-amber-500" />
                        ) : (
                          <span className="text-muted-foreground/50">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/admin/projects/${p.id}`}>
                            <Button variant="outline" size="icon-xs" aria-label="Edit project">
                              <EditIcon className="size-3" />
                            </Button>
                          </Link>
                          <Button
                            variant="destructive"
                            size="icon-xs"
                            onClick={() => setProjectToDelete(p)}
                            aria-label="Delete project"
                          >
                            <Trash2Icon className="size-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card View */}
            <div className="divide-y divide-border/60 md:hidden dark:divide-line">
              {filteredProjects.map((p) => (
                <div key={p.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">{p.title}</span>
                        {p.featured && (
                          <StarIcon className="size-3 fill-amber-400 text-amber-500" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{p.tagline}</p>
                    </div>
                    {p.image && (
                      <img
                        src={p.image}
                        alt=""
                        className="size-12 shrink-0 rounded object-cover border border-border"
                      />
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
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
                      <Tag className="text-[0.625rem]">{p.category}</Tag>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/admin/projects/${p.id}`}>
                        <Button variant="outline" size="xs" className="gap-1">
                          <EditIcon className="size-3" /> Edit
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="xs"
                        onClick={() => setProjectToDelete(p)}
                      >
                        <Trash2Icon className="size-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
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
