"use client";

import { createCollection } from "@/actions/collections";
import { CollectionFormDialog } from "./CollectionFormDialog";

interface CreateCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCollectionDialog({
  open,
  onOpenChange,
}: CreateCollectionDialogProps) {
  return (
    <CollectionFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="New Collection"
      submitLabel="Create"
      savingLabel="Creating..."
      successMessage="Collection created"
      errorMessage="Failed to create collection"
      idPrefix="collection"
      onSubmit={(values) => createCollection(values)}
    />
  );
}
