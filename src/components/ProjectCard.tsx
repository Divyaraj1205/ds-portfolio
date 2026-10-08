import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { Project } from '../data/content';
import WordsPullUp from './WordsPullUp';

const EASE = [0.16, 1, 0.3, 1] as const;

// The heading gets a head start (`HEADER_LEAD`), then projects reveal in
// PAIRS by row rather than one-by-one -- 01/02 together, then 03/04 a beat
// later -- matching the requested "row 1 reveals, row 2 follows" cadence.
// The divider gets its own slightly earlier delay so it settles in just
// ahead of its row's content, not simultaneously with it.
const HEADER_LEAD = 0.25;
const ROW_STAGGER = 0.12;
const DIVIDER_LEAD = 0.15;

interface ProjectCardProps {
  project: Project;
  index: number;
  rowIndex: number;
  isLastItem: boolean;
  isLastRow: boolean;
  isLastColumn: boolean;
  isDimmed: boolean;
  onHoverChange: (index: number | null) => void;
}

export default function ProjectCard({
  project,
  index,
  rowIndex,
  isLastItem,
  isLastRow,
  isLastColumn,
  isDimmed,
  onHoverChange,
}: ProjectCardProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px -10% 0px' });
  const show = reduce || inView;

  // `hasEntered` (a step behind `show`, flipped in an effect after the entrance
  // commits) lets the one-time staggered entrance delay apply only to that
  // first reveal -- every later opacity change driven by hover-dimming reacts
  // immediately, with no leftover per-card stagger.
  const [hasEntered, setHasEntered] = useState(false);
  useEffect(() => {
    if (show) setHasEntered(true);
  }, [show]);

  // One shared editorial grid rather than four separate bordered cards: the
  // bottom divider shows between every stacked project on mobile, but only
  // between the two rows once the layout becomes a 2-column grid (`md:`,
  // matching the grid's own breakpoint below) -- and the right divider only
  // ever appears at that same breakpoint, between the two columns.
  const showBottomMobile = !isLastItem;
  const showBottomDesktop = !isLastRow;
  const showRightDesktop = !isLastColumn;

  const dividerClass = [
    showBottomMobile ? 'border-b border-cream/10' : '',
    showBottomMobile && !showBottomDesktop ? 'md:border-b-0' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const paddingClass = showRightDesktop ? 'md:pr-6 lg:pr-9 xl:pr-12' : 'md:pl-6 lg:pl-9 xl:pl-12';
  const entranceDelay = HEADER_LEAD + rowIndex * ROW_STAGGER;

  return (
    <motion.article
      ref={ref}
      initial={reduce ? undefined : { opacity: 0, y: 24, scale: 0.97 }}
      animate={
        reduce
          ? undefined
          : { opacity: show ? (isDimmed ? 0.45 : 1) : 0, y: show ? 0 : 24, scale: show ? 1 : 0.97 }
      }
      transition={{ duration: hasEntered ? 0.4 : 0.75, delay: hasEntered ? 0 : entranceDelay, ease: EASE }}
      // Mouse only: on touch, a tap's emulated hover never "leaves", which
      // would leave the other three projects stuck dimmed while scrolling.
      onPointerEnter={(e) => e.pointerType === 'mouse' && onHoverChange(index)}
      onPointerLeave={() => onHoverChange(null)}
      className={`group relative flex min-h-[200px] flex-col justify-center py-6 sm:py-7 md:min-h-[182px] md:py-6 lg:min-h-[192px] lg:py-7 xl:min-h-[204px] xl:py-8 ${dividerClass} ${paddingClass}`}
    >
      {/* The vertical column divider, reveal-animated (scaleY 0->1) rather
          than a static border -- same position and appearance as before,
          just settling in a beat ahead of this row's own content instead
          of being present instantly. */}
      {showRightDesktop && (
        <motion.span
          aria-hidden="true"
          initial={reduce ? undefined : { scaleY: 0, opacity: 0 }}
          animate={reduce ? undefined : show ? { scaleY: 1, opacity: 1 } : { scaleY: 0, opacity: 0 }}
          transition={{ duration: 0.7, delay: DIVIDER_LEAD + rowIndex * ROW_STAGGER, ease: EASE }}
          style={{ transformOrigin: 'top' }}
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-px bg-cream/10 md:block"
        />
      )}
      {/* No visual column anymore -- a single deliberately-capped text
          column rather than letting it sprawl across the freed-up width,
          so the card still reads as one composed editorial block instead
          of an empty layout stretched to fill the space a mockup left. */}
      <div className="flex min-w-0 max-w-lg flex-col gap-2 md:gap-2.5">
        <span className="block select-none font-display text-xs font-semibold text-cream/30 transition-colors duration-500 ease-premium group-hover:text-cream/55">
          {project.number}
        </span>

        <WordsPullUp
          as="h3"
          text={project.title}
          delay={entranceDelay + 0.08}
          className="font-display text-2xl font-bold leading-[1.1] tracking-tightest text-cream/90 transition-colors duration-500 ease-premium group-hover:text-cream sm:text-3xl md:text-xl lg:text-2xl xl:text-3xl"
        />

        <span className="block text-[10px] uppercase tracking-[0.24em] text-cream/55">{project.category}</span>

        <span aria-hidden="true" className="relative block h-px w-10 overflow-hidden">
          {/* Driven by the card's own `show` rather than its own whileInView:
              a scaleX(0) hairline has a zero-area box that IntersectionObserver
              only sometimes reports, so this line used to appear on some
              projects and never on others. */}
          <motion.span
            initial={reduce ? undefined : { scaleX: 0 }}
            animate={reduce ? undefined : show ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.6, delay: entranceDelay + 0.15, ease: EASE }}
            style={{ transformOrigin: 'left' }}
            className="block h-full w-full bg-cream/25 transition-colors duration-500 ease-premium group-hover:bg-[#9db3d1]/70"
          />
        </span>

        <p className="max-w-sm text-xs leading-relaxed text-text-secondary sm:text-sm">{project.description}</p>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[10px] uppercase tracking-[0.12em] text-cream/45 sm:text-[11px]">
          {project.tech.map((t, i) => (
            <span key={t} className="flex items-center gap-2">
              {i > 0 && (
                <span className="text-cream/20" aria-hidden="true">
                  •
                </span>
              )}
              {t}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}
