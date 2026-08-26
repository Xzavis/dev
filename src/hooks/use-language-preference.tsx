"use client"

import { createContext, useContext, useEffect, useState } from "react"

const STORAGE_KEY = "language"

export type Language = "en" | "id"

type LanguagePreference = {
  language: Language
  setLanguage: (language: Language) => void
}

const LanguagePreferenceContext = createContext<LanguagePreference | null>(null)

export function LanguagePreferenceProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [language, setLanguageState] = useState<Language>(() =>
    typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "id"
      ? "id"
      : "en"
  )

  const setLanguage = (value: Language) => {
    setLanguageState(value)
    localStorage.setItem(STORAGE_KEY, value)
    document.documentElement.lang = value
  }

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  return (
    <LanguagePreferenceContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguagePreferenceContext.Provider>
  )
}

export function useLanguagePreference() {
  const context = useContext(LanguagePreferenceContext)
  if (!context) {
    throw new Error(
      "useLanguagePreference must be used within LanguagePreferenceProvider"
    )
  }

  return context
}
