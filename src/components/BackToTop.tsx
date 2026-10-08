import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useState } from 'react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const reduce = useReducedMotion();

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (latest) => {
    setVisible(latest > window.innerHeight * 0.8);
  });

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={scrollTop}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="group fixed bottom-6 right-4 z-[70] inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream/20 bg-black/85 text-cream transition-colors duration-300 hover:border-cream/40 sm:bottom-8 sm:right-8"
          aria-label="Back to top"
          data-cursor="link"
        >
          <ArrowUp className="h-4 w-4 transition-transform duration-300 ease-premium group-hover:-translate-y-0.5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
