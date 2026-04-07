import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.1
    }
  },
  viewport: { once: true, margin: "-100px" }
};

function WhyUsSection() {
  const highlights = [
    {
      title: "Start",
      description: "Begin with a clean, professional resume-building experience.",
    },
    {
      title: "Support",
      description: "Follow a student-first flow that feels simple and guided.",
    },
    {
      title: "Scale",
      description: "Grow into AI tools, interview prep, and career support features.",
    },
  ];

  return (
    <section
      id="why-us"
      className="relative overflow-hidden bg-[var(--color-bg-alt)] px-6 py-20 md:px-12 md:py-24 lg:px-20"
    >
      <div className="absolute left-1/2 top-16 h-64 w-64 -translate-x-1/2 rounded-full bg-[var(--color-secondary)]/10 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-48 w-48 rounded-full bg-[var(--color-accent-2)]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <motion.div 
          className="mx-auto max-w-4xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-secondary)]">
            Why Us
          </p>

          <h2 className="mt-4 text-4xl font-bold leading-tight text-[var(--color-text)] md:text-5xl lg:text-6xl">
            More clarity.
            <br />
            Less overwhelm.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[var(--color-muted)] md:text-lg">
            Career Copilot helps students begin with a better resume and grow
            into a broader career support platform over time.
          </p>
        </motion.div>

        <motion.div 
          className="mt-14 grid gap-6 md:grid-cols-3"
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-100px" }}
        >
          {highlights.map((item, index) => (
            <motion.div
              key={item.title}
              variants={fadeInUp}
              className="group rounded-[24px] border border-slate-200/80 bg-white/70 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-[0_14px_40px_rgba(53,0,139,0.10)]"
            >
              <div className="mb-5 flex items-center justify-between">
                <p className="text-2xl font-bold text-[var(--color-primary)] transition duration-300 group-hover:scale-105">
                  {item.title}
                </p>
                <span className="text-xs font-semibold tracking-[0.2em] text-slate-400">
                  0{index + 1}
                </span>
              </div>

              <p className="text-sm leading-6 text-[var(--color-muted)] transition duration-300 group-hover:text-[var(--color-text)] md:text-base">
                {item.description}
              </p>

              <div className="mt-6 h-1 w-12 rounded-full bg-slate-200 transition-all duration-300 group-hover:w-24 group-hover:bg-[var(--color-primary)]" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default WhyUsSection;