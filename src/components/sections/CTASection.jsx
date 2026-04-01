import { Link } from "react-router-dom";

function CTASection() {
  return (
    <section className="bg-white px-6 pb-16 md:px-12 md:pb-24 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-[var(--color-text)] px-6 py-14 text-white shadow-[0_24px_60px_rgba(15,23,42,0.16)] md:px-10 md:py-20">
          <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-[var(--color-accent-1)]/20 blur-3xl" />
          <div className="absolute right-0 top-10 h-52 w-52 rounded-full bg-[var(--color-secondary)]/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-[var(--color-accent-2)]/12 blur-3xl" />

          <div className="relative mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">
              Get Started
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
              Build a resume that gives your career a stronger beginning
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/75 md:text-lg">
              Start with a guided resume builder designed for students, then
              grow into a broader career platform as new tools are added to
              Career Copilot.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                to="/login"
                className="rounded-2xl bg-white px-7 py-3.5 text-sm font-semibold text-[var(--color-text)] transition hover:opacity-90"
              >
                Login
              </Link>

              <Link
                to="/how-it-works"
                className="rounded-2xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Create Resume
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/65">
              <span>Student-friendly flow</span>
              <span className="hidden h-1 w-1 rounded-full bg-white/30 sm:block" />
              <span>Clean professional output</span>
              <span className="hidden h-1 w-1 rounded-full bg-white/30 sm:block" />
              <span>Built to grow with you</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;