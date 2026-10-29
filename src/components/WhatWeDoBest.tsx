import { motion, useInView, type Variants } from 'framer-motion';
import { useRef } from 'react';

const EASE = [0.16, 1, 0.3, 1] as const;

// ---------------------------------------------------------------------------
// Specialization ("What We Do Best"): the heading block with a four-step
// process line, then the skills in two groups -- Development and Design --
// each a two-column grid of numbered entries split by hairline rules.
// ---------------------------------------------------------------------------

const groups: { title: string; items: [string, string][] }[] = [
  {
    title: 'Development',
    items: [
      ['Frontend Development', 'Modern, fast and interactive web experiences.'],
      ['WordPress Development', 'Flexible and powerful websites for every business.'],
      ['Shopify Development', 'High-performing eCommerce stores tailored to your needs.'],
      ['Software Development', 'Custom software tailored to your business needs.'],
      ['CRM Development', 'Smarter customer management solutions to streamline your business.'],
      ['Workflow Automation', 'Automate processes and save valuable time.'],
    ],
  },
  {
    title: 'Design',
    items: [
      ['Website UI Design', 'Clean and modern interfaces that convert.'],
      ['Responsive Design', 'Seamless experience across all devices.'],
      ['Graphic Design', 'Impactful visuals for stronger branding.'],
      ['Landing Pages', 'Focused designs that drive results.'],
      ['E-Commerce Design', 'Conversion-driven designs for online stores.'],
    ],
  },
];

const STEPS = ['Idea', 'Design', 'Develop', 'Grow'];

const pad = (n: number) => String(n).padStart(2, '0');

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
    <motion.div ref={ref} {...reveal} className="frame mt-[var(--sy)] font-inter text-white">
      {/* ── heading block + process steps ───────────────────────────── */}
      <div className="flex flex-col gap-10 xl:flex-row xl:items-end xl:justify-between xl:gap-16">
        <div className="min-w-0">
          <motion.div variants={rise} custom={0} className="flex items-center gap-5">
            <span className="text-xs font-medium uppercase leading-none tracking-[0.34em] sm:text-[13px]">Specialization</span>
            <span aria-hidden="true" className="h-px w-16 bg-white/70 sm:w-24" />
          </motion.div>
          <motion.h3
            variants={rise}
            custom={0.08}
            className="mt-5 text-[clamp(2.5rem,4.6vw,5rem)] font-extrabold leading-[1.02] tracking-[-0.025em]"
          >
            What We Do Best
          </motion.h3>
          <motion.p
            variants={rise}
            custom={0.16}
            className="mt-4 max-w-[46rem] text-base leading-relaxed text-white/80 sm:text-lg lg:text-xl"
          >
            We combine creativity, technology and strategy to deliver digital solutions that help businesses grow.
          </motion.p>
        </div>

        <motion.ol variants={rise} custom={0.24} className="grid w-full max-w-[38rem] shrink-0 grid-cols-4 xl:mb-1 xl:w-[38rem]">
          {STEPS.map((step, i) => (
            <li key={step} className="relative flex flex-col items-center">
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-[calc(50%+30px)] right-[calc(-50%+30px)] top-[22px] h-px bg-white/30 sm:left-[calc(50%+36px)] sm:right-[calc(-50%+36px)] sm:top-[27px]"
                />
              )}
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/70 text-[13px] tabular-nums sm:h-14 sm:w-14 sm:text-[15px]">
                {pad(i + 1)}
              </span>
              <span className="mt-3 text-[10px] font-semibold uppercase leading-none tracking-[0.22em] text-white/90 sm:mt-4 sm:text-xs sm:tracking-[0.28em]">
                {step}
              </span>
            </li>
          ))}
        </motion.ol>
      </div>

      {/* The two groups: side by side (as in the mockup) only where each still
          has room for two readable columns; below that they stack. */}
      <div className="mt-12 grid grid-cols-1 gap-y-12 sm:mt-20 sm:gap-y-16 2xl:grid-cols-[1.12fr_1fr] 2xl:gap-y-0">
        {groups.map((group, g) => (
          <motion.section
            key={group.title}
            variants={rise}
            custom={0.3 + g * 0.1}
            aria-labelledby={`specialization-${group.title.toLowerCase()}`}
            className={g === 0 ? '2xl:pr-14' : '2xl:border-l 2xl:border-white/20 2xl:pl-14'}
          >
            <div className="flex items-center gap-6">
              <h4
                id={`specialization-${group.title.toLowerCase()}`}
                className="text-xs font-semibold uppercase leading-none tracking-[0.34em] sm:text-sm"
              >
                {group.title}
              </h4>
              <span aria-hidden="true" className="h-px flex-1 bg-white/30" />
              <span aria-hidden="true" className="text-3xl font-extralight leading-none tabular-nums text-white/85 sm:text-4xl">
                {pad(group.items.length)}
              </span>
            </div>

            {/* Every entry carries a hairline on top and the list is pulled up
                1px under a clip, so the first row's line is hidden and the
                rules fall between rows whatever the column count. */}
            <div className="mt-3 overflow-hidden sm:mt-8">
              <ol className="-mt-px grid grid-cols-1 gap-x-10 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-2">
                {group.items.map(([title, desc], i) => (
                  <li key={title} className="group flex gap-4 border-t border-white/15 py-5 sm:gap-5 sm:py-8">
                    <span
                      aria-hidden="true"
                      className="w-10 shrink-0 text-[2.1rem] font-extralight leading-none text-white/60 transition-colors duration-300 group-hover:text-white sm:w-[3.25rem] sm:text-[2.6rem]"
                    >
                      {pad(i + 1)}
                    </span>
                    <span aria-hidden="true" className="w-px shrink-0 self-stretch bg-white/25" />
                    <div className="min-w-0">
                      <h5 className="text-lg font-semibold leading-snug sm:text-[1.2rem] 2xl:text-[clamp(1rem,1.1vw,1.2rem)]">
                        {title}
                      </h5>
                      <p className="mt-2 text-[15px] leading-relaxed text-white/75 sm:text-base">{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </motion.section>
        ))}
      </div>
    </motion.div>
  );
}
