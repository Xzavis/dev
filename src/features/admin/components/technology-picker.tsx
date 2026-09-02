"use client"

import { CheckIcon, SearchIcon } from "lucide-react"
import React, { useEffect, useId, useMemo, useRef, useState } from "react"

import {
  normalizeTechName,
  TECHNOLOGY_CATALOG,
  type TechnologyCatalogItem,
} from "@/config/technology-catalog"
import { cn } from "@/lib/utils"

export interface TechnologyPickerProps {
  value: string
  onChange: (value: string) => void
  onSelectCatalog: (item: TechnologyCatalogItem) => void
  error?: string
  autoFocus?: boolean
  placeholder?: string
}

export function TechnologyPicker({
  value,
  onChange,
  onSelectCatalog,
  error,
  autoFocus,
  placeholder = "Search technology (e.g. React, Python)...",
}: TechnologyPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listboxId = useId()

  const searchQuery = value || ""

  // Filter catalog based on query
  const filteredCatalog = useMemo(() => {
    const query = searchQuery.trim()
    if (!query) return TECHNOLOGY_CATALOG

    const normQuery = normalizeTechName(query)
    return TECHNOLOGY_CATALOG.filter((item) => {
      const matchName = item.name.toLowerCase().includes(query.toLowerCase())
      const matchNorm = normalizeTechName(item.name).includes(normQuery)
      const matchAlias = item.aliases?.some((a) =>
        normalizeTechName(a).includes(normQuery)
      )
      return matchName || matchNorm || matchAlias
    })
  }, [searchQuery])

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [])

  const handleSelectCatalog = (item: TechnologyCatalogItem) => {
    onChange(item.name)
    onSelectCatalog(item)
    setIsOpen(false)
  }

  // Find the selected item to display its icon in the preview
  const selectedItem = TECHNOLOGY_CATALOG.find(
    (item) => normalizeTechName(item.name) === normalizeTechName(value)
  )

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input container with icon preview */}
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 transition-colors focus-within:border-ring focus-within:ring-1 focus-within:ring-ring dark:border-input dark:bg-input/20",
          error && "border-destructive/80 focus-within:border-destructive focus-within:ring-destructive"
        )}
      >
        {/* Active Icon Preview */}
        <div className="flex size-6 shrink-0 items-center justify-center rounded bg-muted/60 text-muted-foreground">
          {selectedItem?.iconId ? (
            <svg className="size-4 fill-current text-foreground" viewBox="0 0 24 24" aria-hidden>
              <use href={`/icons/tech-stack-v1.svg?v=2#${selectedItem.iconId}`} />
            </svg>
          ) : (
            <SearchIcon className="size-3.5 opacity-50" />
          )}
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            onChange(e.target.value)
            if (!isOpen) setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
        />

        <SearchIcon className="size-4 shrink-0 text-muted-foreground/50 pointer-events-none" />
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-border/80 bg-popover p-1 shadow-xl backdrop-blur-md dark:border-line dark:bg-card"
        >
          {filteredCatalog.length > 0 ? (
            <div className="space-y-0.5">
              <div className="px-2 py-1 text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase">
                Catalog ({filteredCatalog.length})
              </div>
              {filteredCatalog.map((item) => {
                const isSelected =
                  normalizeTechName(value) === normalizeTechName(item.name)

                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelectCatalog(item)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-muted/80",
                      isSelected && "bg-primary/10 text-primary font-medium"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex size-5 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                        {item.iconId ? (
                          <svg className="size-3.5 fill-current text-foreground" viewBox="0 0 24 24" aria-hidden>
                            <use href={`/icons/tech-stack-v1.svg?v=2#${item.iconId}`} />
                          </svg>
                        ) : null}
                      </div>
                      <span className="truncate text-foreground font-medium">
                        {item.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[0.625rem] text-muted-foreground">
                        {item.adminCategory}
                      </span>
                      {isSelected && <CheckIcon className="size-3.5 text-primary" />}
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="p-3 text-center text-xs text-muted-foreground">
              {searchQuery.trim()
                ? "No matching technology found. Custom technologies are not allowed."
                : "Type to search catalog..."}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

