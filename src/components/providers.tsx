"use client"

import { ThemeProvider } from "next-themes"
import React, { useEffect } from "react"

import { TooltipProvider } from "@/components/base/ui/tooltip"
import { ChatProvider } from "@/components/chat-provider"
import { SoundPreferenceProvider } from "@/hooks/soundcn/use-sound-preference"
import { LanguagePreferenceProvider } from "@/hooks/use-language-preference"

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      if (typeof navigator !== "undefined" && /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)) {
        document.documentElement.classList.add("os-macos")
      }
    } catch {}
  }, [])
  return (
    <ThemeProvider
      enableSystem
      disableTransitionOnChange
      enableColorScheme
      storageKey="theme"
      defaultTheme="dark"
      attribute="class"
    >
      <LanguagePreferenceProvider>
        <SoundPreferenceProvider>
          <TooltipProvider>
            <ChatProvider>{children}</ChatProvider>
          </TooltipProvider>
        </SoundPreferenceProvider>
      </LanguagePreferenceProvider>
    </ThemeProvider>
  )
}
