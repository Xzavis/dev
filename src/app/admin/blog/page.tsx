"use client"

// ponytail: Blog CRUD -- manage articles, drafts, tags, and sync with Medium feed
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BookOpenIcon,
  DownloadCloudIcon,
  EditIcon,
  ExternalLinkIcon,
  NewspaperIcon,
  PlusIcon,
  SaveIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import React, { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Tag } from "@/components/ui/tag"
import {
  deleteBlogAction,
  fetchBlogAction,
  importMediumFeedAction,
  reorderBlogAction,
  saveBlogAction,
} from "@/features/admin/actions/content-actions"
import { AdminAlertDialog, AdminDialog } from "@/features/admin/components/admin-dialog"
import {
  FormField,
  FormInput,
  FormSelect,
  FormTextarea,
} from "@/features/admin/components/admin-form-elements"
import { AdminHeader } from "@/features/admin/components/admin-header"
import { useToast } from "@/features/admin/components/admin-toast"
import type { AdminBlogPost } from "@/features/admin/types/admin"

function emptyBlogPost(): AdminBlogPost {
  return {
    id: "",
    title: "",
    slug: "",
    description: "",
    publishedAt: new Date().toISOString().slice(0, 10),
    thumbnail: "",
    categories: ["Engineering"],
    link: "",
    content: "",
    status: "published",
  }
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<AdminBlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)
  const [editing, setEditing] = useState<AdminBlogPost | null>(null)
  const [deleting, setDeleting] = useState<AdminBlogPost | null>(null)
  const [tagsInput, setTagsInput] = useState("")
  const toast = useToast()

  const load = () =>
    fetchBlogAction().then((data) => {
      setPosts(data)
      setLoading(false)
    })

  useEffect(() => {
    load()
  }, [])

  const openNew = () => {
    const fresh = emptyBlogPost()
    setEditing(fresh)
    setTagsInput(fresh.categories.join(", "))
  }

  const openEdit = (post: AdminBlogPost) => {
    setEditing({ ...post })
    setTagsInput((post.categories || []).join(", "))
  }

  const handleSave = async () => {
    if (!editing) return
    if (!editing.title.trim() || !editing.description.trim()) {
      toast.error("Title and Summary/Description are required.")
      return
    }

    const categories = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    setSaving(true)
    const res = await saveBlogAction({
      ...editing,
      categories: categories.length > 0 ? categories : ["General"],
    })
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
    const res = await deleteBlogAction(deleting.id)
    setDeleting(null)
    if (res.success) {
      toast.success(res.message)
      load()
    } else {
      toast.error(res.message)
    }
  }

  const handleImportMedium = async () => {
    setImporting(true)
    const res = await importMediumFeedAction()
    setImporting(false)
    if (res.success) {
      toast.success(res.message)
      load()
    } else {
      toast.error(res.message)
    }
  }

  const move = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= posts.length) return
    const next = [...posts]
    const [moved] = next.splice(index, 1)
    next.splice(targetIndex, 0, moved)
    setPosts(next)
    const res = await reorderBlogAction(next)
    if (res.success && res.data) {
      setPosts(res.data)
      toast.success("Articles reordered.")
    } else if (!res.success) {
      toast.error(res.message)
      load()
    }
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Blog Articles"
        subtitle={`${posts.length} article${posts.length !== 1 ? "s" : ""} — manage portfolio posts and synchronized stories.`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleImportMedium}
              disabled={importing}
              className="gap-1.5"
              title="Fetch existing posts from Medium feed into CMS"
            >
              <DownloadCloudIcon className="size-4" />
              {importing ? "Importing..." : "Import Medium"}
            </Button>
            <Button onClick={openNew} size="sm" className="gap-1.5">
              <PlusIcon className="size-4" />
              Add Article
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="rounded-xl border border-border/80 bg-card p-8 text-center text-sm text-muted-foreground dark:border-line">
          Loading blog articles...
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/80 bg-card/50 p-12 text-center dark:border-line">
          <NewspaperIcon className="mx-auto size-8 text-muted-foreground/60" />
          <p className="mt-2 text-sm font-medium text-foreground">No articles in CMS yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Create native portfolio posts or import your existing Medium stories.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleImportMedium}
              disabled={importing}
              className="gap-1.5"
            >
              <DownloadCloudIcon className="size-4" />
              {importing ? "Importing..." : "Import Medium Feed"}
            </Button>
            <Button onClick={openNew} size="sm" className="gap-1.5">
              <PlusIcon className="size-4" /> Add Article
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post, idx) => (
            <div
              key={post.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-border dark:border-line"
            >
              {/* Left: Thumbnail & Details */}
              <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                {post.thumbnail ? (
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="size-14 rounded-lg object-cover border border-border/60 shrink-0 dark:border-line"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none"
                    }}
                  />
                ) : (
                  <div className="size-14 rounded-lg bg-muted/60 border border-border/60 flex items-center justify-center shrink-0 dark:border-line">
                    <BookOpenIcon className="size-5 text-muted-foreground" />
                  </div>
                )}

                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground line-clamp-1">
                      {post.title}
                    </h3>
                    {post.status === "draft" ? (
                      <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[0.625rem] font-medium text-amber-600 dark:text-amber-400">
                        Draft
                      </span>
                    ) : (
                      <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[0.625rem] font-medium text-emerald-600 dark:text-emerald-400">
                        Published
                      </span>
                    )}
                    {post.link && (
                      <a
                        href={post.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                        title="View original article"
                      >
                        <ExternalLinkIcon className="size-3" />
                      </a>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
                    {post.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <span className="text-[0.6875rem] text-muted-foreground font-mono">
                      {post.publishedAt}
                    </span>
                    {(post.categories || []).slice(0, 3).map((cat) => (
                      <Tag key={cat} className="text-[0.625rem]">
                        {cat}
                      </Tag>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center justify-end gap-1 shrink-0 border-t border-border/60 pt-2 sm:border-t-0 sm:pt-0 dark:border-line">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  disabled={idx === 0}
                  onClick={() => move(idx, "up")}
                  title="Move up"
                >
                  <ArrowUpIcon className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  disabled={idx === posts.length - 1}
                  onClick={() => move(idx, "down")}
                  title="Move down"
                >
                  <ArrowDownIcon className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => openEdit(post)}
                  title="Edit"
                >
                  <EditIcon className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setDeleting(post)}
                  className="text-rose-500 hover:text-rose-600 dark:hover:bg-rose-950/20"
                  title="Delete"
                >
                  <Trash2Icon className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Dialog */}
      {editing && (
        <AdminDialog
          open={Boolean(editing)}
          onClose={() => setEditing(null)}
          title={editing.id ? "Edit Article" : "Add Article"}
          description="Create or edit blog posts for your portfolio."
        >
          <div className="space-y-4 py-2">
            <FormField label="Title" required description="Article headline">
              <FormInput
                value={editing.title}
                onChange={(e) => {
                  const title = e.target.value
                  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
                  setEditing({
                    ...editing,
                    title,
                    slug: editing.id ? editing.slug : slug,
                  })
                }}
                placeholder="Building Scalable Frontend Applications with Next.js"
              />
            </FormField>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <FormField label="Slug" description="Unique URL slug">
                <FormInput
                  value={editing.slug || ""}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  placeholder="building-scalable-nextjs"
                />
              </FormField>

              <FormField label="Publish Date" description="YYYY-MM-DD">
                <FormInput
                  type="date"
                  value={editing.publishedAt}
                  onChange={(e) => setEditing({ ...editing, publishedAt: e.target.value })}
                />
              </FormField>

              <FormField label="Status">
                <FormSelect
                  value={editing.status || "published"}
                  onChange={(e) =>
                    setEditing({ ...editing, status: e.target.value as "published" | "draft" })
                  }
                  options={[
                    { value: "published", label: "Published" },
                    { value: "draft", label: "Draft" },
                  ]}
                />
              </FormField>
            </div>

            <FormField
              label="Thumbnail / Cover Image URL"
              description="Direct image URL or local path (e.g. /image/blog-cover.webp)"
            >
              <FormInput
                value={editing.thumbnail || ""}
                onChange={(e) => setEditing({ ...editing, thumbnail: e.target.value })}
                placeholder="https://miro.medium.com/... or /image/profile.webp"
              />
            </FormField>

            {/* Thumbnail preview */}
            {editing.thumbnail && (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted/30 p-1">
                <img
                  src={editing.thumbnail}
                  alt="Cover Preview"
                  className="size-full object-cover rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none"
                  }}
                />
              </div>
            )}

            <FormField
              label="External Article Link (Optional)"
              description="Link to original publication (e.g. Medium story or Substack)"
            >
              <FormInput
                value={editing.link || ""}
                onChange={(e) => setEditing({ ...editing, link: e.target.value })}
                placeholder="https://medium.com/@zickriann/my-article-123"
              />
            </FormField>

            <FormField label="Categories / Tags" description="Comma-separated topics">
              <FormInput
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Engineering, Next.js, Architecture"
              />
            </FormField>

            <FormField label="Summary / Excerpt" required description="Short preview shown on blog cards">
              <FormTextarea
                rows={3}
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                placeholder="A deep dive into architecture and state management..."
              />
            </FormField>

            <FormField label="Article Body / Markdown (Optional)" description="Full article text or markdown">
              <FormTextarea
                rows={5}
                value={editing.content || ""}
                onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                placeholder="Write article content here..."
              />
            </FormField>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/60 dark:border-line">
              <Button variant="outline" onClick={() => setEditing(null)}>
                <XIcon className="size-3.5" /> Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="gap-1.5">
                <SaveIcon className="size-3.5" />
                {saving ? "Saving..." : "Save Article"}
              </Button>
            </div>
          </div>
        </AdminDialog>
      )}

      {/* Delete Confirmation */}
      {deleting && (
        <AdminAlertDialog
          open={Boolean(deleting)}
          title="Delete Article"
          description={`Are you sure you want to delete "${deleting.title}"? This action cannot be undone.`}
          confirmText="Delete Article"
          variant="destructive"
          onClose={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}
