import SectionShell from "@/components/admin/section-shell";
import StatusPill from "@/components/ui/status-pill";

const sampleQuestions = [
  {
    id: "Q1",
    title: "Describe el dano actual de la vivienda",
    type: "area de texto",
    required: true,
  },
  {
    id: "Q2",
    title: "Cuantas personas hay en tu hogar?",
    type: "seleccion",
    required: true,
  },
  {
    id: "Q3",
    title: "Actualmente tienes un espacio seguro para dormir?",
    type: "opcion unica",
    required: true,
  },
];

export default function AdminFormBuilderPage() {
  return (
    <SectionShell
      title="Constructor de formulario"
      subtitle="Estructura de gestion de preguntas para evaluaciones publicas conectadas a la base de datos."
    >
      <section className="panel space-y-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <StatusPill tone="blue">Formulario activo: Housing Relief 2026</StatusPill>
          <button type="button" className="btn-secondary px-4 py-2 text-sm">
            Agregar pregunta
          </button>
        </div>
        {sampleQuestions.map((question, index) => (
          <article
            key={question.id}
            className="rounded-xl border border-line bg-bg-elev/70 px-4 py-3"
          >
            <p className="text-xs uppercase tracking-[0.08em] text-ink-soft">
              {question.id} • Posicion {index + 1}
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">
              {question.title}
            </p>
            <p className="mt-1 text-xs text-ink-soft">
              {question.type} • {question.required ? "requerido" : "opcional"}
            </p>
          </article>
        ))}
      </section>
    </SectionShell>
  );
}
