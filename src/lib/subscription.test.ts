import { describe, it, expect } from "vitest"
import { FREE_LIMITS, PRO_ONLY_TYPES, isProOnlyType } from "./subscription"

describe("FREE_LIMITS", () => {
  it("maxItems is 50", () => {
    expect(FREE_LIMITS.maxItems).toBe(50)
  })

  it("maxCollections is 3", () => {
    expect(FREE_LIMITS.maxCollections).toBe(3)
  })
})

describe("PRO_ONLY_TYPES", () => {
  it("contains file and image", () => {
    expect(PRO_ONLY_TYPES).toEqual(["file", "image"])
  })
})

describe("isProOnlyType", () => {
  it("returns true for file", () => {
    expect(isProOnlyType("file")).toBe(true)
  })

  it("returns true for image", () => {
    expect(isProOnlyType("image")).toBe(true)
  })

  it("returns false for snippet", () => {
    expect(isProOnlyType("snippet")).toBe(false)
  })

  it("returns false for prompt", () => {
    expect(isProOnlyType("prompt")).toBe(false)
  })

  it("returns false for note", () => {
    expect(isProOnlyType("note")).toBe(false)
  })

  it("returns false for command", () => {
    expect(isProOnlyType("command")).toBe(false)
  })

  it("returns false for link", () => {
    expect(isProOnlyType("link")).toBe(false)
  })

  it("returns false for empty string", () => {
    expect(isProOnlyType("")).toBe(false)
  })
})
