export type SocialLink = {
  /** Icon identifier resolved via IconRegistry (e.g. "github", "linkedin"). */
  icon: string
  title: string
  /** Optional handle/username or subtitle displayed under the title. */
  subtitle?: string
  /** External profile URL opened when the item is clicked. */
  href: string
}
