function StudentLoveSection() {
  const items = [
    "Easy to start with no confusing setup",
    "Built for students and early job seekers",
    "Guided flow that reduces overthinking",
    "Clean resume structure from the first step",
    "Ready for AI-powered help when needed",
    "Designed to grow beyond just resumes",
  ];

  return (
    <section className="bg-white px-6 py-16 md:px-12 md:py-24 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-secondary)]">
              Why Students Love It
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-text)] md:text-4xl">
              Built to feel simple when career building feels overwhelming
            </h2>

            <p className="mt-4 text-base leading-7 text-[var(--color-muted)] md:text-lg">
              Career Copilot is designed to reduce confusion, guide students
              clearly, and make the first steps feel more manageable.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-4"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-slate-200">
                    <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                  </div>

                  <p className="text-sm font-medium leading-6 text-[var(--color-text)]">
                    {item}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default StudentLoveSection;