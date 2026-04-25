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

import { generateAutoTags, generateDescription, explainCode } from "./ai";
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

describe("generateDescription", () => {
  it("returns error when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as any);
    const result = await generateDescription(validInput);
    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns error when user has no id", async () => {
    mockAuth.mockResolvedValue({ user: {} } as any);
    const result = await generateDescription(validInput);
    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns error for non-Pro users", async () => {
    mockAuth.mockResolvedValue(mockSession({ isPro: false }));
    const result = await generateDescription(validInput);
    expect(result).toEqual({ success: false, error: "Pro subscription required" });
  });

  it("allows non-Pro users when BYPASS_PRO_CHECKS is set", async () => {
    process.env.BYPASS_PRO_CHECKS = "true";
    mockAuth.mockResolvedValue(mockSession({ isPro: false }));
    const client = mockOpenAIResponse('{"description": "A simple React hook."}');
    mockGetOpenAIClient.mockReturnValue(client as unknown as ReturnType<typeof getOpenAIClient>);

    const result = await generateDescription(validInput);
    expect(result.success).toBe(true);
  });

  it("returns validation error for missing title", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const result = await generateDescription({ ...validInput, title: "" });
    expect(result.success).toBe(false);
    expect(result.error).toContain("Title is required");
  });

  it("returns validation error for missing type", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const result = await generateDescription({ ...validInput, type: "" });
    expect(result.success).toBe(false);
    expect(result.error).toContain("Type is required");
  });

  it("returns error when rate limited", async () => {
    mockAuth.mockResolvedValue(mockSession());
    mockCheckActionRateLimit.mockResolvedValue({
      limited: true,
      message: "Too many attempts. Please try again in 30 minutes.",
    });

    const result = await generateDescription(validInput);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Too many attempts");
  });

  it("parses description from {description: ...} format", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const client = mockOpenAIResponse(
      '{"description": "A React hook that syncs state to localStorage."}'
    );
    mockGetOpenAIClient.mockReturnValue(client as unknown as ReturnType<typeof getOpenAIClient>);

    const result = await generateDescription(validInput);
    expect(result).toEqual({
      success: true,
      data: "A React hook that syncs state to localStorage.",
    });
  });

  it("parses description from {summary: ...} fallback format", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const client = mockOpenAIResponse('{"summary": "Stores data between sessions."}');
    mockGetOpenAIClient.mockReturnValue(client as unknown as ReturnType<typeof getOpenAIClient>);

    const result = await generateDescription(validInput);
    expect(result).toEqual({
      success: true,
      data: "Stores data between sessions.",
    });
  });

  it("trims whitespace from description", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const client = mockOpenAIResponse('{"description": "   Trimmed text.   "}');
    mockGetOpenAIClient.mockReturnValue(client as unknown as ReturnType<typeof getOpenAIClient>);

    const result = await generateDescription(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("Trimmed text.");
    }
  });

  it("truncates description to 300 chars", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const longDescription = "x".repeat(500);
    const client = mockOpenAIResponse(
      JSON.stringify({ description: longDescription })
    );
    mockGetOpenAIClient.mockReturnValue(client as unknown as ReturnType<typeof getOpenAIClient>);

    const result = await generateDescription(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(300);
    }
  });

  it("returns error when AI returns empty description", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const client = mockOpenAIResponse('{"description": "   "}');
    mockGetOpenAIClient.mockReturnValue(client as unknown as ReturnType<typeof getOpenAIClient>);

    const result = await generateDescription(validInput);
    expect(result.success).toBe(false);
    expect(result.error).toContain("No description");
  });

  it("returns error when AI returns unexpected format", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const client = mockOpenAIResponse('{"result": "nope"}');
    mockGetOpenAIClient.mockReturnValue(client as unknown as ReturnType<typeof getOpenAIClient>);

    const result = await generateDescription(validInput);
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

    const result = await generateDescription(validInput);
    expect(result).toEqual({ success: false, error: "AI service temporarily unavailable" });
  });

  it("truncates content to 2000 chars before sending", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const client = mockOpenAIResponse('{"description": "Summary."}');
    mockGetOpenAIClient.mockReturnValue(client as unknown as ReturnType<typeof getOpenAIClient>);

    const longContent = "a".repeat(5000);
    await generateDescription({ ...validInput, content: longContent });

    const inputArg = client.responses.create.mock.calls[0][0].input as string;
    expect(inputArg).toContain("Content: " + "a".repeat(2000));
    expect(inputArg).not.toContain("a".repeat(2001));
  });

  it("includes url and fileName in prompt when provided", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const client = mockOpenAIResponse('{"description": "Summary."}');
    mockGetOpenAIClient.mockReturnValue(client as unknown as ReturnType<typeof getOpenAIClient>);

    await generateDescription({
      title: "My File",
      type: "file",
      content: "",
      url: "https://example.com",
      fileName: "report.pdf",
    });

    const inputArg = client.responses.create.mock.calls[0][0].input as string;
    expect(inputArg).toContain("URL: https://example.com");
    expect(inputArg).toContain("File: report.pdf");
  });
});

describe("explainCode", () => {
  const validExplainInput = {
    title: "useLocalStorage Hook",
    content: "export function useLocalStorage() { return null }",
    type: "snippet" as const,
    language: "typescript",
  };

  it("returns error when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as any);
    const result = await explainCode(validExplainInput);
    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns error when user has no id", async () => {
    mockAuth.mockResolvedValue({ user: {} } as any);
    const result = await explainCode(validExplainInput);
    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns error for non-Pro users", async () => {
    mockAuth.mockResolvedValue(mockSession({ isPro: false }));
    const result = await explainCode(validExplainInput);
    expect(result).toEqual({ success: false, error: "Pro subscription required" });
  });

  it("allows non-Pro users when BYPASS_PRO_CHECKS is set", async () => {
    process.env.BYPASS_PRO_CHECKS = "true";
    mockAuth.mockResolvedValue(mockSession({ isPro: false }));
    const client = mockOpenAIResponse('{"explanation": "This hook persists state."}');
    mockGetOpenAIClient.mockReturnValue(client as unknown as ReturnType<typeof getOpenAIClient>);

    const result = await explainCode(validExplainInput);
    expect(result.success).toBe(true);
  });

  it("returns validation error for missing content", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const result = await explainCode({ ...validExplainInput, content: "" });
    expect(result.success).toBe(false);
    expect(result.error).toContain("Content is required");
  });

  it("returns validation error for invalid type", async () => {
    mockAuth.mockResolvedValue(mockSession());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await explainCode({ ...validExplainInput, type: "note" as any });
    expect(result.success).toBe(false);
    expect(result.error).toContain("snippet or command");
  });

  it("accepts command type", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const client = mockOpenAIResponse('{"explanation": "Lists files."}');
    mockGetOpenAIClient.mockReturnValue(client as unknown as ReturnType<typeof getOpenAIClient>);

    const result = await explainCode({
      title: "List files",
      content: "ls -la",
      type: "command",
    });
    expect(result.success).toBe(true);
  });

  it("returns error when rate limited", async () => {
    mockAuth.mockResolvedValue(mockSession());
    mockCheckActionRateLimit.mockResolvedValue({
      limited: true,
      message: "Too many attempts. Please try again in 30 minutes.",
    });

    const result = await explainCode(validExplainInput);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Too many attempts");
  });

  it("parses explanation from {explanation: ...} format", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const client = mockOpenAIResponse(
      '{"explanation": "This snippet defines a React hook for localStorage."}'
    );
    mockGetOpenAIClient.mockReturnValue(client as unknown as ReturnType<typeof getOpenAIClient>);

    const result = await explainCode(validExplainInput);
    expect(result).toEqual({
      success: true,
      data: "This snippet defines a React hook for localStorage.",
    });
  });

  it("parses explanation from {summary: ...} fallback format", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const client = mockOpenAIResponse('{"summary": "A storage helper."}');
    mockGetOpenAIClient.mockReturnValue(client as unknown as ReturnType<typeof getOpenAIClient>);

    const result = await explainCode(validExplainInput);
    expect(result).toEqual({
      success: true,
      data: "A storage helper.",
    });
  });

  it("trims whitespace from explanation", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const client = mockOpenAIResponse('{"explanation": "   Trimmed.   "}');
    mockGetOpenAIClient.mockReturnValue(client as unknown as ReturnType<typeof getOpenAIClient>);

    const result = await explainCode(validExplainInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("Trimmed.");
    }
  });

  it("returns error when AI returns empty explanation", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const client = mockOpenAIResponse('{"explanation": "   "}');
    mockGetOpenAIClient.mockReturnValue(client as unknown as ReturnType<typeof getOpenAIClient>);

    const result = await explainCode(validExplainInput);
    expect(result.success).toBe(false);
    expect(result.error).toContain("No explanation");
  });

  it("returns error when AI returns unexpected format", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const client = mockOpenAIResponse('{"result": "nope"}');
    mockGetOpenAIClient.mockReturnValue(client as unknown as ReturnType<typeof getOpenAIClient>);

    const result = await explainCode(validExplainInput);
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

    const result = await explainCode(validExplainInput);
    expect(result).toEqual({ success: false, error: "AI service temporarily unavailable" });
  });

  it("truncates content to 2000 chars before sending", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const client = mockOpenAIResponse('{"explanation": "Summary."}');
    mockGetOpenAIClient.mockReturnValue(client as unknown as ReturnType<typeof getOpenAIClient>);

    const longContent = "a".repeat(5000);
    await explainCode({ ...validExplainInput, content: longContent });

    const inputArg = client.responses.create.mock.calls[0][0].input as string;
    expect(inputArg).toContain("a".repeat(2000));
    expect(inputArg).not.toContain("a".repeat(2001));
  });

  it("uses 'terminal command' wording in instructions for command type", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const client = mockOpenAIResponse('{"explanation": "ok"}');
    mockGetOpenAIClient.mockReturnValue(client as unknown as ReturnType<typeof getOpenAIClient>);

    await explainCode({ title: "test", content: "ls", type: "command" });

    const instructions = client.responses.create.mock.calls[0][0].instructions as string;
    expect(instructions).toContain("terminal command");
  });

  it("uses 'code snippet' wording in instructions for snippet type", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const client = mockOpenAIResponse('{"explanation": "ok"}');
    mockGetOpenAIClient.mockReturnValue(client as unknown as ReturnType<typeof getOpenAIClient>);

    await explainCode(validExplainInput);

    const instructions = client.responses.create.mock.calls[0][0].instructions as string;
    expect(instructions).toContain("code snippet");
  });

  it("includes language in prompt when provided", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const client = mockOpenAIResponse('{"explanation": "ok"}');
    mockGetOpenAIClient.mockReturnValue(client as unknown as ReturnType<typeof getOpenAIClient>);

    await explainCode(validExplainInput);

    const inputArg = client.responses.create.mock.calls[0][0].input as string;
    expect(inputArg).toContain("Language: typescript");
  });

  it("works without title", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const client = mockOpenAIResponse('{"explanation": "ok"}');
    mockGetOpenAIClient.mockReturnValue(client as unknown as ReturnType<typeof getOpenAIClient>);

    const result = await explainCode({
      content: "console.log('hi')",
      type: "snippet",
    });
    expect(result.success).toBe(true);
  });
});
