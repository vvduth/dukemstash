'use client';

import { useState } from 'react';
import { Download, FileText, FileImage, FileCode, FileArchive, File, Pin, Copy, Check } from 'lucide-react';
import type { DashboardItem } from '@/lib/db/items';

const FILE_ICON_MAP: Record<string, typeof File> = {
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  txt: FileText,
  md: FileText,
  png: FileImage,
  jpg: FileImage,
  jpeg: FileImage,
  gif: FileImage,
  svg: FileImage,
  webp: FileImage,
  js: FileCode,
  ts: FileCode,
  jsx: FileCode,
  tsx: FileCode,
  py: FileCode,
  json: FileCode,
  html: FileCode,
  css: FileCode,
  zip: FileArchive,
  tar: FileArchive,
  gz: FileArchive,
  rar: FileArchive,
};

function getFileIcon(fileName: string | null) {
  if (!fileName) return File;
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  return FILE_ICON_MAP[ext] ?? File;
}

function formatFileSize(bytes: number | null): string {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function FileListRow({ item }: { item: DashboardItem }) {
  const [copied, setCopied] = useState(false);
  const FileIcon = getFileIcon(item.fileName);
  const downloadUrl = item.fileUrl
    ? `/api/files/${encodeURIComponent(item.fileUrl)}`
    : null;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (downloadUrl) {
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = item.fileName ?? item.title;
      a.click();
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!downloadUrl) return;
    navigator.clipboard.writeText(window.location.origin + downloadUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className="flex items-center gap-4 px-4 py-3 rounded-lg border bg-card hover:bg-card/80 transition-colors cursor-pointer"
      style={{ borderColor: `${item.type.color}40` }}
    >
      {/* File icon */}
      <FileIcon className="h-5 w-5 shrink-0 text-muted-foreground" />

      {/* File name + pin */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="text-sm font-medium text-foreground truncate">
          {item.fileName ?? item.title}
        </span>
        {item.isPinned && (
          <Pin className="h-3 w-3 text-muted-foreground fill-muted-foreground shrink-0" />
        )}
      </div>

      {/* Meta info - hidden on mobile, shown on md+ */}
      <span className="hidden md:block text-xs text-muted-foreground w-20 text-right shrink-0">
        {formatFileSize(item.fileSize)}
      </span>
      <span className="hidden md:block text-xs text-muted-foreground w-28 text-right shrink-0">
        {formatDate(item.createdAt)}
      </span>

      {/* Copy URL button */}
      {downloadUrl && (
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label={`Copy link for ${item.fileName ?? item.title}`}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      )}

      {/* Download button */}
      {downloadUrl && (
        <button
          type="button"
          onClick={handleDownload}
          className="shrink-0 p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label={`Download ${item.fileName ?? item.title}`}
        >
          <Download className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
