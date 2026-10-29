import { motion, useInView, type Variants } from 'framer-motion';
import { useRef } from 'react';

const EASE = [0.16, 1, 0.3, 1] as const;

// ---------------------------------------------------------------------------
// Specialization ("What We Do Best"): the section's heading block, then the
// skills in two balanced groups -- Development and Design -- as quiet ruled
// lists rather than cards, so the range reads at a glance.
// ---------------------------------------------------------------------------

const groups: { title: string; items: string[] }[] = [
  {
    title: 'Development',
    items: [
      'Frontend Development',
      'WordPress Development',
      'Shopify Development',
      'Software Development',
      'CRM Development',
      'Workflow Automation',
    ],
  },
  {
    title: 'Design',
    items: ['Website UI Design', 'Responsive Design', 'Graphic Design', 'Landing Pages', 'E-Commerce Design'],
  },
];

const FLOW = ['Idea', 'Design', 'Develop', 'Grow'];

const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (delay: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay, ease: EASE } }),
};

export default function WhatWeDoBest({ reduce }: { reduce: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px -15% 0px' });
  const show = reduce || inView;
  const reveal = reduce ? {} : { initial: 'hidden' as const, animate: show ? ('visible' as const) : ('hidden' as const) };

  return (
    <motion.div ref={ref} {...reveal} className="frame mt-[var(--sy)] font-sans">
      {/* ── heading block ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <motion.div variants={rise} custom={0} className="flex items-center gap-6">
            <span className="text-xs uppercase leading-none tracking-[0.316em] text-white sm:text-sm">Specialization</span>
            <span aria-hidden="true" className="h-px w-16 bg-white/80 sm:w-24" />
          </motion.div>
          <motion.h3
            variants={rise}
            custom={0.08}
            className="mt-5 text-[clamp(2.2rem,3.9vw,4.25rem)] font-bold leading-none tracking-[-0.03em] text-white"
          >
            What We Do Best
          </motion.h3>
          <motion.p
            variants={rise}
            custom={0.16}
            className="mt-5 max-w-2xl text-base font-light leading-relaxed text-white/90 sm:text-lg"
          >
            We combine creativity, technology and strategy to deliver digital solutions that help businesses grow.
          </motion.p>
        </div>

        <motion.p
          variants={rise}
          custom={0.24}
          className="flex flex-wrap items-center gap-x-2.5 gap-y-2 text-[11px] uppercase leading-none tracking-[0.27em] text-white/85 sm:gap-x-4 sm:text-xs lg:pb-2"
        >
          {FLOW.map((step, i) => (
            <span key={step} className="flex items-center gap-x-2.5 sm:gap-x-4">
              {i > 0 && <span aria-hidden="true" className="h-px w-4 bg-white/60 sm:w-6" />}
              {step}
            </span>
          ))}
        </motion.p>
      </div>

      {/* ── the two groups ──────────────────────────────────────────── */}
      <div className="mt-12 grid grid-cols-1 gap-y-12 border-t border-white/15 sm:mt-14 lg:grid-cols-2 lg:gap-y-0">
        {groups.map((group, g) => (
          <motion.section
            key={group.title}
            variants={rise}
            custom={0.3 + g * 0.1}
            aria-labelledby={`specialization-${group.title.toLowerCase()}`}
            className={g === 0 ? 'lg:pr-12 xl:pr-16' : 'lg:border-l lg:border-white/15 lg:pl-12 xl:pl-16'}
          >
            <div className="flex items-baseline justify-between border-b border-white/15 py-5">
              <h4
                id={`specialization-${group.title.toLowerCase()}`}
                className="text-xs font-medium uppercase leading-none tracking-[0.3em] text-white sm:text-sm"
              >
                {group.title}
              </h4>
              <span className="text-xs tabular-nums leading-none tracking-[0.2em] text-white/50" aria-hidden="true">
                {String(group.items.length).padStart(2, '0')}
              </span>
            </div>
            <ol>
              {group.items.map((item, i) => (
                <li
                  key={item}
                  className="group flex items-baseline gap-5 border-b border-white/10 py-4 transition-colors duration-300 hover:border-white/30 sm:py-5"
                >
                  <span className="w-6 shrink-0 text-xs tabular-nums text-white/50" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-lg font-light leading-snug text-white/90 transition-[color,transform] duration-300 group-hover:translate-x-1 group-hover:text-white sm:text-xl">
                    {item}
                  </span>
                </li>
              ))}
            </ol>
          </motion.section>
        ))}
      </div>
    </motion.div>
  );
}
