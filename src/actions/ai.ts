"use server";

import { z } from "zod";
import { getOpenAIClient, AI_MODEL } from "@/lib/openai";
import { aiActionPreflight } from "@/lib/actions/ai-preflight";
import { extractAiString } from "@/lib/actions/ai-response";
import { fail, ok } from "@/lib/actions/result";

const generateAutoTagsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional().default(""),
  type: z.string().min(1, "Type is required"),
  language: z.string().optional(),
});

export type GenerateAutoTagsInput = z.input<typeof generateAutoTagsSchema>;

const MAX_AI_CONTENT_LENGTH = 2000;

export async function generateAutoTags(input: GenerateAutoTagsInput) {
  const pre = await aiActionPreflight(generateAutoTagsSchema, input);
  if (!pre.success) return pre;

  const { title, content, type, language } = pre.data;
  const truncatedContent = content.slice(0, MAX_AI_CONTENT_LENGTH);

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
      return fail("AI returned unexpected format");
    }

    const tags = rawTags
      .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
      .map((t) => t.toLowerCase().trim())
      .slice(0, 5);

    if (tags.length === 0) {
      return fail("No tag suggestions for this content");
    }

    return ok(tags);
  } catch (error) {
    console.error("AI tag suggestion error:", error);
    return fail("AI service temporarily unavailable");
  }
}

const generateDescriptionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional().default(""),
  url: z.string().optional().default(""),
  fileName: z.string().optional().default(""),
  type: z.string().min(1, "Type is required"),
  language: z.string().optional(),
});

export type GenerateDescriptionInput = z.input<typeof generateDescriptionSchema>;

const MAX_DESCRIPTION_LENGTH = 300;

export async function generateDescription(input: GenerateDescriptionInput) {
  const pre = await aiActionPreflight(generateDescriptionSchema, input);
  if (!pre.success) return pre;

  const { title, content, url, fileName, type, language } = pre.data;
  const truncatedContent = content.slice(0, MAX_AI_CONTENT_LENGTH);

  const userInput = [
    `Title: ${title}`,
    `Type: ${type}`,
    language ? `Language: ${language}` : null,
    url ? `URL: ${url}` : null,
    fileName ? `File: ${fileName}` : null,
    truncatedContent ? `Content: ${truncatedContent}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const client = getOpenAIClient();
    const response = await client.responses.create({
      model: AI_MODEL,
      instructions:
        "You are a developer content summarizer. Write a concise 1-2 sentence description " +
        "of the provided item that a developer could skim to understand what it is and when to use it. " +
        "Keep it under 300 characters total. Do not include quotes, markdown, or the word 'description'. " +
        'Return a JSON object with a single key "description" containing the summary string.',
      input: `
Summarize the following item and return JSON.

Item:
${userInput}
`,
      text: {
        format: { type: "json_object" },
      },
    });

    const json = JSON.parse(response.output_text);
    const extracted = extractAiString(
      json,
      "description",
      "summary",
      "No description generated for this content"
    );
    if (!extracted.success) return extracted;

    return ok(extracted.data.slice(0, MAX_DESCRIPTION_LENGTH));
  } catch (error) {
    console.error("AI description generation error:", error);
    return fail("AI service temporarily unavailable");
  }
}

const explainCodeSchema = z.object({
  title: z.string().optional().default(""),
  content: z.string().min(1, "Content is required"),
  type: z.enum(["snippet", "command"], {
    message: "Type must be snippet or command",
  }),
  language: z.string().optional(),
});

export type ExplainCodeInput = z.input<typeof explainCodeSchema>;

export async function explainCode(input: ExplainCodeInput) {
  const pre = await aiActionPreflight(explainCodeSchema, input);
  if (!pre.success) return pre;

  const { title, content, type, language } = pre.data;
  const truncatedContent = content.slice(0, MAX_AI_CONTENT_LENGTH);

  const userInput = [
    title ? `Title: ${title}` : null,
    `Type: ${type}`,
    language ? `Language: ${language}` : null,
    `Content:\n${truncatedContent}`,
  ]
    .filter(Boolean)
    .join("\n");

  const subject = type === "command" ? "terminal command" : "code snippet";

  try {
    const client = getOpenAIClient();
    const response = await client.responses.create({
      model: AI_MODEL,
      instructions:
        `You are a senior developer explaining a ${subject} to another developer. ` +
        "Write a concise explanation (200-300 words total) covering: " +
        "(1) what the code does at a high level, " +
        "(2) the key concepts, syntax, or APIs being used, " +
        "(3) any notable behavior or gotchas worth flagging. " +
        "Use clear markdown with short paragraphs and inline `code` formatting where helpful. " +
        "Do not restate the entire code block. Do not wrap the entire response in a code fence. " +
        'Return a JSON object with a single key "explanation" containing the markdown string.',
      input: `
Explain the following ${subject} and return JSON.

${userInput}
`,
      text: {
        format: { type: "json_object" },
      },
    });

    const json = JSON.parse(response.output_text);
    const extracted = extractAiString(
      json,
      "explanation",
      "summary",
      "No explanation generated for this content"
    );
    if (!extracted.success) return extracted;

    return ok(extracted.data);
  } catch (error) {
    console.error("AI code explanation error:", error);
    return fail("AI service temporarily unavailable");
  }
}

const optimizePromptSchema = z.object({
  title: z.string().optional().default(""),
  content: z.string().min(1, "Content is required"),
});

export type OptimizePromptInput = z.input<typeof optimizePromptSchema>;

export async function optimizePrompt(input: OptimizePromptInput) {
  const pre = await aiActionPreflight(optimizePromptSchema, input);
  if (!pre.success) return pre;

  const { title, content } = pre.data;
  const truncatedContent = content.slice(0, MAX_AI_CONTENT_LENGTH);

  const userInput = [
    title ? `Title: ${title}` : null,
    `Prompt:\n${truncatedContent}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const client = getOpenAIClient();
    const response = await client.responses.create({
      model: AI_MODEL,
      instructions:
        "You are a prompt engineer who refines AI prompts written by developers. " +
        "Improve the given prompt for clarity, structure, and specificity while preserving the user's original intent. " +
        "Add explicit constraints, expected output format, and concrete examples only when they sharpen the request. " +
        "Do not invent new requirements that change the goal. Do not add commentary or meta text outside the prompt itself. " +
        "If the prompt is already clear, well-structured, and specific, set changed to false and return the prompt unchanged. " +
        'Return a JSON object with two keys: "optimized" (the refined prompt as a string) and "changed" (a boolean).',
      input: `
Refine the following prompt and return JSON.

${userInput}
`,
      text: {
        format: { type: "json_object" },
      },
    });

    const json = JSON.parse(response.output_text);
    const extracted = extractAiString(
      json,
      "optimized",
      "prompt",
      "No optimization generated for this prompt"
    );
    if (!extracted.success) return extracted;

    const optimized = extracted.data;
    const rawChanged: unknown =
      typeof json === "object" && json !== null
        ? (json as Record<string, unknown>).changed
        : undefined;
    const changed =
      typeof rawChanged === "boolean"
        ? rawChanged
        : optimized !== content.trim();

    return ok({ optimized, changed });
  } catch (error) {
    console.error("AI prompt optimization error:", error);
    return fail("AI service temporarily unavailable");
  }
}
