import { ArrowUpRight } from 'lucide-react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';

type CursorVariant = 'default' | 'link' | 'cta' | 'text' | 'view';

const RING_MAX = 64;
const DOT_MAX = 16;

const RING_SIZE: Record<CursorVariant, number> = {
  default: 36,
  link: 44,
  cta: 60,
  text: 26,
  view: 64,
};

const DOT_SIZE: Record<CursorVariant, number> = {
  default: 7,
  link: 4,
  cta: 0,
  text: 5,
  view: 0,
};

const EASE = [0.16, 1, 0.3, 1] as const;

export default function CustomCursor() {
  // Same min-width as the CSS that restores the native cursor below md --
  // otherwise a narrow desktop window showed both cursors at once.
  const isFine = useMediaQuery('(hover: hover) and (pointer: fine) and (min-width: 768px)');
  const reduce = useReducedMotion();
  const [variant, setVariant] = useState<CursorVariant>('default');
  const [label, setLabel] = useState('');
  const [visible, setVisible] = useState(true);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  // Inner dot: bound straight to the pointer (no spring) so it never lags
  // the real cursor position -- the trailing feel comes from the ring alone.
  // (The previous overdamped spring trailed the pointer by ~50ms.)
  // Outer ring: softer spring for an elegant, deliberate trailing lag.
  const ringX = useSpring(x, { stiffness: 180, damping: 24, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 180, damping: 24, mass: 0.6 });

  const enabled = isFine && !reduce;

  useEffect(() => {
    if (!enabled) return;

    document.documentElement.classList.add('cursor-none-active');

    const move = (e: globalThis.MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e: globalThis.MouseEvent) => {
      const target = (e.target as HTMLElement).closest('[data-cursor]');
      if (target) {
        const kind = (target.getAttribute('data-cursor') || 'link') as CursorVariant;
        setVariant(kind in RING_SIZE ? kind : 'link');
        setLabel(target.getAttribute('data-cursor-text') || '');
      }
    };
    const out = (e: globalThis.MouseEvent) => {
      const target = (e.target as HTMLElement).closest('[data-cursor]');
      // Moving between children of the same [data-cursor] element fires
      // mouseout too -- skip it, rather than resetting to default only for
      // the next mouseover to set the same variant back (two re-renders).
      if (target && !(e.relatedTarget instanceof Node && target.contains(e.relatedTarget))) {
        setVariant('default');
        setLabel('');
      }
    };
    const leaveViewport = () => setVisible(false);
    const enterViewport = () => setVisible(true);

    window.addEventListener('mousemove', move, { passive: true });
    document.addEventListener('mouseover', over, { passive: true });
    document.addEventListener('mouseout', out, { passive: true });
    document.documentElement.addEventListener('mouseleave', leaveViewport);
    document.documentElement.addEventListener('mouseenter', enterViewport);

    return () => {
      document.documentElement.classList.remove('cursor-none-active');
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', over);
      document.removeEventListener('mouseout', out);
      document.documentElement.removeEventListener('mouseleave', leaveViewport);
      document.documentElement.removeEventListener('mouseenter', enterViewport);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const showLabel = Boolean(label);
  const activeVariant = showLabel ? 'view' : variant;
  const ringSize = RING_SIZE[activeVariant];
  const dotSize = showLabel ? 0 : DOT_SIZE[variant];
  const filled = activeVariant === 'cta' || activeVariant === 'view';

  return (
    <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 200ms ease' }}>
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[100] flex items-center justify-center will-change-transform"
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
          width: RING_MAX,
          height: RING_MAX,
        }}
        aria-hidden="true"
      >
        <motion.div
          className={`absolute flex items-center justify-center rounded-full ${
            filled ? 'bg-cream' : 'border border-cream/40'
          }`}
          animate={{ width: ringSize, height: ringSize }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          <AnimatePresence>
            {showLabel && (
              <motion.span
                key="label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="text-[10px] font-bold uppercase tracking-[0.15em] text-black"
              >
                {label}
              </motion.span>
            )}
            {!showLabel && variant === 'cta' && (
              <motion.span
                key="cta-icon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <ArrowUpRight className="h-4 w-4 text-black" strokeWidth={2} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[101] flex items-center justify-center will-change-transform"
        style={{
          x,
          y,
          translateX: '-50%',
          translateY: '-50%',
          width: DOT_MAX,
          height: DOT_MAX,
        }}
        aria-hidden="true"
      >
        <motion.div
          className="absolute rounded-full bg-cream"
          animate={{ width: dotSize, height: dotSize, opacity: dotSize === 0 ? 0 : 1 }}
          transition={{ duration: 0.25, ease: EASE }}
        />
      </motion.div>
    </div>
  );
}
