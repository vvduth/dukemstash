import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock auth
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

// Mock OpenAI client
vi.mock("@/lib/openai", () => ({
  AI_MODEL: "gpt-5-nano",
  getOpenAIClient: vi.fn(),
}));

// Mock rate limit
vi.mock("@/lib/rate-limit", () => ({
  checkActionRateLimit: vi.fn(),
}));

import { generateAutoTags } from "./ai";
import { auth } from "@/auth";
import { getOpenAIClient } from "@/lib/openai";
import { checkActionRateLimit } from "@/lib/rate-limit";

const mockAuth = vi.mocked(auth);
const mockGetOpenAIClient = vi.mocked(getOpenAIClient);
const mockCheckActionRateLimit = vi.mocked(checkActionRateLimit);

const validInput = {
  title: "useLocalStorage Hook",
  content: "A React hook for persisting state in localStorage",
  type: "snippet",
  language: "typescript",
};

function mockSession(overrides: Record<string, unknown> = {}) {
  return {
    user: {
      id: "user-1",
      isPro: true,
      ...overrides,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

function mockOpenAIResponse(outputText: string) {
  return {
    responses: {
      create: vi.fn().mockResolvedValue({ output_text: outputText }),
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockCheckActionRateLimit.mockResolvedValue({ limited: false });
  process.env.BYPASS_PRO_CHECKS = undefined;
});

describe("generateAutoTags", () => {
  it("returns error when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as any);
    const result = await generateAutoTags(validInput);
    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns error when user has no id", async () => {
    mockAuth.mockResolvedValue({ user: {} } as any);
    const result = await generateAutoTags(validInput);
    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns error for non-Pro users", async () => {
    mockAuth.mockResolvedValue(mockSession({ isPro: false }));
    const result = await generateAutoTags(validInput);
    expect(result).toEqual({ success: false, error: "Pro subscription required" });
  });

  it("allows non-Pro users when BYPASS_PRO_CHECKS is set", async () => {
    process.env.BYPASS_PRO_CHECKS = "true";
    mockAuth.mockResolvedValue(mockSession({ isPro: false }));
    const client = mockOpenAIResponse('{"tags": ["react", "hooks"]}');
    mockGetOpenAIClient.mockReturnValue(client as unknown as ReturnType<typeof getOpenAIClient>);

    const result = await generateAutoTags(validInput);
    expect(result.success).toBe(true);
  });

  it("returns validation error for missing title", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const result = await generateAutoTags({ ...validInput, title: "" });
    expect(result.success).toBe(false);
    expect(result.error).toContain("Title is required");
  });

  it("returns validation error for missing type", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const result = await generateAutoTags({ ...validInput, type: "" });
    expect(result.success).toBe(false);
    expect(result.error).toContain("Type is required");
  });

  it("returns error when rate limited", async () => {
    mockAuth.mockResolvedValue(mockSession());
    mockCheckActionRateLimit.mockResolvedValue({
      limited: true,
      message: "Too many attempts. Please try again in 30 minutes.",
    });

    const result = await generateAutoTags(validInput);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Too many attempts");
  });

  it("parses tags from {tags: [...]} format", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const client = mockOpenAIResponse('{"tags": ["React-Hooks", "LocalStorage", "TypeScript"]}');
    mockGetOpenAIClient.mockReturnValue(client as unknown as ReturnType<typeof getOpenAIClient>);

    const result = await generateAutoTags(validInput);
    expect(result).toEqual({
      success: true,
      data: ["react-hooks", "localstorage", "typescript"],
    });
  });

  it("parses tags from bare array format", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const client = mockOpenAIResponse('["react", "hooks", "state"]');
    mockGetOpenAIClient.mockReturnValue(client as unknown as ReturnType<typeof getOpenAIClient>);

    const result = await generateAutoTags(validInput);
    expect(result).toEqual({
      success: true,
      data: ["react", "hooks", "state"],
    });
  });

  it("normalizes tags to lowercase", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const client = mockOpenAIResponse('{"tags": ["React", "HOOKS"]}');
    mockGetOpenAIClient.mockReturnValue(client as unknown as ReturnType<typeof getOpenAIClient>);

    const result = await generateAutoTags(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(["react", "hooks"]);
    }
  });

  it("limits tags to 5", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const client = mockOpenAIResponse('{"tags": ["a", "b", "c", "d", "e", "f", "g"]}');
    mockGetOpenAIClient.mockReturnValue(client as unknown as ReturnType<typeof getOpenAIClient>);

    const result = await generateAutoTags(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(5);
    }
  });

  it("filters out empty strings from tags", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const client = mockOpenAIResponse('{"tags": ["react", "", "  ", "hooks"]}');
    mockGetOpenAIClient.mockReturnValue(client as unknown as ReturnType<typeof getOpenAIClient>);

    const result = await generateAutoTags(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(["react", "hooks"]);
    }
  });

  it("returns error when AI returns unexpected format", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const client = mockOpenAIResponse('{"result": "not tags"}');
    mockGetOpenAIClient.mockReturnValue(client as unknown as ReturnType<typeof getOpenAIClient>);

    const result = await generateAutoTags(validInput);
    expect(result).toEqual({ success: false, error: "AI returned unexpected format" });
  });

  it("returns error when AI service fails", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const client = {
      responses: {
        create: vi.fn().mockRejectedValue(new Error("API error")),
      },
    };
    mockGetOpenAIClient.mockReturnValue(client as unknown as ReturnType<typeof getOpenAIClient>);

    const result = await generateAutoTags(validInput);
    expect(result).toEqual({ success: false, error: "AI service temporarily unavailable" });
  });

  it("truncates content to 2000 chars", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const client = mockOpenAIResponse('{"tags": ["react"]}');
    mockGetOpenAIClient.mockReturnValue(client as unknown as ReturnType<typeof getOpenAIClient>);

    const longContent = "a".repeat(5000);
    await generateAutoTags({ ...validInput, content: longContent });

    const createCall = client.responses.create;
    const inputArg = createCall.mock.calls[0][0].input as string;
    // Content line should be truncated — total input includes title/type/language lines too
    expect(inputArg.length).toBeLessThan(5000);
    expect(inputArg).toContain("Content: " + "a".repeat(2000));
    expect(inputArg).not.toContain("a".repeat(2001));
  });
});
