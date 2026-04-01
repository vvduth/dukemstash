import { describe, expect, it } from "vitest";
import { createCollectionSchema, updateCollectionSchema } from "./collections";

describe("createCollectionSchema", () => {
  it("accepts valid input with name and description", () => {
    const result = createCollectionSchema.safeParse({
      name: "React Patterns",
      description: "Useful React snippets and patterns",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("React Patterns");
      expect(result.data.description).toBe("Useful React snippets and patterns");
    }
  });

  it("accepts null description", () => {
    const result = createCollectionSchema.safeParse({
      name: "My Collection",
      description: null,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeNull();
    }
  });

  it("trims whitespace from name", () => {
    const result = createCollectionSchema.safeParse({
      name: "  padded name  ",
      description: null,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("padded name");
    }
  });

  it("rejects empty name", () => {
    const result = createCollectionSchema.safeParse({
      name: "",
      description: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects whitespace-only name", () => {
    const result = createCollectionSchema.safeParse({
      name: "   ",
      description: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects name over 100 characters", () => {
    const result = createCollectionSchema.safeParse({
      name: "a".repeat(101),
      description: null,
    });
    expect(result.success).toBe(false);
  });

  it("accepts name at exactly 100 characters", () => {
    const result = createCollectionSchema.safeParse({
      name: "a".repeat(100),
      description: null,
    });
    expect(result.success).toBe(true);
  });

  it("transforms empty description to null", () => {
    const result = createCollectionSchema.safeParse({
      name: "Test",
      description: "  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeNull();
    }
  });

  it("trims whitespace from description", () => {
    const result = createCollectionSchema.safeParse({
      name: "Test",
      description: "  some description  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe("some description");
    }
  });
});

describe("updateCollectionSchema", () => {
  it("accepts valid input with id, name, and description", () => {
    const result = updateCollectionSchema.safeParse({
      id: "cuid123",
      name: "Updated Name",
      description: "Updated description",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("cuid123");
      expect(result.data.name).toBe("Updated Name");
      expect(result.data.description).toBe("Updated description");
    }
  });

  it("rejects missing id", () => {
    const result = updateCollectionSchema.safeParse({
      name: "Name",
      description: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty id", () => {
    const result = updateCollectionSchema.safeParse({
      id: "",
      name: "Name",
      description: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = updateCollectionSchema.safeParse({
      id: "cuid123",
      name: "",
      description: null,
    });
    expect(result.success).toBe(false);
  });

  it("trims name and description", () => {
    const result = updateCollectionSchema.safeParse({
      id: "cuid123",
      name: "  trimmed  ",
      description: "  desc  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("trimmed");
      expect(result.data.description).toBe("desc");
    }
  });

  it("transforms empty description to null", () => {
    const result = updateCollectionSchema.safeParse({
      id: "cuid123",
      name: "Test",
      description: "  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeNull();
    }
  });
});
