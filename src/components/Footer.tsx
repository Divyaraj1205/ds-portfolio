import type { MouseEvent } from 'react';
import { footerNavLinks, personal } from '../data/content';

export default function Footer() {
  const year = new Date().getFullYear();

  const handleNavClick = (e: MouseEvent, href: string) => {
    e.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelector(href)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <footer className="border-t border-cream/10 bg-black py-12 md:py-16">
      <div className="frame flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-display text-xl font-semibold tracking-tightest text-cream sm:text-2xl">
            {personal.name.toUpperCase()}
          </span>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-cream/60">{personal.title}</p>
        </div>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-3 text-xs uppercase tracking-[0.15em] text-cream/60">
            {footerNavLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="relative inline-block py-1 transition-colors duration-300 after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-cream after:transition-transform after:duration-300 after:ease-premium hover:text-cream hover:after:scale-x-100"
                  data-cursor="link"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="frame mt-10">
        <div className="border-t border-cream/10 pt-6 text-xs text-cream/55">© {year} {personal.name}</div>
      </div>
    </footer>
  );
}
