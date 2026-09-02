"use client"

import {
  AwardIcon,
  BookOpenIcon,
  BriefcaseIcon,
  CpuIcon,
  ExternalLinkIcon,
  FolderGit2Icon,
  LayoutDashboardIcon,
  LogOutIcon,
  SettingsIcon,
  Share2Icon,
  TrophyIcon,
  UserIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

import { useAdminAuth } from "./admin-auth-guard"

export const ADMIN_NAV_ITEMS = [
  { label: "Overview", href: "/admin", icon: LayoutDashboardIcon },
  { label: "Profile", href: "/admin/profile", icon: UserIcon },
  { label: "Projects", href: "/admin/projects", icon: FolderGit2Icon },
  { label: "Experience", href: "/admin/experience", icon: BriefcaseIcon },
  { label: "Awards", href: "/admin/awards", icon: TrophyIcon },
  { label: "Certifications", href: "/admin/certifications", icon: AwardIcon },
  { label: "Publications", href: "/admin/publications", icon: BookOpenIcon },
  { label: "Skills", href: "/admin/skills", icon: CpuIcon },
  { label: "Social Links", href: "/admin/social-links", icon: Share2Icon },
  { label: "Settings", href: "/admin/settings", icon: SettingsIcon },
]

export function AdminSidebar({ className, onItemClick }: { className?: string; onItemClick?: () => void }) {
  const pathname = usePathname()
  const { logout } = useAdminAuth()

  return (
    <aside className={cn("flex flex-col h-full border-r border-border bg-card dark:border-line", className)}>
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between border-b border-border/80 px-4 dark:border-line">
        <Link href="/admin" className="flex items-center gap-2 font-semibold text-sm text-foreground">
          <div className="size-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-mono text-xs font-bold">
            Z
          </div>
          <span className="tracking-tight">zickrian.dev</span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-[0.625rem] font-mono text-muted-foreground uppercase">
            Admin
          </span>
        </Link>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        <div className="px-2 py-1 text-[0.6875rem] font-mono text-muted-foreground uppercase tracking-wider">
          Management
        </div>
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer / Exit Links */}
      <div className="border-t border-border/80 p-3 space-y-1 dark:border-line">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLinkIcon className="size-3.5" />
            Live Website
          </span>
          <span className="text-[0.6875rem] text-muted-foreground font-mono">zickrian.dev</span>
        </Link>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors"
        >
          <LogOutIcon className="size-3.5" />
          <span>Lock / Log Out</span>
        </button>
      </div>
    </aside>
  )
}
