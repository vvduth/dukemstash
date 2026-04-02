"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (current > 3) {
    pages.push("...");
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push("...");
  }

  pages.push(total);

  return pages;
}

function pageHref(basePath: string, page: number): string {
  return page === 1 ? basePath : `${basePath}?page=${page}`;
}

const navButtonClass = cn(
  buttonVariants({ variant: "ghost", size: "icon" }),
  "h-8 w-8"
);

const disabledNavClass = cn(
  navButtonClass,
  "pointer-events-none opacity-50"
);

const pageButtonClass = cn(
  buttonVariants({ variant: "ghost", size: "icon" }),
  "h-8 w-8 text-sm"
);

const activePageClass = cn(
  buttonVariants({ variant: "default", size: "icon" }),
  "h-8 w-8 text-sm"
);

export function PaginationControls({
  currentPage,
  totalPages,
  basePath,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1 pt-6"
    >
      {currentPage > 1 ? (
        <Link
          href={pageHref(basePath, currentPage - 1)}
          className={navButtonClass}
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className={disabledNavClass}>
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {pages.map((page, i) =>
        page === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="px-1 text-sm text-muted-foreground"
          >
            ...
          </span>
        ) : page === currentPage ? (
          <span key={page} className={activePageClass}>
            {page}
          </span>
        ) : (
          <Link
            key={page}
            href={pageHref(basePath, page)}
            className={pageButtonClass}
          >
            {page}
          </Link>
        )
      )}

      {currentPage < totalPages ? (
        <Link
          href={pageHref(basePath, currentPage + 1)}
          className={navButtonClass}
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className={disabledNavClass}>
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
