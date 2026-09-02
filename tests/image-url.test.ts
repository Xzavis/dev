import assert from "node:assert/strict"
import test from "node:test"

import { isValidImageUrl, validateImageUrl } from "../src/lib/media/image-url"

test("Image URL Validator Contract Tests", async (t) => {
  await t.test("PASS: Local public paths", () => {
    const validLocalPaths = [
      "/image/profile.webp",
      "/banner.webp",
      "/logos/custompedia.webp",
      "/projects/custora.webp",
      "/custom-folder/my-photo.png",
    ]

    for (const path of validLocalPaths) {
      const res = validateImageUrl(path)
      assert.strictEqual(res.isValid, true, `Expected '${path}' to be valid local path`)
      assert.strictEqual(res.type, "local", `Expected '${path}' to have type 'local'`)
      assert.strictEqual(isValidImageUrl(path), true)
    }
  })

  await t.test("PASS: Valid external HTTPS URLs", () => {
    const validRemoteUrls = [
      "https://example.com/image.webp",
      "https://cdn.example.org/assets/avatar.jpg",
      "https://images.unsplash.com/photo-123456?auto=format",
    ]

    for (const url of validRemoteUrls) {
      const res = validateImageUrl(url)
      assert.strictEqual(res.isValid, true, `Expected '${url}' to be valid remote URL`)
      assert.strictEqual(res.type, "remote", `Expected '${url}' to have type 'remote'`)
      assert.strictEqual(isValidImageUrl(url), true)
    }
  })

  await t.test("FAIL: Malformed and nested URLs", () => {
    const invalidNested = [
      "/image/https://example.com/image.webp",
      "/https://example.com/banner.webp",
      "/image/https://pin.it/rI8eRSJ4h",
      "//cdn.example.com/image.webp",
    ]

    for (const path of invalidNested) {
      const res = validateImageUrl(path)
      assert.strictEqual(res.isValid, false, `Expected '${path}' to fail`)
      assert.strictEqual(isValidImageUrl(path), false)
    }
  })

  await t.test("FAIL: Insecure HTTP protocol", () => {
    const httpUrls = [
      "http://example.com/image.webp",
      "http://cdn.example.org/avatar.jpg",
    ]

    for (const url of httpUrls) {
      const res = validateImageUrl(url)
      assert.strictEqual(res.isValid, false, `Expected '${url}' to fail`)
      assert.strictEqual(isValidImageUrl(url), false)
    }
  })

  await t.test("FAIL: Document / web viewer / share page links", () => {
    const shareUrls = [
      "https://drive.google.com/file/d/123456/view",
      "https://drive.google.com/open?id=123456",
      "https://pin.it/rI8eRSJ4h",
      "https://www.pinterest.com/pin/123456/",
      "https://dropbox.com/s/123456/photo.jpg?dl=0",
    ]

    for (const url of shareUrls) {
      const res = validateImageUrl(url)
      assert.strictEqual(res.isValid, false, `Expected '${url}' to fail`)
      assert.strictEqual(isValidImageUrl(url), false)
    }
  })

  await t.test("FAIL: Dangerous and invalid strings", () => {
    const invalidStrings = [
      "javascript:alert(1)",
      "data:image/png;base64,iVBORw0KGgo...",
      "blob:https://example.com/1234",
      "random non-url text",
      "",
      "   ",
    ]

    for (const str of invalidStrings) {
      const res = validateImageUrl(str)
      assert.strictEqual(res.isValid, false, `Expected '${str}' to fail`)
      assert.strictEqual(isValidImageUrl(str), false)
    }
  })
})
