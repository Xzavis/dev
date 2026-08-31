"use client"

// ponytail: lightweight, dependency-free toast system adhering to portfolio style
import { CheckCircle2Icon, AlertCircleIcon, InfoIcon, XIcon } from "lucide-react"
import React, { createContext, useCallback, useContext, useState } from "react"

import { cn } from "@/lib/utils"

export type ToastType = "success" | "error" | "info"

export interface ToastItem {
  id: string
  type: ToastType
  message: string
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    setToasts((prev) => [...prev, { id, type, message }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const contextValue = {
    toast: addToast,
    success: (msg: string) => addToast(msg, "success"),
    error: (msg: string) => addToast(msg, "error"),
    info: (msg: string) => addToast(msg, "info"),
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Toast container */}
      <div
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-[calc(100vw-2.5rem)] pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className={cn(
              "pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-lg border text-sm shadow-xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-3",
              item.type === "success" &&
                "bg-zinc-900/90 text-white border-emerald-500/30 dark:bg-zinc-950/90 dark:border-emerald-500/40",
              item.type === "error" &&
                "bg-zinc-900/90 text-white border-rose-500/30 dark:bg-zinc-950/90 dark:border-rose-500/40",
              item.type === "info" &&
                "bg-zinc-900/90 text-white border-zinc-700 dark:bg-zinc-950/90 dark:border-zinc-800"
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {item.type === "success" && (
                <CheckCircle2Icon className="size-4 shrink-0 text-emerald-400" />
              )}
              {item.type === "error" && (
                <AlertCircleIcon className="size-4 shrink-0 text-rose-400" />
              )}
              {item.type === "info" && (
                <InfoIcon className="size-4 shrink-0 text-sky-400" />
              )}
              <span className="text-xs sm:text-sm font-medium leading-snug break-words">
                {item.message}
              </span>
            </div>
            <button
              onClick={() => removeToast(item.id)}
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Dismiss toast"
            >
              <XIcon className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
