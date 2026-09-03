"use client"

// ponytail: Certifications CRUD -- domain-specific form following Certification schema (title, issuer, issuerLogoURL, issuerIconName, issueDate, credentialID, credentialURL)
import {
  ArrowDownIcon,
  ArrowUpIcon,
  AwardIcon,
  EditIcon,
  ExternalLinkIcon,
  PlusIcon,
  SaveIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import React, { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  deleteCertificationAction,
  fetchCertificationsAction,
  reorderCertificationsAction,
  saveCertificationAction,
} from "@/features/admin/actions/content-actions"
import { AdminAlertDialog, AdminDialog } from "@/features/admin/components/admin-dialog"
import {
  FormField,
  FormInput,
  FormMediaUpload,
} from "@/features/admin/components/admin-form-elements"
import { AdminHeader } from "@/features/admin/components/admin-header"
import { useToast } from "@/features/admin/components/admin-toast"
import type { AdminCertification } from "@/features/admin/types/admin"
import { cn } from "@/lib/utils"

export const AVAILABLE_LOGOS = [
  { name: "Dicoding", path: "/logos/dicoding.webp", defaultIssuer: "Dicoding Indonesia" },
  { name: "IBM", path: "/logos/ibm.webp", defaultIssuer: "IBM" },
  { name: "McKinsey", path: "/logos/mckinsey.webp", defaultIssuer: "McKinsey.org" },
  { name: "Asah", path: "/logos/asah.webp", defaultIssuer: "Asah by Dicoding & Accenture" },
  { name: "Pijak", path: "/logos/pijak.webp", defaultIssuer: "Pijak in collaboration with IBM SkillsBuild" },
  { name: "Coursera", path: "/logos/coursera.webp", defaultIssuer: "Coursera" },
  { name: "Anthropic", path: "/logos/anthropic.webp", defaultIssuer: "Anthropic" },
  { name: "GDGOC", path: "/logos/gdgoc.webp", defaultIssuer: "Google Developer Groups on Campus" },
  { name: "DNCC", path: "/logos/dncc.webp", defaultIssuer: "Dian Nuswantoro Computer Club" },
  { name: "UDINUS", path: "/logos/udinus.webp", defaultIssuer: "Universitas Dian Nuswantoro" },
  { name: "Custompedia", path: "/logos/custompedia.webp", defaultIssuer: "PT Custompedia Creative Group" },
  { name: "Blockvizo", path: "/logos/blockvizo.svg", defaultIssuer: "Blockvizo" },
]

const PRESET_ISSUERS = [
  { label: "Dicoding Indonesia", logo: "/logos/dicoding.webp" },
  { label: "McKinsey.org", logo: "/logos/mckinsey.webp" },
  { label: "Asah by Dicoding & Accenture", logo: "/logos/asah.webp" },
  { label: "IBM", logo: "/logos/ibm.webp" },
  { label: "Pijak in collaboration with IBM SkillsBuild", logo: "/logos/pijak.webp" },
  { label: "Coursera", logo: "/logos/coursera.webp" },
  { label: "Anthropic", logo: "/logos/anthropic.webp" },
  { label: "Google", logo: "" },
  { label: "Microsoft", logo: "" },
]

function emptyCert(): AdminCertification {
  return {
    _adminId: "",
    title: "",
    issuer: "",
    issuerLogoURL: "",
    issuerIconName: "",
    issueDate: new Date().toISOString().slice(0, 10),
    credentialID: "",
    credentialURL: "",
    displayOrder: undefined,
  }
}

export default function AdminCertificationsPage() {
  const [certs, setCerts] = useState<AdminCertification[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<AdminCertification | null>(null)
  const [deleting, setDeleting] = useState<AdminCertification | null>(null)
  const toast = useToast()

  const load = () =>
    fetchCertificationsAction().then((data) => {
      setCerts(data)
      setLoading(false)
    })

  useEffect(() => {
    load()
  }, [])

  const openNew = () => setEditing(emptyCert())
  const openEdit = (c: AdminCertification) => setEditing({ ...c })

  const handleSave = async () => {
    if (!editing) return
    if (
      !editing.title.trim() ||
      !editing.issuer.trim() ||
      !editing.issueDate ||
      !editing.credentialID ||
      !editing.credentialURL
    ) {
      toast.error("Title, Issuer, Issue Date, Credential ID, and Credential URL are required.")
      return
    }
    setSaving(true)
    const res = await saveCertificationAction(editing)
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
    const res = await deleteCertificationAction(deleting._adminId)
    setDeleting(null)
    if (res.success) {
      toast.success(res.message)
      load()
    } else {
      toast.error(res.message)
    }
  }

  const move = async (idx: number, dir: -1 | 1) => {
    const next = [...certs]
    const target = idx + dir
    if (target < 0 || target >= next.length) return
    ;[next[idx], next[target]] = [next[target], next[idx]]
    setCerts(next)
    const res = await reorderCertificationsAction(next)
    if (res.success) {
      toast.success(res.message)
    } else {
      toast.error(res.message)
    }
    load()
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Certifications"
        subtitle={`${certs.length} certification${certs.length !== 1 ? "s" : ""} — credentials and professional certificates.`}
        actions={
          <Button size="sm" className="gap-1.5" onClick={openNew}>
            <PlusIcon className="size-3.5" /> Add Certification
          </Button>
        }
      />

      {loading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading certifications...</div>
      ) : certs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <AwardIcon className="mx-auto size-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">No certifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {certs.map((cert, idx) => (
            <div
              key={cert._adminId}
              className="flex items-center gap-3 rounded-xl border border-border/80 bg-card px-4 py-3 dark:border-line"
            >
              {/* Reorder */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0}
                  className="rounded p-1 hover:bg-muted disabled:opacity-30"
                  aria-label="Move up"
                >
                  <ArrowUpIcon className="size-3" />
                </button>
                <button
                  onClick={() => move(idx, 1)}
                  disabled={idx === certs.length - 1}
                  className="rounded p-1 hover:bg-muted disabled:opacity-30"
                  aria-label="Move down"
                >
                  <ArrowDownIcon className="size-3" />
                </button>
              </div>

              {/* Logo */}
              {cert.issuerLogoURL ? (
                <img
                  src={cert.issuerLogoURL}
                  alt={cert.issuer}
                  className="size-8 rounded object-contain bg-white p-0.5"
                />
              ) : (
                <div className="size-8 rounded bg-muted flex items-center justify-center text-[0.625rem] font-bold text-muted-foreground">
                  {cert.issuer.slice(0, 2).toUpperCase()}
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{cert.title}</p>
                <p className="text-[0.6875rem] text-muted-foreground">
                  {cert.issuer} · {cert.issueDate}
                </p>
              </div>

              {/* Credential */}
              <div className="hidden sm:block text-right shrink-0">
                <p className="text-[0.6875rem] text-muted-foreground font-mono">{cert.credentialID}</p>
              </div>

              {/* Link */}
              <a
                href={cert.credentialURL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:opacity-80"
                aria-label="View credential"
              >
                <ExternalLinkIcon className="size-3.5" />
              </a>

              {/* Actions */}
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon-sm" onClick={() => openEdit(cert)} aria-label="Edit">
                  <EditIcon className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleting(cert)}
                  aria-label="Delete"
                >
                  <Trash2Icon className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create Dialog */}
      {editing && (
        <AdminDialog
          title={editing._adminId ? "Edit Certification" : "Add Certification"}
          description="Fill in the credential details. All fields except Issuer Logo are required."
          open={!!editing}
          onClose={() => setEditing(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => setEditing(null)}>
                <XIcon className="size-3.5 mr-1.5" /> Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <SaveIcon className="size-3.5 mr-1.5" /> {saving ? "Saving..." : "Save Certification"}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <FormField label="Certificate Title" required>
              <FormInput
                id="cert-title"
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="Machine Learning Cohort"
              />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Issuer" required>
                <FormInput
                  id="cert-issuer"
                  value={editing.issuer}
                  onChange={(e) => setEditing({ ...editing, issuer: e.target.value })}
                  placeholder="Dicoding Indonesia"
                  list="issuer-presets"
                />
                <datalist id="issuer-presets">
                  {PRESET_ISSUERS.map((p) => (
                    <option key={p.label} value={p.label} />
                  ))}
                </datalist>
              </FormField>
              <FormField label="Issue Date" required>
                <FormInput
                  id="cert-date"
                  type="date"
                  value={editing.issueDate}
                  onChange={(e) => setEditing({ ...editing, issueDate: e.target.value })}
                />
              </FormField>
            </div>
            <FormField
              label="Issuer Logo"
              description="Pilih salah satu logo institusi dari /logos atau ketik path kustom"
            >
              <div className="space-y-3">
                {/* Visual Logo Selection Grid */}
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 max-h-48 overflow-y-auto p-1.5 border border-border/60 rounded-lg bg-muted/20 dark:border-line">
                  {AVAILABLE_LOGOS.map((logo) => {
                    const isSelected = editing.issuerLogoURL === logo.path
                    return (
                      <button
                        key={logo.path}
                        type="button"
                        onClick={() => {
                          setEditing({
                            ...editing,
                            issuerLogoURL: logo.path,
                            issuer: editing.issuer ? editing.issuer : logo.defaultIssuer,
                          })
                        }}
                        className={cn(
                          "flex flex-col items-center justify-center gap-1.5 rounded-md border p-2 text-center transition-all hover:border-primary/60 hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/40",
                          isSelected
                            ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
                            : "border-border/60 bg-card dark:border-line"
                        )}
                        title={logo.name}
                      >
                        <div className="relative flex size-7 items-center justify-center rounded bg-white p-0.5 shadow-2xs">
                          <img
                            src={logo.path}
                            alt={logo.name}
                            className="size-full object-contain"
                          />
                        </div>
                        <span className="text-[0.625rem] font-medium text-foreground truncate max-w-full">
                          {logo.name}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Input & Clear Button */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <FormMediaUpload
                      value={editing.issuerLogoURL || ""}
                      onChange={(val) => setEditing({ ...editing, issuerLogoURL: val })}
                      placeholder="Pilih di atas atau unggah / ketik: /logos/dicoding.webp"
                      accept="image/*"
                      targetFolder="logos"
                    />
                  </div>
                  {editing.issuerLogoURL && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditing({ ...editing, issuerLogoURL: "" })}
                      className="text-xs shrink-0 text-muted-foreground hover:text-foreground"
                    >
                      Clear Logo
                    </Button>
                  )}
                </div>

                {/* Selected Preview */}
                {editing.issuerLogoURL && (
                  <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 dark:border-line">
                    <div className="flex size-7 items-center justify-center rounded bg-white p-1 shadow-2xs">
                      <img
                        src={editing.issuerLogoURL}
                        alt="Preview"
                        className="size-full object-contain"
                        onError={(e) => {
                          ;(e.currentTarget as HTMLElement).style.display = "none"
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground truncate">
                      {editing.issuerLogoURL}
                    </span>
                  </div>
                )}
              </div>
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Credential ID" required>
                <FormInput
                  id="cert-cred-id"
                  value={editing.credentialID}
                  onChange={(e) => setEditing({ ...editing, credentialID: e.target.value })}
                  placeholder="53XE1493KZRN"
                />
              </FormField>
              <FormField label="Credential URL" required>
                <FormInput
                  id="cert-cred-url"
                  value={editing.credentialURL}
                  onChange={(e) => setEditing({ ...editing, credentialURL: e.target.value })}
                  placeholder="https://www.dicoding.com/certificates/..."
                />
              </FormField>
            </div>
          </div>
        </AdminDialog>
      )}

      {/* Delete Confirmation */}
      {deleting && (
        <AdminAlertDialog
          title="Delete Certification"
          description={`Are you sure you want to delete "${deleting.title}"? This cannot be undone.`}
          open={!!deleting}
          onClose={() => setDeleting(null)}
          onConfirm={handleDelete}
          confirmText="Delete Certification"
          variant="destructive"
        />
      )}
    </div>
  )
}
