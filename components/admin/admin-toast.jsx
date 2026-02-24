"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function AdminToast({ message }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const clearNotice = useCallback(() => {
    const nextParams = new URLSearchParams(searchParams?.toString() || "");
    nextParams.delete("notice");
    const nextPath = nextParams.size ? `${pathname}?${nextParams.toString()}` : pathname;
    router.replace(nextPath, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (!message) return;
    const timeoutId = window.setTimeout(() => {
      clearNotice();
    }, 3200);

    return () => window.clearTimeout(timeoutId);
  }, [message, clearNotice]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-4 top-4 z-50 w-[min(92vw,24rem)] animate-rise rounded-xl border border-success/45 bg-[linear-gradient(150deg,rgba(14,37,52,0.98),rgba(12,28,45,0.98))] px-4 py-3 text-sm text-ink shadow-[0_24px_60px_-28px_rgba(11,35,52,0.95)]"
    >
      <div className="flex items-start gap-3">
        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-success" aria-hidden />
        <p className="flex-1 font-medium">{message}</p>
        <button
          type="button"
          onClick={clearNotice}
          className="text-xs text-ink-soft transition hover:text-ink"
          aria-label="Cerrar notificacion"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
