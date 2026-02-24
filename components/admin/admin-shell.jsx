"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminNav from "@/components/admin/admin-nav";
import StatusPill from "@/components/ui/status-pill";

const SIDEBAR_EXPANDED = 320;
const SIDEBAR_COLLAPSED = 72;

function LockIcon({ locked }) {
  if (locked) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden>
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M15 11V8a4 4 0 0 0-7.2-2.4" />
    </svg>
  );
}

function SidebarPanel({
  collapsed,
  locked,
  onToggleLock,
  onNavigate,
  mobile = false,
  onCloseMobile,
}) {
  return (
    <aside
      className={`panel-strong animate-pulse-glow flex h-full flex-col border border-line/75 ${
        collapsed ? "p-2" : "p-3 md:p-4"
      }`}
    >
      <div
        className={`mb-4 flex gap-2 ${
          collapsed ? "flex-col items-center justify-start" : "items-start justify-between"
        }`}
      >
        {!collapsed ? (
          <div>
            <p className="text-2xl font-semibold tracking-tight text-ink">
              Menu
            </p>
          </div>
        ) : (
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-bg-base/60 text-sm font-semibold text-blue">
            YW
          </span>
        )}

        {!mobile ? (
          <button
            type="button"
            onClick={onToggleLock}
            aria-label={locked ? "Desbloquear sidebar" : "Bloquear sidebar"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line/85 bg-bg-base/55 text-ink-soft transition hover:border-line-strong hover:text-ink"
            title={locked ? "Desbloquear sidebar" : "Bloquear sidebar"}
          >
            <LockIcon locked={locked} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Cerrar menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line/85 bg-bg-base/55 text-ink-soft transition hover:border-line-strong hover:text-ink"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        )}
      </div>

      <div
        className={`min-h-0 flex-1 overflow-y-auto ${
          collapsed ? "px-0" : "pr-0.5"
        }`}
      >
        <AdminNav collapsed={collapsed} onNavigate={onNavigate} />
      </div>
    </aside>
  );
}

export default function AdminShell({ children }) {
  const [isSidebarLocked, setIsSidebarLocked] = useState(true);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (!isMobileOpen) return;

    const onEsc = (event) => {
      if (event.key === "Escape") {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [isMobileOpen]);

  const isDesktopExpanded = isSidebarLocked || isSidebarHovered;
  const desktopSidebarWidth = isDesktopExpanded ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED;

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ "--admin-sidebar-width": `${desktopSidebarWidth}px` }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-28 top-8 h-80 w-80 rounded-full bg-blue/18 blur-3xl" />
        <div className="absolute right-[-120px] top-16 h-96 w-96 rounded-full bg-teal/14 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-ink/10 blur-3xl" />
      </div>

      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Abrir menu"
        className="fixed left-3 top-3 z-40 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line/85 bg-bg-base/70 text-ink md:hidden"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {isMobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden
        />
      ) : null}

      <div
        className={`fixed inset-y-0 left-0 z-50 p-2 transition-transform duration-300 md:hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full w-[320px]">
          <SidebarPanel
            collapsed={false}
            locked
            onToggleLock={() => {}}
            mobile
            onCloseMobile={() => setIsMobileOpen(false)}
            onNavigate={() => setIsMobileOpen(false)}
          />
        </div>
      </div>

      <div
        className="fixed inset-y-0 left-0 z-40 hidden p-2 md:block"
        onMouseEnter={() => {
          if (!isSidebarLocked) setIsSidebarHovered(true);
        }}
        onMouseLeave={() => {
          if (!isSidebarLocked) setIsSidebarHovered(false);
        }}
      >
        <div className="h-full transition-[width] duration-300" style={{ width: `${desktopSidebarWidth}px` }}>
          <SidebarPanel
            collapsed={!isDesktopExpanded}
            locked={isSidebarLocked}
            onToggleLock={() => {
              setIsSidebarLocked((prev) => !prev);
              if (isSidebarLocked) {
                setIsSidebarHovered(false);
              }
            }}
            onNavigate={() => {}}
          />
        </div>
      </div>

      <div className="px-4 pb-6 pt-16 transition-[margin] duration-300 md:ml-[var(--admin-sidebar-width)] md:px-6 md:py-8">
        <div className="mx-auto w-full max-w-7xl space-y-5">
          <header className="panel flex flex-wrap items-center justify-between gap-4 border border-line/70 p-4 md:p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-ink-soft">
                Operaciones internas
              </p>
              <p className="mt-1 text-2xl font-semibold text-ink">
                Evaluacion de Vivienda YWAM
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <StatusPill tone="success">Sistema en linea</StatusPill>
              <Link
                href="/apply/housing-relief-2026"
                className="btn-secondary px-5 py-2.5 text-sm"
              >
                Ver formulario publico
              </Link>
            </div>
          </header>
          <div className="animate-rise">{children}</div>
        </div>
      </div>
    </div>
  );
}
