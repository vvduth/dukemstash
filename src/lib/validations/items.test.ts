import { describe, expect, it } from "vitest";
import { createItemSchema, updateItemSchema } from "./items";

describe("createItemSchema", () => {
  const validInput = {
    itemTypeId: "clxyz123",
    title: "My Snippet",
    description: "A description",
    content: "const x = 1;",
    url: null,
    language: "typescript",
    tags: ["react"],
  };

  it("accepts valid input with all fields", () => {
    const result = createItemSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.itemTypeId).toBe("clxyz123");
      expect(result.data.title).toBe("My Snippet");
    }
  });

  it("rejects empty itemTypeId", () => {
    const result = createItemSchema.safeParse({ ...validInput, itemTypeId: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing itemTypeId", () => {
    const { itemTypeId: _, ...noType } = validInput;
    const result = createItemSchema.safeParse(noType);
    expect(result.success).toBe(false);
  });

  it("rejects empty title", () => {
    const result = createItemSchema.safeParse({ ...validInput, title: "  " });
    expect(result.success).toBe(false);
  });

  it("validates URL for link items", () => {
    const result = createItemSchema.safeParse({
      ...validInput,
      content: null,
      url: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid URL for link items", () => {
    const result = createItemSchema.safeParse({
      ...validInput,
      content: null,
      url: "https://example.com",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.url).toBe("https://example.com");
    }
  });
});

describe("updateItemSchema", () => {
  it("accepts valid input", () => {
    const result = updateItemSchema.safeParse({
      title: "My Snippet",
      description: "A description",
      content: "const x = 1;",
      url: null,
      language: "typescript",
      tags: ["react", "hooks"],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("My Snippet");
      expect(result.data.tags).toEqual(["react", "hooks"]);
    }
  });

  it("trims whitespace from title", () => {
    const result = updateItemSchema.safeParse({
      title: "  padded title  ",
      description: null,
      content: null,
      url: null,
      language: null,
      tags: [],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("padded title");
    }
  });

  it("rejects empty title", () => {
    const result = updateItemSchema.safeParse({
      title: "",
      description: null,
      content: null,
      url: null,
      language: null,
      tags: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects whitespace-only title", () => {
    const result = updateItemSchema.safeParse({
      title: "   ",
      description: null,
      content: null,
      url: null,
      language: null,
      tags: [],
    });
    expect(result.success).toBe(false);
  });

  it("transforms empty description to null", () => {
    const result = updateItemSchema.safeParse({
      title: "Test",
      description: "  ",
      content: null,
      url: null,
      language: null,
      tags: [],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeNull();
    }
  });

  it("validates URL format", () => {
    const result = updateItemSchema.safeParse({
      title: "Link",
      description: null,
      content: null,
      url: "not-a-url",
      language: null,
      tags: [],
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid URL", () => {
    const result = updateItemSchema.safeParse({
      title: "Link",
      description: null,
      content: null,
      url: "https://example.com",
      language: null,
      tags: [],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.url).toBe("https://example.com");
    }
  });

  it("accepts null URL", () => {
    const result = updateItemSchema.safeParse({
      title: "Test",
      description: null,
      content: null,
      url: null,
      language: null,
      tags: [],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.url).toBeNull();
    }
  });

  it("trims tag strings", () => {
    const result = updateItemSchema.safeParse({
      title: "Test",
      description: null,
      content: null,
      url: null,
      language: null,
      tags: ["  react  ", "hooks"],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual(["react", "hooks"]);
    }
  });

  it("rejects empty tag strings after trim", () => {
    const result = updateItemSchema.safeParse({
      title: "Test",
      description: null,
      content: null,
      url: null,
      language: null,
      tags: ["  "],
    });
    expect(result.success).toBe(false);
  });
});
