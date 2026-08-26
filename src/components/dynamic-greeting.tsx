"use client"

import { useSyncExternalStore } from "react"

const SERVER_GREETING = "Good morning"

function getGreeting() {
  const hour = new Date().getHours()

  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export function DynamicGreeting() {
  const greeting = useSyncExternalStore(
    () => () => {},
    getGreeting,
    () => SERVER_GREETING
  )

  return <>{greeting}</>
}
