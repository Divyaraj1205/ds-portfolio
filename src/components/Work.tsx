import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { projects } from '../data/content';
import ProjectCard from './ProjectCard';
import WordsPullUp from './WordsPullUp';

const EASE = [0.16, 1, 0.3, 1] as const;
const GRID_COLUMNS = 2;

export default function Work() {
  const reduce = useReducedMotion();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="work" className="bg-black px-4 py-24 sm:px-6 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <WordsPullUp
            as="h2"
            text="Selected Work"
            className="font-display text-5xl font-bold leading-[0.95] tracking-tightest text-cream sm:text-6xl md:text-7xl xl:text-8xl"
          />
          <motion.div
            initial={reduce ? undefined : { opacity: 0, x: 18 }}
            whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
            transition={{ duration: 0.65, delay: 0.3, ease: EASE }}
            className="flex max-w-xs items-start gap-3 sm:max-w-sm"
          >
            <span className="mt-2 h-px w-6 shrink-0 bg-[#7C93B3]/70" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-text-secondary sm:text-base">
              Digital experiences built where development meets visual design.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={reduce ? undefined : { opacity: 0 }}
          whileInView={reduce ? undefined : { opacity: 1 }}
          viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
          transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
          className="mt-8 sm:mt-10 md:grid md:grid-cols-2"
        >
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              rowIndex={Math.floor(index / GRID_COLUMNS)}
              isLastItem={index === projects.length - 1}
              isLastRow={index >= projects.length - GRID_COLUMNS}
              isLastColumn={(index + 1) % GRID_COLUMNS === 0}
              isDimmed={hoveredIndex !== null && hoveredIndex !== index}
              onHoverChange={setHoveredIndex}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
