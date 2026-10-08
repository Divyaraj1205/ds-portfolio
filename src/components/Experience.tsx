import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from 'framer-motion';
import {
  Atom,
  Briefcase,
  Code2,
  Compass,
  Camera,
  FileCode,
  Fingerprint,
  Globe,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  MessageSquare,
  MonitorCheck,
  Palette,
  PenTool,
  Rocket,
  Search,
  Settings2,
  ShoppingBag,
  Sparkles,
  Target,
  Type,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { capabilities, experienceResponsibilities, personal } from '../data/content';
import { useMediaQuery } from '../hooks/useMediaQuery';

const EASE = [0.16, 1, 0.3, 1] as const;

type IdentityId = 'developer' | 'designer';

const stagger: Variants = {
  closed: {},
  open: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const staggerItem: Variants = {
  closed: { opacity: 0, y: 10 },
  open: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

const webDev = capabilities.find((c) => c.title === 'Web Development');

const metaEngagement = 'Freelance / Client Projects';
const metaExperience = `${personal.experience} Experience`;

type StageId = 'discovery' | 'research' | 'strategy' | 'design' | 'development' | 'testing' | 'deployment';

interface StageData {
  id: StageId;
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const workStages: StageData[] = [
  {
    id: 'discovery',
    number: '01',
    title: 'Discovery',
    description: 'Understanding goals, users and requirements.',
    icon: Compass,
  },
  {
    id: 'research',
    number: '02',
    title: 'Research',
    description: 'Exploring context, references and constraints.',
    icon: Search,
  },
  {
    id: 'strategy',
    number: '03',
    title: 'Strategy',
    description: 'Planning structure, direction and approach.',
    icon: Target,
  },
  {
    id: 'design',
    number: '04',
    title: 'Design',
    description: 'Crafting UI, visuals and user experience.',
    icon: PenTool,
  },
  {
    id: 'development',
    number: '05',
    title: 'Development',
    description: 'Building responsive, functional interfaces.',
    icon: Code2,
  },
  {
    id: 'testing',
    number: '06',
    title: 'Testing',
    description: 'Reviewing quality, usability and performance.',
    icon: MonitorCheck,
  },
  {
    id: 'deployment',
    number: '07',
    title: 'Deployment',
    description: 'Launching, refining and delivering the result.',
    icon: Rocket,
  },
];

const NODE_COUNT = workStages.length;

interface RowPoint {
  x: number;
  y: number;
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

// The ball's continuous travel path runs straight through every icon-circle
// CENTER with no gaps, so getPointAtLength never has a discontinuity -- the
// ball is simply occluded by each capsule as it arrives at that step, then
// re-emerges as it continues toward the next one.
function buildCenterPath(points: RowPoint[]): string {
  if (points.length === 0) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) d += ` L ${points[i].x} ${points[i].y}`;
  return d;
}

// The 6 visible connector segments, each pulled back from both icon centers
// by `radius` so the drawn line never overlaps a capsule outline -- purely
// decorative, separate from the ball's own gap-free travel path above.
function buildConnectorSegments(points: RowPoint[], radius: number): string[] {
  const segments: string[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.hypot(dx, dy) || 1;
    const ux = dx / dist;
    const uy = dy / dist;
    const sx = a.x + ux * radius;
    const sy = a.y + uy * radius;
    const ex = b.x - ux * radius;
    const ey = b.y - uy * radius;
    segments.push(`M ${sx} ${sy} L ${ex} ${ey}`);
  }
  return segments;
}

// Measures the real rendered center of every step's icon circle relative to
// the row container -- geometry read from the DOM, never hand-typed
// coordinates -- so connectors and the ball land exactly on every node
// regardless of breakpoint, capsule size, or content-driven layout shifts.
interface RowGeometry {
  points: RowPoint[];
  iconRadius: number;
}

function useRowGeometry(
  containerRef: { current: HTMLDivElement | null },
  nodesRef: { current: (HTMLDivElement | null)[] },
  isCompact: boolean,
) {
  const [geo, setGeo] = useState<RowGeometry | null>(null);

  useLayoutEffect(() => {
    function measure() {
      const container = containerRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const next: RowPoint[] = [];
      let radius = 20;
      for (const el of nodesRef.current) {
        if (!el) return;
        const r = el.getBoundingClientRect();
        next.push({ x: r.left + r.width / 2 - containerRect.left, y: r.top + r.height / 2 - containerRect.top });
        radius = r.width / 2;
      }
      if (next.length !== NODE_COUNT) return;
      // Only commit genuinely new geometry: every commit rebuilds the path
      // and restarts the journey loop from step 01, so a no-op re-measure
      // (ResizeObserver's initial callback, the settle timer, a mobile
      // address-bar resize that doesn't move any node) must not reset it.
      setGeo((prev) => {
        if (
          prev &&
          Math.abs(prev.iconRadius - radius) < 0.5 &&
          prev.points.every((p, i) => Math.abs(p.x - next[i].x) < 0.5 && Math.abs(p.y - next[i].y) < 0.5)
        ) {
          return prev;
        }
        return { points: next, iconRadius: radius };
      });
    }
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(containerRef.current as HTMLDivElement);
    window.addEventListener('resize', measure);
    const settle = window.setTimeout(measure, 350);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
      window.clearTimeout(settle);
    };
  }, [isCompact, containerRef, nodesRef]);

  return geo;
}

// Entrance choreography: heading reveals, capsules stagger in, connectors
// draw center-outward across the row, then the continuous ball begins once
// everything has settled.
const CAPSULE_STAGGER_START = 0.3;
const CAPSULE_STAGGER_STEP = 0.1;
const CAPSULE_DURATION = 0.5;
const CONNECTOR_DRAW_START = CAPSULE_STAGGER_START + CAPSULE_STAGGER_STEP * 2;
const CONNECTOR_DRAW_STEP = 0.08;
const CONNECTOR_DRAW_DURATION = 0.5;
// Active/inactive color swap for a step: instant in both directions. The
// step must read as lit on the very frame the ball reaches it, and the step
// being left as subdued on that same frame -- even a short fade-out renders
// its first frame at full brightness, briefly showing two lit steps. (The
// former 500ms fade is what made the highlight trail behind the ball.) The
// arrival pulse ring supplies the softness instead.
const STEP_STATE_TRANSITION = 'duration-0';
const ENTRANCE_TOTAL_MS = Math.round(
  (CONNECTOR_DRAW_START + (NODE_COUNT - 2) * CONNECTOR_DRAW_STEP + CONNECTOR_DRAW_DURATION + 0.5) * 1000,
);

// Sequential journey timing: a single MotionValue (`progress`, 0->1) is the
// one source of truth for the whole journey -- ball position, discrete step
// activation, and connector-segment brightening are all pure functions of
// this one value, so they can never drift out of sync (no independent
// timer). Framer's own `animate()` drives it via its internal rAF loop -- no
// React re-render happens per frame; React state is only touched when the
// active step actually changes (once per step, exactly when the ball
// arrives), never per frame.
//
// Rather than gliding through at constant speed, the timeline alternates
// TRAVEL (the ball moves between two adjacent steps) and PAUSE (the ball
// holds still at a step so its active state is clearly readable) phases,
// encoded as one keyframe animation: every node position appears twice in a
// row (arrival, then pause-end) at the same value, which Framer holds as a
// plateau. The very last plateau (value 1, i.e. step 07) is held slightly
// longer to cover an invisible "flight home" gap, so the 07->01 restart
// never visibly jumps or reverses direction.
const STEP_TRAVEL_S = 1.4;
const STEP_PAUSE_S = 0.75;
const RETURN_FLIGHT_S = 1.1;
const BALL_FADE_S = 0.18;
const BALL_CORE_RADIUS = 2.4;

interface JourneyTimes {
  times: number[];
  totalSeconds: number;
}

// The travel/pause SCHEDULE (when each keyframe lands) depends only on the
// fixed timing constants above, never on node geometry, so it stays a
// module-level constant.
function buildJourneyTimes(): JourneyTimes {
  const rawTimes: number[] = [0];
  let t = 0;

  t += STEP_PAUSE_S;
  rawTimes.push(t);

  for (let i = 0; i < NODE_COUNT - 1; i++) {
    t += STEP_TRAVEL_S;
    rawTimes.push(t);
    t += STEP_PAUSE_S;
    rawTimes.push(t);
  }

  t += RETURN_FLIGHT_S;
  rawTimes.push(t);

  const totalSeconds = t;
  return { times: rawTimes.map((x) => x / totalSeconds), totalSeconds };
}

// The keyframe VALUES the ball travels through, in contrast, must land
// exactly on each node's real arc-length position along the row's own path
// (`nodeFractions`, derived from the same measured geometry the active-node
// detector uses below) rather than an assumed even split -- otherwise the
// ball's pause position drifts off-node whenever spacing isn't perfectly
// uniform (e.g. the mobile stacked layout, where per-stage description
// length shifts row heights slightly).
function buildJourneyKeyframes(nodeFractions: number[]): number[] {
  const keyframes: number[] = [nodeFractions[0], nodeFractions[0]];
  for (let i = 0; i < nodeFractions.length - 1; i++) {
    keyframes.push(nodeFractions[i + 1], nodeFractions[i + 1]);
  }
  keyframes.push(nodeFractions[nodeFractions.length - 1]);
  return keyframes;
}

const JOURNEY_TIMES = buildJourneyTimes();
const RETURN_START_FRACTION = (JOURNEY_TIMES.totalSeconds - RETURN_FLIGHT_S) / JOURNEY_TIMES.totalSeconds;
const BALL_FADE_FRACTION = BALL_FADE_S / JOURNEY_TIMES.totalSeconds;

// The ball fades in right as the cycle starts, stays fully visible through
// every travel and pause of the forward 01->07 journey (never fading
// between nodes), then fades out only once it's done resting at 07 -- right
// as the invisible return flight begins.
const BALL_OPACITY_KEYFRAMES = [0, 1, 1, 0, 0];
const BALL_OPACITY_TIMES = [
  0,
  BALL_FADE_FRACTION,
  RETURN_START_FRACTION,
  Math.min(1, RETURN_START_FRACTION + BALL_FADE_FRACTION),
  1,
];

interface ResponsibilityItem {
  text: string;
  icon: LucideIcon;
}
interface TechItem {
  name: string;
  icon: LucideIcon;
}

interface RoleData {
  id: IdentityId;
  number: string;
  title: string;
  category: string;
  tagline: string;
  responsibilities: ResponsibilityItem[];
  tech: TechItem[];
}

const roles: RoleData[] = [
  {
    id: 'developer',
    number: '01',
    title: 'Web Developer',
    category: webDev?.title ?? 'Web Development',
    tagline: 'Ideas / Develop / Deploy',
    responsibilities: [
      { text: experienceResponsibilities[0], icon: Code2 },
      { text: experienceResponsibilities[1], icon: Globe },
      { text: experienceResponsibilities[2], icon: ShoppingBag },
      { text: experienceResponsibilities[4], icon: Search },
      { text: experienceResponsibilities[5], icon: Sparkles },
      { text: experienceResponsibilities[6], icon: MessageSquare },
    ],
    tech: [
      { name: 'HTML', icon: Code2 },
      { name: 'CSS', icon: Palette },
      { name: 'Bootstrap', icon: Layers },
      { name: 'JavaScript', icon: FileCode },
      { name: 'React', icon: Atom },
      { name: 'WordPress', icon: Globe },
      { name: 'Elementor', icon: LayoutGrid },
      { name: 'Shopify', icon: ShoppingBag },
    ],
  },
  {
    id: 'designer',
    number: '02',
    title: 'Graphic Designer',
    category: 'Graphic Design',
    tagline: 'Ideas / Design / Impact',
    responsibilities: [
      { text: experienceResponsibilities[7], icon: PenTool },
      { text: experienceResponsibilities[8], icon: Camera },
      { text: experienceResponsibilities[9], icon: Fingerprint },
      { text: experienceResponsibilities[10], icon: ImageIcon },
      { text: experienceResponsibilities[11], icon: Type },
      { text: experienceResponsibilities[12], icon: MessageSquare },
    ],
    tech: [
      { name: 'Graphic Design', icon: Palette },
      { name: 'Brand Identity', icon: Fingerprint },
      { name: 'Adobe Photoshop', icon: ImageIcon },
      { name: 'Adobe Illustrator', icon: PenTool },
      { name: 'Canva', icon: Sparkles },
      { name: 'Figma', icon: Layers },
    ],
  },
];

// ============================================================================
// Experience Showcase -- a large premium editorial panel per role: a bordered
// surface (not a small card), a huge low-opacity number behind the content,
// a centered header, and a two-column icon-row body. A slow light travels
// along the panel's own border; only the panel currently nearest the
// viewport's center reads as fully active. One responsive composition
// serves desktop through mobile -- the two-column body collapses to a
// single column, which also gives the exact mobile order requested.
// ============================================================================

// The classic "animated gradient border" CSS technique: a padding-box/
// border-box mask difference leaves only a thin ring visible, inside which
// a slowly rotating conic gradient sweeps a soft highlight around the
// panel's own rounded rect -- no per-panel geometry measurement needed, it
// scales with the panel automatically.
//
// The rotation itself only mounts while the panel is anywhere near the
// viewport (`nearViewport`, a generous margin -- not the narrow "currently
// dominant" band `active` uses). A 10s linear loop otherwise keeps ticking
// forever in the background even while the user has scrolled to Contact or
// back to Hero, for a visual nobody can see; unmounting it stops that rAF
// work outright, and remounting is visually seamless since a looping
// rotation has no meaningful "start angle" to resume from.
function TravelingBorder({ active, reduce, nearViewport }: { active: boolean; reduce: boolean; nearViewport: boolean }) {
  if (reduce) {
    return (
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 rounded-[28px] border transition-colors duration-700 ease-premium ${
          active ? 'border-cream/25' : 'border-cream/10'
        }`}
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px] p-px"
      style={{
        WebkitMaskImage: 'linear-gradient(#000 0 0), linear-gradient(#000 0 0)',
        WebkitMaskClip: 'content-box, border-box',
        WebkitMaskComposite: 'xor',
        maskImage: 'linear-gradient(#000 0 0), linear-gradient(#000 0 0)',
        maskClip: 'content-box, border-box',
        maskComposite: 'exclude',
      }}
    >
      <div className={`absolute inset-0 transition-colors duration-700 ease-premium ${active ? 'bg-cream/25' : 'bg-cream/10'}`} />
      {/* Same 10s linear turn as before, as a CSS animation so it runs on
          the compositor thread instead of a per-frame JS style write. */}
      {nearViewport && (
        <div
          className="absolute inset-[-60%] animate-border-spin"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0%, transparent 80%, rgba(225,224,204,0.85) 90%, rgba(225,224,204,0.3) 95%, transparent 100%)',
            opacity: active ? 1 : 0.55,
          }}
        />
      )}
    </div>
  );
}

interface ResponsibilityRowProps {
  item: ResponsibilityItem;
}

function ResponsibilityRow({ item }: ResponsibilityRowProps) {
  const Icon = item.icon;
  return (
    <motion.li
      variants={staggerItem}
      className="group flex items-start gap-4 border-b border-cream/10 py-4 first:pt-0 last:border-b-0"
    >
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cream/15 text-cream/45 transition-colors duration-300 ease-premium group-hover:border-cream/40 group-hover:text-cream/85">
        <Icon className="h-4 w-4" strokeWidth={1.5} />
      </span>
      <span className="pt-1.5 text-sm leading-relaxed text-cream/70 transition-colors duration-300 ease-premium group-hover:text-cream sm:text-base">
        {item.text}
      </span>
    </motion.li>
  );
}

interface TechRowProps {
  item: TechItem;
  reduce: boolean;
}

function TechRow({ item, reduce }: TechRowProps) {
  const Icon = item.icon;
  return (
    <motion.div
      variants={staggerItem}
      whileHover={reduce ? undefined : { y: -2 }}
      transition={{ duration: 0.2, ease: EASE }}
      className="group flex items-center gap-3 rounded-xl border border-cream/10 px-4 py-3 transition-colors duration-300 ease-premium hover:border-cream/25 hover:bg-cream/5"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cream/15 text-cream/40 transition-colors duration-300 ease-premium group-hover:border-cream/35 group-hover:text-cream/80">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
      </span>
      <span className="text-xs uppercase tracking-[0.12em] text-cream/65 transition-colors duration-300 ease-premium group-hover:text-cream sm:text-sm">
        {item.name}
      </span>
    </motion.div>
  );
}

interface ExperiencePanelProps {
  role: RoleData;
  reduce: boolean;
}

function ExperiencePanel({ role, reduce }: ExperiencePanelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px -10% 0px' });
  const show = reduce || inView;
  const isScrollActive = useInView(ref, { margin: '-30% 0px -30% 0px' });
  const isActive = reduce || isScrollActive;
  // Deliberately generous and NOT `once` -- this only gates whether the
  // border's decorative rotation is mounted at all, so it should stay true
  // for as long as any part of the panel could plausibly be on screen.
  const nearViewport = useInView(ref, { margin: '200px 0px 200px 0px' });

  return (
    <motion.div
      ref={ref}
      initial={reduce ? undefined : { opacity: 0, y: 28 }}
      animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: 0.8, ease: EASE }}
      className="relative overflow-hidden rounded-[28px] bg-about-card px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20"
    >
      <TravelingBorder active={isActive} reduce={reduce} nearViewport={nearViewport} />

      {/* soft ambient warmth behind the panel content */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-1/3 left-1/2 h-[70%] w-[70%] -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(225,224,204,0.08) 0%, transparent 70%)' }}
      />

      <div className="bg-noise pointer-events-none absolute inset-0 rounded-[28px]" aria-hidden="true" />

      {/* huge background number, cropped behind the header */}
      <motion.span
        aria-hidden="true"
        initial={reduce ? undefined : { opacity: 0 }}
        animate={show ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1, delay: reduce ? 0 : 0.1, ease: EASE }}
        className="pointer-events-none absolute -right-6 -top-10 select-none font-display text-[9rem] font-bold leading-none text-cream/5 sm:text-[13rem] lg:-top-16 lg:text-[17rem]"
      >
        {role.number}
      </motion.span>

      <div className="relative">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: -8 }}
            animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.5, delay: reduce ? 0 : 0.15, ease: EASE }}
            className="flex items-center gap-4"
          >
            <span className="h-px w-8 bg-cream/20 sm:w-12" aria-hidden="true" />
            <span className="whitespace-nowrap text-xs uppercase tracking-[0.4em] text-cream/50">
              Experience {role.number}
            </span>
            <span className="h-px w-8 bg-cream/20 sm:w-12" aria-hidden="true" />
          </motion.div>

          <h3
            className={`mt-5 font-display text-4xl font-bold uppercase leading-[0.95] tracking-tightest transition-colors duration-700 ease-premium sm:text-6xl lg:text-7xl ${
              isActive ? 'text-cream' : 'text-cream/80'
            }`}
          >
            {role.title}
          </h3>

          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 8 }}
            animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.5, delay: reduce ? 0 : 0.3, ease: EASE }}
            className="mt-7 flex max-w-xl flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full border border-cream/15 px-6 py-2.5 text-[10px] uppercase tracking-[0.14em] text-cream/55 sm:text-[11px]"
          >
            <span>{role.category}</span>
            <span className="text-cream/20" aria-hidden="true">
              /
            </span>
            <span>{metaExperience}</span>
            <span className="text-cream/20" aria-hidden="true">
              /
            </span>
            <span>{metaEngagement}</span>
          </motion.div>
        </div>

        <div className="relative mt-14 grid grid-cols-1 gap-12 lg:mt-20 lg:grid-cols-2 lg:gap-0">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-cream/10 lg:block"
          />

          <div className="lg:pr-14">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cream/20 text-cream/55">
                <Briefcase className="h-4 w-4" strokeWidth={1.5} />
              </span>
              <span className="text-xs uppercase tracking-[0.25em] text-cream/45">Professional Responsibilities</span>
            </div>
            <motion.ul
              initial={false}
              animate={show ? 'open' : 'closed'}
              variants={stagger}
              className="mt-6"
            >
              {role.responsibilities.map((item) => (
                <ResponsibilityRow key={item.text} item={item} />
              ))}
            </motion.ul>
          </div>

          <div className="lg:pl-14">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cream/20 text-cream/55">
                <Settings2 className="h-4 w-4" strokeWidth={1.5} />
              </span>
              <span className="text-xs uppercase tracking-[0.25em] text-cream/45">Tools &amp; Technologies</span>
            </div>
            <motion.div
              initial={false}
              animate={show ? 'open' : 'closed'}
              variants={stagger}
              className="mt-6 space-y-2.5"
            >
              {role.tech.map((item) => (
                <TechRow key={item.name} item={item} reduce={reduce} />
              ))}
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={reduce ? undefined : { opacity: 0 }}
          animate={show ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: reduce ? 0 : 0.5, ease: EASE }}
          className="mt-14 flex items-center justify-center gap-4 lg:mt-20"
        >
          <span className="h-px w-10 bg-cream/15" aria-hidden="true" />
          <span className="whitespace-nowrap text-[10px] uppercase tracking-[0.35em] text-cream/35 sm:text-[11px]">
            {role.tagline}
          </span>
          <span className="h-px w-10 bg-cream/15" aria-hidden="true" />
        </motion.div>
      </div>
    </motion.div>
  );
}

// A minimal connector between the two panels -- a short vertical rail with
// "01"/"02" endpoints and a small point that travels down it as this
// specific stretch of the page scrolls through view. Purely a continuity
// cue, not a label.
function PanelConnector({ reduce }: { reduce: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.8', 'end 0.2'] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });
  // Translates a rail-height wrapper rather than animating `top`, so the
  // scroll-linked dot is a compositor-only transform with no per-frame layout.
  const dotY = useTransform(progress, [0, 1], ['0%', '100%']);

  return (
    <div ref={ref} className="mx-auto flex flex-col items-center py-10 sm:py-14">
      <span className="text-[10px] tracking-[0.35em] text-cream/30">01</span>
      <div className="relative mt-4 h-16 w-px bg-cream/10 sm:h-20">
        {!reduce && (
          <motion.div aria-hidden="true" style={{ y: dotY }} className="absolute inset-0">
            <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cream/60" />
          </motion.div>
        )}
      </div>
      <span className="mt-4 text-[10px] tracking-[0.35em] text-cream/30">02</span>
    </div>
  );
}

function ExperienceShowcase({ reduce }: { reduce: boolean }) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <ExperiencePanel role={roles[0]} reduce={reduce} />
      <PanelConnector reduce={reduce} />
      <ExperiencePanel role={roles[1]} reduce={reduce} />
    </div>
  );
}

interface ConnectorSegmentProps {
  d: string;
  show: boolean;
  reduce: boolean;
  delay: number;
  isBright: boolean;
}

// One static connector between two adjacent steps: a thin drawn-in line with
// an arrowhead marker and a small waypoint dot at its midpoint. Brightens
// briefly when the journey ball is currently arriving at its destination
// step.
function ConnectorSegment({ d, show, reduce, delay, isBright }: ConnectorSegmentProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const [geo, setGeo] = useState<{ len: number; mid: RowPoint } | null>(null);

  useLayoutEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    const len = el.getTotalLength() || 1;
    const mid = el.getPointAtLength(len / 2);
    setGeo({ len, mid: { x: mid.x, y: mid.y } });
  }, [d]);

  const len = geo?.len ?? 1;

  return (
    <>
      <path ref={pathRef} d={d} fill="none" stroke="none" aria-hidden="true" />
      <motion.path
        d={d}
        fill="none"
        stroke="rgba(225,224,204,0.28)"
        strokeWidth="1.2"
        strokeLinecap="round"
        markerEnd="url(#howIWorkRowArrow)"
        style={{ strokeDasharray: len }}
        initial={reduce ? undefined : { strokeDashoffset: len }}
        animate={{ strokeDashoffset: show ? 0 : len }}
        transition={{ duration: CONNECTOR_DRAW_DURATION, delay: reduce ? 0 : delay, ease: EASE }}
      />
      <motion.path
        d={d}
        fill="none"
        stroke="#E1E0CC"
        strokeWidth="1.4"
        strokeLinecap="round"
        animate={{ opacity: isBright ? 0.8 : 0 }}
        transition={{ duration: 0.4, ease: EASE }}
      />
      {geo && <circle cx={geo.mid.x} cy={geo.mid.y} r="2" fill="rgba(225,224,204,0.4)" />}
    </>
  );
}

interface JourneyBallProps {
  d: string;
  progress: MotionValue<number>;
  ballOpacity: MotionValue<number>;
  fallback: RowPoint;
  show: boolean;
  reduce: boolean;
}

// The single traveling ball: a bright core with a soft halo. Position is
// read straight off the real SVG path geometry via getPointAtLength (never
// CSS left/top, never hand-typed coordinates), driven by the shared
// `progress` value -- reading it inside useTransform costs a cheap native
// call per frame but never triggers a React re-render; only the bound SVG
// attributes update, via Framer's own commit path.
function JourneyBall({ d, progress, ballOpacity, fallback, show, reduce }: JourneyBallProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(1);
  useLayoutEffect(() => {
    if (pathRef.current) setLen(pathRef.current.getTotalLength() || 1);
  }, [d]);

  const ballX = useTransform(progress, (v) => {
    const el = pathRef.current;
    if (!el || !len) return fallback.x;
    return el.getPointAtLength(clamp01(v) * len).x;
  });
  const ballY = useTransform(progress, (v) => {
    const el = pathRef.current;
    if (!el || !len) return fallback.y;
    return el.getPointAtLength(clamp01(v) * len).y;
  });

  return (
    <>
      <path ref={pathRef} d={d} fill="none" stroke="none" aria-hidden="true" />
      {!reduce && (
        <motion.g style={{ opacity: show ? ballOpacity : 0 }}>
          <motion.circle cx={ballX} cy={ballY} r="7" fill="#E1E0CC" fillOpacity="0.18" filter="url(#howIWorkBallHalo)" />
          <motion.circle cx={ballX} cy={ballY} r={BALL_CORE_RADIUS} fill="#F5F4E8" />
        </motion.g>
      )}
    </>
  );
}

interface StepColumnProps {
  stage: StageData;
  index: number;
  show: boolean;
  reduce: boolean;
  isActive: boolean;
  justReached: boolean;
  pulseKey: number;
  iconRef: (el: HTMLDivElement | null) => void;
}

// One capsule: a tall rounded outline holding the step number up top and a
// refined icon circle in the lower-middle, with the title/description block
// below. All 7 columns share these exact classes, so identical dimensions
// and spacing come for free rather than needing per-item measurement.
function StepColumn({ stage, index, show, reduce, isActive, justReached, pulseKey, iconRef }: StepColumnProps) {
  const Icon = stage.icon;
  const delay = reduce ? 0 : CAPSULE_STAGGER_START + index * CAPSULE_STAGGER_STEP;

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={reduce ? undefined : { opacity: 0, scale: 0.9 }}
        animate={show ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
        transition={{ duration: CAPSULE_DURATION, delay, ease: EASE }}
        className={`relative flex h-52 w-24 shrink-0 flex-col items-center rounded-full border bg-black/40 pt-7 transition-colors ${STEP_STATE_TRANSITION} sm:h-60 sm:w-28 md:h-44 md:w-16 md:pt-5 lg:h-56 lg:w-20 lg:pt-6 xl:h-64 xl:w-28 xl:pt-7 ${
          isActive ? 'border-cream/50' : 'border-cream/20'
        }`}
      >
        <span
          className={`font-display text-xl font-bold transition-colors ${STEP_STATE_TRANSITION} sm:text-2xl md:text-lg lg:text-xl xl:text-2xl ${
            isActive ? 'text-cream' : 'text-cream/30'
          }`}
        >
          {stage.number}
        </span>

        <div
          ref={iconRef}
          className="relative mt-8 flex h-11 w-11 shrink-0 items-center justify-center sm:mt-10 sm:h-12 sm:w-12 md:mt-5 md:h-9 md:w-9 lg:mt-6 lg:h-10 lg:w-10 xl:mt-10 xl:h-12 xl:w-12"
        >
          {/* Ring 1: stays close, marks the active state while it holds. A very
              subtle continuous breathing scale keeps the current node feeling
              alive without ever reading as a pulse or glow. */}
          <motion.span
            animate={{ scale: isActive && !reduce ? [1, 1.035, 1] : 1 }}
            transition={{ duration: 1.8, repeat: isActive && !reduce ? Infinity : 0, ease: 'easeInOut' }}
            className={`pointer-events-none absolute inset-0 rounded-full border transition-colors ${STEP_STATE_TRANSITION} ${
              isActive ? 'border-cream/60' : 'border-cream/20'
            }`}
            aria-hidden="true"
          />
          <span
            className={`pointer-events-none absolute inset-[4px] rounded-full border transition-colors ${STEP_STATE_TRANSITION} ${
              isActive ? 'border-cream/30' : 'border-cream/5'
            }`}
            aria-hidden="true"
          />
          {justReached && (
            <motion.span
              key={pulseKey}
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.55, opacity: 0 }}
              transition={{ duration: 1.1, ease: EASE }}
              className="pointer-events-none absolute inset-[-6px] rounded-full border border-cream/45"
              aria-hidden="true"
            />
          )}
          <Icon
            className={`relative h-[18px] w-[18px] transition-colors ${STEP_STATE_TRANSITION} sm:h-5 sm:w-5 ${
              isActive ? 'text-cream' : 'text-cream/30'
            }`}
            strokeWidth={1.5}
          />
        </div>
      </motion.div>

      <div className="mt-6 flex flex-col items-center text-center">
        <span
          className={`h-1.5 w-1.5 rounded-full transition-colors ${STEP_STATE_TRANSITION} ${isActive ? 'bg-cream/70' : 'bg-cream/25'}`}
          aria-hidden="true"
        />
        <span className="h-4 w-px bg-cream/15" aria-hidden="true" />
        <h4
          className={`break-words font-display text-sm font-bold uppercase tracking-tightest transition-colors ${STEP_STATE_TRANSITION} sm:text-base md:max-w-[84px] md:text-xs lg:max-w-[108px] lg:text-sm xl:max-w-none xl:text-base ${
            isActive ? 'text-cream' : 'text-cream/30'
          }`}
        >
          {stage.title}
        </h4>
        <span className="mt-2 h-px w-6 bg-cream/20" aria-hidden="true" />
        <p
          className={`mt-2 max-w-[150px] break-words text-xs leading-snug transition-colors ${STEP_STATE_TRANSITION} sm:text-[13px] md:max-w-[84px] md:text-[11px] lg:max-w-[108px] lg:text-xs xl:max-w-[150px] xl:text-[13px] ${
            isActive ? 'text-cream/65' : 'text-cream/30'
          }`}
        >
          {stage.description}
        </p>
      </div>
    </div>
  );
}

function ProcessJourney({ reduce }: { reduce: boolean }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-15% 0px -15% 0px' });
  const show = reduce || inView;
  // Separate from `show` (which, once true, deliberately stays true forever
  // so the one-time entrance reveal never re-plays): this continuously
  // tracks whether the row is anywhere near the viewport, purely to gate the
  // looping ball/opacity animation below so it isn't still running its rAF
  // loop while the user has scrolled away to Contact or back to Hero.
  const nearViewport = useInView(sectionRef, { margin: '300px 0px 300px 0px' });
  const isCompact = !useMediaQuery('(min-width: 768px)');

  const rowRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<(HTMLDivElement | null)[]>([]);
  const geo = useRowGeometry(rowRef, nodesRef, isCompact);
  const points = geo?.points ?? null;

  const [autoActiveIndex, setAutoActiveIndex] = useState(0);
  const [pulseStep, setPulseStep] = useState(0);

  const centerPathD = useMemo(() => (points ? buildCenterPath(points) : ''), [points]);
  const segments = useMemo(
    () => (points && geo ? buildConnectorSegments(points, geo.iconRadius) : []),
    [points, geo],
  );

  // Real arc-length position of every node along the ball's own straight-line
  // path (cumulative Euclidean distance through `points`, the same
  // coordinates `centerPathD`/the ball's `getPointAtLength` use) -- not an
  // assumed even split. `arrival` is a pixel distance (the measured icon
  // circle's radius plus the ball's own core radius) rather than a
  // time/fraction guess, so "node i reached" means the ball's edge has made
  // contact with node i's icon ring -- the exact moment it visibly arrives,
  // so the highlight lands with it rather than while the eased ball is
  // still creeping in toward the center.
  const arcGeometry = useMemo(() => {
    if (!points || !geo) return null;
    const cumulative: number[] = [0];
    for (let i = 1; i < points.length; i++) {
      cumulative.push(cumulative[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y));
    }
    const total = cumulative[cumulative.length - 1] || 1;
    return { cumulative, total, arrival: geo.iconRadius + BALL_CORE_RADIUS };
  }, [points, geo]);

  const journeyKeyframes = useMemo(() => {
    if (!arcGeometry) return null;
    return buildJourneyKeyframes(arcGeometry.cumulative.map((c) => c / arcGeometry.total));
  }, [arcGeometry]);

  // Single source of truth for the whole sequential journey: `progress` runs
  // through the travel/pause keyframe timeline on Framer's own rAF loop (no
  // React re-render per frame). Ball position reads it via useTransform;
  // discrete step activation reads it via a change subscription that only
  // calls setState when the active step actually changes -- exactly when
  // the ball's position crosses a node -- keeping everything perfectly
  // synced without ever touching React state on a per-frame basis. Ball
  // opacity runs on its own independently-animated MotionValue rather than
  // being derived from `progress`, since the same numeric value (1) now
  // legitimately occurs at two different times (resting at 07, and holding
  // through the invisible return flight) that need different opacity.
  const progress = useMotionValue(0);
  const ballOpacity = useMotionValue(0);
  // Where in the cycle (seconds) a still-running journey was when its
  // effect re-ran purely because the measured geometry changed (a real
  // resize / rotation). The rebuilt journey resumes from that point with no
  // entrance delay instead of restarting at step 01. Cleared whenever the
  // journey is genuinely stopped (scrolled away, reduced motion), so those
  // still restart from 01 with the full entrance, as before.
  const resumeAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (reduce || !show || !nearViewport || !points || !journeyKeyframes) {
      resumeAtRef.current = null;
      return;
    }
    const resumeAt = resumeAtRef.current;
    resumeAtRef.current = null;
    if (resumeAt === null) {
      progress.set(0);
      ballOpacity.set(0);
    }
    const delay = resumeAt === null ? ENTRANCE_TOTAL_MS / 1000 : 0;
    // Wall-clock moment the cycle's t=0 falls on, tracked here rather than
    // read back from the controls so the delay period is unambiguous.
    const cycleStart = performance.now() + delay * 1000 - (resumeAt ?? 0) * 1000;
    const progressControls = animate(progress, journeyKeyframes, {
      times: JOURNEY_TIMES.times,
      duration: JOURNEY_TIMES.totalSeconds,
      delay,
      ease: EASE,
      repeat: Infinity,
      repeatType: 'loop',
    });
    const opacityControls = animate(ballOpacity, BALL_OPACITY_KEYFRAMES, {
      times: BALL_OPACITY_TIMES,
      duration: JOURNEY_TIMES.totalSeconds,
      delay,
      ease: 'linear',
      repeat: Infinity,
      repeatType: 'loop',
    });
    if (resumeAt !== null) {
      progressControls.time = resumeAt;
      opacityControls.time = resumeAt;
    }
    return () => {
      const elapsed = (performance.now() - cycleStart) / 1000;
      resumeAtRef.current = elapsed > 0 ? elapsed % JOURNEY_TIMES.totalSeconds : null;
      progressControls.stop();
      opacityControls.stop();
    };
  }, [reduce, show, nearViewport, points, progress, ballOpacity, journeyKeyframes]);

  // Active step is derived from the ball's own eased position, not a
  // separate timer or an exact-equality check against `progress` -- under
  // the entrance/travel easing, `v` only becomes numerically identical to a
  // node's exact target fraction at the very last instant of each travel
  // segment, well after the ball is already visually sitting on the node,
  // which is what previously made the highlight read as arriving late. Here
  // the same `v` is converted to the ball's real arc-length position (via
  // `arcGeometry`, built from the identical path coordinates the ball
  // renders against) and compared directly to each node's true position, so
  // the node lights up the instant the ball actually reaches it on screen.
  const lastActiveIndexRef = useRef(-1);
  useEffect(() => {
    if (reduce || !show || !points || !arcGeometry) {
      lastActiveIndexRef.current = -1;
      return;
    }
    const { cumulative, total, arrival } = arcGeometry;
    const unsubscribe = progress.on('change', (v) => {
      const ballArcLength = clamp01(v) * total;
      let idx = 0;
      for (let i = 0; i < cumulative.length; i++) {
        if (ballArcLength >= cumulative[i] - arrival) idx = i;
      }
      if (idx !== lastActiveIndexRef.current) {
        lastActiveIndexRef.current = idx;
        // Commit in this same animation frame (once per step, never per
        // frame) rather than on React's next scheduled render, so the step
        // lights up on exactly the frame the ball is drawn touching it.
        flushSync(() => {
          setAutoActiveIndex(idx);
          setPulseStep((c) => c + 1);
        });
      }
    });
    return unsubscribe;
  }, [reduce, show, points, progress, arcGeometry]);

  // Reduced motion: no traveling ball, but step 01 still reads as the
  // active/current step, per spec -- a static, fully legible resting state.
  const activeIndex = reduce ? 0 : autoActiveIndex;

  return (
    <div ref={sectionRef} className="mt-16 sm:mt-20">
      <div className="overflow-hidden">
        <motion.h3
          initial={reduce ? undefined : { y: '100%' }}
          animate={show ? { y: '0%' } : { y: '100%' }}
          transition={{ duration: 0.5, ease: EASE }}
          className="font-display text-2xl font-bold uppercase leading-none tracking-tightest text-cream sm:text-3xl"
        >
          How I Work
        </motion.h3>
      </div>

      <div ref={rowRef} className="relative mt-10 sm:mt-12">
        {points && (
          <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
            <defs>
              <marker id="howIWorkRowArrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 Z" fill="rgba(225,224,204,0.5)" />
              </marker>
              <filter id="howIWorkBallHalo" x="-200%" y="-200%" width="500%" height="500%">
                <feGaussianBlur stdDeviation="2.2" />
              </filter>
            </defs>
            {segments.map((d, i) => (
              <ConnectorSegment
                key={i}
                d={d}
                show={show}
                reduce={reduce}
                delay={CONNECTOR_DRAW_START + i * CONNECTOR_DRAW_STEP}
                isBright={activeIndex === i + 1}
              />
            ))}
            <JourneyBall d={centerPathD} progress={progress} ballOpacity={ballOpacity} fallback={points[0]} show={show} reduce={reduce} />
          </svg>
        )}

        <div className="relative z-10 grid grid-cols-1 gap-y-16 md:grid-cols-7 md:items-start md:gap-x-2 lg:gap-x-4 xl:gap-x-6">
          {workStages.map((stage, i) => (
            <StepColumn
              key={stage.id}
              stage={stage}
              index={i}
              show={show}
              reduce={reduce}
              isActive={activeIndex === i}
              justReached={!reduce && activeIndex === i}
              pulseKey={pulseStep}
              iconRef={(el) => {
                nodesRef.current[i] = el;
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Experience() {
  const reduce = Boolean(useReducedMotion());

  return (
    <section id="experience" aria-labelledby="experience-heading" className="bg-black px-4 py-12 sm:px-6 sm:py-14 md:py-16">
      {/* Visually hidden: the panels' role titles and "How I Work" are h3s,
          and without this the section had no h2 of its own in the outline. */}
      <h2 id="experience-heading" className="sr-only">
        Experience
      </h2>
      <div>
        <ExperienceShowcase reduce={reduce} />
      </div>

      <div className="mx-auto max-w-7xl">
        <ProcessJourney reduce={reduce} />
      </div>
    </section>
  );
}
