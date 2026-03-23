import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashSync } from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

// ============================================================================
// System Item Types
// ============================================================================

const systemTypes = [
  { name: "snippet", icon: "Code", color: "#3b82f6", isSystem: true },
  { name: "prompt", icon: "Sparkles", color: "#8b5cf6", isSystem: true },
  { name: "command", icon: "Terminal", color: "#f97316", isSystem: true },
  { name: "note", icon: "StickyNote", color: "#fde047", isSystem: true },
  { name: "file", icon: "File", color: "#6b7280", isSystem: true },
  { name: "image", icon: "Image", color: "#ec4899", isSystem: true },
  { name: "link", icon: "Link", color: "#10b981", isSystem: true },
];

// ============================================================================
// Seed Data
// ============================================================================

interface SeedItem {
  title: string;
  description: string;
  type: string;
  language?: string;
  tags: string[];
  isPinned?: boolean;
  isFavorite?: boolean;
  content?: string;
  url?: string;
}

interface SeedCollection {
  name: string;
  description: string;
  isFavorite?: boolean;
  items: SeedItem[];
}

const collectionsData: SeedCollection[] = [
  {
    name: "React Patterns",
    description: "Reusable React patterns and hooks",
    items: [
      {
        title: "useDebounce Hook",
        description: "A custom hook that debounces a value with a configurable delay",
        type: "snippet",
        language: "typescript",
        tags: ["react", "hooks", "performance"],
        isPinned: true,
        content: `import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}`,
      },
      {
        title: "Context Provider Pattern",
        description: "Type-safe React context with a custom provider and hook",
        type: "snippet",
        language: "typescript",
        tags: ["react", "context", "patterns"],
        content: `import { createContext, useContext, useState, ReactNode } from "react";

interface ThemeContextType {
  theme: "light" | "dark";
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));
  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}`,
      },
      {
        title: "useLocalStorage Hook",
        description: "Persist state to localStorage with SSR safety",
        type: "snippet",
        language: "typescript",
        tags: ["react", "hooks", "storage"],
        isFavorite: true,
        content: `import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      console.warn(\`Failed to save \${key} to localStorage\`);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}`,
      },
    ],
  },
  {
    name: "AI Workflows",
    description: "AI prompts and workflow automations",
    isFavorite: true,
    items: [
      {
        title: "Code Review Prompt",
        description: "Thorough code review prompt for AI assistants",
        type: "prompt",
        tags: ["ai", "code-review", "workflow"],
        isPinned: true,
        content: `Review the following code for:

1. **Bugs & Logic Errors** — edge cases, off-by-one, null handling
2. **Security** — injection, auth issues, data exposure
3. **Performance** — unnecessary re-renders, N+1 queries, memory leaks
4. **Readability** — naming, structure, comments where needed
5. **Best Practices** — framework conventions, DRY, SOLID

For each issue found, provide:
- Severity (critical / warning / suggestion)
- Line number or location
- What's wrong and why
- A concrete fix

Code to review:
\`\`\`
{{paste code here}}
\`\`\``,
      },
      {
        title: "Documentation Generator",
        description: "Generate comprehensive documentation from code",
        type: "prompt",
        tags: ["ai", "documentation", "workflow"],
        content: `Generate documentation for the following code. Include:

1. **Overview** — What does this code do? (1-2 sentences)
2. **Parameters / Props** — Table with name, type, default, description
3. **Return Value** — What it returns and when
4. **Usage Examples** — 2-3 practical examples
5. **Edge Cases** — Known limitations or gotchas

Use JSDoc/TSDoc format for inline docs.

Code:
\`\`\`
{{paste code here}}
\`\`\``,
      },
      {
        title: "Refactoring Assistant",
        description: "AI prompt for guided code refactoring",
        type: "prompt",
        tags: ["ai", "refactoring", "workflow"],
        isFavorite: true,
        content: `Refactor the following code. Goals:

1. **Simplify** — Reduce complexity, remove dead code
2. **Extract** — Break into smaller, testable functions
3. **Type Safety** — Add/improve TypeScript types
4. **Naming** — Use clear, descriptive names
5. **Patterns** — Apply appropriate design patterns

Constraints:
- Maintain the same public API / behavior
- Keep backwards compatibility
- Explain each change and why

Code to refactor:
\`\`\`
{{paste code here}}
\`\`\``,
      },
    ],
  },
  {
    name: "DevOps",
    description: "Infrastructure and deployment resources",
    items: [
      {
        title: "Multi-stage Docker Build",
        description: "Optimized Docker build for Node.js apps",
        type: "snippet",
        language: "dockerfile",
        tags: ["docker", "devops", "deployment"],
        content: `# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]`,
      },
      {
        title: "Deploy with Zero Downtime",
        description: "Blue-green deployment script using Docker Compose",
        type: "command",
        tags: ["devops", "deployment", "docker"],
        content: `# Blue-green deploy with Docker Compose
docker compose -f docker-compose.prod.yml build && \\
docker compose -f docker-compose.prod.yml up -d --no-deps --scale app=2 && \\
sleep 10 && \\
docker compose -f docker-compose.prod.yml up -d --no-deps --scale app=1`,
      },
      {
        title: "GitHub Actions Documentation",
        description: "Official GitHub Actions workflow syntax reference",
        type: "link",
        tags: ["devops", "ci-cd", "github"],
        url: "https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions",
      },
      {
        title: "Docker Compose Reference",
        description: "Docker Compose file version 3 reference documentation",
        type: "link",
        tags: ["devops", "docker", "reference"],
        url: "https://docs.docker.com/compose/compose-file/",
      },
    ],
  },
  {
    name: "Terminal Commands",
    description: "Useful shell commands for everyday development",
    items: [
      {
        title: "Git Interactive Rebase & Cleanup",
        description: "Squash, reorder, and clean up commit history",
        type: "command",
        tags: ["git", "terminal", "workflow"],
        isPinned: true,
        content: `# Interactive rebase last N commits
git rebase -i HEAD~5

# Squash all commits on feature branch
git reset --soft main && git commit -m "feat: description"

# Clean up merged branches
git branch --merged main | grep -v "main" | xargs git branch -d`,
      },
      {
        title: "Docker Container Management",
        description: "Common Docker commands for container lifecycle",
        type: "command",
        tags: ["docker", "terminal", "devops"],
        content: `# Stop all running containers
docker stop $(docker ps -q)

# Remove all stopped containers, unused images, and volumes
docker system prune -af --volumes

# View logs with follow and timestamps
docker logs -f --timestamps <container>

# Exec into running container
docker exec -it <container> /bin/sh`,
      },
      {
        title: "Process Management",
        description: "Find and manage system processes",
        type: "command",
        tags: ["terminal", "system", "debugging"],
        content: `# Find process using a specific port
lsof -i :3000

# Kill process on a port
kill -9 $(lsof -t -i :3000)

# Watch resource usage
top -o %MEM -n 20

# List all node processes
ps aux | grep node`,
      },
      {
        title: "Package Manager Utilities",
        description: "npm and pnpm productivity commands",
        type: "command",
        tags: ["npm", "terminal", "packages"],
        isFavorite: true,
        content: `# Check for outdated packages
npm outdated

# View dependency tree for a package
npm ls <package>

# Find why a package is installed
npm explain <package>

# Clean install from lockfile
rm -rf node_modules && npm ci

# Check for vulnerabilities
npm audit && npm audit fix`,
      },
    ],
  },
  {
    name: "Design Resources",
    description: "UI/UX resources and references",
    items: [
      {
        title: "Tailwind CSS Documentation",
        description: "Official Tailwind CSS utility class reference",
        type: "link",
        tags: ["css", "tailwind", "reference"],
        isFavorite: true,
        url: "https://tailwindcss.com/docs",
      },
      {
        title: "shadcn/ui Components",
        description: "Beautifully designed components built with Radix UI and Tailwind",
        type: "link",
        tags: ["ui", "components", "react"],
        url: "https://ui.shadcn.com/docs/components",
      },
      {
        title: "Vercel Design System",
        description: "Vercel's open-source design system and component library",
        type: "link",
        tags: ["design-system", "ui", "reference"],
        url: "https://vercel.com/geist/introduction",
      },
      {
        title: "Lucide Icons",
        description: "Beautiful and consistent open-source icon library",
        type: "link",
        tags: ["icons", "ui", "design"],
        url: "https://lucide.dev/icons",
      },
    ],
  },
];

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log("🌱 Seeding database...\n");

  // --- System Item Types ---
  console.log("Creating system item types...");
  const typeMap = new Map<string, string>();

  for (const type of systemTypes) {
    const existing = await prisma.itemType.findFirst({
      where: { name: type.name, isSystem: true, userId: null },
    });

    if (existing) {
      await prisma.itemType.update({
        where: { id: existing.id },
        data: { icon: type.icon, color: type.color },
      });
      typeMap.set(type.name, existing.id);
    } else {
      const created = await prisma.itemType.create({
        data: {
          name: type.name,
          icon: type.icon,
          color: type.color,
          isSystem: true,
          userId: null,
        },
      });
      typeMap.set(type.name, created.id);
    }
    console.log(`  ✓ ${type.name}`);
  }

  // --- Demo User ---
  console.log("\nCreating demo user...");
  const hashedPassword = hashSync("12345678", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@devstash.io" },
    update: { name: "Demo User", password: hashedPassword },
    create: {
      email: "demo@devstash.io",
      name: "Demo User",
      password: hashedPassword,
      isPro: false,
      emailVerified: new Date(),
    },
  });
  console.log(`  ✓ ${user.email}`);

  // --- Tags ---
  console.log("\nCreating tags...");
  const allTags = new Set<string>();
  for (const col of collectionsData) {
    for (const item of col.items) {
      for (const tag of item.tags) {
        allTags.add(tag);
      }
    }
  }

  const tagMap = new Map<string, string>();
  for (const tagName of allTags) {
    const tag = await prisma.tag.upsert({
      where: { name: tagName },
      update: {},
      create: { name: tagName },
    });
    tagMap.set(tagName, tag.id);
  }
  console.log(`  ✓ ${allTags.size} tags`);

  // --- Collections & Items ---
  console.log("\nCreating collections and items...");

  for (const colData of collectionsData) {
    // Delete existing collection's item associations for idempotency
    const existingCol = await prisma.collection.findUnique({
      where: { name_userId: { name: colData.name, userId: user.id } },
      include: { items: true },
    });

    if (existingCol) {
      // Delete existing items that belong to this collection
      for (const rel of existingCol.items) {
        await prisma.item.delete({ where: { id: rel.itemId } });
      }
      await prisma.collection.delete({ where: { id: existingCol.id } });
    }

    const collection = await prisma.collection.create({
      data: {
        name: colData.name,
        description: colData.description,
        isFavorite: colData.isFavorite ?? false,
        userId: user.id,
      },
    });

    for (const itemData of colData.items) {
      const typeId = typeMap.get(itemData.type);
      if (!typeId) throw new Error(`Unknown type: ${itemData.type}`);

      const isLink = itemData.type === "link";

      const item = await prisma.item.create({
        data: {
          title: itemData.title,
          description: itemData.description,
          contentType: isLink ? "URL" : "TEXT",
          content: isLink ? null : itemData.content,
          url: isLink ? itemData.url : null,
          language: itemData.language ?? null,
          isFavorite: itemData.isFavorite ?? false,
          isPinned: itemData.isPinned ?? false,
          userId: user.id,
          itemTypeId: typeId,
          collections: {
            create: { collectionId: collection.id },
          },
          tags: {
            create: itemData.tags.map((t) => ({
              tagId: tagMap.get(t)!,
            })),
          },
        },
      });

      console.log(`  ✓ [${colData.name}] ${item.title}`);
    }
  }

  console.log("\n✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });