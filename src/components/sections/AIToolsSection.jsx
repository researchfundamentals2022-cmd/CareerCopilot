import { motion } from "framer-motion";

function AIToolsSection() {
  const steps = [
    "Open Google AI Studio",
    "Sign in with your Google account",
    "Open the API Keys page",
    "Create or copy your Gemini API key",
    "Paste it here to unlock AI features",
  ];

  const marqueeKeywords = [
    "Gemini Assistant", "ATS Optimized", "Generate with AI", "AI Summary", 
    "Job Matching", "Impact Analysis", "Professional Tone", "Skill Scoring",
    "Gemini Assistant", "ATS Optimized", "Generate with AI", "AI Summary"
  ];

  return (
    <section
      id="ai-tools"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#fcfbff_100%)] px-6 py-16 md:px-12 md:py-24 lg:px-20"
    >
      {/* Background Decorative Marquee */}
      <div className="absolute top-0 left-0 w-full overflow-hidden opacity-[0.03] pointer-events-none">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap py-4 text-8xl font-black uppercase tracking-tighter"
        >
          {marqueeKeywords.join(" • ")} • {marqueeKeywords.join(" • ")}
        </motion.div>
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
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

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            <p className="text-sm font-semibold text-[var(--color-text)]">
              How students can get their Gemini API key
            </p>


            <div className="mt-5 space-y-4">
              {steps.map((step, index) => (
                <motion.div 
                  key={step} 
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] font-bold text-white">
                    {index + 1}
                  </div>
                  <p className="pt-0.5 text-sm leading-6 text-[var(--color-muted)]">
                    {step}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-6 rounded-2xl border border-orange-100 bg-orange-50/70 p-5"
          >
            <p className="text-sm leading-6 text-[var(--color-text)]">
              Students can create their Gemini API key from Google AI Studio and
              then paste it here to unlock AI-assisted features in the platform.
            </p>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, rotate: 1 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative rounded-3xl border border-slate-200 bg-white/50 p-4 shadow-xl backdrop-blur-sm md:p-6"
          style={{ touchAction: "pan-y" }}
        >
          {/* Subtle floating chips for "motion" */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -top-4 -right-4 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold shadow-lg"
          >
            ✨ AI Assistant
          </motion.div>
          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="pointer-events-none absolute -bottom-2 -left-4 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold shadow-lg"
          >
            Generate with AI
          </motion.div>


          <div className="rounded-2xl border border-slate-200 bg-[var(--color-bg-alt)] p-6">
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
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-500 outline-none focus:border-[var(--color-primary)] transition-all"
                />
                <button className="rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.05] hover:opacity-90 active:scale-95">
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
        </motion.div>
      </div>
    </section>
  );
}

export default AIToolsSection;