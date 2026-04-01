import { Link } from "react-router-dom";
import HeroImage from "../../assets/HeroPreviewImage.png";

function HeroSection() {
  return (
    <section className="min-h-[calc(100vh-81px)] bg-white px-6 md:px-12 lg:px-20">
      <div className="mx-auto grid min-h-[calc(100vh-81px)] max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="mb-4 inline-flex rounded-full bg-violet-50 px-4 py-1 text-sm font-medium text-[var(--color-primary)]">
            More than just a tool
          </p>

          <h1 className="max-w-3xl text-4xl font-bold leading-tight text-[var(--color-text)] md:text-5xl lg:text-6xl">
            Your career starts with a better resume
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--color-muted)] md:text-lg">
            Career Copilot helps students begin with a professional resume and
            evolves into a complete career support platform. Start building
            today, grow with AI tools tomorrow.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              to="/how-it-works"
              className="rounded-xl bg-[var(--color-primary)] px-6 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              Create Resume
            </Link>

            <a
              href="#features"
              className="rounded-xl border border-slate-300 px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              Explore Features
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-6 -top-6 h-32 w-32 rounded-full bg-[var(--color-accent-2)]/30 blur-3xl" />
          <div className="absolute -bottom-8 -right-6 h-40 w-40 rounded-full bg-[var(--color-secondary)]/20 blur-3xl" />

          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-[var(--color-bg-alt)] p-4 shadow-lg">
            <img
              src={HeroImage}
              alt="Career Copilot resume builder preview"
              className="h-full w-full rounded-2xl object-cover"
            />

          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;