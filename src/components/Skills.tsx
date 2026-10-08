import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import {
  Bot,
  Check,
  Code2,
  FolderGit2,
  GitBranch,
  Globe,
  Image as ImageIcon,
  LayoutGrid,
  MessageSquare,
  Palette,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { useRef, useState, type ComponentType, type MouseEvent, type PointerEvent } from 'react';
import { capabilities, education, keyStrengths, specialization, tools } from '../data/content';
import { useFinePointer } from '../hooks/useMediaQuery';
import WordsPullUp from './WordsPullUp';

const EASE = [0.16, 1, 0.3, 1] as const;
const clamp = (value: number, max: number) => Math.max(-max, Math.min(max, value));

const toolIcons: Record<string, ComponentType<{ className?: string }>> = {
  Canva: Palette,
  'Adobe Photoshop': ImageIcon,
  'VS Code': Code2,
  WordPress: Globe,
  Elementor: LayoutGrid,
  Shopify: ShoppingBag,
  Git: GitBranch,
  GitHub: FolderGit2,
  'AI Tools': Sparkles,
  'Prompt Engineering': MessageSquare,
  'AI Automation': Bot,
};

function CapabilityCard({
  number,
  title,
  items,
  index,
}: {
  number: string;
  title: string;
  items: string[];
  index: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 24 }}
      // The staggered entrance delay belongs to the reveal only -- as the
      // shared `transition` it also delayed every later hover lift by up to
      // 0.3s on the right-most cards.
      whileInView={reduce ? undefined : { opacity: 1, y: 0, transition: { duration: 0.7, delay: index * 0.1, ease: EASE } }}
      viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="group flex flex-col rounded-2xl border border-transparent bg-feature-card p-7 shadow-[0_0_0_rgba(225,224,204,0)] transition-[border-color,box-shadow] duration-400 ease-premium hover:border-cream/15 hover:shadow-[0_28px_70px_-30px_rgba(225,224,204,0.22)] sm:p-8"
    >
      <span className="text-xs tracking-[0.25em] text-cream/40">{number}</span>
      <h3 className="mt-4 font-display text-lg font-bold tracking-tight text-cream sm:text-xl">{title}</h3>
      <span className="mt-3 block h-px w-10 origin-left scale-x-[0.6] bg-cream/20 transition-[transform,background-color] duration-500 ease-premium group-hover:scale-x-100 group-hover:bg-cream/40" />
      <ul className="mt-6 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-text-secondary">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-cream/60" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

const NODE_X = 'left-3 sm:left-4';

function BoardPath({ reduce, active }: { reduce: boolean; active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-y-0 z-0 w-px ${NODE_X}`}
    >
      <div className="h-full w-full bg-cream/10">
        <motion.div
          style={reduce ? { transformOrigin: 'top' } : { scaleY: progress, transformOrigin: 'top' }}
          animate={reduce ? { scaleY: 1 } : undefined}
          className={`h-full w-full transition-colors duration-500 ease-premium ${active ? 'bg-cream/50' : 'bg-cream/25'}`}
        />
      </div>
    </div>
  );
}

interface StrengthNodeProps {
  strength: string;
  index: number;
  reduce: boolean;
  isFine: boolean;
  hoveredIndex: number | null;
  onHoverChange: (i: number | null) => void;
}

function StrengthNode({ strength, index, reduce, isFine, hoveredIndex, onHoverChange }: StrengthNodeProps) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px -10% 0px' });
  const isScrollActive = useInView(ref, { margin: '-42% 0px -42% 0px' });
  const show = reduce || inView;

  const isHovered = hoveredIndex === index;
  const isActive = isHovered || isScrollActive;
  const isDimmed = hoveredIndex !== null && hoveredIndex !== index;

  const magActive = isFine && !reduce;
  const magX = useMotionValue(0);
  const magY = useMotionValue(0);
  const springX = useSpring(magX, { stiffness: 260, damping: 22, mass: 0.4 });
  const springY = useSpring(magY, { stiffness: 260, damping: 22, mass: 0.4 });

  // Rect read once on enter (as MagneticButton does), not on every
  // mousemove -- reading layout right after the spring's transform writes
  // forced a synchronous layout per mouse event.
  const rectRef = useRef<DOMRect | null>(null);
  const handleEnter = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    rectRef.current = e.currentTarget.getBoundingClientRect();
    onHoverChange(index);
  };
  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!magActive || !rectRef.current) return;
    const rect = rectRef.current;
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    magX.set(clamp(relX * 0.12, 8));
    magY.set(clamp(relY * 0.35, 6));
  };
  const handleLeave = () => {
    rectRef.current = null;
    magX.set(0);
    magY.set(0);
    onHoverChange(null);
  };

  return (
    <motion.li
      ref={ref}
      initial={reduce ? undefined : { opacity: 0, x: -16 }}
      animate={show ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
      transition={{ duration: 0.6, delay: reduce ? 0 : index * 0.08, ease: EASE }}
      className="relative"
    >
      <motion.span
        aria-hidden="true"
        initial={reduce ? undefined : { scale: 0.4, opacity: 0 }}
        animate={show ? { scale: 1, opacity: 1 } : { scale: 0.4, opacity: 0 }}
        transition={{ duration: 0.5, delay: reduce ? 0 : index * 0.08 + 0.1, ease: EASE }}
        className={`absolute top-8 z-10 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-colors duration-500 ease-premium sm:top-9 ${NODE_X} ${
          isActive ? 'border-cream bg-cream' : 'border-cream/45 bg-black'
        }`}
      />
      {!reduce && (
        <motion.span
          aria-hidden="true"
          animate={isScrollActive ? { scale: [1, 2.1], opacity: [0.35, 0] } : { scale: 1, opacity: 0 }}
          transition={isScrollActive ? { duration: 1.8, repeat: Infinity, ease: 'easeOut' } : { duration: 0.3 }}
          className={`absolute top-8 z-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cream/50 sm:top-9 ${NODE_X}`}
        />
      )}

      <AnimatePresence>
        {isHovered && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="pointer-events-none absolute left-8 top-1 z-10 text-[9px] uppercase tracking-[0.25em] text-cream/50 sm:left-10"
          >
            {String(index + 1).padStart(2, '0')} / Active
          </motion.span>
        )}
      </AnimatePresence>

      <motion.div
        // Mouse only: a touch tap's emulated hover never "leaves", which
        // would leave every other strength stuck dimmed.
        onPointerEnter={handleEnter}
        onMouseMove={handleMove}
        onPointerLeave={handleLeave}
        style={magActive ? { x: springX, y: springY } : undefined}
        className={`relative flex items-baseline gap-5 py-6 pl-8 transition-opacity duration-400 ease-premium sm:gap-7 sm:py-8 sm:pl-10 ${
          isDimmed ? 'opacity-45' : 'opacity-100'
        }`}
      >
        <span
          className={`shrink-0 select-none font-display text-3xl font-normal tabular-nums leading-none transition-colors duration-500 ease-premium sm:text-4xl md:text-5xl lg:text-6xl ${
            isActive ? 'text-cream/45' : 'text-cream/15'
          }`}
        >
          {String(index + 1).padStart(2, '0')}
        </span>

        <span
          className={`font-display text-xl font-bold leading-snug transition-colors duration-500 ease-premium sm:text-2xl lg:text-3xl ${
            isActive ? 'text-cream' : 'text-cream/70'
          }`}
        >
          {strength}
        </span>
      </motion.div>
    </motion.li>
  );
}

const whatIBring = [
  {
    n: '01',
    title: 'Technical Thinking',
    desc: 'Building practical, responsive digital solutions.',
  },
  {
    n: '02',
    title: 'Visual Thinking',
    desc: 'Combining design, usability and attention to detail.',
  },
  {
    n: '03',
    title: 'Business Mindset',
    desc: 'Creating work focused on real client goals.',
  },
];

function EducationObject({ reduce, isFine }: { reduce: boolean; isFine: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px -10% 0px' });
  const show = reduce || inView;
  const [isHovered, setIsHovered] = useState(false);

  const parallaxActive = isFine && !reduce;
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const decorSpringX = useSpring(rawX, { stiffness: 120, damping: 22, mass: 0.5 });
  const decorSpringY = useSpring(rawY, { stiffness: 120, damping: 22, mass: 0.5 });
  const markSpringX = useSpring(rawX, { stiffness: 90, damping: 24, mass: 0.6 });
  const markSpringY = useSpring(rawY, { stiffness: 90, damping: 24, mass: 0.6 });

  const rectRef = useRef<DOMRect | null>(null);
  const handleEnter = (e: MouseEvent<HTMLDivElement>) => {
    rectRef.current = e.currentTarget.getBoundingClientRect();
  };
  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!parallaxActive || !rectRef.current) return;
    const rect = rectRef.current;
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    rawX.set(clamp(relX * 10, 6));
    rawY.set(clamp(relY * 8, 5));
  };
  const handleLeave = () => {
    rectRef.current = null;
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <div
      ref={ref}
      onMouseEnter={handleEnter}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="relative mt-2 lg:mt-0 lg:pl-9"
    >
      {/* huge subtle 01 behind the composition */}
      <motion.span
        aria-hidden="true"
        style={parallaxActive ? { x: decorSpringX, y: decorSpringY } : undefined}
        initial={reduce ? undefined : { opacity: 0, y: -10 }}
        animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
        transition={{ duration: 0.4, delay: reduce ? 0 : 0.06, ease: EASE }}
        className="pointer-events-none absolute -top-3 right-0 z-0 select-none font-display text-7xl font-bold leading-none text-cream/10 sm:text-8xl lg:text-9xl"
      >
        01
      </motion.span>

      {/* vertical editorial EDUCATION rule, desktop only */}
      <motion.span
        aria-hidden="true"
        style={parallaxActive ? { x: markSpringX, y: markSpringY, writingMode: 'vertical-rl' } : { writingMode: 'vertical-rl' }}
        initial={reduce ? undefined : { opacity: 0 }}
        animate={show ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.4, delay: reduce ? 0 : 0.03, ease: EASE }}
        className="pointer-events-none absolute left-0 top-0 z-0 hidden select-none text-[10px] uppercase tracking-[0.5em] text-cream/15 lg:block"
      >
        Education
      </motion.span>

      {/* tiny technical/editorial marks */}
      <span aria-hidden="true" className="pointer-events-none absolute right-1 top-24 hidden h-3 w-px bg-cream/15 sm:block" />
      <span aria-hidden="true" className="pointer-events-none absolute right-1 top-[7.5rem] hidden h-1 w-1 rounded-full bg-cream/20 sm:block" />
      <span aria-hidden="true" className="pointer-events-none absolute -left-1 bottom-0 hidden text-[8px] uppercase tracking-[0.3em] text-cream/10 lg:block">
        N.01
      </span>

      <div className="relative z-10">
        <motion.span
          initial={reduce ? undefined : { opacity: 0 }}
          animate={show ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="block text-xs uppercase tracking-[0.3em] text-cream/45"
        >
          Education
        </motion.span>

        <div className="mt-6 max-w-sm">
          <motion.div
            onPointerEnter={(e) => e.pointerType === 'mouse' && setIsHovered(true)}
            onPointerLeave={() => setIsHovered(false)}
            animate={reduce ? undefined : { y: isHovered ? -3 : 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <WordsPullUp
              as="h3"
              text={education.degree}
              delay={reduce ? 0 : 0.1}
              stagger={0.04}
              className="font-display text-3xl font-bold leading-[0.95] tracking-tightest text-cream sm:text-4xl lg:text-5xl"
            />

            <span
              aria-hidden="true"
              className={`mt-3 block h-px bg-cream/40 transition-all duration-400 ease-premium ${
                isHovered ? 'w-14 opacity-100' : 'w-0 opacity-0'
              }`}
            />
            <AnimatePresence>
              {isHovered && (
                <motion.span
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  className="mt-2 block text-[9px] uppercase tracking-[0.3em] text-cream/40"
                >
                  Academic Path
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.p
            initial={reduce ? undefined : { opacity: 0, y: 8 }}
            animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.35, delay: reduce ? 0 : 0.5, ease: EASE }}
            className="mt-3 text-sm text-text-secondary sm:text-base"
          >
            {education.field}
          </motion.p>

          <div className="mt-8 flex items-center gap-3">
            <div className="h-px flex-1 overflow-hidden">
              <motion.div
                initial={reduce ? undefined : { scaleX: 0 }}
                animate={show ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 0.4, delay: reduce ? 0 : 0.55, ease: EASE }}
                style={{ transformOrigin: 'left' }}
                className="h-full w-full bg-cream/25"
              />
            </div>
            <motion.span
              aria-hidden="true"
              initial={reduce ? undefined : { scale: 0, opacity: 0 }}
              animate={show ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              transition={{ duration: 0.25, delay: reduce ? 0 : 0.9, ease: EASE }}
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-cream/50"
            />
          </div>

          {/* What I Bring — fills the space below Education with a compact,
              secondary editorial block instead of leaving it empty. */}
          <div className="mt-14 max-w-sm border-t border-cream/10 pt-8 sm:mt-16">
            <motion.span
              initial={reduce ? undefined : { opacity: 0, y: 10 }}
              animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.5, delay: reduce ? 0 : 1.0, ease: EASE }}
              className="block font-display text-xs uppercase tracking-[0.3em] text-cream/45"
            >
              What I Bring
            </motion.span>

            <motion.span
              initial={reduce ? undefined : { opacity: 0, y: 8 }}
              animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              transition={{ duration: 0.5, delay: reduce ? 0 : 1.08, ease: EASE }}
              className="mt-3 block font-display text-sm font-semibold uppercase tracking-wide text-cream/75 sm:text-base"
            >
              Development <span className="text-cream/30">×</span> Design{' '}
              <span className="text-cream/30">×</span> Business
            </motion.span>

            <ul className="mt-7 space-y-5">
              {whatIBring.map((item, i) => (
                <motion.li
                  key={item.n}
                  initial={reduce ? undefined : { opacity: 0, y: 12 }}
                  animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                  transition={{ duration: 0.5, delay: reduce ? 0 : 1.16 + i * 0.1, ease: EASE }}
                  className="group flex gap-4"
                >
                  <span className="shrink-0 font-display text-xs tracking-[0.15em] text-cream/30 transition-colors duration-300 ease-premium group-hover:text-cream/70">
                    {item.n}
                  </span>
                  <div>
                    <span className="block font-display text-sm font-semibold uppercase tracking-[0.04em] text-cream/80 transition-colors duration-300 ease-premium group-hover:text-cream sm:text-base">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-text-secondary transition-colors duration-300 ease-premium group-hover:text-cream/70 sm:text-sm">
                      {item.desc}
                    </span>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Skills() {
  const reduce = Boolean(useReducedMotion());
  const isFine = useFinePointer();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="skills" className="bg-black px-4 py-24 sm:px-6 md:py-32">
      <div className="mx-auto max-w-7xl">
        <WordsPullUp
          as="h2"
          text="Everything I build sits between code and creativity."
          className="max-w-3xl font-display text-3xl font-semibold leading-[1.15] tracking-tightest text-cream sm:text-5xl md:text-6xl"
        />

        {/* Capabilities */}
        <div className="mt-14 grid gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((cap, index) => (
            <CapabilityCard key={cap.number} {...cap} index={index} />
          ))}
        </div>

        {/* Tools */}
        <div className="mt-20 sm:mt-24">
          <span className="text-xs uppercase tracking-[0.3em] text-cream/45">Tools</span>
          <div className="mt-6 flex flex-wrap gap-3">
            {tools.map((tool, i) => {
              const Icon = toolIcons[tool.name] ?? Sparkles;
              return (
                <motion.span
                  key={tool.name}
                  initial={reduce ? undefined : { opacity: 0, y: 10 }}
                  whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
                  transition={{ duration: 0.5, delay: i * 0.03, ease: EASE }}
                  className="group flex items-center gap-2 rounded-full border border-cream/10 px-4 py-2 text-xs text-cream/70 transition-[border-color,background-color,color] duration-300 ease-premium hover:border-cream/35 hover:bg-cream/5 hover:text-cream sm:text-sm"
                >
                  <Icon className="h-3.5 w-3.5 text-cream/50 transition-colors duration-300 ease-premium group-hover:text-cream/80" />
                  {tool.name}
                </motion.span>
              );
            })}
          </div>
        </div>

        {/* Specialization */}
        <div className="mt-20 sm:mt-24">
          <span className="text-xs uppercase tracking-[0.3em] text-cream/45">Specialization</span>
          <motion.div
            initial={reduce ? undefined : { opacity: 0 }}
            whileInView={reduce ? undefined : { opacity: 1 }}
            viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
            transition={{ duration: 0.8, ease: EASE }}
            className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-3"
          >
            {specialization.map((item, i) => (
              <span key={item} className="group flex items-center gap-3">
                <span className="relative text-lg font-medium tracking-tight text-cream/85 transition-colors duration-300 ease-premium group-hover:text-cream sm:text-2xl">
                  {item}
                  <span className="pointer-events-none absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-cream/50 transition-transform duration-300 ease-premium group-hover:scale-x-100" />
                </span>
                {i < specialization.length - 1 && (
                  <span className="text-lg text-text-muted sm:text-2xl" aria-hidden="true">
                    /
                  </span>
                )}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Key strengths + Education */}
        <div className="mt-20 grid gap-14 sm:mt-24 lg:grid-cols-[1.4fr_1fr] lg:gap-10">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-cream/45">Key Strengths</span>
            <div className="relative mt-8">
              <BoardPath reduce={reduce} active={hoveredIndex !== null} />
              <ul>
                {keyStrengths.map((strength, i) => (
                  <StrengthNode
                    key={strength}
                    strength={strength}
                    index={i}
                    reduce={reduce}
                    isFine={isFine}
                    hoveredIndex={hoveredIndex}
                    onHoverChange={setHoveredIndex}
                  />
                ))}
              </ul>
            </div>
          </div>

          <EducationObject reduce={reduce} isFine={isFine} />
        </div>
      </div>
    </section>
  );
}
