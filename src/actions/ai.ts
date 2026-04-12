"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { getOpenAIClient, AI_MODEL } from "@/lib/openai";
import { checkActionRateLimit } from "@/lib/rate-limit";

const generateAutoTagsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional().default(""),
  type: z.string().min(1, "Type is required"),
  language: z.string().optional(),
});

export type GenerateAutoTagsInput = z.input<typeof generateAutoTagsSchema>;

export async function generateAutoTags(input: GenerateAutoTagsInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }

  const isPro = session.user.isPro || process.env.BYPASS_PRO_CHECKS === "true";
  if (!isPro) {
    return { success: false as const, error: "Pro subscription required" };
  }

  const parsed = generateAutoTagsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  // Rate limit check
  const rateCheck = await checkActionRateLimit("ai", session.user.id);
  if (rateCheck.limited) {
    return { success: false as const, error: rateCheck.message };
  }

  const { title, content, type, language } = parsed.data;
  const truncatedContent = content.slice(0, 2000);

  const userInput = [
    `Title: ${title}`,
    `Type: ${type}`,
    language ? `Language: ${language}` : null,
    truncatedContent ? `Content: ${truncatedContent}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const client = getOpenAIClient();
    const response = await client.responses.create({
      model: AI_MODEL,
      instructions:
        "You are a developer content tagger. Suggest 3-5 concise, lowercase tags for developer content. " +
        'Tags should be specific technical terms (e.g., "react-hooks", "async-await", "sql-joins"). ' +
        'Do not use generic tags like "code" or "programming". ' +
        "Return a JSON object with a single key \"tags\" containing an array of strings.",
      input: `
Analyze the following content and return JSON.

Content:
${userInput}
`,
      text: {
        format: { type: "json_object" },
      },
    });

    const text = response.output_text;
    const json = JSON.parse(text);

    // Handle both {"tags": [...]} and [...] formats
    const rawTags: unknown[] = Array.isArray(json) ? json : json.tags;
    if (!Array.isArray(rawTags)) {
      return { success: false as const, error: "AI returned unexpected format" };
    }

    const tags = rawTags
      .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
      .map((t) => t.toLowerCase().trim())
      .slice(0, 5);

    if (tags.length === 0) {
      return { success: false as const, error: "No tag suggestions for this content" };
    }

    return { success: true as const, data: tags };
  } catch (error) {
    console.error("AI tag suggestion error:", error);
    return { success: false as const, error: "AI service temporarily unavailable" };
  }
}
