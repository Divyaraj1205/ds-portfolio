import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MagneticButton from './MagneticButton';

const EASE = [0.16, 1, 0.3, 1] as const;

export default function NotFound() {
  const reduce = useReducedMotion();
  const navigate = useNavigate();

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black px-6 text-center">
      <div className="bg-noise" aria-hidden="true" />

      <motion.span
        initial={reduce ? undefined : { opacity: 0, y: 20 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="select-none font-display text-[28vw] font-bold leading-none tracking-tightest text-cream sm:text-[20vw] md:text-[16vw]"
      >
        404
      </motion.span>

      <motion.p
        initial={reduce ? undefined : { opacity: 0, y: 14 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
        className="mt-4 max-w-sm font-display text-xl italic text-cream/70 sm:text-2xl"
      >
        Looks like this page took a different route.
      </motion.p>

      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 14 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.35, ease: EASE }}
        className="mt-10"
      >
        <MagneticButton onClick={() => navigate('/')}>Back Home</MagneticButton>
      </motion.div>
    </main>
  );
}
