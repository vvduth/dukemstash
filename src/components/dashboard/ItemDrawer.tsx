"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ICON_MAP } from "@/lib/constants/icon-map";
import type { IconName } from "@/lib/constants/icon-map";
import type { ItemDetail } from "@/lib/db/items";
import { updateItem, deleteItem } from "@/actions/items";
import { toggleItemFavorite } from "@/actions/favorites";
import { toggleItemPin } from "@/actions/pins";
import { toast } from "sonner";
import {
  Star,
  Pin,
  Copy,
  Pencil,
  Trash2,
  Save,
  X,
  Download,
  File,
} from "lucide-react";
import { CodeEditor } from "./CodeEditor";
import { MarkdownEditor } from "./MarkdownEditor";
import { CollectionPicker } from "./CollectionPicker";
import type { UserCollection } from "@/lib/db/collections";

interface ItemDrawerProps {
  itemId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: (itemId: string) => void;
  collections: UserCollection[];
}

export function ItemDrawer({ itemId, open, onOpenChange, onDeleted, collections }: ItemDrawerProps) {
  const router = useRouter();
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editLanguage, setEditLanguage] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editCollectionIds, setEditCollectionIds] = useState<string[]>([]);

  // Resize state
  const [drawerWidth, setDrawerWidth] = useState(512); // default ~sm:max-w-lg
  const isResizing = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = window.innerWidth - e.clientX;
      setDrawerWidth(Math.max(320, Math.min(newWidth, window.innerWidth * 0.9)));
    };
    const handleMouseUp = () => {
      if (isResizing.current) {
        isResizing.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const fetchItem = useCallback(async (id: string) => {
    setLoading(true);
    setItem(null);
    try {
      const res = await fetch(`/api/items/${id}`);
      if (res.ok) {
        const data = await res.json();
        setItem(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && itemId) {
      fetchItem(itemId);
    }
    if (!open) {
      setItem(null);
      setEditing(false);
    }
  }, [open, itemId, fetchItem]);

  const enterEditMode = () => {
    if (!item) return;
    setEditTitle(item.title);
    setEditDescription(item.description ?? "");
    setEditContent(item.content ?? "");
    setEditUrl(item.url ?? "");
    setEditLanguage(item.language ?? "");
    setEditTags(item.tags.join(", "));
    setEditCollectionIds(item.collections.map((c) => c.id));
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
  };

  const handleSave = async () => {
    if (!item) return;
    setSaving(true);
    try {
      const tags = editTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const result = await updateItem(item.id, {
        title: editTitle,
        description: editDescription || null,
        content: editContent || null,
        url: editUrl || null,
        language: editLanguage || null,
        tags,
        collectionIds: editCollectionIds,
      });

      if (result.success) {
        setItem(result.data);
        setEditing(false);
        toast.success("Item updated");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to update item");
    } finally {
      setSaving(false);
    }
  };

  const TypeIcon = item
    ? ICON_MAP[item.type.icon as IconName] ?? null
    : null;

  const handleDelete = async () => {
    if (!item) return;
    setDeleting(true);
    try {
      const result = await deleteItem(item.id);
      if (result.success) {
        toast.success("Item deleted");
        onOpenChange(false);
        onDeleted?.(item.id);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to delete item");
    } finally {
      setDeleting(false);
    }
  };

  const handleCopy = async () => {
    const text = item?.content ?? item?.url ?? "";
    if (text) {
      await navigator.clipboard.writeText(text);
    }
  };

  const typeName = item?.type.name ?? "";
  const showContent = ["snippet", "prompt", "command", "note"].includes(typeName);
  const showLanguage = ["snippet", "command"].includes(typeName);
  const showUrl = typeName === "link";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto max-w-none!"
        style={{ width: drawerWidth }}
      >
        {/* Resize handle */}
        <div
          onMouseDown={startResize}
          className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-primary/20 active:bg-primary/30 transition-colors z-10"
        />
        {loading ? (
          <DrawerSkeleton />
        ) : item ? (
          <div className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="pr-8">
              <div className="flex items-center gap-2">
                {TypeIcon && (
                  <TypeIcon
                    className="h-4 w-4 shrink-0"
                    style={{ color: item.type.color }}
                  />
                )}
                {editing ? (
                  <SheetTitle className="text-lg sr-only">
                    Editing {item.title}
                  </SheetTitle>
                ) : (
                  <SheetTitle className="text-lg">{item.title}</SheetTitle>
                )}
              </div>
              {/* Type & language badges */}
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="text-xs font-medium capitalize px-2 py-0.5 rounded-full"
                  style={{
                    color: item.type.color,
                    backgroundColor: `${item.type.color}15`,
                  }}
                >
                  {item.type.name}
                </span>
                {!editing && item.language && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {item.language}
                  </span>
                )}
              </div>
            </SheetHeader>

            {editing ? (
              /* ── Edit Mode ── */
              <div className="px-4 pb-4 flex-1 min-h-0 space-y-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Item title"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label htmlFor="edit-description">Description</Label>
                  <textarea
                    id="edit-description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Optional description"
                    rows={2}
                    className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-y dark:bg-input/30"
                  />
                </div>

                {/* Content (type-specific) */}
                {showContent && (
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-content">Content</Label>
                    {showLanguage ? (
                      <CodeEditor
                        value={editContent}
                        onChange={setEditContent}
                        language={editLanguage || undefined}
                      />
                    ) : (
                      <MarkdownEditor
                        value={editContent}
                        onChange={setEditContent}
                      />
                    )}
                  </div>
                )}

                {/* URL (link type) */}
                {showUrl && (
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-url">URL</Label>
                    <Input
                      id="edit-url"
                      type="url"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                )}

                {/* Language (snippet/command) */}
                {showLanguage && (
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-language">Language</Label>
                    <Input
                      id="edit-language"
                      value={editLanguage}
                      onChange={(e) => setEditLanguage(e.target.value)}
                      placeholder="e.g. typescript, python"
                    />
                  </div>
                )}

                {/* Tags */}
                <div className="space-y-1.5">
                  <Label htmlFor="edit-tags">Tags</Label>
                  <Input
                    id="edit-tags"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    placeholder="react, hooks, state (comma-separated)"
                  />
                </div>

                {/* Collections */}
                <div className="space-y-1.5">
                  <Label>Collections</Label>
                  <CollectionPicker
                    collections={collections}
                    selectedIds={editCollectionIds}
                    onChange={setEditCollectionIds}
                    disabled={saving}
                  />
                </div>

                <div className="text-xs text-muted-foreground">
                  Created {new Date(item.createdAt).toLocaleDateString()} · Updated{" "}
                  {new Date(item.updatedAt).toLocaleDateString()}
                </div>
              </div>
            ) : (
              /* ── View Mode ── */
              <>
                {/* Description */}
                {item.description && (
                  <div className="px-4 pb-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Description
                    </h4>
                    <p className="text-sm text-foreground">{item.description}</p>
                  </div>
                )}

                {/* Content */}
                <div className="px-4 pb-4 flex-1 min-h-0">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Content
                  </h4>
                  {item.contentType === "URL" && item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:underline break-all"
                    >
                      {item.url}
                    </a>
                  ) : item.content ? (
                    showLanguage ? (
                      <CodeEditor
                        value={item.content}
                        language={item.language ?? undefined}
                        readonly
                      />
                    ) : (
                      <MarkdownEditor
                        value={item.content}
                        readonly
                      />
                    )
                  ) : item.fileUrl ? (
                    <div className="space-y-3">
                      {/* Image preview */}
                      {typeName === "image" && (
                        <div className="rounded-lg border overflow-hidden bg-muted/30">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`/api/files/${encodeURIComponent(item.fileUrl)}`}
                            alt={item.title}
                            className="w-full h-auto max-h-80 object-contain"
                          />
                        </div>
                      )}

                      {/* File info */}
                      {typeName === "file" && (
                        <div className="flex items-center gap-3 rounded-lg border p-3">
                          <File className="h-8 w-8 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.fileName}</p>
                            {item.fileSize && (
                              <p className="text-xs text-muted-foreground">
                                {item.fileSize >= 1024 * 1024
                                  ? `${(item.fileSize / (1024 * 1024)).toFixed(1)} MB`
                                  : `${(item.fileSize / 1024).toFixed(1)} KB`}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Download button */}
                      <a
                        href={`/api/files/${encodeURIComponent(item.fileUrl)}`}
                        download={item.fileName ?? "download"}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                      >
                        <Download className="h-4 w-4" />
                        Download {typeName === "image" ? "image" : "file"}
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No content
                    </p>
                  )}
                </div>

                {/* Collections */}
                {item.collections.length > 0 && (
                  <div className="px-4 pb-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Collections
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {item.collections.map((col) => (
                        <span
                          key={col.id}
                          className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                        >
                          {col.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {item.tags.length > 0 && (
                  <div className="px-4 pb-4">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Action bar */}
            {editing ? (
              <div className="mt-auto border-t px-4 py-3 flex items-center gap-2">
                <Button
                  onClick={handleSave}
                  disabled={saving || !editTitle.trim()}
                  size="sm"
                >
                  <Save className="h-4 w-4 mr-1.5" />
                  {saving ? "Saving..." : "Save"}
                </Button>
                <Button
                  onClick={cancelEdit}
                  disabled={saving}
                  variant="outline"
                  size="sm"
                >
                  <X className="h-4 w-4 mr-1.5" />
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="mt-auto border-t px-4 py-3 flex items-center gap-1">
                <button
                  className="p-2 rounded-md hover:bg-muted transition-colors"
                  title={item.isFavorite ? "Unfavorite" : "Favorite"}
                  onClick={async () => {
                    const prev = item.isFavorite;
                    setItem({ ...item, isFavorite: !prev });
                    const result = await toggleItemFavorite(item.id);
                    if (!result.success) {
                      setItem({ ...item, isFavorite: prev });
                      toast.error(result.error);
                    } else {
                      router.refresh();
                    }
                  }}
                >
                  <Star
                    className={`h-4 w-4 ${
                      item.isFavorite
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
                <button
                  className="p-2 rounded-md hover:bg-muted transition-colors"
                  title={item.isPinned ? "Unpin" : "Pin"}
                  onClick={async () => {
                    const prev = item.isPinned;
                    setItem({ ...item, isPinned: !prev });
                    const result = await toggleItemPin(item.id);
                    if (!result.success) {
                      setItem({ ...item, isPinned: prev });
                      toast.error(result.error);
                    } else {
                      toast.success(prev ? "Item unpinned" : "Item pinned");
                      router.refresh();
                    }
                  }}
                >
                  <Pin
                    className={`h-4 w-4 ${
                      item.isPinned
                        ? "fill-foreground text-foreground"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
                <button
                  onClick={handleCopy}
                  className="p-2 rounded-md hover:bg-muted transition-colors"
                  title="Copy content"
                >
                  <Copy className="h-4 w-4 text-muted-foreground" />
                </button>
                <button
                  onClick={enterEditMode}
                  className="p-2 rounded-md hover:bg-muted transition-colors"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                </button>
                <div className="ml-auto">
                  <AlertDialog>
                    <AlertDialogTrigger
                      className="p-2 rounded-md hover:bg-destructive/10 transition-colors"
                      title="Delete"
                      disabled={deleting}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete item</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete &quot;{item.title}&quot;? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          variant="destructive"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <SheetDescription className="text-muted-foreground">
              Item not found
            </SheetDescription>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-48 w-full rounded-lg" />
      <div className="flex gap-1.5">
        <Skeleton className="h-5 w-14 rounded" />
        <Skeleton className="h-5 w-14 rounded" />
        <Skeleton className="h-5 w-14 rounded" />
      </div>
    </div>
  );
}
