import SectionShell from "@/components/admin/section-shell";
import StatusPill from "@/components/ui/status-pill";

const sampleQuestions = [
  {
    id: "Q1",
    title: "Describe current housing damage",
    type: "textarea",
    required: true,
  },
  {
    id: "Q2",
    title: "How many people are in your household?",
    type: "select",
    required: true,
  },
  {
    id: "Q3",
    title: "Do you currently have safe sleeping space?",
    type: "radio",
    required: true,
  },
];

export default function AdminFormBuilderPage() {
  return (
    <SectionShell
      title="Form Builder"
      subtitle="Question management scaffold for DB-driven public assessments."
    >
      <section className="panel space-y-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <StatusPill tone="blue">Active Form: Housing Relief 2026</StatusPill>
          <button type="button" className="btn-secondary px-4 py-2 text-sm">
            Add Question
          </button>
        </div>
        {sampleQuestions.map((question, index) => (
          <article
            key={question.id}
            className="rounded-xl border border-line bg-bg-elev/70 px-4 py-3"
          >
            <p className="text-xs uppercase tracking-[0.08em] text-ink-soft">
              {question.id} • Position {index + 1}
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">
              {question.title}
            </p>
            <p className="mt-1 text-xs text-ink-soft">
              {question.type} • {question.required ? "required" : "optional"}
            </p>
          </article>
        ))}
      </section>
    </SectionShell>
  );
}
