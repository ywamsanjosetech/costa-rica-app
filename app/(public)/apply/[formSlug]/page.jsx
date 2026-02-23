export default async function PublicAssessmentFormPage({ params }) {
  const { formSlug } = await params;
  const slug = decodeURIComponent(formSlug || "housing-relief");

  return (
    <main className="space-y-6 animate-rise">
      <header className="panel-strong p-6 md:p-8">
        <p className="chip">Public Assessment</p>
        <h1 className="mt-4 text-3xl font-semibold md:text-4xl">
          <span className="text-gradient">Housing Relief Intake</span>
        </h1>
        <p className="mt-3 text-sm text-ink-soft">
          Form key: <span className="font-semibold text-ink">{slug}</span>
        </p>
        <p className="mt-2 max-w-3xl text-sm text-ink-soft">
          Please provide accurate information so our team can prioritize urgent
          housing support fairly and efficiently.
        </p>
      </header>

      <section className="panel p-6 md:p-8">
        <form className="space-y-6" action="/api/assessments" method="post">
          <input type="hidden" name="form_slug" value={slug} />
          <input
            type="text"
            name="company"
            autoComplete="off"
            tabIndex={-1}
            className="hidden"
            aria-hidden="true"
          />

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-ink">
                Applicant full name
              </span>
              <input
                name="full_name"
                className="input-lux w-full px-3 py-2 text-sm"
                placeholder="Enter your full legal name"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-ink">
                Phone number
              </span>
              <input
                name="phone"
                className="input-lux w-full px-3 py-2 text-sm"
                placeholder="+506 ..."
              />
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-medium text-ink">
              Current living situation
            </span>
            <textarea
              name="living_situation"
              rows={4}
              className="input-lux w-full px-3 py-2 text-sm"
              placeholder="Describe your current housing condition."
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-ink">Household size</span>
              <select name="household_size" className="input-lux w-full px-3 py-2 text-sm">
                <option value="">Select one</option>
                <option value="1">1</option>
                <option value="2-3">2-3</option>
                <option value="4-6">4-6</option>
                <option value="7+">7+</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-ink">
                Is relocation urgent?
              </span>
              <select name="urgent_flag" className="input-lux w-full px-3 py-2 text-sm">
                <option value="">Select one</option>
                <option value="yes">Yes, immediate risk</option>
                <option value="no">No, stable for now</option>
              </select>
            </label>
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-ink-soft">
              Protected by server-side validation and anti-spam checks.
            </p>
            <button
              type="submit"
              className="btn-primary px-5 py-2.5 text-sm"
            >
              Submit Assessment
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
