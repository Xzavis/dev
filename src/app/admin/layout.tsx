import type { Metadata } from "next"
import React from "react"

import { AdminAuthProvider } from "@/features/admin/components/admin-auth-guard"
import { AdminMobileNav } from "@/features/admin/components/admin-mobile-nav"
import { AdminSidebar } from "@/features/admin/components/admin-sidebar"
import { ToastProvider } from "@/features/admin/components/admin-toast"

export const metadata: Metadata = {
  title: "Admin Dashboard | zickrian.dev",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AdminAuthProvider>
        <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/20">
          {/* Desktop Sidebar (Left) */}
          <div className="hidden md:flex md:w-64 md:shrink-0">
            <AdminSidebar className="fixed inset-y-0 w-64" />
          </div>

          {/* Main Area */}
          <div className="flex flex-1 flex-col md:pl-0 min-w-0">
            {/* Mobile Header (Top) */}
            <AdminMobileNav />

            {/* Content Body */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
              {children}
            </main>
          </div>
        </div>
      </AdminAuthProvider>
    </ToastProvider>
  )
}
