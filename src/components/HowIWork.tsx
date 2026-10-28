import { motion, useInView, type Variants } from 'framer-motion';
import { CodeXml, FileText, Monitor, Pencil, Rocket, Search, Target, type LucideIcon } from 'lucide-react';
import { useRef, type CSSProperties } from 'react';

const EASE = [0.16, 1, 0.3, 1] as const;

// ---------------------------------------------------------------------------
// Desktop (xl+) is a scaled copy of the How I Work mockup (1983 x 793). The
// staircase, its numbers, icon rings and guide lines are the mockup's own
// artwork with the text removed (/how-i-work-stairs.webp); every piece of
// text sits on top of it at the mockup's coordinates. Positions are written
// in mockup px and scaled by `var(--x) * 100cqw / 1983`. Below xl the same
// content stacks: header, the artwork as a band, then the steps as a list.
// ---------------------------------------------------------------------------

interface Step {
  n: string;
  title: string;
  // the mockup's line breaks (xl only; below xl the text flows freely)
  lines: string[];
  icon: LucideIcon;
  // title box top-left in mockup px
  x: number;
  y: number;
}

const steps: Step[] = [
  { n: '01', title: 'Discovery', lines: ['Understanding goals,', 'users and', 'requirements.'], icon: FileText, x: 145.5, y: 366.6 },
  { n: '02', title: 'Research', lines: ['Exploring context,', 'references and', 'constraints.'], icon: Search, x: 436.5, y: 349.6 },
  { n: '03', title: 'Strategy', lines: ['Planning structure,', 'direction and', 'approach.'], icon: Target, x: 691.5, y: 324.6 },
  { n: '04', title: 'Design', lines: ['Crafting UI, visuals', 'and user experience.'], icon: Pencil, x: 927.5, y: 269.6 },
  { n: '05', title: 'Development', lines: ['Building responsive,', 'functional interfaces.'], icon: CodeXml, x: 1204.5, y: 189.6 },
  { n: '06', title: 'Testing', lines: ['Reviewing quality,', 'usability and', 'performance.'], icon: Monitor, x: 1454.5, y: 154.1 },
  { n: '07', title: 'Deployment', lines: ['Launching, refining', 'and delivering', 'the result.'], icon: Rocket, x: 1734.5, y: 172.6 },
];

// Mockup px -> container units, for the inline position variables.
const at = (x: number, y: number) => ({ '--x': x, '--y': y }) as CSSProperties;
// Mockup content edges for .frame-fit: text starts 84px in, "From ideas" ends 70px short.
const FIT = { '--wm': 1983, '--a': 84, '--b': 70, '--t': 49, '--gt': 'var(--sy)' } as CSSProperties;
const POS = 'xl:absolute xl:z-10 xl:left-[calc(var(--x)*100cqw/1983)] xl:top-[calc(var(--y)*100cqw/1983)]';

const rise: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: (delay: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay, ease: EASE } }),
};
const draw: Variants = {
  hidden: { scaleX: 0 },
  visible: (delay: number = 0) => ({ scaleX: 1, transition: { duration: 1, delay, ease: EASE } }),
};

export default function HowIWork({ reduce }: { reduce: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px -15% 0px' });
  const show = reduce || inView;
  const reveal = reduce ? {} : { initial: 'hidden' as const, animate: show ? ('visible' as const) : ('hidden' as const) };

  return (
    <motion.div
      ref={ref}
      {...reveal}
      style={FIT}
      className="frame relative mt-[var(--sy)] overflow-hidden bg-black pb-4 pt-6 font-sans [container-type:inline-size] xl:frame-fit xl:aspect-[1983/793] xl:py-0"
    >
      {/* ── header ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-5 xl:contents">
        <motion.span
          variants={rise}
          custom={0}
          style={at(82.7, 55.3)}
          className={`text-xs uppercase leading-none tracking-[0.377em] text-white sm:text-sm ${POS} xl:text-[calc(17.86*100cqw/1983)]`}
        >
          Process
        </motion.span>
        <motion.span
          aria-hidden="true"
          variants={draw}
          custom={0.2}
          style={{ ...at(236, 64.2), transformOrigin: 'left' }}
          className={`h-px w-16 bg-white/75 ${POS} xl:w-[calc(114*100cqw/1983)]`}
        />
      </div>

      <div className="mt-6 overflow-hidden xl:contents">
        <motion.h3
          variants={rise}
          custom={0.1}
          style={at(78, 93.9)}
          className={`whitespace-nowrap text-[clamp(2.75rem,15cqw,6.3rem)] uppercase leading-none text-white ${POS} xl:text-[calc(100.7*100cqw/1983)]`}
        >
          <span className="font-extrabold tracking-[-0.014em]">How I</span>{' '}
          <span className="-ml-[0.07em] font-light tracking-[-0.012em]">Work</span>
        </motion.h3>
      </div>

      <motion.p
        variants={rise}
        custom={0.2}
        style={at(84.5, 200.7)}
        className={`mt-5 max-w-xl text-lg font-light leading-[1.52] tracking-[0.013em] text-white/[0.93] sm:text-xl ${POS} xl:mt-0 xl:max-w-none xl:text-[calc(22.33*100cqw/1983)] xl:leading-[1.523]`}
      >
        A clear and strategic process to turn
        <br className="hidden sm:inline" /> ideas into meaningful digital experiences.
      </motion.p>

      <div className="mt-6 flex items-center gap-4 xl:contents">
        <motion.span
          variants={rise}
          custom={0.3}
          style={at(1803.6, 43.25)}
          className={`text-xs uppercase leading-[1.344] tracking-[0.044em] text-white sm:text-sm sm:leading-[1.344] ${POS} xl:text-[calc(17.86*100cqw/1983)]`}
        >
          From ideas
          <br /> to impact
        </motion.span>
        <motion.span
          aria-hidden="true"
          variants={draw}
          custom={0.5}
          style={{ ...at(1848, 119.1), transformOrigin: 'right' }}
          className={`h-px w-12 bg-white/70 ${POS} xl:w-[calc(66*100cqw/1983)]`}
        />
      </div>

      {/* ── the staircase artwork ───────────────────────────────────── */}
      {/* Tablets: a full-bleed band cropped to the stairs. On phones it would be a
          ~110px sliver, so phones get the step timeline below instead. */}
      <motion.div
        variants={rise}
        custom={0.15}
        aria-hidden="true"
        className="relative -mx-[var(--g)] mt-10 hidden aspect-[1983/600] overflow-hidden sm:block xl:absolute xl:inset-0 xl:m-0 xl:aspect-auto"
      >
        <img
          src="/how-i-work-stairs.webp"
          alt=""
          width={1983}
          height={793}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="absolute bottom-0 left-0 w-full select-none xl:inset-0 xl:h-full"
        />
      </motion.div>

      {/* ── the seven steps ─────────────────────────────────────────── */}
      <ol className="mt-10 grid grid-cols-1 gap-x-10 sm:grid-cols-2 sm:gap-y-10 xl:contents">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.li
              key={step.n}
              variants={rise}
              custom={0.35 + i * 0.09}
              style={at(step.x, step.y)}
              className={`relative flex gap-5 pb-9 last:pb-0 sm:pb-0 xl:block ${POS}`}
            >
              {/* below xl the artwork is too small to read, so each step
                  carries its own icon; on phones a line joins them into a timeline */}
              <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/70 bg-black xl:hidden">
                <Icon className="h-5 w-5 text-white" strokeWidth={1.4} aria-hidden="true" />
              </span>
              {i < steps.length - 1 && (
                <span aria-hidden="true" className="absolute bottom-1 left-6 top-[52px] w-px bg-gradient-to-b from-white/45 to-white/10 sm:hidden" />
              )}
              <div className="min-w-0 pt-1 xl:pt-0">
                <span className="mb-2 block text-[11px] font-medium tabular-nums tracking-[0.2em] text-white/45 xl:hidden">STEP {step.n}</span>
                <h4 className="text-base font-semibold uppercase leading-none tracking-[-0.021em] text-white xl:text-[calc(19.29*100cqw/1983)]">
                  {step.title}
                </h4>
                <p className="mt-2.5 text-sm font-light leading-[1.43] tracking-[0.011em] text-white/90 xl:mt-[calc(8.9*100cqw/1983)] xl:whitespace-nowrap xl:text-[max(11px,calc(16.1*100cqw/1983))] xl:leading-[1.4286]">
                  {step.lines.map((line, j) => (
                    <span key={line}>
                      {j > 0 && <br className="hidden xl:inline" />}
                      {j > 0 && <span className="xl:hidden"> </span>}
                      {line}
                    </span>
                  ))}
                </p>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </motion.div>
  );
}
