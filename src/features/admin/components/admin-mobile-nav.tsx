"use client"

// ponytail: mobile top bar + drawer navigation designed for single-hand use
import { MenuIcon, ExternalLinkIcon, CheckCircle2Icon, GitCommitIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import React, { useState } from "react"

import { Button } from "@/components/ui/button"
import { AdminDrawer } from "./admin-drawer"
import { ADMIN_NAV_ITEMS, AdminSidebar } from "./admin-sidebar"

export function AdminMobileNav() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const pathname = usePathname()

  const currentItem =
    ADMIN_NAV_ITEMS.find((item) =>
      item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
    ) || ADMIN_NAV_ITEMS[0]

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur-md md:hidden dark:border-line">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
          >
            <MenuIcon className="size-4" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">
              {currentItem.label}
            </span>
            <span className="rounded bg-muted px-1 py-0.5 text-[0.625rem] font-mono text-muted-foreground">
              CMS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/" target="_blank">
            <Button variant="ghost" size="xs" className="gap-1 text-[0.6875rem]">
              <ExternalLinkIcon className="size-3" /> Live
            </Button>
          </Link>
        </div>
      </header>

      {/* Drawer */}
      <AdminDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Admin Navigation"
        position="left"
      >
        <AdminSidebar
          className="border-0 bg-transparent"
          onItemClick={() => setDrawerOpen(false)}
        />
      </AdminDrawer>
    </>
  )
}
