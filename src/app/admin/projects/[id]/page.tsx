"use client"

import React, { use,useEffect, useState } from "react"

import { fetchProjectByIdAction } from "@/features/admin/actions/content-actions"
import { ProjectForm } from "@/features/admin/components/project-form"
import type { AdminProject } from "@/features/admin/types/admin"

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [project, setProject] = useState<AdminProject | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjectByIdAction(resolvedParams.id).then((data) => {
      setProject(data)
      setLoading(false)
    })
  }, [resolvedParams.id])

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center text-xs text-muted-foreground">
        Loading project details...
      </div>
    )
  }

  if (!project) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center text-xs text-muted-foreground">
        Project not found.
      </div>
    )
  }

  return <ProjectForm initialData={project} />
}
