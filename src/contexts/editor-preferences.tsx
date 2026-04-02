"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { toast } from "sonner";
import { updateEditorPreferences } from "@/actions/editor-preferences";
import {
  EDITOR_PREFERENCES_DEFAULTS,
  type EditorPreferences,
} from "@/lib/validations/editor-preferences";

type EditorPreferencesContextValue = {
  preferences: EditorPreferences;
  updatePreference: <K extends keyof EditorPreferences>(
    key: K,
    value: EditorPreferences[K]
  ) => void;
};

const EditorPreferencesContext = createContext<EditorPreferencesContextValue | null>(null);

export function EditorPreferencesProvider({
  initialPreferences,
  children,
}: {
  initialPreferences: EditorPreferences | null;
  children: React.ReactNode;
}) {
  const [preferences, setPreferences] = useState<EditorPreferences>(
    initialPreferences ?? EDITOR_PREFERENCES_DEFAULTS
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const updatePreference = useCallback(
    <K extends keyof EditorPreferences>(key: K, value: EditorPreferences[K]) => {
      setPreferences((prev) => {
        const next = { ...prev, [key]: value };

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
          const result = await updateEditorPreferences(next);
          if (result.success) {
            toast.success("Editor preferences saved");
          } else {
            toast.error(result.error);
          }
        }, 500);

        return next;
      });
    },
    []
  );

  return (
    <EditorPreferencesContext.Provider value={{ preferences, updatePreference }}>
      {children}
    </EditorPreferencesContext.Provider>
  );
}

export function useEditorPreferences() {
  const ctx = useContext(EditorPreferencesContext);
  if (!ctx) {
    return { preferences: EDITOR_PREFERENCES_DEFAULTS, updatePreference: undefined };
  }
  return ctx;
}
