"use client"

// ponytail: lightweight client auth gate with secure password/PIN verification
import { KeyRoundIcon, LockIcon, ShieldAlertIcon } from "lucide-react"
import React, { createContext, useContext, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

import { verifyAdminAuthAction } from "../actions/content-actions"
import { FormInput } from "./admin-form-elements"
import { useToast } from "./admin-toast"

interface AdminAuthContextType {
  isAuthenticated: boolean
  logout: () => void
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAuthenticated: false,
  logout: () => {},
})

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [checking, setChecking] = useState(true)
  const [passphrase, setPassphrase] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { error: toastError, success: toastSuccess } = useToast()

  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = sessionStorage.getItem("zickrian_admin_auth")
      if (saved === "1") {
        setIsAuthenticated(true)
      }
      setChecking(false)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passphrase.trim()) {
      setError("Passphrase is required.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await verifyAdminAuthAction(passphrase.trim())
      if (res.authorized) {
        sessionStorage.setItem("zickrian_admin_auth", "1")
        setIsAuthenticated(true)
        toastSuccess("Authenticated successfully. Welcome to Zickrian Admin!")
      } else {
        setError(res.message || "Invalid credentials.")
        toastError(res.message || "Invalid credentials.")
      }
    } catch {
      setError("Failed to verify credentials. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    sessionStorage.removeItem("zickrian_admin_auth")
    setIsAuthenticated(false)
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl dark:border-line">
          <div className="flex flex-col items-center text-center pb-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
              <LockIcon className="size-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Zickrian Admin</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Private Content Management for zickrian.dev
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <KeyRoundIcon className="size-3.5" /> Passphrase / Admin PIN
              </label>
              <FormInput
                type="password"
                placeholder="Enter secret passphrase..."
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                autoFocus
                error={error}
              />
              {error && (
                <p className="text-[0.75rem] font-medium text-destructive flex items-center gap-1">
                  <ShieldAlertIcon className="size-3" /> {error}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Authenticating..." : "Unlock Dashboard"}
            </Button>
          </form>

          <div className="mt-4 border-t border-border/60 pt-3 text-center dark:border-line">
            <p className="text-[0.6875rem] text-muted-foreground">
              Default dev secret: <code className="text-foreground">zickrian2026</code>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  return useContext(AdminAuthContext)
}
