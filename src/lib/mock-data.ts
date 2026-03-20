// Mock data for dashboard UI — replace with real DB queries when ready

export const mockUser = {
  id: "user_1",
  name: "John Doe",
  email: "john@example.com",
  image: null,
  isPro: true,
};

export const mockItemTypes = [
  { id: "type_snippet", name: "snippet", icon: "Code",       color: "#3b82f6", isSystem: true },
  { id: "type_prompt",  name: "prompt",  icon: "Sparkles",   color: "#8b5cf6", isSystem: true },
  { id: "type_note",    name: "note",    icon: "StickyNote", color: "#fde047", isSystem: true },
  { id: "type_command", name: "command", icon: "Terminal",   color: "#f97316", isSystem: true },
  { id: "type_link",    name: "link",    icon: "Link",       color: "#10b981", isSystem: true },
  { id: "type_file",    name: "file",    icon: "File",       color: "#6b7280", isSystem: true },
  { id: "type_image",   name: "image",   icon: "Image",      color: "#ec4899", isSystem: true },
];

export const mockCollections = [
  {
    id: "col_1",
    name: "React Patterns",
    description: "Common React patterns and best practices",
    isFavorite: true,
    itemCount: 24,
    typeIds: ["type_snippet", "type_note", "type_link"],
  },
  {
    id: "col_2",
    name: "Python Scripts",
    description: "Useful Python automation scripts",
    isFavorite: false,
    itemCount: 18,
    typeIds: ["type_snippet", "type_command"],
  },
  {
    id: "col_3",
    name: "Context Files",
    description: "AI context files for various projects",
    isFavorite: true,
    itemCount: 12,
    typeIds: ["type_file", "type_image"],
  },
  {
    id: "col_4",
    name: "AI Prompts Library",
    description: "Collection of effective AI prompts",
    isFavorite: false,
    itemCount: 45,
    typeIds: ["type_prompt", "type_file", "type_snippet"],
  },
  {
    id: "col_5",
    name: "DevOps Commands",
    description: "Docker, K8s, and deployment commands",
    isFavorite: false,
    itemCount: 32,
    typeIds: ["type_command", "type_snippet", "type_link", "type_file"],
  },
  {
    id: "col_6",
    name: "Interview Prep",
    description: "Code snippets and notes for interviews",
    isFavorite: true,
    itemCount: 28,
    typeIds: ["type_snippet", "type_prompt", "type_link", "type_note", "type_command"],
  },
];

export const mockItems = [
  {
    id: "item_1",
    title: "useLocalStorage Hook",
    description: "A custom React hook for persisting state to localStorage",
    contentType: "TEXT" as const,
    content: `export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    setStoredValue(value);
    window.localStorage.setItem(key, JSON.stringify(value));
  };

  return [storedValue, setValue];
}`,
    language: "typescript",
    isFavorite: false,
    isPinned: true,
    itemTypeId: "type_snippet",
    tags: ["react", "hooks", "storage"],
    collectionIds: ["col_1", "col_6"],
  },
  {
    id: "item_2",
    title: "Docker Compose Up",
    description: "Start all containers in detached mode",
    contentType: "TEXT" as const,
    content: "docker compose up -d",
    language: null,
    isFavorite: false,
    isPinned: true,
    itemTypeId: "type_command",
    tags: ["docker", "devops"],
    collectionIds: ["col_5"],
  },
  {
    id: "item_3",
    title: "System Design Prompt",
    description: "Prompt for system design discussions with AI",
    contentType: "TEXT" as const,
    content: "You are a senior software architect. Help me design a scalable system for...",
    language: null,
    isFavorite: true,
    isPinned: false,
    itemTypeId: "type_prompt",
    tags: ["ai", "system-design", "architecture"],
    collectionIds: ["col_4", "col_6"],
  },
  {
    id: "item_4",
    title: "Vercel Documentation",
    description: "Official Vercel deployment documentation",
    contentType: "URL" as const,
    url: "https://vercel.com/docs",
    language: null,
    isFavorite: true,
    isPinned: false,
    itemTypeId: "type_link",
    tags: ["vercel", "deployment", "docs"],
    collectionIds: ["col_5"],
  },
  {
    id: "item_5",
    title: "Python Retry Decorator",
    description: "Decorator for retrying failed function calls",
    contentType: "TEXT" as const,
    content: `import time
import functools

def retry(max_attempts=3, delay=1.0):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1:
                        raise
                    time.sleep(delay)
        return wrapper
    return decorator`,
    language: "python",
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_snippet",
    tags: ["python", "decorator", "retry"],
    collectionIds: ["col_2"],
  },
  {
    id: "item_6",
    title: "Git Undo Last Commit",
    description: "Undo last commit but keep changes staged",
    contentType: "TEXT" as const,
    content: "git reset --soft HEAD~1",
    language: null,
    isFavorite: true,
    isPinned: false,
    itemTypeId: "type_command",
    tags: ["git", "undo"],
    collectionIds: ["col_5", "col_6"],
  },
  {
    id: "item_7",
    title: "React Query Setup Note",
    description: "Notes on setting up TanStack Query in Next.js",
    contentType: "TEXT" as const,
    content: "Wrap the app in QueryClientProvider at the root layout. Use `'use client'` wrapper component to avoid SSR issues.",
    language: null,
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_note",
    tags: ["react", "tanstack", "nextjs"],
    collectionIds: ["col_1"],
  },
  {
    id: "item_8",
    title: "Tailwind CSS v4 Docs",
    description: "Official Tailwind CSS v4 documentation",
    contentType: "URL" as const,
    url: "https://tailwindcss.com/docs",
    language: null,
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_link",
    tags: ["tailwind", "css", "docs"],
    collectionIds: ["col_1"],
  },
];
