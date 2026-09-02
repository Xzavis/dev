export type TechStack = {
  key: string
  title: string
  href?: string
  categories: string[]
  type: "technology" | "soft-skill"
  iconId?: string
  /** Persisted skill proficiency level */
  level?: "Beginner" | "Intermediate" | "Advanced" | "Expert"
  /** Whether to highlight on homepage tech stack */
  featured?: boolean
}
