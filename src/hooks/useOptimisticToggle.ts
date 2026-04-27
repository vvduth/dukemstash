"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UseOptimisticToggleOptions {
  current: boolean;
  action: () => Promise<{ success: boolean; error?: string }>;
  setOptimistic?: (next: boolean) => void;
  successToast?: (next: boolean) => string;
}

export function useOptimisticToggle({
  current,
  action,
  setOptimistic,
  successToast,
}: UseOptimisticToggleOptions) {
  const router = useRouter();

  return async () => {
    const prev = current;
    const next = !prev;
    setOptimistic?.(next);

    const result = await action();
    if (!result.success) {
      setOptimistic?.(prev);
      toast.error(result.error);
      return;
    }

    if (successToast) {
      toast.success(successToast(next));
    }
    router.refresh();
  };
}
