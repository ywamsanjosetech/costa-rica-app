"use client";

import { useState } from "react";

export default function FormAccessGate({ children }) {
  const [isChecked, setIsChecked] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  if (isUnlocked) {
    return children;
  }

  return (
    <section className="panel border-line-strong/60 bg-[linear-gradient(160deg,rgba(34,58,97,0.86),rgba(18,38,70,0.82))] p-6 md:p-8">
      <div className="space-y-4">
        <p className="chip inline-flex">Aviso importante</p>
        <h2 className="text-2xl font-semibold text-ink md:text-3xl">
          Requisitos para completar el formulario
        </h2>

        <ul className="list-disc space-y-1 pl-5 text-sm text-ink-soft md:text-base">
          <li>Informacion personal</li>
          <li>Contacto</li>
          <li>Fotos de la vivienda y la familia</li>
        </ul>

        <p className="rounded-xl border border-line/70 bg-bg-elev/35 p-3 text-sm font-medium text-pink-soft">
          Una vez enviada la solicitud no se podra editar.
        </p>

        <label className="inline-flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(event) => setIsChecked(event.target.checked)}
            className="h-4 w-4 accent-blue"
          />
          Entiendo y deseo continuar
        </label>

        <div>
          <button
            type="button"
            disabled={!isChecked}
            onClick={() => setIsUnlocked(true)}
            className="btn-primary px-6 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-45 disabled:brightness-75"
          >
            Continuar
          </button>
        </div>
      </div>
    </section>
  );
}
