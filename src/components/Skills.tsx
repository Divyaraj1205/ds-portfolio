import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { capabilities } from '../data/content';
import WhatMakesMeDifferent from './WhatMakesMeDifferent';
import WhatWeDoBest from './WhatWeDoBest';
import WordsPullUp from './WordsPullUp';

const EASE = [0.16, 1, 0.3, 1] as const;

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

export default function Skills() {
  const reduce = Boolean(useReducedMotion());

  return (
    <section id="skills" className="bg-black py-[calc(var(--sy)/2)]">
      <div className="frame">
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
      </div>

      {/* Specialization: "What We Do Best" (sizes itself to the shared frame) */}
      <div>
        <WhatWeDoBest reduce={reduce} />
      </div>

      <div className="frame">
        {/* Key Strengths ("What Makes Me Different") + What I Bring */}
        <WhatMakesMeDifferent reduce={reduce} />
      </div>
    </section>
  );
}
