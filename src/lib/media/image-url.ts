/**
 * Shared Image URL Validator
 *
 * Enforces strict media contracts:
 * A. Local public path: Starts with '/', does not start with '//', does not contain protocols or nested URLs.
 * B. Absolute HTTPS URL: Valid URL constructor, protocol strictly 'https:', rejects share/view pages (Google Drive, Pinterest, etc.).
 */

export interface ImageUrlValidationResult {
  isValid: boolean
  type?: "local" | "remote"
  error?: string
}

// Disallowed share / view page hostnames and URL patterns that are HTML pages, not direct image assets
const DISALLOWED_SHARE_DOMAINS = [
  "pin.it",
  "pinterest.com",
  "drive.google.com",
  "docs.google.com",
  "dropbox.com",
]

/**
 * Validates whether an image path/URL conforms to the supported media contract.
 */
export function validateImageUrl(value: unknown): ImageUrlValidationResult {
  if (typeof value !== "string" || !value.trim()) {
    return {
      isValid: false,
      error: "Image path or URL is required.",
    }
  }

  const trimmed = value.trim()

  // Disallow javascript:, data:, blob:, or other pseudo-protocols immediately
  if (/^(javascript|data|blob|file|ftp):/i.test(trimmed)) {
    return {
      isValid: false,
      error: "Data, blob, and script URLs are not supported for safety.",
    }
  }

  // Check if it's intended as a local path (starts with '/')
  if (trimmed.startsWith("/")) {
    // Disallow protocol-relative URLs (e.g. //cdn.example.com)
    if (trimmed.startsWith("//")) {
      return {
        isValid: false,
        error: "Protocol-relative URLs starting with '//' are not allowed. Use '/...' for local or 'https://...' for remote.",
      }
    }

    // Disallow nested protocol URLs (e.g. /image/https://..., /http://...)
    if (/\/(https?|ftp|file):/i.test(trimmed) || /https?:\/\//i.test(trimmed)) {
      return {
        isValid: false,
        error: "Malformed path: local path cannot contain nested web protocols or URLs.",
      }
    }

    // Must be a clean relative path (e.g. /image/profile.webp, /logos/custompedia.webp)
    return {
      isValid: true,
      type: "local",
    }
  }

  // Otherwise, must be a direct absolute HTTPS URL
  try {
    const parsed = new URL(trimmed)

    if (parsed.protocol !== "https:") {
      return {
        isValid: false,
        error: "External image URLs must use the secure 'https://' protocol.",
      }
    }

    const hostname = parsed.hostname.toLowerCase()

    // Disallow known document/share page URLs that do not return raw image binaries
    const isDisallowedShare = DISALLOWED_SHARE_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    )

    if (isDisallowedShare) {
      return {
        isValid: false,
        error: `Direct image links from ${hostname} web viewer pages are not supported. Use a direct image URL or upload to /public.`,
      }
    }

    return {
      isValid: true,
      type: "remote",
    }
  } catch {
    return {
      isValid: false,
      error: "Invalid image path: must start with '/' for local files or 'https://' for external images.",
    }
  }
}

/**
 * Helper returning boolean check for quick filtering
 */
export function isValidImageUrl(value: unknown): boolean {
  return validateImageUrl(value).isValid
}
