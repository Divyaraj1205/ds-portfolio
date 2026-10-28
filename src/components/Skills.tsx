import { motion, useReducedMotion } from 'framer-motion';
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
import { type ComponentType } from 'react';
import { capabilities, tools } from '../data/content';
import WhatMakesMeDifferent from './WhatMakesMeDifferent';
import WhatWeDoBest from './WhatWeDoBest';
import WordsPullUp from './WordsPullUp';

const EASE = [0.16, 1, 0.3, 1] as const;

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

        {/* Tools */}
        <div className="mt-16 sm:mt-24">
          <span className="text-xs uppercase tracking-[0.3em] text-cream/60">Tools</span>
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
