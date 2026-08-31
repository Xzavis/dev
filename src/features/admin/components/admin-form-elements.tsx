"use client"

// ponytail: native form primitives reusing portfolio borders, typography and focus rings
import React, { useId } from "react"

import { cn } from "@/lib/utils"

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export function FormInput({ className, error, ...props }: FormInputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:border-input dark:bg-input/20",
        error && "border-destructive/80 focus:border-destructive focus:ring-destructive",
        className
      )}
      {...props}
    />
  )
}

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

export function FormTextarea({ className, error, rows = 4, ...props }: FormTextareaProps) {
  return (
    <textarea
      rows={rows}
      className={cn(
        "w-full rounded-lg border border-border bg-background/50 p-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:border-input dark:bg-input/20 resize-y",
        error && "border-destructive/80 focus:border-destructive focus:ring-destructive",
        className
      )}
      {...props}
    />
  )
}

export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
  options: { label: string; value: string }[]
}

export function FormSelect({ className, error, options, ...props }: FormSelectProps) {
  return (
    <select
      className={cn(
        "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:border-input dark:bg-input/30",
        error && "border-destructive/80 focus:border-destructive focus:ring-destructive",
        className
      )}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-popover text-popover-foreground">
          {opt.label}
        </option>
      ))}
    </select>
  )
}

export interface FormSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
}

export function FormSwitch({ checked, onChange, label, description, disabled }: FormSwitchProps) {
  return (
    <label className={cn("inline-flex items-center gap-3 cursor-pointer select-none", disabled && "cursor-not-allowed opacity-50")}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          checked ? "bg-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block size-4 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>
      {(label || description) && (
        <div className="flex flex-col text-left">
          {label && <span className="text-xs font-medium text-foreground">{label}</span>}
          {description && <span className="text-[0.75rem] text-muted-foreground">{description}</span>}
        </div>
      )}
    </label>
  )
}

export interface FormFieldProps {
  label: string
  required?: boolean
  description?: string
  error?: string
  children: React.ReactNode
  className?: string
}

export function FormField({ label, required, description, error, children, className }: FormFieldProps) {
  const id = useId()
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-medium text-foreground flex items-center gap-1">
          {label}
          {required && <span className="text-destructive font-bold">*</span>}
        </label>
      </div>
      {children}
      {description && !error && (
        <p className="text-[0.75rem] text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-[0.75rem] font-medium text-destructive animate-in fade-in-50">{error}</p>
      )}
    </div>
  )
}
