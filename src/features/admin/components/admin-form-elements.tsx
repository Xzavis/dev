"use client"

import {
  CheckIcon,
  FolderOpenIcon,
  ImageIcon,
  Loader2Icon,
  SearchIcon,
  Trash2Icon,
  UploadIcon,
  VideoIcon,
  XIcon,
} from "lucide-react"
import React, { useCallback, useEffect, useId, useRef, useState } from "react"

import { cn } from "@/lib/utils"

import {
  deleteMediaAction,
  listMediaAction,
  type MediaItemInfo,
  uploadMediaAction,
} from "../actions/content-actions"
import { AdminAlertDialog, AdminDialog } from "./admin-dialog"
import { useToast } from "./admin-toast"

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export function FormInput({ className, error, ...props }: FormInputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:border-input dark:bg-input/20",
        error && "border-destructive/80 focus:border-destructive focus:ring-destructive",
        className
      )}
      {...props}
    />
  )
}

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

export function FormTextarea({ className, error, rows = 4, ...props }: FormTextareaProps) {
  return (
    <textarea
      rows={rows}
      className={cn(
        "w-full rounded-lg border border-border bg-background/50 p-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:border-input dark:bg-input/20 resize-y",
        error && "border-destructive/80 focus:border-destructive focus:ring-destructive",
        className
      )}
      {...props}
    />
  )
}

export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
  options: { label: string; value: string }[]
}

export function FormSelect({ className, error, options, ...props }: FormSelectProps) {
  return (
    <select
      className={cn(
        "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:border-input dark:bg-input/30",
        error && "border-destructive/80 focus:border-destructive focus:ring-destructive",
        className
      )}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-popover text-popover-foreground">
          {opt.label}
        </option>
      ))}
    </select>
  )
}

export interface FormSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
}

export function FormSwitch({ checked, onChange, label, description, disabled }: FormSwitchProps) {
  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onChange(!checked)}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault()
          onChange(!checked)
        }
      }}
      className={cn(
        "inline-flex items-center gap-3 select-none outline-none",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation()
          if (!disabled) onChange(!checked)
        }}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          checked ? "bg-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block size-4 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>
      {(label || description) && (
        <div className="flex flex-col text-left">
          {label && <span className="text-xs font-medium text-foreground">{label}</span>}
          {description && <span className="text-[0.75rem] text-muted-foreground">{description}</span>}
        </div>
      )}
    </div>
  )
}

export interface FormFieldProps {
  label: string
  required?: boolean
  description?: string
  error?: string
  children: React.ReactNode
  className?: string
}

export function FormField({ label, required, description, error, children, className }: FormFieldProps) {
  const id = useId()
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-medium text-foreground flex items-center gap-1">
          {label}
          {required && <span className="text-destructive font-bold">*</span>}
        </label>
      </div>
      {children}
      {description && !error && (
        <p className="text-[0.75rem] text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-[0.75rem] font-medium text-destructive animate-in fade-in-50">{error}</p>
      )}
    </div>
  )
}

export interface MediaLibraryModalProps {
  open: boolean
  onClose: () => void
  onSelect: (url: string) => void
  currentValue?: string
  targetFolder?: "image" | "banner" | "logos" | "projects"
  projectSlug?: string
  accept?: string
}

export function MediaLibraryModal({
  open,
  onClose,
  onSelect,
  currentValue,
  targetFolder = "image",
  projectSlug,
  accept = "image/*,video/webm,video/mp4",
}: MediaLibraryModalProps) {
  const [items, setItems] = useState<MediaItemInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [deletingItem, setDeletingItem] = useState<MediaItemInfo | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { success, error: toastError } = useToast()

  const refreshMedia = useCallback(async () => {
    setLoading(true)
    try {
      const res = await listMediaAction(targetFolder, projectSlug)
      if (res.success) {
        setItems(res.data)
      } else {
        toastError(res.message || "Gagal memuat daftar media.")
      }
    } catch {
      toastError("Gagal memuat galeri media.")
    } finally {
      setLoading(false)
    }
  }, [targetFolder, projectSlug, toastError])

  useEffect(() => {
    if (!open) return
    let isSubscribed = true
    listMediaAction(targetFolder, projectSlug)
      .then((res) => {
        if (!isSubscribed) return
        if (res.success) {
          setItems(res.data)
        }
        setLoading(false)
      })
      .catch(() => {
        if (isSubscribed) {
          setLoading(false)
        }
      })
    return () => {
      isSubscribed = false
    }
  }, [open, targetFolder, projectSlug])

  const handleUploadNew = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("targetFolder", targetFolder)
    if (projectSlug) {
      formData.append("projectSlug", projectSlug)
    }

    try {
      const res = await uploadMediaAction(formData)
      if (res.success && res.url) {
        success(res.message || "File berhasil diunggah.")
        await refreshMedia()
        onSelect(res.url)
        onClose()
      } else {
        toastError(res.message || "Upload gagal.")
      }
    } catch {
      toastError("Upload gagal.")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDelete = async () => {
    if (!deletingItem) return
    try {
      const res = await deleteMediaAction(deletingItem.url)
      if (res.success) {
        success(res.message)
        if (currentValue === deletingItem.url) {
          onSelect("")
        }
        await refreshMedia()
      } else {
        toastError(res.message)
      }
    } catch {
      toastError("Gagal menghapus file.")
    } finally {
      setDeletingItem(null)
    }
  }

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  )

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <>
      <AdminDialog
        open={open}
        onClose={onClose}
        title={
          targetFolder === "banner"
            ? "Galeri Banner & Video (public/)"
            : targetFolder === "logos"
            ? "Katalog Logo (public/logos/)"
            : targetFolder === "projects"
            ? projectSlug
              ? `Galeri Proyek: ${projectSlug} (public/projects/${projectSlug}/)`
              : "Galeri Aset Proyek (public/projects/)"
            : "Galeri Media Gambar (public/image/)"
        }
        description={
          targetFolder === "banner"
            ? "Pilih banner dari root public/ atau unggah file baru."
            : targetFolder === "logos"
            ? "Pilih logo dari public/logos/ atau unggah logo baru."
            : targetFolder === "projects"
            ? projectSlug
              ? `Pilih gambar dari folder public/projects/${projectSlug}/ atau unggah langsung ke folder proyek ini.`
              : "Pilih gambar dari folder public/projects/ atau unggah file baru."
            : "Pilih gambar dari public/image/ atau unggah file baru."
        }
        maxWidth="xl"
      >
        <div className="space-y-4">
          {/* Header Controls: Search + Upload Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama file..."
                className="w-full rounded-lg border border-border bg-background/50 pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-input dark:bg-input/20"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <XIcon className="size-3" />
                </button>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUploadNew}
              accept={accept}
              className="hidden"
              aria-hidden="true"
              disabled={isUploading}
            />
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-primary bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2Icon className="size-3.5 animate-spin" />
                  <span>Mengunggah...</span>
                </>
              ) : (
                <>
                  <UploadIcon className="size-3.5" />
                  <span>Unggah Baru</span>
                </>
              )}
            </button>
          </div>

          {/* Grid View */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-muted-foreground">
              <Loader2Icon className="size-6 animate-spin text-primary mb-2" />
              <span>Memuat galeri media...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center rounded-lg border border-dashed border-border p-6 dark:border-input">
              <ImageIcon className="size-8 text-muted-foreground mb-2 opacity-50" />
              <p className="text-xs font-medium text-foreground">
                {search ? "Tidak ada file yang cocok dengan pencarian." : "Belum ada file media di direktori ini."}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Klik tombol &quot;Unggah Baru&quot; di atas untuk menambahkan media pertama Anda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[55vh] overflow-y-auto p-1">
              {filtered.map((item) => {
                const isSelected = currentValue === item.url
                return (
                  <div
                    key={item.url}
                    className={cn(
                      "group relative flex flex-col overflow-hidden rounded-lg border bg-card transition-all text-left",
                      isSelected
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border hover:border-foreground/30 dark:border-input"
                    )}
                  >
                    {/* Media Thumbnail Container */}
                    <div
                      onClick={() => {
                        onSelect(item.url)
                        onClose()
                      }}
                      className="relative aspect-video w-full cursor-pointer bg-muted/40 overflow-hidden flex items-center justify-center"
                    >
                      {item.isVideo ? (
                        <>
                          <video src={item.url} muted className="size-full object-cover" />
                          <div className="absolute bottom-1 right-1 flex items-center gap-1 rounded bg-black/70 px-1 py-0.5 text-[9px] text-white">
                            <VideoIcon className="size-2.5" />
                            <span>Video</span>
                          </div>
                        </>
                      ) : (
                        <img
                          src={item.url}
                          alt={item.name}
                          className="size-full object-cover transition-transform group-hover:scale-105"
                          onError={(e) => {
                            ;(e.currentTarget as HTMLElement).style.display = "none"
                          }}
                        />
                      )}

                      {/* Selected Badge */}
                      {isSelected && (
                        <div className="absolute top-1.5 left-1.5 rounded-full bg-primary p-1 text-primary-foreground shadow-sm">
                          <CheckIcon className="size-3" />
                        </div>
                      )}
                    </div>

                    {/* Metadata & Actions */}
                    <div className="flex items-center justify-between gap-1 p-2 bg-background/80">
                      <div
                        onClick={() => {
                          onSelect(item.url)
                          onClose()
                        }}
                        className="min-w-0 flex-1 cursor-pointer"
                        title={item.name}
                      >
                        <p className="truncate text-[11px] font-medium text-foreground">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">{formatSize(item.size)}</p>
                      </div>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeletingItem(item)
                        }}
                        className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        title="Hapus media ini"
                      >
                        <Trash2Icon className="size-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </AdminDialog>

      {/* Confirmation Dialog for Deleting Media */}
      <AdminAlertDialog
        open={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        title="Hapus File Media?"
        description={`Apakah Anda yakin ingin menghapus file "${deletingItem?.name}" secara permanen dari server? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Permanen"
        variant="destructive"
      />
    </>
  )
}

export interface FormMediaUploadProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  accept?: string
  targetFolder?: "image" | "banner" | "logos" | "projects"
  projectSlug?: string
  disabled?: boolean
  className?: string
}

// ponytail: unified input with direct 1-click upload, deduplication, and media library browser
export function FormMediaUpload({
  value,
  onChange,
  placeholder = "/image/example.webp or https://...",
  error,
  accept = "image/*,video/webm,video/mp4",
  targetFolder = "image",
  projectSlug,
  disabled = false,
  className,
}: FormMediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isLibraryOpen, setIsLibraryOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { success, error: toastError } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("targetFolder", targetFolder)
    if (projectSlug) {
      formData.append("projectSlug", projectSlug)
    }

    try {
      const res = await uploadMediaAction(formData)
      if (res.success && res.url) {
        onChange(res.url)
        success(res.message || "File uploaded successfully.")
      } else {
        toastError(res.message || "Upload failed.")
      }
    } catch {
      toastError("Failed to upload file.")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          className="hidden"
          aria-hidden="true"
          disabled={disabled || isUploading}
        />
        <div className="relative flex-1">
          <FormInput
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            error={error}
            disabled={disabled || isUploading}
          />
        </div>

        {/* Browse Media Library Button */}
        <button
          type="button"
          disabled={disabled || isUploading}
          onClick={() => setIsLibraryOpen(true)}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-muted/60 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted hover:text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:border-input dark:bg-input/30"
          title="Buka galeri gambar/banner yang sudah ada"
        >
          <FolderOpenIcon className="size-3.5 text-muted-foreground" />
          <span>Galeri</span>
        </button>

        {/* Direct Upload Button */}
        <button
          type="button"
          disabled={disabled || isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-primary/10 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/20 focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:border-input"
          title="Unggah file baru langsung dari komputer"
        >
          {isUploading ? (
            <>
              <Loader2Icon className="size-3.5 animate-spin text-primary" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <UploadIcon className="size-3.5 text-primary" />
              <span>Upload</span>
            </>
          )}
        </button>
      </div>

      {/* Media Library Dialog */}
      {isLibraryOpen && (
        <MediaLibraryModal
          open={isLibraryOpen}
          onClose={() => setIsLibraryOpen(false)}
          onSelect={(url) => {
            onChange(url)
            setIsLibraryOpen(false)
          }}
          currentValue={value}
          targetFolder={targetFolder}
          projectSlug={projectSlug}
          accept={accept}
        />
      )}
    </div>
  )
}
