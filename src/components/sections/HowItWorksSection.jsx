function HowItWorksSection() {
  const steps = [
    {
      number: "1",
      title: "Sign In",
      description: "Create your free account to get started.",
      badgeClass:
        "bg-[var(--color-primary)] text-white shadow-[0_12px_24px_rgba(53,0,139,0.18)]",
    },
    {
      number: "2",
      title: "Add Gemini Key",
      description: "Provide your API key to unlock AI power.",
      badgeClass:
        "bg-[var(--color-accent-1)] text-white shadow-[0_12px_24px_rgba(249,115,22,0.22)]",
    },
    {
      number: "3",
      title: "Build Resume",
      description: "Use our simple builder to craft your profile.",
      badgeClass:
        "bg-[var(--color-accent-2)] text-[var(--color-text)] shadow-[0_12px_24px_rgba(251,191,36,0.22)]",
    },
    {
      number: "4",
      title: "Grow",
      description: "Access more career tools as they launch.",
      badgeClass:
        "bg-[var(--color-secondary)] text-white shadow-[0_12px_24px_rgba(124,58,237,0.18)]",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[var(--color-bg-alt)] px-6 py-16 md:px-12 md:py-24 lg:px-20">
      <div className="absolute left-0 top-16 h-40 w-40 rounded-full bg-[var(--color-accent-2)]/20 blur-3xl" />
      <div className="absolute right-0 top-32 h-52 w-52 rounded-full bg-[var(--color-accent-1)]/15 blur-3xl" />
      <div className="absolute bottom-10 left-1/3 h-40 w-40 rounded-full bg-[var(--color-secondary)]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-1)]">
            How It Works
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-text)] md:text-4xl">
            A straightforward path to launching your career
          </h2>

          <p className="mt-4 text-base leading-7 text-[var(--color-muted)] md:text-lg">
            Start simple with resume building, then unlock more tools as Career
            Copilot grows with you.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {index !== steps.length - 1 && (
                <div className="absolute left-[calc(100%-10px)] top-11 hidden h-[2px] w-8 bg-gradient-to-r from-[var(--color-accent-1)] to-[var(--color-accent-2)] xl:block" />
              )}

              <div className="h-full rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
                <div
                  className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold ${step.badgeClass}`}
                >
                  {step.number}
                </div>

                <h3 className="text-lg font-semibold text-[var(--color-text)]">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;