import { z } from "zod";

export const FONT_SIZE_OPTIONS = [12, 13, 14, 15, 16, 18, 20] as const;
export const TAB_SIZE_OPTIONS = [2, 4, 8] as const;
export const THEME_OPTIONS = ["vs-dark", "monokai", "github-dark"] as const;

export const EDITOR_PREFERENCES_DEFAULTS = {
  fontSize: 14,
  tabSize: 2,
  wordWrap: true,
  minimap: false,
  theme: "vs-dark" as const,
};

export type EditorPreferences = z.infer<typeof editorPreferencesSchema>;

export const editorPreferencesSchema = z.object({
  fontSize: z.number().refine((v) => (FONT_SIZE_OPTIONS as readonly number[]).includes(v), {
    message: "Invalid font size",
  }),
  tabSize: z.number().refine((v) => (TAB_SIZE_OPTIONS as readonly number[]).includes(v), {
    message: "Invalid tab size",
  }),
  wordWrap: z.boolean(),
  minimap: z.boolean(),
  theme: z.enum(THEME_OPTIONS),
});
