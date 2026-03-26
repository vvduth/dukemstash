# CLAUDE.md
A developer knowledge hub for snippets, commands, prompts, notes, files, images, links and custom types.

@AGENTS.md

## Context files
Read the following to get the full context of the project:
- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md

## Commands

- `npm run dev` — start dev server (Turbopack)
- `npm run build` — production build
- `npm run start` — serve production build
- `npm test` — run unit tests (Vitest, single run)
- `npm run test:watch` — run unit tests in watch mode
Tests cover server actions and utilities only (`src/**/*.test.ts`). No component tests.

## Neon Database

- **Project:** `cold-butterfly-93907631` (dukem-stash)
- **Default branch:** `br-weathered-hall-a197sh6a` (development)
- **Production branch:** `br-wispy-lake-a1gwrsdu` (production) — **NEVER** use unless explicitly requested
- Always pass `projectId` and `branchId` when using Neon MCP tools

