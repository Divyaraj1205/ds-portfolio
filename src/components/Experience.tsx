import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from 'framer-motion';
import {
  Atom,
  Briefcase,
  Code2,
  Camera,
  FileCode,
  Fingerprint,
  Globe,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  MessageSquare,
  Palette,
  PenTool,
  Search,
  Settings2,
  ShoppingBag,
  Sparkles,
  Type,
  type LucideIcon,
} from 'lucide-react';
import { useRef } from 'react';
import { useFinePointer, useMediaQuery } from '../hooks/useMediaQuery';
import HowIWork from './HowIWork';
import { capabilities, experienceResponsibilities, personal } from '../data/content';

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
// The rotation only mounts while it can be seen and is worth its cost
// (`spin`): the panel is the active one in the middle of the viewport, on a
// fine-pointer (desktop) device. Re-compositing the masked ring every frame was
// the page's main source of dropped frames while scrolling, so the inactive
// panel and touch devices get the static ring instead; remounting is seamless
// since a looping rotation has no meaningful "start angle" to resume from.
function TravelingBorder({ active, reduce, spin }: { active: boolean; reduce: boolean; spin: boolean }) {
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
      {/* The rotating layer is a centred square just big enough to reach the
          panel's corners (190% of its width covers the panels from 1024px up),
          less than half the pixels of the old inset-[-60%] rectangle. */}
      {spin && (
        <div className="absolute left-1/2 top-1/2 aspect-square w-[190%] -translate-x-1/2 -translate-y-1/2">
          <div
            className="h-full w-full animate-border-spin will-change-transform"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0%, transparent 80%, rgba(225,224,204,0.85) 90%, rgba(225,224,204,0.3) 95%, transparent 100%)',
            }}
          />
        </div>
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
  const isLg = useMediaQuery('(min-width: 1024px)');
  // the rotating glow only on mouse-driven screens >= 1024px, where the panel
  // is wide enough for its square layer to reach every corner
  const finePointer = useFinePointer() && isLg;

  return (
    <motion.div
      ref={ref}
      initial={reduce ? undefined : { opacity: 0, y: 28 }}
      animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: 0.8, ease: EASE }}
      className="relative overflow-hidden rounded-[28px] bg-about-card px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20"
    >
      <TravelingBorder active={isActive} reduce={reduce} spin={isScrollActive && finePointer} />

      {/* soft ambient warmth behind the panel content */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-1/3 left-1/2 h-[70%] w-[70%] -translate-x-1/2 rounded-full"
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
      <span className="text-[10px] tracking-[0.35em] text-cream/55">01</span>
      <div className="relative mt-4 h-16 w-px bg-cream/10 sm:h-20">
        {!reduce && (
          <motion.div aria-hidden="true" style={{ y: dotY }} className="absolute inset-0">
            <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cream/60" />
          </motion.div>
        )}
      </div>
      <span className="mt-4 text-[10px] tracking-[0.35em] text-cream/55">02</span>
    </div>
  );
}

function ExperienceShowcase({ reduce }: { reduce: boolean }) {
  return (
    // No extra gutter below sm: the section's own px-4 already provides it
    // (doubling it squeezed the panels' text column on phones).
    <div className="frame">
      <ExperiencePanel role={roles[0]} reduce={reduce} />
      <PanelConnector reduce={reduce} />
      <ExperiencePanel role={roles[1]} reduce={reduce} />
    </div>
  );
}

export default function Experience() {
  const reduce = Boolean(useReducedMotion());

  return (
    <section id="experience" aria-labelledby="experience-heading" className="bg-black py-[calc(var(--sy)/2)]">
      {/* Visually hidden: the panels' role titles and "How I Work" are h3s,
          and without this the section had no h2 of its own in the outline. */}
      <h2 id="experience-heading" className="sr-only">
        Experience
      </h2>
      <div>
        <ExperienceShowcase reduce={reduce} />
      </div>

      {/* sizes itself to the shared frame */}
      <div>
        <HowIWork reduce={reduce} />
      </div>
    </section>
  );
}
