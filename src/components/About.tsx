import { motion, useInView, useReducedMotion, type Variants } from 'framer-motion';
import { Bot, Brain, CodeXml, Monitor, Palette, Pencil, PenTool, Sparkle, type LucideIcon } from 'lucide-react';
import { createContext, useContext, useRef, type CSSProperties, type ReactNode } from 'react';
import { useContactModal } from '../context/useContactModal';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { BrandIcon, type BrandName } from './BrandIcon';

const EASE = [0.16, 1, 0.3, 1] as const;

// ---------------------------------------------------------------------------
// Desktop (xl+) is a scaled copy of the About mockup (1774 x 887): the section
// is a container (container-type: inline-size) and every xl position / size
// below is in mockup px, passed as CSS variables and scaled by
// `var(--x) * 100cqw / 1774`. Text specs (x, y, fs, per-line letter-spacing
// `ls` in em, line-height `L`) were fitted so each line's ink box lands on the
// mockup's. Below xl the same content stacks in normal flow.
// The card's photo strip is cut from the mockup.
// ---------------------------------------------------------------------------

type Spec = { x: number; y: number; fs?: number; ls?: number[]; L?: number; w?: number; h?: number };
const at = ({ x, y, fs, w, h, L }: Spec) =>
  ({ '--x': x, '--y': y, '--fs': fs, '--w': w, '--h': h, '--lh': L }) as CSSProperties;
const POS = 'xl:absolute xl:left-[calc(var(--x)*100cqw/1774)] xl:top-[calc(var(--y)*100cqw/1774)]';
// Never below 11px: on 1280-1500px screens the scaled micro-labels would
// otherwise drop to 8-10px.
const FS = 'xl:text-[length:max(11px,calc(var(--fs)*100cqw/1774))]';
const W = 'xl:w-[calc(var(--w)*100cqw/1774)]';
const H = 'xl:h-[calc(var(--h)*100cqw/1774)]';
// Mockup content edges for .frame-fit: text starts 86px in, chips end 47px short;
// first ink 57px from the top, last 66px from the bottom (the hero card above
// ends 20px before its section does).
const FIT = { '--wm': 1774, '--a': 86, '--b': 47, '--t': 57, '--bt': 66, '--gt': 'calc(var(--sy) - 20px)', '--gb': 'calc(var(--sy) / 2)' } as CSSProperties;
const LS = 'xl:tracking-[calc(var(--ls)*1em)]';

const rise: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: (delay: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay, ease: EASE } }),
};
const draw: Variants = {
  hidden: { scaleX: 0 },
  visible: (delay: number = 0) => ({ scaleX: 1, transition: { duration: 1, delay, ease: EASE } }),
};

// Entrance stagger from the element's place in the composition: left to right,
// then top to bottom.
const delayAt = (x: number, y: number) => 0.05 + (x / 1774) * 0.45 + (y / 887) * 0.2;
const MOTION = { p: motion.p, span: motion.span, h3: motion.h3 };

// Per-element entrance (desktop composition only). Below xl the stacked
// section rises in as one block instead -- animating ~50 separate layers cost
// phones a visible stutter on entry.
const Stagger = createContext(true);
const useRise = () => (useContext(Stagger) ? rise : undefined);

// One positioned text element; each line keeps the mockup's break (and its own
// fitted letter-spacing) at xl and flows freely below it.
function Txt({
  spec,
  lines,
  className = '',
  as = 'p',
  free = false,
}: {
  spec: Spec;
  lines: ReactNode[];
  className?: string;
  as?: 'p' | 'span' | 'h3';
  /** sits in a flex row instead of being placed absolutely at xl */
  free?: boolean;
}) {
  const Tag = MOTION[as];
  return (
    <Tag
      variants={useRise()}
      custom={delayAt(spec.x, spec.y)}
      style={at(spec)}
      className={`${free ? '' : POS} ${FS} xl:whitespace-nowrap ${spec.L ? 'xl:leading-[var(--lh)]' : 'xl:leading-none'} ${className}`}
    >
      {lines.map((line, i) => (
        <span key={i} style={{ '--ls': spec.ls?.[i] ?? 0 } as CSSProperties} className={`${LS} xl:block`}>
          {i > 0 && <span className="xl:hidden"> </span>}
          {line}
        </span>
      ))}
    </Tag>
  );
}

// Fitted text specs (mockup px).
const T = {
  eyebrowAbout: { x: 87, y: 90.2, fs: 18.57, ls: [0.1411] },
  hello: { x: 85, y: 175.9, fs: 19.29, ls: [0.3219] },
  name: { x: 81, y: 196.9, fs: 107.14, ls: [-0.065] },
  role: { x: 85, y: 311.5, fs: 48.57, ls: [-0.0263, 0.0043], L: 1.0912 },
  bold: { x: 84, y: 419.3, fs: 51.43, ls: [-0.0475] },
  para: { x: 85, y: 517.5, fs: 19.75, ls: [0.0052, -0.0182], L: 1.4684 },
  tiny: { x: 86, y: 812.3, fs: 11.43, ls: [0.2917] },
  journey: { x: 676, y: 125.6, fs: 17.86, ls: [0.111] },
  br01: { x: 1670, y: 57.2, fs: 18.57, ls: [0.1045] },
  br02: { x: 1672, y: 481.2, fs: 18.57, ls: [0.024] },
  myid: { x: 1181, y: 106.6, fs: 17.86, ls: [0.2335] },
  tech: { x: 1181, y: 483.4, fs: 17.14, ls: [0.1767] },
  always: { x: 1560, y: 808.4, fs: 12.14, ls: [0.2799] },
};

const stats = [
  {
    n: '01', value: '50+', label: 'Projects', desc: ['Web apps, websites, and', 'creative solutions.'],
    nS: { x: 675, y: 196.8, fs: 21.43, ls: [0.1116] }, vS: { x: 734, y: 175.9, fs: 69.29, ls: [0.0004] },
    lS: { x: 733, y: 251.2, fs: 18.57, ls: [0.1462] }, dS: { x: 734, y: 281, fs: 15.69, ls: [-0.0226, -0.0159], L: 1.211 },
  },
  {
    n: '02', value: '1.5+', label: 'Years Experience', desc: ['Turning ideas into', 'functional products.'],
    nS: { x: 675, y: 394.8, fs: 21.43, ls: [0.1116] }, vS: { x: 733, y: 372.9, fs: 69.29, ls: [-0.023] },
    lS: { x: 734, y: 448.2, fs: 18.57, ls: [0.0896] }, dS: { x: 734, y: 478, fs: 15.69, ls: [-0.0089, -0.0001], L: 1.211 },
  },
  {
    n: '03', value: '100%', label: 'Client Focus', desc: ['Quality, deadlines and', 'satisfaction.'],
    nS: { x: 676, y: 593.8, fs: 21.43, ls: [0.0183] }, vS: { x: 733, y: 572.9, fs: 69.29, ls: [-0.0312] },
    lS: { x: 734, y: 646.2, fs: 18.57, ls: [0.1566] }, dS: { x: 734, y: 675.5, fs: 15.69, ls: [0.0216, 0.0255], L: 1.4022 },
  },
];

const flow = [
  { word: 'Ideas', s: { x: 665, y: 776.3, fs: 11.43, ls: [0.238] } },
  { word: 'Code', s: { x: 786, y: 776.3, fs: 11.43, ls: [0.2329] } },
  { word: 'Design', s: { x: 903, y: 776.3, fs: 11.43, ls: [0.2521] } },
  { word: 'Impact', s: { x: 1035, y: 776.3, fs: 11.43, ls: [0.2458] } },
];
const FLOW_ARROWS = [741, 858, 990];

const identity: { title: string; desc: string; icon: LucideIcon; tile: number; tS: Spec; dS: Spec }[] = [
  { title: 'Development', desc: 'Clean, efficient and scalable code.', icon: CodeXml, tile: 160, tS: { x: 1298, y: 173.2, fs: 18.57, ls: [0.0653] }, dS: { x: 1298, y: 203.5, fs: 17.02, ls: [0.0069] } },
  { title: 'Design', desc: 'Simple, modern and user-focused design.', icon: Pencil, tile: 262, tS: { x: 1298, y: 275.2, fs: 18.57, ls: [0.0692] }, dS: { x: 1298, y: 305.5, fs: 17.02, ls: [-0.0093] } },
  { title: 'Digital Experience', desc: 'Meaningful and impactful experiences.', icon: Monitor, tile: 364, tS: { x: 1297, y: 377.2, fs: 18.57, ls: [0.0816] }, dS: { x: 1298, y: 407.5, fs: 17.02, ls: [-0.0028] } },
];

// The mockup's technology pills: box (x, row, width) and mark.
type ChipIcon = { brand: BrandName } | { lucide: LucideIcon; fill?: boolean };
const ROW_Y = [524.5, 579, 633.5, 688, 743];
const chips: { label: string; icon: ChipIcon; x: number; row: number; w: number }[] = [
  { label: 'HTML', icon: { brand: 'html5' }, x: 1180, row: 0, w: 110 },
  { label: 'CSS', icon: { brand: 'css3' }, x: 1306, row: 0, w: 98 },
  { label: 'Bootstrap', icon: { brand: 'bootstrap' }, x: 1419, row: 0, w: 134 },
  { label: 'JavaScript', icon: { brand: 'javascript' }, x: 1568, row: 0, w: 135 },
  { label: 'React', icon: { brand: 'react' }, x: 1180, row: 1, w: 110 },
  { label: 'WordPress', icon: { brand: 'wordpress' }, x: 1305, row: 1, w: 140 },
  { label: 'Elementor', icon: { brand: 'elementor' }, x: 1460, row: 1, w: 135 },
  { label: 'Shopify', icon: { brand: 'shopify' }, x: 1610, row: 1, w: 117 },
  { label: 'UI/UX', icon: { lucide: PenTool }, x: 1180, row: 2, w: 109 },
  { label: 'Graphic Design', icon: { lucide: Palette }, x: 1304, row: 2, w: 179 },
  { label: 'Meta Ads', icon: { brand: 'meta' }, x: 1498, row: 2, w: 133 },
  { label: 'AI Assisted Development', icon: { lucide: Brain }, x: 1180, row: 3, w: 253 },
  { label: 'Prompt Engineering', icon: { lucide: Sparkle, fill: true }, x: 1450, row: 3, w: 202 },
  { label: 'AI Automation', icon: { lucide: Bot }, x: 1180, row: 4, w: 169 },
];

function ChipMark({ icon }: { icon: ChipIcon }) {
  const cls = 'h-[1.15em] w-[1.15em] shrink-0 xl:h-[calc(21*100cqw/1774)] xl:w-[calc(21*100cqw/1774)]';
  if ('brand' in icon) return <BrandIcon name={icon.brand} className={cls} />;
  const Icon = icon.lucide;
  return <Icon className={cls} strokeWidth={1.6} fill={icon.fill ? 'currentColor' : 'none'} aria-hidden="true" />;
}


// A thin rule (desktop composition); `fade` trails it off to the right.
function Rule({ s, className = '', fade = false, delay = 0.2 }: { s: Spec; className?: string; fade?: boolean; delay?: number }) {
  return (
    <motion.span
      aria-hidden="true"
      variants={draw}
      custom={delay}
      style={{ ...at(s), transformOrigin: 'left' }}
      className={`hidden xl:block ${POS} ${W} ${H} ${fade ? 'bg-gradient-to-r' : ''} ${className}`}
    />
  );
}

const EYEBROW = 'font-albert text-xs font-medium uppercase leading-none tracking-[0.2em] text-white sm:text-sm';
// Metallic fill of the mockup's bold lines.
const SILVER = 'bg-[linear-gradient(100deg,#ffffff_0%,#f3f3f3_45%,#bdbdbd_100%)] bg-clip-text text-transparent';

export default function About() {
  const reduce = Boolean(useReducedMotion());
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px -15% 0px' });
  const show = reduce || inView;
  const reveal = reduce ? {} : { initial: 'hidden' as const, animate: show ? ('visible' as const) : ('hidden' as const) };
  const { open: openContactModal } = useContactModal();
  const isXl = useMediaQuery('(min-width: 1280px)');
  const riseXl = isXl ? rise : undefined;

  return (
    <section
      ref={ref}
      id="about"
      className="relative overflow-hidden bg-black pb-[calc(var(--sy)/2)] pt-[calc(var(--sy)_-_8px)] font-albert sm:pt-[calc(var(--sy)_-_16px)] md:pt-[calc(var(--sy)_-_20px)] xl:py-0"
    >
      {/* the scaled composition sits on the shared frame (see .frame-fit) */}
      <div style={FIT} className="frame relative [container-type:inline-size] xl:frame-fit xl:aspect-[1774/887]">
      <Stagger.Provider value={isXl}>
      <motion.div {...reveal} variants={isXl ? undefined : rise} custom={0} className="relative xl:static">
        {/* ── LEFT ────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-5 xl:contents">
          <Txt as="span" spec={T.eyebrowAbout} lines={['About me']} className={EYEBROW} />
          <span className="h-px w-16 bg-white/50 xl:hidden" aria-hidden="true" />
        </div>
        <Rule s={{ x: 229, y: 97.5, w: 233, h: 1 }} fade className="from-white/70 via-white/60 to-white/30" delay={0.1} />

        <h2 className="mt-10 uppercase xl:mt-0">
          <Txt as="span" spec={T.hello} lines={['Hello, I’m']} className="block text-sm font-medium tracking-[0.3em] text-white sm:text-base" />
          <Txt
            as="span"
            spec={T.name}
            lines={['Divyaraj.']}
            className={`mt-3 block font-outfit text-[clamp(3.2rem,17cqw,6.7rem)] font-extrabold leading-none tracking-[-0.05em] xl:mt-0 ${SILVER}`}
          />
          <Txt
            as="span"
            spec={T.role}
            lines={['A developer,', 'designer &']}
            className="mt-3 block font-outfit text-[clamp(1.9rem,9cqw,3rem)] font-light leading-[1.09] text-white/[0.78] xl:mt-0"
          />
          <Txt
            as="span"
            spec={T.bold}
            lines={['Problem solver.']}
            className={`block font-outfit text-[clamp(2rem,9.5cqw,3.2rem)] font-bold leading-[1.09] tracking-[-0.03em] ${SILVER}`}
          />
        </h2>

        <motion.span
          aria-hidden="true"
          variants={draw}
          custom={0.3}
          style={{ ...at({ x: 85, y: 493.8, w: 44, h: 1.5 }), transformOrigin: 'left' }}
          className={`mt-6 block h-px w-11 bg-white/75 ${POS} ${W} ${H} xl:mt-0`}
        />

        <Txt spec={T.para} lines={['I build digital experiences through code,', 'design, and visual thinking.']} className="mt-6 max-w-md text-lg leading-[1.47] text-white/90 xl:mt-0" />

        <div className="mt-8 flex flex-wrap items-center gap-4 xl:contents">
          <motion.button
            type="button"
            variants={riseXl}
            custom={delayAt(84.5, 614.5)}
            onClick={openContactModal}
            data-cursor="cta"
            style={at({ x: 84.5, y: 614.5, w: 250, h: 54, fs: 14.29 })}
            className={`group flex h-12 items-center justify-between gap-10 border-[1.5px] border-white/90 px-6 text-xs font-medium uppercase leading-none tracking-[0.136em] text-white transition-colors duration-300 hover:bg-white hover:text-black ${POS} ${W} ${H} ${FS} xl:gap-0 xl:pl-[calc(27*100cqw/1774)] xl:pr-[calc(28*100cqw/1774)]`}
          >
            Let&rsquo;s connect
            <svg viewBox="0 0 16 8" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true" className="h-[0.56em] w-[1.12em] shrink-0 transition-transform duration-300 group-hover:translate-x-1">
              <path d="M0 4h15M11.5.5 15 4l-3.5 3.5" />
            </svg>
          </motion.button>
        </div>

        {/* caption + rule: one flex row at xl too, so the rule gives way if the
            11px floor makes the caption wider than the mockup's */}
        <div
          style={at({ x: 86, y: 807.5, w: 472, h: 20 })}
          className={`mt-10 flex items-center gap-5 ${POS} ${W} ${H} xl:mt-0 xl:gap-[calc(27*100cqw/1774)]`}
        >
          <Txt free as="span" spec={T.tiny} lines={['Turning ideas into digital reality']} className="text-[0.6875rem] font-medium uppercase leading-none tracking-[0.29em] text-white/60" />
          <span className="h-px min-w-6 flex-1 bg-white/20 xl:bg-white/[0.22]" aria-hidden="true" />
        </div>

        {/* ── CENTRE: the journey card ────────────────────────────────── */}
        <div className="relative mt-14 rounded-md border border-white/20 bg-[#0b0b0b] p-6 sm:p-8 xl:contents">
          <motion.span
            aria-hidden="true"
            variants={riseXl}
            custom={0.15}
            style={at({ x: 631, y: 89.5, w: 492.5, h: 727 })}
            className={`hidden rounded-[calc(5*100cqw/1774)] border border-b-white/20 border-l-white/[0.36] border-r-white/[0.28] border-t-white/20 bg-[#0b0b0b] xl:block ${POS} ${W} ${H}`}
          />
          <img
            src="/about-strip.webp"
            alt=""
            aria-hidden="true"
            width={129}
            height={658}
            loading="lazy"
            decoding="async"
            style={at({ x: 993, y: 91, w: 129, h: 658 })}
            className={`pointer-events-none hidden select-none xl:block ${POS} ${W} ${H}`}
          />

          <div className="flex items-center gap-5 xl:contents">
            <Txt as="span" spec={T.journey} lines={['My journey']} className={EYEBROW} />
            <span className="h-px w-16 bg-white/50 xl:hidden" aria-hidden="true" />
          </div>
          <Rule s={{ x: 836, y: 133, w: 113, h: 1 }} className="bg-white/55" delay={0.3} />

          <ul className="mt-6 divide-y divide-white/15 xl:contents">
            {stats.map((s, i) => (
              <li key={s.n} className="grid grid-cols-[2.5rem_1fr] gap-x-3 py-6 first:pt-0 xl:contents">
                <Txt as="span" spec={s.nS} lines={[s.n]} className="pt-2 xl:pt-0 text-base font-medium leading-none text-white/60" />
                <div className="flex flex-col xl:contents">
                  <Txt as="p" spec={s.lS} lines={[s.label]} className="order-2 mt-3 text-sm font-medium uppercase leading-none tracking-[0.14em] text-white xl:mt-0" />
                  <Txt as="p" spec={s.vS} lines={[s.value]} className="order-1 font-outfit text-5xl font-bold leading-none text-white" />
                  <Txt as="p" spec={s.dS} lines={s.desc} className="order-3 mt-3 text-sm leading-snug text-white/70 xl:mt-0" />
                </div>
                {i < 2 && <Rule s={{ x: 675, y: [347.5, 545][i], w: 289, h: 1 }} className="bg-white/[0.24]" delay={0.4 + i * 0.1} />}
              </li>
            ))}
          </ul>

          <Rule s={{ x: 663, y: 749.5, w: 430, h: 1 }} className="bg-white/[0.26]" delay={0.6} />
          <div className="mt-6 flex items-center justify-between border-t border-white/15 pt-5 text-[0.6875rem] font-medium uppercase tracking-[0.24em] text-white/80 sm:text-xs xl:contents">
            {flow.map((f, i) => (
              <span key={f.word} className="contents">
                <Txt as="span" spec={f.s} lines={[f.word]} />
                {i < 3 && (
                  <svg
                    viewBox="0 0 14 8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    aria-hidden="true"
                    style={at({ x: FLOW_ARROWS[i], y: 778, w: 14, h: 8 })}
                    className={`h-2 w-3.5 text-white/80 ${POS} ${W} ${H}`}
                  >
                    <path d="M0 4h13M10 1l3 3-3 3" />
                  </svg>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* ── RIGHT: identity + technologies ──────────────────────────── */}
        <div className="mt-16 xl:contents">
          <div className="flex items-center gap-5 xl:contents">
            <Txt as="span" spec={T.myid} lines={['My identity']} className={EYEBROW} />
            <span className="h-px flex-1 bg-white/60 xl:hidden" aria-hidden="true" />
            <Txt as="span" spec={T.br01} lines={['[ 01 ]']} className="text-xs leading-none tracking-[0.1em] text-white/85 sm:text-sm" />
          </div>
          <Rule s={{ x: 1363, y: 114.3, w: 185, h: 1.5 }} className="bg-white/80" delay={0.3} />

          <ul className="mt-6 xl:contents">
            {identity.map((item, i) => {
              const Icon = item.icon;
              return (
                <li key={item.title} className="flex items-center gap-5 border-b border-white/15 py-5 xl:contents">
                  <motion.span
                    variants={riseXl}
                    custom={delayAt(1185, item.tile)}
                    style={at({ x: 1185, y: item.tile, w: 72, h: 71 })}
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-white/[0.22] bg-[linear-gradient(145deg,#1a1a1a_0%,#0c0c0c_70%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_24px_rgba(0,0,0,0.5)] ${POS} ${W} ${H} xl:rounded-[calc(7*100cqw/1774)]`}
                  >
                    <Icon className="h-7 w-7 text-white xl:h-[65%] xl:w-[65%]" strokeWidth={1.3} aria-hidden="true" />
                  </motion.span>
                  <div className="xl:contents">
                    <Txt as="h3" spec={item.tS} lines={[item.title]} className="text-sm font-medium uppercase leading-none tracking-[0.12em] text-white" />
                    <Txt spec={item.dS} lines={[item.desc]} className="mt-2 text-sm leading-snug text-white/85 xl:mt-0" />
                  </div>
                  {i < 2 && <Rule s={{ x: 1297, y: [246, 348][i], w: 398, h: 1 }} className="bg-white/[0.16]" delay={0.4 + i * 0.08} />}
                </li>
              );
            })}
          </ul>

          <div className="mt-12 flex items-center gap-5 xl:contents">
            <Txt as="span" spec={T.tech} lines={['Technologies']} className={EYEBROW} />
            <span className="h-px flex-1 bg-white/60 xl:hidden" aria-hidden="true" />
            <Txt as="span" spec={T.br02} lines={['[ 02 ]']} className="text-xs leading-none tracking-[0.1em] text-white/85 sm:text-sm" />
          </div>
          <Rule s={{ x: 1373, y: 489.8, w: 177, h: 1.5 }} className="bg-white/70" delay={0.55} />

          <ul className="mt-6 flex flex-wrap gap-2.5 xl:contents">
            {chips.map((c) => (
              <motion.li
                key={c.label}
                variants={riseXl}
                custom={delayAt(c.x, ROW_Y[c.row])}
                style={at({ x: c.x, y: ROW_Y[c.row], w: c.w, h: 40.5, fs: 15.71 })}
                className={`flex h-10 items-center gap-2.5 rounded-full border border-white/20 bg-white/[0.02] px-4 text-sm leading-none tracking-[-0.026em] text-white/90 ${POS} ${W} ${H} ${FS} xl:gap-[calc(10.5*100cqw/1774)] xl:px-0 xl:pl-[calc(18.5*100cqw/1774)]`}
              >
                <ChipMark icon={c.icon} />
                <span className="whitespace-nowrap">{c.label}</span>
              </motion.li>
            ))}
          </ul>

          {/* rule + dot + label as one row (the rule gives way to the label) */}
          <div
            style={at({ x: 1180, y: 804.5, w: 538, h: 20 })}
            className={`mt-10 flex items-center gap-9 ${POS} ${W} ${H} xl:mt-0 xl:gap-[calc(36.5*100cqw/1774)]`}
          >
            <span aria-hidden="true" className="relative h-px min-w-6 flex-1 bg-white/30">
              <span className="absolute right-0 top-1/2 h-[5px] w-[5px] -translate-y-1/2 rounded-full bg-white/75 xl:h-[calc(5*100cqw/1774)] xl:w-[calc(5*100cqw/1774)]" />
            </span>
            <Txt free as="span" spec={T.always} lines={['Always learning']} className="text-[0.6875rem] font-medium uppercase leading-none tracking-[0.28em] text-white/65" />
          </div>
        </div>
      </motion.div>
      </Stagger.Provider>
      </div>
    </section>
  );
}
