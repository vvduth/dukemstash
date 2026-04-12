# AI Integration Plan

> Research document for integrating OpenAI gpt-5-nano into Dukemstash.
> Generated: 2026-04-12

---

## Table of Contents

1. [Overview](#overview)
2. [Package Setup](#package-setup)
3. [Architecture](#architecture)
4. [Feature Specifications](#feature-specifications)
5. [Server Action Patterns](#server-action-patterns)
6. [Streaming Patterns](#streaming-patterns)
7. [Pro Gating](#pro-gating)
8. [Rate Limiting](#rate-limiting)
9. [Cost Optimization](#cost-optimization)
10. [UI Patterns](#ui-patterns)
11. [Security Considerations](#security-considerations)
12. [File Structure](#file-structure)
13. [Environment Variables](#environment-variables)

---

## Overview

Four AI features for Pro users:

| Feature | Input | Output | Pattern |
|---------|-------|--------|---------|
| Auto-tag | Title + content + type | 3-5 tag suggestions | Non-streaming (server action) |
| Summarize | Content | 1-2 sentence summary | Non-streaming (server action) |
| Explain Code | Code + language | Markdown explanation | Streaming (API route) |
| Optimize Prompt | Prompt text | Improved prompt + notes | Streaming (API route) |

---

## Package Setup

```bash
npm install ai @ai-sdk/openai
```

**Why Vercel AI SDK over raw OpenAI SDK:**
- Built-in streaming helpers for Next.js (`toDataStreamResponse()`)
- `useCompletion` React hook for client-side streaming
- `generateObject` with Zod schemas for structured output (auto-tag)
- Provider-agnostic — easy to swap models later
- Handles retries, error normalization, token counting

---

## Architecture

### Decision Matrix: Server Action vs API Route

| Feature | Approach | Why |
|---------|----------|-----|
| Auto-tag | Server action (`generateObject`) | Short, structured output; fits `{ success, data }` pattern |
| Summarize | Server action (`generateText`) | Short output; no streaming needed |
| Explain Code | API route (`streamText`) | Long output; streaming improves UX |
| Optimize Prompt | API route (`streamText`) | Long output; streaming improves UX |

### Client Library

```typescript
// src/lib/ai.ts
import { openai } from "@ai-sdk/openai";

export const aiModel = openai("gpt-5-nano");
```

Single model reference used across all features. Easy to change model globally.

---

## Feature Specifications

### 1. Auto-Tag Suggestions

**System prompt:**
```
You are a developer content tagger. Suggest 3-5 concise, lowercase tags for developer content. Tags should be specific technical terms (e.g., "react-hooks", "async-await", "sql-joins"). Do not use generic tags like "code" or "programming".
```

**User prompt:**
```
Title: {title}
Type: {type}
Language: {language}
Content: {first 500 chars of content}
```

**Output schema (Zod):**
```typescript
z.object({
  tags: z.array(z.string().min(1).max(50)).min(1).max(5),
})
```

**Implementation: `generateObject`** — returns structured, validated tags.

### 2. AI Summary

**System prompt:**
```
You are a technical content summarizer. Write a 1-2 sentence summary of the following developer content. Be specific and actionable. Focus on what the content does or teaches.
```

**User prompt:** `{content (first 1000 chars)}`

**Max tokens:** 150

**Implementation: `generateText`** — returns plain text summary.

### 3. Code Explanation

**System prompt:**
```
You are a senior developer explaining code to a colleague. Explain what this code does, key patterns used, and any notable decisions. Use bullet points for structure. Keep it concise but thorough.
```

**User prompt:**
````
Language: {language}
```{language}
{code}
```
````

**Max tokens:** 500

**Implementation: `streamText`** — streams markdown into the UI.

### 4. Prompt Optimizer

**System prompt:**
```
You are an AI prompt engineer. Improve the given prompt for clarity, specificity, and effectiveness. Return the optimized prompt followed by a brief "Changes:" section noting what was improved and why. Format the optimized prompt in a code block.
```

**User prompt:** `Original prompt:\n{prompt text}`

**Max tokens:** 500

**Implementation: `streamText`** — streams the result for immediate feedback.

---

## Server Action Patterns

Following existing codebase conventions (`{ success, data?, error? }` return type, Zod validation, auth + Pro gating).

```typescript
// src/actions/ai.ts
"use server";

import { auth } from "@/auth";
import { generateObject, generateText } from "ai";
import { aiModel } from "@/lib/ai";
import { z } from "zod";

export async function suggestTags(input: { title: string; content: string; type: string; language?: string }) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }
  if (!session.user.isPro && process.env.BYPASS_PRO_CHECKS !== "true") {
    return { success: false, error: "Pro subscription required" };
  }

  const truncatedContent = input.content.slice(0, 500);

  try {
    const { object } = await generateObject({
      model: aiModel,
      schema: z.object({ tags: z.array(z.string().min(1).max(50)).max(5) }),
      maxTokens: 100,
      prompt: `Title: ${input.title}\nType: ${input.type}\nLanguage: ${input.language || "unknown"}\nContent: ${truncatedContent}`,
      system: "You are a developer content tagger. Suggest 3-5 concise, lowercase tags...",
    });

    return { success: true, data: object.tags };
  } catch (error) {
    console.error("AI tag suggestion error:", error);
    return { success: false, error: "AI service temporarily unavailable" };
  }
}

export async function generateSummary(content: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }
  if (!session.user.isPro && process.env.BYPASS_PRO_CHECKS !== "true") {
    return { success: false, error: "Pro subscription required" };
  }

  try {
    const { text } = await generateText({
      model: aiModel,
      maxTokens: 150,
      prompt: content.slice(0, 1000),
      system: "You are a technical content summarizer...",
    });

    return { success: true, data: text };
  } catch (error) {
    console.error("AI summary error:", error);
    return { success: false, error: "AI service temporarily unavailable" };
  }
}
```

---

## Streaming Patterns

For code explanation and prompt optimization, use API routes with streaming.

### API Route

```typescript
// src/app/api/ai/explain/route.ts
import { streamText } from "ai";
import { aiModel } from "@/lib/ai";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!session.user.isPro && process.env.BYPASS_PRO_CHECKS !== "true") {
    return new Response("Pro required", { status: 403 });
  }

  // Rate limit check here

  const { code, language } = await req.json();
  if (!code || typeof code !== "string") {
    return new Response("Invalid input", { status: 400 });
  }

  const result = streamText({
    model: aiModel,
    maxTokens: 500,
    system: "You are a senior developer explaining code...",
    prompt: `Language: ${language}\n\`\`\`${language}\n${code.slice(0, 2000)}\n\`\`\``,
  });

  return result.toDataStreamResponse();
}
```

### Client Hook

```typescript
"use client";
import { useCompletion } from "ai/react";

export function useCodeExplainer() {
  return useCompletion({
    api: "/api/ai/explain",
  });
}

// Usage in component:
const { completion, isLoading, complete, stop } = useCodeExplainer();

// Trigger:
await complete("", { body: { code, language } });
```

---

## Pro Gating

Follows existing pattern from `src/actions/items.ts`:

```typescript
// Server actions
if (!session.user.isPro && process.env.BYPASS_PRO_CHECKS !== "true") {
  return { success: false, error: "Pro subscription required" };
}

// API routes
if (!session.user.isPro && process.env.BYPASS_PRO_CHECKS !== "true") {
  return new Response("Pro required", { status: 403 });
}
```

**Client-side:** Show AI buttons only for Pro users, or show disabled with "PRO" badge for free users (same pattern as file/image types in sidebar).

---

## Rate Limiting

Separate AI rate limiter using existing Upstash pattern:

```typescript
// In src/lib/rate-limit.ts — add:
export const aiRateLimit = createRateLimit("ai", 20, "1 h");
// 20 AI requests per hour per user
```

Apply in both server actions and API routes:

```typescript
const rateCheck = await checkRateLimit(aiRateLimit, session.user.id);
if (rateCheck.limited) {
  return { success: false, error: `AI quota exceeded. Try again in ${rateCheck.retryAfter}s` };
}
```

---

## Cost Optimization

| Strategy | Implementation |
|----------|---------------|
| **Truncate input** | Content: 500 chars (tags), 1000 chars (summary), 2000 chars (explain) |
| **Set maxTokens** | 100 (tags), 150 (summary), 500 (explain/optimize) |
| **Cache results** | Store AI summaries/tags in DB; skip re-generation if content unchanged |
| **Use cheapest model** | gpt-5-nano for all features |
| **Rate limit per user** | 20 requests/hour prevents abuse |
| **Structured output** | `generateObject` for tags avoids wasted tokens on formatting |
| **Debounce client** | Don't auto-trigger; require explicit button click |
| **OpenAI spending cap** | Set monthly budget in OpenAI dashboard |

### Optional: DB Caching

Add an `aiSummary` field to the Item model to cache generated summaries:

```prisma
model Item {
  // ... existing fields
  aiSummary   String?  @db.Text  // Cached AI summary
  aiTags      String[] // Cached AI tag suggestions
}
```

Only regenerate when content changes (compare content hash).

---

## UI Patterns

### AI Action Button Placement

**ItemDrawer action bar:**
```
[★ Favorite] [📌 Pin] [📋 Copy] [✏️ Edit] [✨ AI ▾] [🗑️ Delete]
                                              ├─ Suggest Tags
                                              ├─ Generate Summary
                                              ├─ Explain Code      (snippet/command only)
                                              └─ Optimize Prompt   (prompt type only)
```

- Use Sparkles icon from Lucide for the AI dropdown
- Show dropdown only for Pro users (or disabled with PRO badge for free)
- Context-aware: only show relevant options based on item type

### Auto-Tag Suggestions UI

```
Tags: [react] [hooks] [typescript]

✨ Suggested: [+ state-management] [+ custom-hooks] [+ local-storage]  [Dismiss]
```

- Muted/outlined chips with "+" to accept each tag
- "Dismiss" or "x" to dismiss all suggestions
- Accepted tags move to main tag list with full styling
- Also available in CreateItemDialog and ItemDrawer edit mode

### Loading States

| Feature | Loading Pattern |
|---------|----------------|
| Auto-tag | Skeleton chips with shimmer animation (~1-2s) |
| Summary | Skeleton text block, then full result |
| Code explain | Streaming markdown with "Stop" button |
| Prompt optimize | Streaming text with "Stop" button |

### AI Content Visual Treatment

- Subtle dashed border or different background for AI-generated content
- Small "✨" badge on AI-generated summaries/tags
- After accepting, content looks identical to manually created content

### Error States

| State | UI |
|-------|-----|
| API failure | "AI couldn't process this. Try again?" + retry button |
| Rate limited | "AI quota exceeded. Try again in X minutes" |
| Content too short | Disable AI button with tooltip "Add more content" |
| No suggestions | "No suggestions for this content" (don't show empty area) |

---

## Security Considerations

| Concern | Mitigation |
|---------|-----------|
| API key exposure | `OPENAI_API_KEY` env var, server-side only |
| Prompt injection | Truncate input, use system prompts, validate output with Zod |
| Cost abuse | Per-user rate limiting (20/hr), maxTokens caps, input truncation |
| PII leakage | User content is sent to OpenAI — document in privacy policy |
| Output validation | `generateObject` with Zod for structured responses |
| Error leakage | Never expose raw API errors; log server-side, return generic message |

---

## File Structure

```
src/
├── lib/
│   └── ai.ts                        # AI model singleton + prompt constants
├── actions/
│   └── ai.ts                        # suggestTags, generateSummary server actions
├── app/
│   └── api/
│       └── ai/
│           ├── explain/route.ts      # Streaming code explanation
│           └── optimize/route.ts     # Streaming prompt optimization
├── hooks/
│   ├── use-code-explainer.ts         # useCompletion wrapper for explain
│   └── use-prompt-optimizer.ts       # useCompletion wrapper for optimize
└── components/
    └── ai/
        ├── AiDropdown.tsx            # Sparkles dropdown in ItemDrawer
        ├── TagSuggestions.tsx         # Inline tag suggestion chips
        ├── AiSummary.tsx             # Summary display with accept/dismiss
        ├── CodeExplainer.tsx          # Streaming explanation panel
        └── PromptOptimizer.tsx        # Streaming optimizer with diff view
```

---

## Environment Variables

Add to `.env.example`:

```env
# AI (Pro feature)
OPENAI_API_KEY=sk-...
```

No other AI-specific env vars needed. The Vercel AI SDK reads `OPENAI_API_KEY` automatically via `@ai-sdk/openai`.

---

## Implementation Order

1. **Setup** — Install packages, create `src/lib/ai.ts`, add env var
2. **Auto-tag** — Server action + TagSuggestions component (simplest feature, validates setup)
3. **Summary** — Server action + AiSummary component
4. **Code explanation** — API route + streaming + CodeExplainer component
5. **Prompt optimizer** — API route + streaming + PromptOptimizer component
6. **Polish** — Rate limiting, caching, error states, mobile responsiveness
