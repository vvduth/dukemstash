"use client";

import { useCallback, useState, useRef } from "react";
import { Upload, File, Image, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  IMAGE_MAX_SIZE,
  FILE_MAX_SIZE,
  IMAGE_EXTENSIONS,
  FILE_EXTENSIONS,
  getAcceptString,
  validateFile,
} from "@/lib/r2";

interface FileUploadProps {
  itemType: "image" | "file";
  onUploaded: (data: { key: string; fileName: string; fileSize: number }) => void;
  disabled?: boolean;
}

type UploadState =
  | { status: "idle" }
  | { status: "selected"; file: File }
  | { status: "uploading"; file: File; progress: number }
  | { status: "done"; fileName: string; fileSize: number; key: string }
  | { status: "error"; message: string };

export function FileUpload({ itemType, onUploaded, disabled }: FileUploadProps) {
  const [state, setState] = useState<UploadState>({ status: "idle" });
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const maxSize = itemType === "image" ? IMAGE_MAX_SIZE : FILE_MAX_SIZE;
  const extensions = itemType === "image" ? IMAGE_EXTENSIONS : FILE_EXTENSIONS;
  const accept = getAcceptString(itemType);

  const handleFile = useCallback(
    (file: File) => {
      const error = validateFile(
        { name: file.name, size: file.size, type: file.type },
        itemType
      );
      if (error) {
        setState({ status: "error", message: error });
        return;
      }
      setState({ status: "selected", file });
    },
    [itemType]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // Reset input so the same file can be re-selected
      e.target.value = "";
    },
    [handleFile]
  );

  const uploadFile = useCallback(async () => {
    if (state.status !== "selected") return;
    const { file } = state;

    setState({ status: "uploading", file, progress: 0 });

    try {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("itemType", itemType);

      const result = await new Promise<{
        key: string;
        fileName: string;
        fileSize: number;
      }>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setState({ status: "uploading", file, progress });
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            const body = JSON.parse(xhr.responseText);
            reject(new Error(body.error || "Upload failed"));
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Upload failed")));

        xhr.open("POST", "/api/upload");
        xhr.send(formData);
      });

      setState({
        status: "done",
        fileName: result.fileName,
        fileSize: result.fileSize,
        key: result.key,
      });
      onUploaded(result);
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Upload failed",
      });
    }
  }, [state, itemType, onUploaded]);

  const reset = () => {
    setState({ status: "idle" });
  };

  const IconComponent = itemType === "image" ? Image : File;

  return (
    <div className="space-y-2">
      {/* Drop zone */}
      {(state.status === "idle" || state.status === "error") && (
        <>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`
              flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors
              ${dragOver ? "border-ring bg-accent/50" : "border-muted-foreground/25 hover:border-muted-foreground/50"}
              ${disabled ? "pointer-events-none opacity-50" : ""}
            `}
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium">
                Drop {itemType === "image" ? "an image" : "a file"} here or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {extensions.join(", ")} &middot; Max {maxSize / (1024 * 1024)} MB
              </p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              onChange={handleInputChange}
              className="hidden"
              disabled={disabled}
            />
          </div>
          {state.status === "error" && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}
        </>
      )}

      {/* Selected - ready to upload */}
      {state.status === "selected" && (
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <IconComponent className="h-8 w-8 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{state.file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(state.file.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <Button size="sm" onClick={uploadFile}>
              Upload
            </Button>
            <button
              onClick={reset}
              className="p-1 rounded-md hover:bg-muted transition-colors"
              title="Remove"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      )}

      {/* Uploading - progress */}
      {state.status === "uploading" && (
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <IconComponent className="h-8 w-8 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{state.file.name}</p>
            <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-200"
                style={{ width: `${state.progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Uploading... {state.progress}%
            </p>
          </div>
        </div>
      )}

      {/* Done */}
      {state.status === "done" && (
        <div className="flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/5 p-3">
          <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{state.fileName}</p>
            <p className="text-xs text-muted-foreground">
              {(state.fileSize / 1024).toFixed(1)} KB &middot; Uploaded
            </p>
          </div>
          <button
            onClick={reset}
            className="p-1 rounded-md hover:bg-muted transition-colors"
            title="Replace"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      )}
    </div>
  );
}
