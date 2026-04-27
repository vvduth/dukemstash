"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderOpen, Pencil, Star, Trash2 } from "lucide-react";
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
import { EditCollectionDialog } from "@/components/dashboard/EditCollectionDialog";
import { deleteCollection } from "@/actions/collections";
import { toggleCollectionFavorite } from "@/actions/favorites";
import { useOptimisticToggle } from "@/hooks/useOptimisticToggle";
import { toast } from "sonner";

interface CollectionDetailHeaderProps {
  collection: {
    id: string;
    name: string;
    description: string | null;
    isFavorite: boolean;
    itemCount: number;
  };
}

export function CollectionDetailHeader({ collection }: CollectionDetailHeaderProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const toggleFavorite = useOptimisticToggle({
    current: collection.isFavorite,
    action: () => toggleCollectionFavorite(collection.id),
  });

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const result = await deleteCollection(collection.id);
      if (result.success) {
        toast.success("Collection deleted");
        router.push("/dashboard/collections");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to delete collection");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <FolderOpen className="h-5 w-5 text-muted-foreground" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-foreground">{collection.name}</h1>
            {collection.isFavorite && (
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            )}
          </div>
          {collection.description && (
            <p className="text-sm text-muted-foreground">{collection.description}</p>
          )}
          <p className="text-sm text-muted-foreground">
            {collection.itemCount} {collection.itemCount === 1 ? "item" : "items"}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            className="p-2 rounded-md hover:bg-accent transition-colors"
            title={collection.isFavorite ? "Unfavorite" : "Favorite"}
            onClick={toggleFavorite}
          >
            <Star className={`h-4 w-4 ${collection.isFavorite ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
          </button>
          <button
            className="p-2 rounded-md hover:bg-accent transition-colors"
            title="Edit"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </button>
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
                <AlertDialogTitle>Delete collection</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete &quot;{collection.name}&quot;? Items in this
                  collection will not be deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} variant="destructive">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <EditCollectionDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        collection={collection}
      />
    </>
  );
}
