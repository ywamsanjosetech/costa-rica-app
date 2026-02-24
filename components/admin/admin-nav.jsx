"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminMenu } from "@/lib/navigation/admin-menu";

function MenuIcon({ href, collapsed }) {
  const iconClass = collapsed ? "h-[18px] w-[18px]" : "h-4 w-4";

  if (href === "/admin/dashboard") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden>
        <rect x="3" y="3" width="8" height="8" rx="1.8" />
        <rect x="13" y="3" width="8" height="5" rx="1.8" />
        <rect x="13" y="10" width="8" height="11" rx="1.8" />
        <rect x="3" y="13" width="8" height="8" rx="1.8" />
      </svg>
    );
  }

  if (href === "/admin/submissions") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden>
        <rect x="4" y="3" width="16" height="18" rx="2.2" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </svg>
    );
  }

  if (href === "/admin/analytics") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden>
        <path d="M4 20V10M10 20V6M16 20v-4M22 20V3" />
      </svg>
    );
  }

  if (href === "/admin/export") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden>
        <path d="M12 3v11M8 10l4 4 4-4" />
        <path d="M4 17v3h16v-3" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h10" />
      <circle cx="18" cy="17" r="2.3" />
    </svg>
  );
}

export default function AdminNav({ collapsed = false, onNavigate }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegacion de administracion"
      className={`space-y-2 reveal-stagger ${collapsed ? "px-1" : ""}`}
    >
      {adminMenu.map((item) => {
        const isActive = pathname === item.href;
        const baseExpandedClasses =
          "group relative block overflow-hidden rounded-2xl border py-3 px-3 transition-all duration-300 ease-out active:scale-[0.98]";
        const stateExpandedClasses = isActive
          ? "border-blue/65 bg-gradient-to-r from-blue/24 via-teal/14 to-transparent text-ink shadow-[0_20px_32px_-26px_rgba(121,201,255,0.95)] hover:-translate-y-0.5 hover:scale-[1.01] hover:border-blue/80 hover:bg-blue/22"
          : "border-line/70 bg-bg-elev/60 text-ink-soft hover:-translate-y-0.5 hover:scale-[1.01] hover:border-line-strong hover:bg-bg-elev/82 hover:text-ink hover:shadow-[0_18px_36px_-14px_rgba(188,228,255,0.42)]";
        const baseCollapsedClasses =
          "group relative mx-auto flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border transition-all duration-300 ease-out active:scale-[0.98]";
        const stateCollapsedClasses = isActive
          ? "border-blue/70 bg-gradient-to-b from-blue/26 to-blue/12 text-blue shadow-[0_18px_30px_-22px_rgba(121,201,255,0.9)]"
          : "border-line/80 bg-bg-elev/58 text-ink-soft hover:-translate-y-0.5 hover:scale-[1.03] hover:border-line-strong hover:bg-bg-elev/80 hover:text-ink";

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={
              collapsed
                ? `${baseCollapsedClasses} ${stateCollapsedClasses}`
                : `${baseExpandedClasses} ${stateExpandedClasses}`
            }
          >
            {!collapsed ? (
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/18 to-transparent transition-transform duration-500 ease-out group-hover:translate-x-full" />
            ) : null}

            <div
              className={`relative z-10 flex items-center ${
                collapsed ? "justify-center" : "gap-3"
              }`}
            >
              <span
                className={`inline-flex shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold tracking-[0.08em] ${
                  collapsed
                    ? `h-9 w-9 ${
                        isActive
                          ? "bg-blue/24 text-blue"
                          : "bg-transparent text-current"
                      }`
                    : `h-8 w-8 border ${
                        isActive
                          ? "border-blue/65 bg-blue/24 text-blue shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]"
                          : "border-line bg-bg-base/70 text-ink-soft group-hover:border-line-strong"
                      }`
                }`}
              >
                <MenuIcon href={item.href} collapsed={collapsed} />
              </span>
              {!collapsed ? (
                <div className="min-w-0">
                  <p className="text-base font-semibold leading-tight">{item.label}</p>
                </div>
              ) : null}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
