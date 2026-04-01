function AIToolsSection() {
  const steps = [
    "Open Google AI Studio",
    "Sign in with your Google account",
    "Open the API Keys page",
    "Create or copy your Gemini API key",
    "Paste it here to unlock AI features",
  ];

  return (
    <section
      id="ai-tools"
      className="bg-[linear-gradient(180deg,#ffffff_0%,#fcfbff_100%)] px-6 py-16 md:px-12 md:py-24 lg:px-20"
    >
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-secondary)]">
            AI-Powered Support
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-text)] md:text-4xl">
            Connect Gemini in a student-friendly way
          </h2>

          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--color-muted)] md:text-lg">
            Career Copilot lets students bring their own Gemini API key to use
            AI features for resume help, writing support, and future career
            tools.
          </p>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-[var(--color-text)]">
              How students can get their Gemini API key
            </p>

            <div className="mt-4 space-y-3">
              {steps.map((step, index) => (
                <div key={step} className="flex items-start gap-3">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-semibold text-white">
                    {index + 1}
                  </div>
                  <p className="pt-0.5 text-sm leading-6 text-[var(--color-muted)]">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-orange-100 bg-orange-50/70 p-5">
            <p className="text-sm leading-6 text-[var(--color-text)]">
              Students can create their Gemini API key from Google AI Studio and
              then paste it here to unlock AI-assisted features in the platform.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="rounded-3xl border border-slate-200 bg-[var(--color-bg-alt)] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--color-primary)]">
                  Paste your Gemini API key
                </p>
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  Copy it from Google AI Studio and connect it here
                </p>
              </div>

              <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
                Student Setup
              </span>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                Gemini API Key
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  placeholder="AIzaSy..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-500 outline-none"
                />
                <button className="rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">
                  Save Key
                </button>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-5">
              <p className="text-sm leading-6 text-[var(--color-muted)]">
                Once connected, the platform can use your key for resume
                suggestions, writing help, and future AI-assisted career
                features.
              </p>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-900 px-4 py-4 text-sm text-slate-200">
              <p className="font-medium text-white">Helpful note</p>
              <p className="mt-2 leading-6 text-slate-300">
                Keep your API key private and only use it inside trusted
                applications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AIToolsSection;