import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useRef } from 'react';
import { useContactModal } from '../context/useContactModal';
import { personal } from '../data/content';
import MagneticButton from './MagneticButton';
import WordsPullUp from './WordsPullUp';

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Contact() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { open: openContactModal } = useContactModal();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const headingY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative overflow-hidden bg-black px-4 py-28 sm:px-6 md:py-40"
    >
      <div className="bg-noise" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl">
        <motion.h2
          style={reduce ? undefined : { y: headingY }}
          className="max-w-4xl font-display text-4xl font-bold leading-[0.95] tracking-tightest text-cream sm:text-7xl md:text-8xl"
        >
          <WordsPullUp as="span" className="block" text="Let's build something" />
          <WordsPullUp as="span" className="block" text="worth remembering." delay={0.15} />
        </motion.h2>

        <motion.p
          initial={reduce ? undefined : { opacity: 0, y: 14 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
          className="mt-8 max-w-md text-sm leading-relaxed text-text-secondary sm:mt-10 sm:text-base"
          data-cursor="text"
        >
          Have an idea, website, brand, or digital experience in mind? Let&rsquo;s turn it into
          something polished, useful, and visually strong.
        </motion.p>

        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 14 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.55, ease: EASE }}
          className="mt-16 grid gap-6 border-t border-cream/10 pt-10 sm:mt-20 sm:grid-cols-3 sm:gap-8"
        >
          <a
            href={personal.emailHref}
            className="group flex items-center gap-3 text-cream/80 transition-colors duration-300 hover:text-cream"
            data-cursor="link"
          >
            <Mail className="h-4 w-4 shrink-0 text-cream/40 transition-transform duration-300 ease-premium group-hover:-translate-y-0.5" />
            <span className="text-sm sm:text-base">{personal.email}</span>
          </a>
          <a
            href={personal.phoneHref}
            className="group flex items-center gap-3 text-cream/80 transition-colors duration-300 hover:text-cream"
            data-cursor="link"
          >
            <Phone className="h-4 w-4 shrink-0 text-cream/40 transition-transform duration-300 ease-premium group-hover:-translate-y-0.5" />
            <span className="text-sm sm:text-base">{personal.phone}</span>
          </a>
          <span className="flex items-center gap-3 text-cream/60">
            <MapPin className="h-4 w-4 shrink-0 text-cream/40" />
            <span className="text-sm sm:text-base">{personal.location}</span>
          </span>
        </motion.div>

        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 16 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.7, ease: EASE }}
          className="mt-12 sm:mt-14"
        >
          <MagneticButton onClick={openContactModal} variant="primary" cursorText="Talk">
            Let&rsquo;s Work Together
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}
