import { motion, useInView, type Variants } from 'framer-motion';
import { MonitorSmartphone, PenTool, ShoppingCart } from 'lucide-react';
import { useRef, type CSSProperties, type ReactNode } from 'react';
import { BrandIcon } from './BrandIcon';

const EASE = [0.16, 1, 0.3, 1] as const;

// ---------------------------------------------------------------------------
// From 1400px up this block is a scaled copy of the "What We Do Best" mockup
// (2168 x 725): it is a container (container-type: inline-size) and every
// desktop position / size is written in mockup px and scaled by
// `var(--x) * 100cqw / 2168`. The card outlines are one SVG in mockup
// coordinates; text, icons sit on top. (Below 1400px the eight
// cards are too narrow side by side, so they become a 4 / 2 / 1-column grid
// with the same look.)
// ---------------------------------------------------------------------------

type Box = { x?: number; y?: number; w?: number; h?: number; fs?: number; lh?: number };
const at = ({ x, y, w, h, fs, lh }: Box) =>
  ({ '--x': x, '--y': y, '--w': w, '--h': h, '--fs': fs, '--lh': lh }) as CSSProperties;
// Mockup content edges for .frame-fit: the card outlines (52.5px / 47.5px in).
const FIT = { '--wm': 2168, '--a': 52.5, '--b': 47.5, '--t': 73, '--bt': 62, '--gt': 'var(--sy)' } as CSSProperties;
const POS = 'min-[1400px]:absolute min-[1400px]:left-[calc(var(--x)*100cqw/2168)] min-[1400px]:top-[calc(var(--y)*100cqw/2168)]';
const FS = 'min-[1400px]:text-[length:max(11px,calc(var(--fs)*100cqw/2168))]';
const W = 'min-[1400px]:w-[calc(var(--w)*100cqw/2168)]';
const H = 'min-[1400px]:h-[calc(var(--h)*100cqw/2168)]';

// Browser window with </> -- the mockup's Frontend mark.
function FrontendIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <rect x="2.5" y="3.5" width="19" height="17" rx="2" />
      <path d="M2.5 8h19" />
      <path d="M5.5 5.8h.01M7.5 5.8h.01M9.5 5.8h.01" strokeWidth="1.6" />
      <path d="m9.5 12-2.5 2.25 2.5 2.25M14.5 12l2.5 2.25-2.5 2.25M12.8 11.2l-1.6 6.1" />
    </svg>
  );
}

// Browser window with an image block and text lines -- the Landing Pages mark.
function LandingIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <rect x="2.5" y="3.5" width="19" height="17" rx="2" />
      <path d="M2.5 8h19" />
      <path d="M5.5 5.8h.01M7.5 5.8h.01M9.5 5.8h.01" strokeWidth="1.6" />
      <rect x="5.5" y="11" width="5.5" height="6.5" rx=".6" />
      <path d="M13.5 11.5h5M13.5 14.25h5M13.5 17h3.5" />
    </svg>
  );
}

// Bezier curve with square anchors and a handle -- the Website UI Design mark.
function BezierIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M5.5 16.5C5.5 10 8.5 6 12 6s6.5 4 6.5 10.5" />
      <path d="M3.5 6h17" />
      <rect x="4" y="16.5" width="3" height="3" rx=".4" />
      <rect x="17" y="16.5" width="3" height="3" rx=".4" />
      <circle cx="3.5" cy="6" r="1.1" />
      <circle cx="20.5" cy="6" r="1.1" />
      <rect x="10.6" y="4.6" width="2.8" height="2.8" rx=".4" />
    </svg>
  );
}

// Mockup geometry (px). R = card edges (R[k] left, R[k+1] right of card k);
// cx = icon circle centres; tx = text column; nx = number.
const R = [52.5, 301.5, 560.5, 828.5, 1088.5, 1350.5, 1608.5, 1873.5, 2120.5];
const CY = 375.75;
const CR = 55.5;

const cards: {
  title: [string, string];
  desc: [string, string, string];
  icon: (cls: string) => ReactNode;
  cx: number;
  tx: number;
  nx: number;
}[] = [
  { title: ['Frontend', 'Development'], desc: ['Modern, fast and', 'interactive frontend', 'experiences.'], icon: (c) => <FrontendIcon className={c} />, cx: 159, tx: 88, nx: 70.5 },
  { title: ['WordPress', 'Development'], desc: ['Custom, scalable and', 'easy-to-manage', 'WordPress websites.'], icon: (c) => <BrandIcon name="wordpress" className={c} />, cx: 415, tx: 346, nx: 323.5 },
  { title: ['Shopify', 'Development'], desc: ['Conversion-focused', 'Shopify stores for', 'growing brands.'], icon: (c) => <BrandIcon name="shopify" className={c} />, cx: 679, tx: 613, nx: 587.5 },
  { title: ['Website', 'UI Design'], desc: ['Clean, modern and', 'user-friendly', 'designs.'], icon: (c) => <BezierIcon className={c} />, cx: 941, tx: 880, nx: 852 },
  { title: ['Responsive', 'Design'], desc: ['Perfect experience', 'across all devices', 'and screen sizes.'], icon: (c) => <MonitorSmartphone className={c} strokeWidth={1.2} aria-hidden="true" />, cx: 1205, tx: 1138, nx: 1118.5 },
  { title: ['Graphic', 'Design'], desc: ['Creative visuals', 'that strengthen', 'your brand identity.'], icon: (c) => <PenTool className={c} strokeWidth={1.2} aria-hidden="true" />, cx: 1463, tx: 1398, nx: 1372 },
  { title: ['Landing', 'Pages'], desc: ['High-converting', 'landing pages for', 'campaigns and products.'], icon: (c) => <LandingIcon className={c} />, cx: 1721, tx: 1660, nx: 1625 },
  { title: ['E-Commerce', 'Design'], desc: ['Engaging online stores', 'that drive sales and', 'growth.'], icon: (c) => <ShoppingCart className={c} strokeWidth={1.2} aria-hidden="true" />, cx: 1987, tx: 1916, nx: 1885 },
];

const FLOW = [
  { word: 'Idea', x: 1595 },
  { word: 'Design', x: 1692 },
  { word: 'Develop', x: 1820 },
  { word: 'Grow', x: 1972 },
];
// [x, width] of the dashes between them
const FLOW_DASHES = [
  [1655, 23],
  [1783, 24],
  [1927, 28],
];

// Card k's outline, split into the bright run (top connector + right side)
// and the bottom, which fades in from the shared left edge.
function bright(k: number) {
  const r = R[k + 1];
  if (k === 0)
    return `M107.3 393C72 393 52.5 418 52.5 450L52.5 612C52.5 642 75 663 105 663L258 663C283 663 301.5 645 301.5 620L301.5 377A25 25 0 0 0 276.5 352L211 352`;
  if (k === 7) return `M2041.5 383C2085 383 ${r} 400 ${r} 445L${r} 620`;
  return `M${r} 620L${r} 377A25 25 0 0 0 ${r - 25} 352L${cards[k].cx + 52} 352`;
}
function bottom(k: number) {
  const l = R[k] + 1.5;
  const r = R[k + 1];
  return `M${l} 636C${l} 652 ${l + 10.5} 663 ${l + 28.5} 663L${r - 43.5} 663C${r - 18.5} 663 ${r} 645 ${r} 620`;
}

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
    <motion.div
      ref={ref}
      {...reveal}
      style={FIT}
      className="relative mt-[var(--sy)] bg-black px-[var(--g)] font-sans [container-type:inline-size] min-[1400px]:frame-fit min-[1400px]:aspect-[2168/725]"
    >
      {/* ── header: shifted 58.5px left of the mockup so it starts on the shared frame line, with the cards ── */}
      <div className="mx-auto max-w-[var(--frame)] min-[1400px]:contents">
        <motion.div variants={rise} custom={0} className="flex items-center gap-6 min-[1400px]:contents">
          <span
            style={at({ x: 53.5, y: 70.1, fs: 19.29 })}
            className={`text-xs uppercase leading-none tracking-[0.316em] text-white sm:text-sm ${POS} ${FS}`}
          >
            Specialization
          </span>
          <span aria-hidden="true" style={at({ x: 301.5, y: 79.5, w: 97, h: 1.5 })} className={`h-px w-16 bg-white/80 ${POS} ${W} ${H}`} />
        </motion.div>

        <motion.h3
          variants={rise}
          custom={0.08}
          style={at({ x: 52.5, y: 111.5, fs: 83.57 })}
          className={`mt-5 whitespace-nowrap text-[clamp(2.2rem,9cqw,4rem)] font-bold leading-none tracking-[-0.03em] text-white min-[1400px]:mt-0 ${POS} ${FS}`}
        >
          What We Do Best
        </motion.h3>

        <motion.p
          variants={rise}
          custom={0.16}
          style={at({ x: 53.5, y: 204.5, fs: 23.12, lh: 1.341 })}
          className={`mt-5 max-w-2xl text-base font-light leading-relaxed text-white/90 sm:text-lg min-[1400px]:mt-0 min-[1400px]:max-w-none min-[1400px]:whitespace-nowrap min-[1400px]:leading-[var(--lh)] ${POS} ${FS}`}
        >
          We combine creativity, technology and strategy to deliver digital
          <br className="hidden min-[1400px]:inline" /> solutions that help businesses grow.
        </motion.p>

        <motion.p
          variants={rise}
          custom={0.24}
          style={at({ fs: 15 })}
          className={`mt-6 flex flex-wrap items-center gap-x-2.5 gap-y-2 text-[11px] sm:gap-x-4 uppercase leading-none tracking-[0.27em] text-white/85 sm:text-xs min-[1400px]:contents ${FS}`}
        >
          {/* each word and dash pinned to the mockup's x at desktop */}
          {FLOW.map((step, i) => (
            <span key={step.word} className="flex items-center gap-x-2.5 sm:gap-x-4 min-[1400px]:contents">
              {i > 0 && (
                <span
                  aria-hidden="true"
                  style={at({ x: FLOW_DASHES[i - 1][0], y: 174.5, w: FLOW_DASHES[i - 1][1], h: 1.5 })}
                  className={`h-px w-4 bg-white/60 sm:w-6 ${POS} ${W} ${H}`}
                />
              )}
              <span style={at({ x: step.x, y: 166.7 })} className={`whitespace-nowrap ${POS}`}>
                {step.word}
              </span>
            </span>
          ))}
        </motion.p>
      </div>

      {/* ── card outlines (desktop composition) ─────────────────────── */}
      <svg
        viewBox="0 0 2168 725"
        fill="none"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden h-full w-full min-[1400px]:block"
      >
        <defs>
          {cards.map((_, k) => (
            <linearGradient key={k} id={`wwdb-fade-${k}`} gradientUnits="userSpaceOnUse" x1={R[k]} y1="0" x2={R[k + 1]} y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity={k === 0 ? 0.8 : 0.16} />
              <stop offset="0.65" stopColor="#fff" stopOpacity={k === 0 ? 0.8 : 0.3} />
              <stop offset="1" stopColor="#fff" stopOpacity="0.72" />
            </linearGradient>
          ))}
        </defs>
        {cards.map((c, k) => (
          <g key={k}>
            {k > 0 && (
              <motion.path
                d={bottom(k)}
                stroke={`url(#wwdb-fade-${k})`}
                strokeWidth="1.6"
                initial={reduce ? undefined : { pathLength: 0 }}
                animate={{ pathLength: show ? 1 : 0 }}
                transition={{ duration: 1.1, delay: reduce ? 0 : 0.3 + k * 0.08, ease: EASE }}
              />
            )}
            <motion.path
              d={bright(k)}
              stroke="#fff"
              strokeOpacity="0.78"
              strokeWidth="1.6"
              initial={reduce ? undefined : { pathLength: 0 }}
              animate={{ pathLength: show ? 1 : 0 }}
              transition={{ duration: 1.1, delay: reduce ? 0 : 0.25 + k * 0.08, ease: EASE }}
            />
            {k < 7 && <circle cx={c.cx + 48.5} cy="352" r="3.5" fill="#fff" fillOpacity="0.85" />}
          </g>
        ))}
      </svg>

      {/* ── the eight cards ─────────────────────────────────────────── */}
      <ol className="mx-auto mt-16 grid max-w-7xl grid-cols-1 gap-x-4 gap-y-14 sm:grid-cols-2 lg:grid-cols-4 min-[1400px]:contents">
        {cards.map((c, k) => {
          const n = String(k + 1).padStart(2, '0');
          const label = `${c.title[0]} ${c.title[1]}`;
          return (
            <motion.li
              key={label}
              variants={reduce ? undefined : rise}
              custom={0.3 + k * 0.06}
              className="relative flex flex-col rounded-[28px] border border-white/25 px-6 pb-6 pt-16 min-[1400px]:contents"
            >
              <span
                style={at({ x: c.nx, y: 307.1, fs: 19.29 })}
                className={`absolute right-6 top-5 text-sm font-light leading-none text-white/80 min-[1400px]:right-auto ${POS} ${FS}`}
              >
                {n}
              </span>
              <span
                style={at({ x: c.cx - CR, y: CY - CR, w: CR * 2, h: CR * 2 })}
                className={`absolute -top-9 left-6 flex h-[72px] w-[72px] items-center justify-center rounded-full border-[1.5px] border-white/75 bg-black text-white min-[1400px]:border-2 ${POS} ${W} ${H}`}
              >
                {c.icon('h-[52%] w-[52%]')}
              </span>
              <h4
                style={at({ x: c.tx, y: 440.8, fs: 21.71, lh: 1.405 })}
                className={`text-lg font-semibold leading-snug text-white min-[1400px]:whitespace-nowrap min-[1400px]:leading-[var(--lh)] ${POS} ${FS}`}
              >
                {c.title[0]}
                <br className="hidden min-[1400px]:inline" /> {c.title[1]}
              </h4>
              <p
                style={at({ x: c.tx, y: 512.8, fs: 16.74, lh: 1.643 })}
                className={`mt-3 flex-1 text-sm font-light leading-relaxed text-white/75 min-[1400px]:mt-0 min-[1400px]:whitespace-nowrap min-[1400px]:leading-[var(--lh)] ${POS} ${FS}`}
              >
                {c.desc[0]}
                <br className="hidden min-[1400px]:inline" /> {c.desc[1]}
                <br className="hidden min-[1400px]:inline" /> {c.desc[2]}
              </p>
            </motion.li>
          );
        })}
      </ol>
    </motion.div>
  );
}
