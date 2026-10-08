import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { useFinePointer } from '../hooks/useMediaQuery';
import { aboutAbility, aboutSkills, aboutSummary } from '../data/content';

const EASE = [0.16, 1, 0.3, 1] as const;

const identityItems = [
  { n: '01', label: 'Development' },
  { n: '02', label: 'Design' },
  { n: '03', label: 'Digital Experience' },
];

// Real technology names get two size tiers instead of a uniform pill grid —
// deliberate rhythm, not a random word cloud.
const CORE_SKILLS = new Set(['HTML', 'CSS', 'JavaScript', 'React', 'WordPress', 'Shopify', 'UI/UX', 'Graphic Design']);

function chunk<T>(items: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
const skillGroups = chunk(aboutSkills, 3);

// A line-level reveal (mask + translateY, matching the site's existing
// overflow-hidden pull-up vocabulary) rather than word-by-word — reads as a
// deliberate editorial statement, not a typewriter.
// Variant labels (not plain targets) so an Emphasis underline inside the
// line inherits this same in-view trigger -- see Emphasis below.
const revealLine = (delay: number) => ({
  hidden: { y: '100%', opacity: 0 },
  visible: { y: '0%', opacity: 1, transition: { duration: 0.85, delay, ease: EASE } },
});

function RevealLine({ children, delay, reduce }: { children: ReactNode; delay: number; reduce: boolean }) {
  return (
    <span className="block overflow-hidden pb-[0.1em]">
      <motion.span
        className="block"
        initial={reduce ? undefined : 'hidden'}
        whileInView={reduce ? undefined : 'visible'}
        variants={reduce ? undefined : revealLine(delay)}
        viewport={{ once: true, margin: '-15% 0px -15% 0px' }}
      >
        {children}
      </motion.span>
    </span>
  );
}

// Tiny brightness lift + a hairline underline that draws in — the "active
// word" treatment for DEVELOPER / DESIGN / DIGITAL / CREATIVE.
//
// The underline has no in-view trigger of its own: it is a variant child of
// the line or paragraph it sits in, so it fires on exactly that element's
// reveal (then waits its own `delay`). Earlier versions observed the 1px
// line itself (a zero-area box IntersectionObserver reports only
// intermittently) and then the word (small, mostly clipped by the reveal
// mask, so a fast flick-scroll could skip it in WebKit) -- either way some
// underlines never drew. (Viewport margins site-wide are also vertical-only:
// a bare '-15%' insets the left/right edges too, so a short word near the
// column edge, like "digital", could never count as in view.) `inMask` is
// for words inside a RevealLine, whose overflow-hidden mask would otherwise
// clip an underline hung below the word's own box.
const emphasisUnderline = (delay: number) => ({
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.6, delay, ease: EASE } },
});

function Emphasis({
  children,
  delay,
  reduce,
  inMask = false,
}: {
  children: string;
  delay: number;
  reduce: boolean;
  inMask?: boolean;
}) {
  return (
    <span className="relative inline-block text-cream">
      {children}
      <motion.span
        aria-hidden="true"
        variants={reduce ? undefined : emphasisUnderline(delay)}
        style={{ transformOrigin: 'left' }}
        className={`absolute left-0 h-px w-full bg-cream/45 ${inMask ? 'bottom-0' : '-bottom-1'}`}
      />
    </span>
  );
}

// As RevealLine: variant labels so the Emphasis underlines inside inherit
// this paragraph's in-view trigger.
const introParagraph = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.7, ease: EASE } },
};

interface SignatureConnectorProps {
  reduce: boolean;
  isFine: boolean;
}

// The one signature visual: a custom vertical "signal" marker connecting a
// DEV node to a DESIGN node — a drawn line, then a single traveling pulse
// once the section enters view (not a generic circle, not a repeating loop).
const connectorLine = {
  hidden: { scaleY: 0 },
  visible: { scaleY: 1, transition: { duration: 0.9, delay: 0.15, ease: EASE } },
};
const connectorNode = (delay: number) => ({
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, delay, ease: EASE } },
});
// Travels by translating a full-height wrapper (y % = % of the connector's
// height, i.e. the same positions `top` gave) so the pulse is a
// compositor-only transform instead of a per-frame layout change.
const connectorDot = {
  hidden: { y: '8%', opacity: 0 },
  visible: {
    y: ['8%', '8%', '92%', '92%'],
    opacity: [0, 1, 1, 0],
    transition: { duration: 1.4, delay: 1.05, ease: EASE, times: [0, 0.08, 0.85, 1] },
  },
};

function SignatureConnector({ reduce, isFine }: SignatureConnectorProps) {
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const springX = useSpring(mvX, { stiffness: 140, damping: 18, mass: 0.4 });
  const springY = useSpring(mvY, { stiffness: 140, damping: 18, mass: 0.4 });
  const active = isFine && !reduce;
  const rectRef = useRef<DOMRect | null>(null);

  const handleEnter = (e: MouseEvent<HTMLDivElement>) => {
    if (!active) return;
    rectRef.current = e.currentTarget.getBoundingClientRect();
  };
  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!active || !rectRef.current) return;
    const rect = rectRef.current;
    mvX.set(((e.clientX - rect.left) / rect.width - 0.5) * 8);
    mvY.set(((e.clientY - rect.top) / rect.height - 0.5) * 6);
  };
  const handleLeave = () => {
    mvX.set(0);
    mvY.set(0);
  };

  return (
    <motion.div
      onMouseEnter={handleEnter}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      initial={reduce ? undefined : 'hidden'}
      whileInView={reduce ? undefined : 'visible'}
      viewport={{ once: true, margin: '-15% 0px -15% 0px' }}
      style={active ? { x: springX, y: springY } : undefined}
      className="relative hidden lg:col-span-1 lg:flex lg:flex-col lg:items-center"
      aria-hidden="true"
    >
      <motion.div variants={reduce ? undefined : connectorNode(0.05)} className="flex flex-col items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full border border-cream/50" />
        <span className="text-[8px] uppercase tracking-[0.25em] text-cream/35">Dev</span>
      </motion.div>

      <motion.span
        variants={reduce ? undefined : connectorLine}
        style={{ transformOrigin: 'top' }}
        className="my-3 w-px flex-1 bg-cream/15"
      />

      {!reduce && (
        <motion.span variants={connectorDot} className="pointer-events-none absolute inset-0">
          <motion.span
            style={active ? { x: springX } : undefined}
            className="absolute left-1/2 top-0 h-1 w-1 -translate-x-1/2 rounded-full bg-cream"
          />
        </motion.span>
      )}

      <motion.div variants={reduce ? undefined : connectorNode(1.2)} className="flex flex-col items-center gap-2">
        <span className="text-[8px] uppercase tracking-[0.25em] text-cream/35">Design</span>
        <span className="h-1.5 w-1.5 rounded-full border border-cream/50" />
      </motion.div>
    </motion.div>
  );
}

// Mobile/tablet equivalent of the connector once the columns stack —
// reoriented horizontally rather than simply hidden.
// The in-view trigger sits on the row (real size), not on the 1px lines --
// see Emphasis above for why a scaleX(0) hairline can't observe itself.
const dividerLine = (delay: number) => ({
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.7, delay, ease: EASE } },
});

function MobileDivider({ reduce }: { reduce: boolean }) {
  return (
    <motion.div
      initial={reduce ? undefined : 'hidden'}
      whileInView={reduce ? undefined : 'visible'}
      viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
      className="flex items-center gap-3 py-1 lg:hidden"
      aria-hidden="true"
    >
      <motion.span
        variants={reduce ? undefined : dividerLine(0)}
        style={{ transformOrigin: 'left' }}
        className="h-px flex-1 bg-cream/15"
      />
      <span className="h-1.5 w-1.5 shrink-0 rounded-full border border-cream/40" />
      <motion.span
        variants={reduce ? undefined : dividerLine(0.15)}
        style={{ transformOrigin: 'right' }}
        className="h-px flex-1 bg-cream/15"
      />
    </motion.div>
  );
}

function IdentityList({ reduce }: { reduce: boolean }) {
  return (
    <div className="flex flex-col gap-2.5">
      {identityItems.map((item, i) => (
        <motion.div
          key={item.n}
          initial={reduce ? undefined : { opacity: 0, x: 22 }}
          whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
          transition={{ duration: 0.6, delay: 0.1 + i * 0.08, ease: EASE }}
          className="flex items-baseline gap-3 border-b border-cream/10 pb-2.5"
        >
          <span className="font-display text-xs text-cream/35">{item.n}</span>
          <span className="text-xs uppercase tracking-[0.2em] text-cream/70 sm:text-sm">{item.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

function SkillField({ reduce }: { reduce: boolean }) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-3">
      {skillGroups.map((group, gi) =>
        group.map((skill, si) => (
          <motion.span
            key={skill}
            initial={reduce ? undefined : { opacity: 0, y: 10 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
            transition={{ duration: 0.5, delay: 0.1 + gi * 0.12 + si * 0.04, ease: EASE }}
            // Mouse only: a touch tap fires emulated mouse events with no
            // matching leave, which would leave every other skill dimmed.
            onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(skill)}
            onPointerLeave={() => setHovered((h) => (h === skill ? null : h))}
            className={`relative cursor-default pb-0.5 transition-colors duration-300 ${
              CORE_SKILLS.has(skill) ? 'text-base font-medium sm:text-lg' : 'text-xs font-normal sm:text-sm'
            } ${hovered === null ? 'text-cream/70' : hovered === skill ? 'text-cream' : 'text-cream/25'}`}
          >
            {skill}
            <motion.span
              aria-hidden="true"
              initial={false}
              animate={{ scaleX: hovered === skill ? 1 : 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              style={{ transformOrigin: 'left' }}
              className="absolute bottom-0 left-0 h-px w-full bg-cream/60"
            />
          </motion.span>
        )),
      )}
    </div>
  );
}

export default function About() {
  const reduce = Boolean(useReducedMotion());
  const isFine = useFinePointer();

  return (
    <section id="about" className="relative bg-black px-4 py-16 sm:px-6 sm:py-20 md:py-24 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-y-10 lg:grid-cols-12 lg:gap-x-10 xl:gap-x-14">
          {/* LEFT — the signature statement */}
          <div className="lg:col-span-7">
            <motion.span
              initial={reduce ? undefined : { opacity: 0, y: 10 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE }}
              className="block text-xs uppercase tracking-[0.3em] text-cream/45"
            >
              About Me
            </motion.span>

            <h2 className="mt-6 max-w-xl font-display text-[clamp(1.9rem,1.15rem_+_3vw,3.4rem)] font-bold uppercase leading-[1.04] tracking-tight text-cream/75 sm:mt-8">
              <RevealLine delay={0.08} reduce={reduce}>
                I am <Emphasis delay={0.55} reduce={reduce} inMask>Divyaraj.</Emphasis>
              </RevealLine>
              <RevealLine delay={0.2} reduce={reduce}>
                A self-taught
              </RevealLine>
              <RevealLine delay={0.32} reduce={reduce}>
                <Emphasis delay={0.75} reduce={reduce} inMask>Developer.</Emphasis>
              </RevealLine>
              <RevealLine delay={0.46} reduce={reduce}>
                &amp; a <Emphasis delay={0.9} reduce={reduce} inMask>creative</Emphasis>
              </RevealLine>
              <RevealLine delay={0.56} reduce={reduce}>
                problem solver.
              </RevealLine>
            </h2>

            <motion.p
              initial={reduce ? undefined : 'hidden'}
              whileInView={reduce ? undefined : 'visible'}
              variants={reduce ? undefined : introParagraph}
              viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
              className="mt-8 max-w-sm text-sm leading-relaxed text-text-secondary sm:mt-10 sm:text-base"
            >
              I build <Emphasis delay={1.1} reduce={reduce}>digital</Emphasis> experiences through code,{' '}
              <Emphasis delay={1.2} reduce={reduce}>design</Emphasis>, and visual thinking.
            </motion.p>
          </div>

          <MobileDivider reduce={reduce} />
          <SignatureConnector reduce={reduce} isFine={isFine} />

          {/* RIGHT — identity, description, skill field */}
          <div className="lg:col-span-4 lg:col-start-9">
            <motion.span
              initial={reduce ? undefined : { opacity: 0, x: 16 }}
              whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE }}
              className="block text-xs uppercase tracking-[0.3em] text-cream/45"
            >
              Identity
            </motion.span>

            <div className="mt-6">
              <IdentityList reduce={reduce} />
            </div>

            <div className="mt-8 space-y-4">
              <motion.p
                initial={reduce ? undefined : { opacity: 0, x: 20 }}
                whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
                transition={{ duration: 0.65, delay: 0.1, ease: EASE }}
                className="text-sm leading-relaxed text-cream/75"
              >
                {aboutSummary}
              </motion.p>
              <motion.p
                initial={reduce ? undefined : { opacity: 0, x: 20 }}
                whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
                transition={{ duration: 0.65, delay: 0.18, ease: EASE }}
                className="text-xs leading-relaxed text-text-secondary"
              >
                {aboutAbility}
              </motion.p>
            </div>

            <motion.span
              initial={reduce ? undefined : { opacity: 0, x: 16 }}
              whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
              className="mt-9 block text-xs uppercase tracking-[0.3em] text-cream/45"
            >
              Technologies
            </motion.span>
            <div className="mt-5">
              <SkillField reduce={reduce} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
