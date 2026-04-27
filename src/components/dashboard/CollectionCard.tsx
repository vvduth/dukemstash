"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Pencil, Star, Trash2 } from "lucide-react";
import { ICON_MAP } from "@/lib/constants/icon-map";
import type { IconName } from "@/lib/constants/icon-map";
import type { DashboardCollection } from "@/lib/db/collections";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EditCollectionDialog } from "@/components/dashboard/EditCollectionDialog";
import { deleteCollection } from "@/actions/collections";
import { toggleCollectionFavorite } from "@/actions/favorites";
import { useOptimisticToggle } from "@/hooks/useOptimisticToggle";
import { toast } from "sonner";

export function CollectionCard({ collection }: { collection: DashboardCollection }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const toggleFavorite = useOptimisticToggle({
    current: collection.isFavorite,
    action: () => toggleCollectionFavorite(collection.id),
  });

  const handleCardClick = () => {
    router.push(`/dashboard/collections/${collection.id}`);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const result = await deleteCollection(collection.id);
      if (result.success) {
        toast.success("Collection deleted");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to delete collection");
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <>
      <div
        className="group rounded-lg border bg-card p-4 hover:bg-card/80 transition-colors h-full flex flex-col gap-2 cursor-pointer"
        style={{
          borderColor: collection.dominantColor
            ? `${collection.dominantColor}40`
            : undefined,
        }}
        onClick={handleCardClick}
        role="link"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardClick();
          }
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-foreground text-sm leading-snug">
            {collection.name}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            {collection.isFavorite && (
              <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500 mt-0.5" />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger
                className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-accent transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleFavorite}>
                  <Star className={`h-3.5 w-3.5 ${collection.isFavorite ? "fill-yellow-500 text-yellow-500" : ""}`} />
                  {collection.isFavorite ? "Unfavorite" : "Favorite"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {collection.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
            {collection.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-center gap-1">
            {collection.types.slice(0, 4).map((type) => {
              const Icon = ICON_MAP[type.icon as IconName];
              return Icon ? (
                <Icon
                  key={type.name}
                  className="h-3 w-3"
                  style={{ color: type.color }}
                  aria-label={type.name}
                />
              ) : null;
            })}
          </div>
          <span className="text-xs text-muted-foreground">
            {collection.itemCount} {collection.itemCount === 1 ? "item" : "items"}
          </span>
        </div>
      </div>

      <EditCollectionDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        collection={collection}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete collection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{collection.name}&quot;? Items in this
              collection will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              variant="destructive"
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
