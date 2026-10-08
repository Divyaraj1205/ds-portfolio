import { motion, useReducedMotion } from 'framer-motion';
import type { ElementType } from 'react';

const EASE = [0.16, 1, 0.3, 1] as const;

interface WordsPullUpProps {
  text: string;
  className?: string;
  as?: ElementType;
  delay?: number;
  stagger?: number;
}

export default function WordsPullUp({
  text,
  className = '',
  as: Wrapper = 'div',
  delay = 0,
  stagger = 0.08,
}: WordsPullUpProps) {
  const reduce = useReducedMotion();
  const words = text.split(' ');

  const Comp = Wrapper as ElementType;

  return (
    <Comp className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
            <motion.span
              className="inline-block"
              initial={reduce ? undefined : { y: 20, opacity: 0, filter: 'blur(6px)' }}
              whileInView={reduce ? undefined : { y: 0, opacity: 1, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
              transition={{ duration: 0.7, delay: delay + i * stagger, ease: EASE }}
            >
              {word}
              {i < words.length - 1 ? ' ' : ''}
            </motion.span>
          </span>
        ))}
      </span>
    </Comp>
  );
}
