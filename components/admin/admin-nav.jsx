"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminMenu } from "@/lib/navigation/admin-menu";

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegacion de administracion" className="space-y-2 reveal-stagger">
      {adminMenu.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-xl border px-3 py-3 transition ${
              isActive
                ? "border-blue/55 bg-blue/16 text-ink"
                : "border-transparent bg-bg-elev/60 text-ink-soft hover:border-line hover:bg-bg-elev/80 hover:text-ink"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-[11px] font-semibold tracking-[0.08em] ${
                  isActive
                    ? "border-blue/55 bg-blue/18 text-blue"
                    : "border-line bg-bg-base/70 text-ink-soft"
                }`}
              >
                {item.code}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-1 text-xs text-ink-soft">{item.description}</p>
              </div>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
