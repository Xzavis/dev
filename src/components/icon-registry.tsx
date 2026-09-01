import {
  AstroidIcon,
  BarChart3Icon,
  BriefcaseBusinessIcon,
  FlaskConicalIcon,
  GraduationCapIcon,
  NetworkIcon,
  SchoolIcon,
  UsersIcon,
} from "lucide-react"
import React from "react"

import { Icons } from "@/components/icons"

interface IconRegistryProps extends React.HTMLAttributes<SVGElement> {
  name?: string
  fallback?: React.ReactNode
}

/**
 * Centralized Icon Registry that resolves string icon identifiers
 * from serializable content (JSON) to their corresponding Lucide or custom SVG components.
 */
export function IconRegistry({ name, className, fallback, ...props }: IconRegistryProps) {
  if (!name) {
    return <>{fallback ?? <BriefcaseBusinessIcon className={className} {...props} />}</>
  }

  const normalized = name.toLowerCase().trim()

  switch (normalized) {
    // ─── Experience Position Icons ───────────────────────────────────────────
    case "astroid":
    case "asteroid":
      return <AstroidIcon className={className} {...props} />

    case "flask":
    case "flask-conical":
    case "flaskconical":
      return <FlaskConicalIcon className={className} {...props} />

    case "network":
      return <NetworkIcon className={className} {...props} />

    case "chart":
    case "barchart3":
    case "bar-chart-3":
    case "bar-chart":
      return <BarChart3Icon className={className} {...props} />

    case "users":
      return <UsersIcon className={className} {...props} />

    case "graduation":
    case "graduation-cap":
    case "graduationcap":
      return <GraduationCapIcon className={className} {...props} />

    case "school":
      return <SchoolIcon className={className} {...props} />

    case "briefcase":
    case "briefcase-business":
      return <BriefcaseBusinessIcon className={className} {...props} />

    // ─── Social Platform Icons ───────────────────────────────────────────────
    case "github":
      return <Icons.github className={className} {...props} />

    case "linkedin":
      return <Icons.linkedin className={className} {...props} />

    case "discord":
      return <Icons.discord className={className} {...props} />

    case "medium":
      return <Icons.medium className={className} {...props} />

    case "email":
    case "mail":
      return <Icons.email className={className} {...props} />

    case "huggingface":
    case "hugging-face":
      return <Icons.huggingface className={className} {...props} />

    case "github-copilot":
    case "githubcopilot":
      return <Icons.githubCopilot className={className} {...props} />

    case "claude":
    case "claude-code":
    case "claudecode":
      return <Icons.claudeCode className={className} {...props} />

    default:
      return <>{fallback ?? <BriefcaseBusinessIcon className={className} {...props} />}</>
  }
}
