"use client"

// ponytail: overview dashboard highlighting key stats, recent changes and quick actions
import {
  ArrowUpRightIcon,
  BriefcaseIcon,
  ClockIcon,
  CpuIcon,
  FileEditIcon,
  FolderGit2Icon,
  PlusIcon,
  SparklesIcon,
  UserIcon,
} from "lucide-react"
import Link from "next/link"
import React, { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Tag } from "@/components/ui/tag"
import { fetchDashboardOverviewAction } from "@/features/admin/actions/content-actions"
import { AdminHeader } from "@/features/admin/components/admin-header"
import type { DashboardMetrics } from "@/features/admin/types/admin"

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardOverviewAction().then((data) => {
      setMetrics(data)
      setLoading(false)
    })
  }, [])

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Dashboard Overview"
        subtitle="Manage your portfolio content, projects, experience, and sync to live site."
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 dark:border-line">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Projects</span>
            <FolderGit2Icon className="size-4 text-primary" />
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {loading ? "..." : metrics?.projectsCount}
          </div>
          <p className="mt-1 text-[0.6875rem] text-muted-foreground">Case studies & apps</p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 dark:border-line">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Experience</span>
            <BriefcaseIcon className="size-4 text-primary" />
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {loading ? "..." : metrics?.experienceCount}
          </div>
          <p className="mt-1 text-[0.6875rem] text-muted-foreground">Companies & cohorts</p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 dark:border-line">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Skills</span>
            <CpuIcon className="size-4 text-primary" />
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {loading ? "..." : metrics?.skillsCount}
          </div>
          <p className="mt-1 text-[0.6875rem] text-muted-foreground">Tech & frameworks</p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 dark:border-line">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Drafts</span>
            <FileEditIcon className="size-4 text-amber-500" />
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {loading ? "..." : metrics?.draftsCount}
          </div>
          <p className="mt-1 text-[0.6875rem] text-muted-foreground">Unpublished items</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-border/80 bg-card p-5 dark:border-line space-y-3">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <SparklesIcon className="size-4 text-primary" /> Quick Content Actions
        </h2>
        <div className="flex flex-wrap gap-2.5">
          <Link href="/admin/projects/new">
            <Button size="sm" className="gap-1.5">
              <PlusIcon className="size-3.5" /> Add Project
            </Button>
          </Link>
          <Link href="/admin/experience">
            <Button variant="outline" size="sm" className="gap-1.5">
              <PlusIcon className="size-3.5" /> Add Experience
            </Button>
          </Link>
          <Link href="/admin/profile">
            <Button variant="outline" size="sm" className="gap-1.5">
              <UserIcon className="size-3.5" /> Edit Profile
            </Button>
          </Link>
          <Link href="/admin/skills">
            <Button variant="outline" size="sm" className="gap-1.5">
              <CpuIcon className="size-3.5" /> Manage Skills
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Changes */}
      <div className="rounded-xl border border-border/80 bg-card dark:border-line overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/80 px-5 py-4 dark:border-line">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Recent Changes</h2>
            <p className="text-xs text-muted-foreground">Audit log of your recent portfolio updates</p>
          </div>
        </div>

        <div className="divide-y divide-border/60 dark:divide-line">
          {loading ? (
            <div className="p-6 text-center text-xs text-muted-foreground">Loading recent activity...</div>
          ) : metrics?.recentChanges.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">No recent changes recorded yet.</div>
          ) : (
            metrics?.recentChanges.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-muted/40 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{item.title}</span>
                    <Tag className="text-[0.625rem] uppercase">{item.type}</Tag>
                    {item.status === "draft" ? (
                      <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[0.625rem] font-medium text-amber-600 dark:text-amber-400">
                        Draft
                      </span>
                    ) : (
                      <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[0.625rem] font-medium text-emerald-600 dark:text-emerald-400">
                        Published
                      </span>
                    )}
                  </div>
                  <p className="text-[0.6875rem] text-muted-foreground flex items-center gap-1">
                    <ClockIcon className="size-3" />
                    Updated {new Date(item.updatedAt).toLocaleString()}
                  </p>
                </div>

                <Link href={item.editUrl}>
                  <Button variant="outline" size="xs" className="gap-1 self-start sm:self-auto">
                    <span>Edit</span>
                    <ArrowUpRightIcon className="size-3" />
                  </Button>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
