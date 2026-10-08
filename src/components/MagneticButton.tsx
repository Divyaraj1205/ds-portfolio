import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useRef, type MouseEvent, type ReactNode } from 'react';
import { useFinePointer } from '../hooks/useMediaQuery';

interface MagneticButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  icon?: boolean;
  className?: string;
  cursorText?: string;
  ariaLabel?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

const clamp = (value: number, max: number) => Math.max(-max, Math.min(max, value));

export default function MagneticButton({
  children,
  href,
  onClick,
  variant = 'primary',
  icon = true,
  className = '',
  cursorText,
  ariaLabel,
  disabled = false,
  type = 'button',
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const reduce = useReducedMotion();
  const isFine = useFinePointer();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const iconX = useMotionValue(0);
  const iconY = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 26, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 220, damping: 26, mass: 0.5 });
  const iconSpringX = useSpring(iconX, { stiffness: 260, damping: 24, mass: 0.4 });
  const iconSpringY = useSpring(iconY, { stiffness: 260, damping: 24, mass: 0.4 });

  const handleEnter = () => {
    if (!isFine || reduce || !ref.current) return;
    rectRef.current = ref.current.getBoundingClientRect();
  };

  const handleMove = (e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (!isFine || reduce || !rectRef.current) return;
    const rect = rectRef.current;
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    // Button body: subtle pull, clamped to a small range.
    x.set(clamp(relX * 0.22, 6));
    y.set(clamp(relY * 0.22, 5));
    // Icon: layered depth — moves a little further than the button body.
    iconX.set(clamp(relX * 0.32, 9));
    iconY.set(clamp(relY * 0.32, 7));
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
    iconX.set(0);
    iconY.set(0);
  };

  const base =
    'group relative inline-flex items-center gap-3 rounded-full px-7 py-4 text-sm font-semibold tracking-wide transition-colors duration-300 ease-premium focus-visible:outline-cream';
  const styles =
    variant === 'primary'
      ? 'bg-cream text-black'
      : 'border border-cream/25 text-cream hover:border-cream/60';
  const disabledStyles = disabled ? 'pointer-events-none opacity-60' : '';

  const iconWrap =
    variant === 'primary' ? 'bg-black text-cream' : 'bg-cream/10 text-cream';

  const content = (
    <>
      <span>{children}</span>
      {icon && (
        <motion.span
          style={isFine && !reduce ? { x: iconSpringX, y: iconSpringY } : undefined}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-300 ease-premium group-hover:scale-110 ${iconWrap}`}
        >
          <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-premium group-hover:translate-x-0.5" />
        </motion.span>
      )}
    </>
  );

  const sharedProps = {
    ref: ref as never,
    style: { x: springX, y: springY },
    onMouseEnter: handleEnter,
    onMouseMove: handleMove,
    onMouseLeave: handleLeave,
    whileHover: isFine && !reduce ? { scale: 1.02 } : undefined,
    whileTap: { scale: 0.97 },
    'data-cursor': variant === 'primary' ? 'cta' : 'link',
    'data-cursor-text': cursorText ?? '',
    'aria-label': ariaLabel,
    className: `${base} ${styles} ${disabledStyles} ${className}`,
  };

  if (href) {
    return (
      <motion.a href={href} {...sharedProps}>
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button type={type} onClick={onClick} disabled={disabled} {...sharedProps}>
      {content}
    </motion.button>
  );
}
