"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ICON_MAP } from "@/lib/constants/icon-map";
import type { IconName } from "@/lib/constants/icon-map";
import type { SystemItemType } from "@/lib/db/items";
import { createItem } from "@/actions/items";
import { toast } from "sonner";
import { CodeEditor } from "./CodeEditor";
import { MarkdownEditor } from "./MarkdownEditor";
import { FileUpload } from "./FileUpload";
import { CollectionPicker } from "./CollectionPicker";
import type { UserCollection } from "@/lib/db/collections";

interface CreateItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemTypes: SystemItemType[];
  collections: UserCollection[];
  defaultTypeId?: string;
}

export function CreateItemDialog({
  open,
  onOpenChange,
  itemTypes,
  collections,
  defaultTypeId,
}: CreateItemDialogProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Form state
  const [selectedTypeId, setSelectedTypeId] = useState(defaultTypeId ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("");
  const [tags, setTags] = useState("");
  const [collectionIds, setCollectionIds] = useState<string[]>([]);
  const [fileData, setFileData] = useState<{
    key: string;
    fileName: string;
    fileSize: number;
  } | null>(null);

  const selectedType = itemTypes.find((t) => t.id === selectedTypeId);
  const typeName = selectedType?.name ?? "";

  const showContent = ["snippet", "prompt", "command", "note"].includes(typeName);
  const showLanguage = ["snippet", "command"].includes(typeName);
  const showUrl = typeName === "link";
  const showFile = typeName === "file" || typeName === "image";

  // Apply defaultTypeId when dialog opens
  useEffect(() => {
    if (open && defaultTypeId) {
      setSelectedTypeId(defaultTypeId);
    }
  }, [open, defaultTypeId]);

  const resetForm = () => {
    setSelectedTypeId(defaultTypeId ?? "");
    setTitle("");
    setDescription("");
    setContent("");
    setUrl("");
    setLanguage("");
    setTags("");
    setCollectionIds([]);
    setFileData(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const tagList = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const result = await createItem({
        itemTypeId: selectedTypeId,
        title,
        description: description || null,
        content: showContent ? content || null : null,
        url: showUrl ? url || null : null,
        language: showLanguage ? language || null : null,
        tags: tagList,
        collectionIds,
        fileUrl: fileData?.key ?? null,
        fileName: fileData?.fileName ?? null,
        fileSize: fileData?.fileSize ?? null,
      });

      if (result.success) {
        toast.success("Item created");
        handleOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to create item");
    } finally {
      setSaving(false);
    }
  };

  const canSubmit =
    selectedTypeId &&
    title.trim() &&
    (showUrl ? url.trim() : true) &&
    (showFile ? fileData !== null : true);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Item</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type selector */}
          <div className="space-y-1.5">
            <Label htmlFor="type">Type</Label>
            <Select value={selectedTypeId} onValueChange={(v) => setSelectedTypeId(v ?? "")}>
              <SelectTrigger id="type">
                {selectedType ? (
                  <span className="flex items-center gap-2">
                    {(() => {
                      const Icon = ICON_MAP[selectedType.icon as IconName];
                      return Icon ? (
                        <Icon className="h-4 w-4" style={{ color: selectedType.color }} />
                      ) : null;
                    })()}
                    <span className="capitalize">{selectedType.name}</span>
                  </span>
                ) : (
                  <SelectValue placeholder="Select a type" />
                )}
              </SelectTrigger>
              <SelectContent>
                {itemTypes.map((type) => {
                  const Icon = ICON_MAP[type.icon as IconName];
                  return (
                    <SelectItem key={type.id} value={type.id}>
                      <span className="flex items-center gap-2">
                        {Icon && (
                          <Icon
                            className="h-4 w-4"
                            style={{ color: type.color }}
                          />
                        )}
                        <span className="capitalize">{type.name}</span>
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="create-title">Title</Label>
            <Input
              id="create-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Item title"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="create-description">Description</Label>
            <textarea
              id="create-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={2}
              className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-y dark:bg-input/30"
            />
          </div>

          {/* Content (snippet, prompt, command, note) */}
          {showContent && (
            <div className="space-y-1.5">
              <Label htmlFor="create-content">Content</Label>
              {showLanguage ? (
                <CodeEditor
                  value={content}
                  onChange={setContent}
                  language={language || undefined}
                />
              ) : (
                <MarkdownEditor
                  value={content}
                  onChange={setContent}
                />
              )}
            </div>
          )}

          {/* URL (link type) */}
          {showUrl && (
            <div className="space-y-1.5">
              <Label htmlFor="create-url">URL</Label>
              <Input
                id="create-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                required
              />
            </div>
          )}

          {/* File upload (file, image) */}
          {showFile && (
            <div className="space-y-1.5">
              <Label>
                {typeName === "image" ? "Image" : "File"}
              </Label>
              <FileUpload
                itemType={typeName as "image" | "file"}
                onUploaded={setFileData}
                disabled={saving}
              />
            </div>
          )}

          {/* Language (snippet, command) */}
          {showLanguage && (
            <div className="space-y-1.5">
              <Label htmlFor="create-language">Language</Label>
              <Input
                id="create-language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="e.g. typescript, python"
              />
            </div>
          )}

          {/* Tags */}
          <div className="space-y-1.5">
            <Label htmlFor="create-tags">Tags</Label>
            <Input
              id="create-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="react, hooks, state (comma-separated)"
            />
          </div>

          {/* Collections */}
          <div className="space-y-1.5">
            <Label>Collections</Label>
            <CollectionPicker
              collections={collections}
              selectedIds={collectionIds}
              onChange={setCollectionIds}
              disabled={saving}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || saving}>
              {saving ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
