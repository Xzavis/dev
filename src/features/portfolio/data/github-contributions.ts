import { unstable_cache } from "next/cache"

import { GITHUB_USERNAME } from "@/config/site"

export type Activity = {
  date: string
  count: number
  level: number
}

type GitHubContributionsResponse = {
  contributions?: Activity[]
}

function isActivity(value: unknown): value is Activity {
  if (!value || typeof value !== "object") return false

  const activity = value as Record<string, unknown>

  return (
    typeof activity.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(activity.date) &&
    typeof activity.count === "number" &&
    Number.isFinite(activity.count) &&
    activity.count >= 0 &&
    typeof activity.level === "number" &&
    Number.isInteger(activity.level) &&
    activity.level >= 0 &&
    activity.level <= 4
  )
}

export const getGitHubContributions = unstable_cache(
  // Throws on failure instead of swallowing it here: `unstable_cache` only
  // memoizes a *resolved* value, so a caught-and-returned `[]` would get
  // stored as "no contributions" for the full 24h `revalidate` window off the
  // back of a single network hiccup - every visitor would see the empty
  // fallback for a day. Letting it throw means a failed fetch is retried on
  // the very next request instead. The caller (GitHubContributions) already
  // catches this and renders empty for that one request.
  async () => {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=all`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) {
      throw new Error(`GitHub contributions request failed: ${res.status}`)
    }
    const data = (await res.json()) as GitHubContributionsResponse
    const contributions = data.contributions

    if (!Array.isArray(contributions) || !contributions.every(isActivity)) {
      throw new Error("GitHub contributions response has an invalid shape")
    }

    return contributions
  },
  ["github-contributions"],
  { revalidate: 86400 }
)
