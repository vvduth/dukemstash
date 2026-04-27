"use client";

import { updateCollection } from "@/actions/collections";
import { CollectionFormDialog } from "./CollectionFormDialog";

interface EditCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: {
    id: string;
    name: string;
    description: string | null;
  };
}

export function EditCollectionDialog({
  open,
  onOpenChange,
  collection,
}: EditCollectionDialogProps) {
  return (
    <CollectionFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Collection"
      submitLabel="Save"
      savingLabel="Saving..."
      successMessage="Collection updated"
      errorMessage="Failed to update collection"
      idPrefix="edit-collection"
      initialValues={{
        name: collection.name,
        description: collection.description,
      }}
      onSubmit={(values) =>
        updateCollection({ id: collection.id, ...values })
      }
    />
  );
}
