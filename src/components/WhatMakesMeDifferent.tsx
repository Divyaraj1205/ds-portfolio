import { motion, useInView, type Variants } from 'framer-motion';
import { Laptop, Lightbulb, MessageCircleMore, Pencil, PenTool, Search, Settings, type LucideIcon } from 'lucide-react';
import { useRef, type CSSProperties, type SVGProps } from 'react';
import { keyStrengths } from '../data/content';

const EASE = [0.16, 1, 0.3, 1] as const;

// Desktop (xl+) sizing note: this block is a container (container-type:
// inline-size), and every xl: size/position below is the mockup's own
// measurement divided by its 1550px content width -- i.e. 1cqw = 15.5px of
// the mockup -- so at xl the layout is a true scaled copy of the design.
// Below xl the same elements use ordinary responsive rem sizes.

// The mockup's outlined, rising bar chart (lucide's chart icons draw solid
// strokes or axes, not these outlined bars).
function RisingBars(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="3.5" y="13" width="4.5" height="8" rx="0.6" />
      <rect x="9.75" y="8.5" width="4.5" height="12.5" rx="0.6" />
      <rect x="16" y="3.5" width="4.5" height="17.5" rx="0.6" />
    </svg>
  );
}

type IconComponent = LucideIcon | typeof RisingBars;

// Same order as keyStrengths in content.ts. Copy is split into the mockup's
// own lines: at xl they break exactly there (see Lines); below xl it wraps
// naturally. (Width alone can't reproduce them -- the mockup's typeface has
// different letter proportions from Inter.)
const strengthDetails: { desc: string[]; icon: IconComponent }[] = [
  { desc: ['Finding smart solutions with', 'a creative approach.'], icon: Lightbulb },
  { desc: ['Understanding client needs', 'and turning ideas into clear plans.'], icon: MessageCircleMore },
  { desc: ['Creating clean, modern', 'and impactful designs.'], icon: PenTool },
  { desc: ['Focusing on every small detail', 'to ensure high quality work.'], icon: Search },
  { desc: ['Quickly learning new tools,', 'trends and adapting to', 'changing needs.'], icon: Settings },
  { desc: ['Creating work that delivers', 'real value and supports', 'business goals.'], icon: RisingBars },
];

const strengthsIntro = [
  'A combination of creativity, strategy and',
  'problem-solving that helps me create',
  'meaningful digital experiences.',
];
const bringIntro = [
  'A balanced mix of technical knowledge, design thinking',
  'and a business mindset to deliver practical, effective',
  'and result-driven solutions.',
];

// Copy lines that break where the mockup breaks at xl, and wrap freely below.
function Lines({ lines }: { lines: string[] }) {
  return lines.map((line, i) => (
    <span key={i}>
      {i > 0 && (
        <>
          {' '}
          <br className="hidden xl:inline" />
        </>
      )}
      {line}
    </span>
  ));
}

const SILVER = 'bg-[linear-gradient(180deg,#f0f0f0_0%,#a3a3a3_100%)] bg-clip-text text-transparent';

const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (delay: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: EASE } }),
};

function Eyebrow({ label, lineClass }: { label: string; lineClass: string }) {
  return (
    <motion.div variants={rise} custom={0} className="flex items-center gap-4 xl:gap-[1.15cqw]">
      <span className="font-inter text-[0.7rem] font-medium uppercase tracking-[0.34em] text-white/90 sm:text-xs xl:text-[0.85cqw]">
        {label}
      </span>
      <span aria-hidden="true" className={`h-px bg-white/30 ${lineClass}`} />
    </motion.div>
  );
}

interface VennItem {
  title: [string, string];
  desc: string;
  icon: IconComponent;
  // text block anchor (top-centre), % of the diagram box
  x: number;
  y: number;
  width: number;
}

const vennItems: VennItem[] = [
  { title: ['Technical', 'Thinking'], desc: 'Building practical, responsive digital solutions.', icon: Laptop, x: 50.3, y: 7.85, width: 33 },
  { title: ['Visual', 'Thinking'], desc: 'Combining design, usability and attention to detail.', icon: Pencil, x: 24.6, y: 54.55, width: 30 },
  { title: ['Business', 'Mindset'], desc: 'Creating work focused on real client goals.', icon: RisingBars, x: 75.4, y: 54.9, width: 35 },
];

// Three overlapping circles (the mockup's 537x518 diagram, in its own
// coordinates) with a dot where they meet. A container itself, so its text
// and icons scale with the diagram at every width.
function Venn({ show, reduce }: { show: boolean; reduce: boolean }) {
  const circles = [
    { cx: 270, cy: 150 },
    { cx: 145, cy: 366 },
    { cx: 393, cy: 366 },
  ];
  return (
    <div className="relative [container-type:inline-size]">
      <div className="relative aspect-[537/518]">
        <svg viewBox="0 0 537 518" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
          {circles.map((c, i) => (
            <motion.circle
              key={i}
              cx={c.cx}
              cy={c.cy}
              r={148}
              fill="rgba(255,255,255,0.025)"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              initial={reduce ? undefined : { pathLength: 0, opacity: 0 }}
              animate={show ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
              transition={{ duration: 1.4, delay: reduce ? 0 : 0.25 + i * 0.15, ease: EASE }}
            />
          ))}
        </svg>

        <motion.span
          aria-hidden="true"
          initial={reduce ? undefined : { opacity: 0, scale: 0 }}
          animate={show ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
          transition={{ duration: 0.5, delay: reduce ? 0 : 1.1, ease: EASE }}
          className="absolute left-[50.3%] top-[57%] -ml-[1.1cqw] -mt-[1.1cqw] h-[2.2cqw] w-[2.2cqw] min-h-2 min-w-2 rounded-full bg-white shadow-[0_0_12px_2px_rgba(255,255,255,0.45)]"
        />

        <ul>
          {vennItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <li
                key={item.desc}
                style={{ left: `${item.x}%`, '--y': `${item.y}%`, width: `${item.width}%` } as CSSProperties}
                // narrow phones: the text can't shrink below a readable size, so
                // the lower two labels sit a little higher to stay inside their circles
                className={`absolute top-[var(--y)] -translate-x-1/2 ${i > 0 ? 'max-[420px]:top-[calc(var(--y)-3%)] max-[360px]:top-[calc(var(--y)-5%)]' : ''}`}
              >
                <motion.div
                  initial={reduce ? undefined : { opacity: 0, y: 10 }}
                  animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.7, delay: reduce ? 0 : 0.6 + i * 0.12, ease: EASE }}
                  className="flex flex-col items-center text-center"
                >
                  <Icon className="h-[10.5cqw] w-[10.5cqw] text-white max-[420px]:h-[9cqw] max-[420px]:w-[9cqw]" strokeWidth={1.4} />
                  <h4 className="mt-[1.7cqw] font-inter text-[clamp(0.75rem,3.75cqw,1.35rem)] font-bold uppercase leading-[1.22] text-white">
                    {item.title[0]}
                    <br />
                    {item.title[1]}
                  </h4>
                  <p className="mt-[1.8cqw] font-inter text-[clamp(0.7rem,3.15cqw,1.1rem)] leading-[1.38] text-white/70">
                    {item.desc}
                  </p>
                </motion.div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// Key Strengths ("What Makes Me Different") + What I Bring, the closing block of Skills.
export default function WhatMakesMeDifferent({ reduce }: { reduce: boolean }) {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const leftInView = useInView(leftRef, { once: true, margin: '-10% 0px -10% 0px' });
  const rightInView = useInView(rightRef, { once: true, margin: '-10% 0px -10% 0px' });
  const showLeft = reduce || leftInView;
  const showRight = reduce || rightInView;
  const reveal = (show: boolean) =>
    reduce ? {} : { initial: 'hidden' as const, animate: show ? ('visible' as const) : ('hidden' as const) };

  return (
    <div className="mt-[var(--sy)] [container-type:inline-size]">
      <div className="grid gap-16 xl:grid-cols-[60cqw_1fr] xl:gap-0">
        {/* LEFT -- Key Strengths */}
        <motion.div ref={leftRef} {...reveal(showLeft)}>
          <Eyebrow label="Key Strengths" lineClass="w-16 xl:w-[4.35cqw]" />

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between xl:mt-[2.15cqw] xl:gap-0">
            <motion.h3
              variants={rise}
              custom={0.08}
              className="font-inter text-[2.9rem] font-bold leading-[0.9] tracking-[-0.035em] text-white sm:text-6xl md:text-7xl xl:text-[6.3cqw] xl:leading-[0.86] xl:tracking-[-0.04em]"
            >
              What Makes
              <br />
              Me <span className={SILVER}>Different</span>
            </motion.h3>
            <motion.p
              variants={rise}
              custom={0.18}
              className="max-w-md font-inter text-[0.95rem] leading-[1.55] text-white/70 lg:max-w-[21rem] xl:w-[21.6cqw] xl:max-w-none xl:pb-[0.3cqw] xl:text-[1.15cqw] xl:leading-[1.7] xl:tracking-[-0.01em]"
            >
              <Lines lines={strengthsIntro} />
            </motion.p>
          </div>

          <ul className="mt-12 grid sm:grid-cols-2 xl:mt-[2cqw]">
            {keyStrengths.map((title, i) => {
              const { desc, icon: Icon } = strengthDetails[i];
              const rightCol = i % 2 === 1;
              return (
                <motion.li
                  key={title}
                  variants={rise}
                  custom={0.25 + i * 0.07}
                  className={`group relative flex items-center gap-5 py-7 sm:gap-6 xl:items-start xl:gap-[2.25cqw] xl:py-[2.3cqw] ${
                    i > 0 ? 'border-t border-white/[0.12]' : ''
                  } ${i === 1 ? 'sm:border-t-0' : ''} ${rightCol ? 'sm:pl-8 xl:pl-[2.55cqw]' : 'sm:pr-6 xl:pr-[2cqw]'}`}
                >
                  {/* short vertical divider between the two columns (sm+) */}
                  {rightCol && (
                    <span aria-hidden="true" className="absolute bottom-[12%] left-0 top-[12%] hidden w-px bg-white/[0.12] sm:block" />
                  )}
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/[0.09] transition-colors duration-400 ease-premium group-hover:bg-white/[0.12] sm:h-20 sm:w-20 xl:h-[7.15cqw] xl:w-[7.15cqw]">
                    <Icon
                      className="h-7 w-7 text-white transition-transform duration-400 ease-premium group-hover:scale-110 sm:h-8 sm:w-8 xl:h-[2.9cqw] xl:w-[2.9cqw]"
                      strokeWidth={1.4}
                    />
                  </span>
                  <div className={`min-w-0 xl:mt-[0.7cqw] ${rightCol ? 'xl:-mr-[1.4cqw]' : ''}`}>
                    {/* sm:leading re-stated: text-lg would otherwise also set a 28px line height */}
                    <h4
                      className={`font-inter text-base font-semibold leading-[1.25] text-white sm:text-lg sm:leading-[1.25] xl:text-[1.3cqw] xl:tracking-[-0.01em] ${
                        rightCol ? 'xl:max-w-[17.6cqw]' : 'xl:max-w-[13cqw]'
                      }`}
                    >
                      {title}
                    </h4>
                    <p
                      className={`mt-2 font-inter text-sm leading-[1.45] text-white/60 sm:text-[0.95rem] xl:mt-[0.5cqw] xl:text-[1.16cqw] ${
                        rightCol ? 'xl:max-w-[19cqw]' : 'xl:max-w-[15.8cqw]'
                      }`}
                    >
                      <Lines lines={desc} />
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </motion.div>

        {/* RIGHT -- What I Bring */}
        <motion.div
          ref={rightRef}
          {...reveal(showRight)}
          className="border-t border-white/10 pt-14 xl:ml-[3cqw] xl:border-l xl:border-t-0 xl:pl-[3.7cqw] xl:pt-[0.2cqw]"
        >
          <Eyebrow label="What I Bring" lineClass="w-24 xl:w-[9.5cqw]" />

          <motion.p
            variants={rise}
            custom={0.08}
            className="mt-6 font-inter text-[1.75rem] font-bold uppercase leading-[1.05] tracking-[-0.02em] text-white sm:text-5xl xl:mt-[2.1cqw] xl:text-[2.95cqw] xl:leading-[1.09] xl:tracking-[-0.025em]"
          >
            Development <span className="font-normal text-white/60">×</span>
            <br /> Design <span className="ml-[0.2em] mr-[0.45em] font-normal text-white/60">×</span>{' '}
            <span className={SILVER}>Business</span>
          </motion.p>

          <motion.p
            variants={rise}
            custom={0.16}
            className="mt-5 max-w-xl font-inter text-[0.95rem] leading-[1.55] text-white/70 xl:mt-[1.55cqw] xl:max-w-none xl:text-[1.16cqw] xl:leading-[1.62]"
          >
            <Lines lines={bringIntro} />
          </motion.p>

          {/* below 360px the diagram uses the full screen width (cancelling the section's 16px gutters) */}
          <div className="mx-auto mt-10 w-full max-w-[34rem] max-[360px]:-mx-4 max-[360px]:w-[calc(100%+2rem)] xl:mx-0 xl:-ml-[1.4cqw] xl:mt-[1.15cqw] xl:w-[34.6cqw] xl:max-w-none">
            <Venn show={showRight} reduce={reduce} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
