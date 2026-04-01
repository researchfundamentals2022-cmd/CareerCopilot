function FutureAddonsSection() {
  const addons = [
    {
      status: "In Development",
      title: "PrepTalk",
      description:
        "AI-powered speech analysis assistant that evaluates fluency, confidence, clarity, and multiple speaking parameters.",
    },
    {
      status: "Planned",
      title: "Step Wizer",
      description:
        "A visual explanation engine that turns pasted code into simple step-by-step logic flows students can actually follow.",
    },
    {
      status: "Planned",
      title: "Graphic AI",
      description:
        "Prompt-based visual generation to create supporting graphics, simple assets, and polished learning visuals faster.",
    },
  ];

  const loopedAddons = [...addons, ...addons];

  return (
    <section
      id="roadmap"
      className="overflow-hidden bg-[var(--color-bg-alt)] px-6 py-16 md:px-12 md:py-24 lg:px-20"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-secondary)]">
            Future Add-ons
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-text)] md:text-4xl">
            We are constantly evolving
          </h2>

          <p className="mt-4 text-base leading-7 text-[var(--color-muted)] md:text-lg">
            Here is a sneak peek at the modules we are adding next as Career
            Copilot grows into a broader student career platform.
          </p>
        </div>

        <div className="relative mt-12">
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-[var(--color-bg-alt)] to-transparent md:w-24" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-[var(--color-bg-alt)] to-transparent md:w-24" />

          <div className="carousel-track-wrapper">
            <div className="carousel-track flex w-max gap-6">
              {loopedAddons.map((item, index) => (
                <div
                  key={`${item.title}-${index}`}
                  className="w-[300px] flex-shrink-0 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md md:w-[360px]"
                >
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      item.status === "In Development"
                        ? "bg-orange-50 text-[var(--color-accent-1)]"
                        : "bg-violet-50 text-[var(--color-primary)]"
                    }`}
                  >
                    {item.status}
                  </span>

                  <h3 className="mt-5 text-xl font-semibold text-[var(--color-text)]">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[var(--color-muted)] md:text-[15px]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .carousel-track-wrapper {
          overflow: hidden;
          width: 100%;
        }

        .carousel-track {
          animation: futureAddonsScroll 22s linear infinite;
        }

        .carousel-track-wrapper:hover .carousel-track {
          animation-play-state: paused;
        }

        @keyframes futureAddonsScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-50% - 12px));
          }
        }
      `}</style>
    </section>
  );
}

export default FutureAddonsSection;