"use client";

import { useEditorPreferences } from "@/contexts/editor-preferences";
import {
  FONT_SIZE_OPTIONS,
  TAB_SIZE_OPTIONS,
  THEME_OPTIONS,
} from "@/lib/validations/editor-preferences";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const THEME_LABELS: Record<(typeof THEME_OPTIONS)[number], string> = {
  "vs-dark": "VS Dark",
  monokai: "Monokai",
  "github-dark": "GitHub Dark",
};

export function EditorPreferencesForm() {
  const { preferences, updatePreference } = useEditorPreferences();

  return (
    <div className="space-y-5">
      {/* Font Size */}
      <div className="flex items-center justify-between">
        <Label htmlFor="fontSize">Font size</Label>
        <Select
          value={String(preferences.fontSize)}
          onValueChange={(v) => updatePreference?.("fontSize", Number(v))}
        >
          <SelectTrigger id="fontSize" className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}px
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tab Size */}
      <div className="flex items-center justify-between">
        <Label htmlFor="tabSize">Tab size</Label>
        <Select
          value={String(preferences.tabSize)}
          onValueChange={(v) => updatePreference?.("tabSize", Number(v))}
        >
          <SelectTrigger id="tabSize" className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TAB_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size} spaces
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Theme */}
      <div className="flex items-center justify-between">
        <Label htmlFor="theme">Theme</Label>
        <Select
          value={preferences.theme}
          onValueChange={(v) =>
            updatePreference?.("theme", v as (typeof THEME_OPTIONS)[number])
          }
        >
          <SelectTrigger id="theme" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {THEME_OPTIONS.map((theme) => (
              <SelectItem key={theme} value={theme}>
                {THEME_LABELS[theme]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Word Wrap */}
      <div className="flex items-center justify-between">
        <Label htmlFor="wordWrap">Word wrap</Label>
        <Switch
          id="wordWrap"
          checked={preferences.wordWrap}
          onCheckedChange={(v) => updatePreference?.("wordWrap", v)}
        />
      </div>

      {/* Minimap */}
      <div className="flex items-center justify-between">
        <Label htmlFor="minimap">Minimap</Label>
        <Switch
          id="minimap"
          checked={preferences.minimap}
          onCheckedChange={(v) => updatePreference?.("minimap", v)}
        />
      </div>
    </div>
  );
}
