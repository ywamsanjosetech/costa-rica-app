"use client";

import { useEffect, useRef, useState } from "react";

export default function DeleteQuestionControls({ deleteQuestionAction }) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!isConfirmOpen) return;

    const frameId = window.requestAnimationFrame(() => {
      const confirmElement = confirmRef.current;
      if (!confirmElement) return;

      const rect = confirmElement.getBoundingClientRect();
      const overflow = rect.bottom - window.innerHeight;
      if (overflow > 0) {
        window.scrollBy({
          top: overflow + 20,
          behavior: "smooth",
        });
      }
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [isConfirmOpen]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsConfirmOpen((current) => !current)}
        className="btn-danger-ghost px-3 py-2 text-xs"
      >
        Eliminar
      </button>

      {isConfirmOpen ? (
        <div
          ref={confirmRef}
          className="absolute bottom-[calc(100%+0.5rem)] right-0 z-40 w-56 space-y-2 rounded-lg border border-red-300/45 bg-[linear-gradient(160deg,rgba(52,18,26,0.97),rgba(28,10,15,0.98))] p-3 shadow-[0_24px_40px_-24px_rgba(9,2,3,0.95)]"
        >
          <p className="text-xs text-ink-soft">¿Está seguro de que desea eliminar esta pregunta?</p>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsConfirmOpen(false)}
              className="btn-secondary px-3 py-2 text-xs"
            >
              No
            </button>
            <button
              type="submit"
              formAction={deleteQuestionAction}
              formNoValidate
              className="btn-danger px-3 py-2 text-xs"
            >
              Sí, eliminar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
