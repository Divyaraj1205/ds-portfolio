import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useContactModal } from '../context/useContactModal';
import { navLinks, personal } from '../data/content';
import { trapTabKey } from '../lib/focusTrap';

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [compact, setCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHref, setActiveHref] = useState('#home');
  const reduce = useReducedMotion();
  const lastY = useRef(0);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { open: openContactModal } = useContactModal();

  // The bar's compact-on-scroll shrink (same values/timing as always) runs on
  // motion values so its contents can counter the vertical part of it:
  // `contentScaleY` = scaleX / scaleY, so text and logo end up uniformly
  // scaled by scaleX instead of squashed ~11% vertically. Derived per frame
  // from the live values, so it stays exact mid-transition too.
  const navScaleX = useMotionValue(1);
  const navScaleY = useMotionValue(1);
  const contentScaleY = useTransform([navScaleX, navScaleY], ([sx, sy]: number[]) => sx / sy);
  useEffect(() => {
    const opts = { duration: 0.35, ease: EASE };
    const x = animate(navScaleX, scrolled ? 0.97 : 1, opts);
    const y = animate(navScaleY, compact ? 0.86 : scrolled ? 0.97 : 1, opts);
    return () => {
      x.stop();
      y.stop();
    };
  }, [scrolled, compact, navScaleX, navScaleY]);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 60);
    const delta = latest - lastY.current;
    if (latest > 120 && delta > 4) {
      setCompact(true);
    } else if (delta < -4 || latest < 120) {
      setCompact(false);
    }
    lastY.current = latest;
  });

  useEffect(() => {
    // #home is observed too (it has no link of its own) so scrolling back up
    // to the hero clears the underline instead of leaving the last section
    // visited -- often Contact -- marked active.
    const sections = ['#home', ...navLinks.map((link) => link.href)]
      .map((href) => document.querySelector(href))
      .filter((el): el is Element => Boolean(el));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveHref(`#${visible.target.id}`);
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.5, 1] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('scroll-locked', menuOpen);
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        return;
      }
      // Keep Tab / Shift+Tab inside the full-screen menu while it's open --
      // otherwise focus walks into the page hidden behind it.
      if (menuRef.current) trapTabKey(e, menuRef.current);
    };
    window.addEventListener('keydown', onKey);
    const menuButton = menuButtonRef.current;
    return () => {
      window.removeEventListener('keydown', onKey);
      // Back to the hamburger on close, so keyboard focus isn't left on the
      // removed overlay. preventScroll keeps it from fighting the smooth
      // scroll to a chosen section.
      menuButton?.focus({ preventScroll: true });
    };
  }, [menuOpen]);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <>
      <motion.header
        initial={reduce ? undefined : { opacity: 0, y: -24 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
        className="fixed inset-x-0 top-0 z-[80] flex justify-center px-4 pt-4 sm:pt-6"
      >
        <motion.nav
          style={{ scaleX: navScaleX, scaleY: navScaleY }}
          animate={{
            backgroundColor: scrolled ? 'rgba(0,0,0,0.92)' : 'rgba(0,0,0,0.55)',
            borderColor: scrolled ? 'rgba(225,224,204,0.12)' : 'rgba(225,224,204,0.16)',
          }}
          transition={{ duration: 0.35, ease: EASE }}
          className="flex w-full max-w-3xl origin-top items-center rounded-full border py-2 pl-5 pr-2.5"
          aria-label="Primary"
        >
          <motion.div style={{ scaleY: contentScaleY }} className="flex w-full items-center justify-between gap-4">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('#home');
              }}
              className="shrink-0"
              aria-label="Home"
              data-cursor="link"
            >
              <img
                src="/db-logo-mark.png"
                alt={`${personal.name} logo`}
                className="h-7 w-7 object-contain sm:h-8 sm:w-8"
                draggable={false}
              />
            </a>

            <ul className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => {
                const isActive = activeHref === link.href;
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(link.href);
                      }}
                      aria-current={isActive ? 'true' : undefined}
                      className={`group relative flex flex-col items-center rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition-colors duration-300 ${
                        isActive ? 'text-cream' : 'text-cream/70 hover:text-cream'
                      }`}
                      data-cursor="link"
                    >
                      <motion.span whileHover={{ y: -1 }} transition={{ duration: 0.2, ease: EASE }}>
                        {link.label}
                      </motion.span>
                      <span
                        className={`mt-0.5 h-[3px] w-3 origin-center rounded-full bg-cream transition-[transform,opacity] duration-300 ease-premium ${
                          isActive
                            ? 'scale-x-100 opacity-100'
                            : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-60'
                        }`}
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                );
              })}
            </ul>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                openContactModal();
              }}
              className="hidden shrink-0 items-center rounded-full bg-cream px-5 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-black transition-transform duration-300 ease-premium hover:scale-[1.03] md:inline-flex"
              data-cursor="cta"
            >
              Let&rsquo;s Talk
            </button>

            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-cream md:hidden"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              data-cursor="link"
            >
              <Menu className="h-5 w-5" />
            </button>
          </motion.div>
        </motion.nav>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={menuRef}
            className="fixed inset-0 z-[120] flex flex-col bg-black px-6 pb-10 pt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <div className="flex items-center justify-between">
              <img
                src="/db-logo-mark.png"
                alt={`${personal.name} logo`}
                className="h-7 w-7 object-contain"
                draggable={false}
              />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                autoFocus
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cream/20 text-cream"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col items-start justify-center gap-2">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }}
                  initial={reduce ? undefined : { opacity: 0, y: 16 }}
                  animate={reduce ? undefined : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.08 * i, ease: EASE }}
                  className="text-[13vw] font-medium leading-[1.05] tracking-tightest text-cream sm:text-6xl"
                >
                  {link.label}
                </motion.a>
              ))}
            </nav>

            <div className="flex flex-col gap-1 text-xs uppercase tracking-[0.15em] text-cream/50">
              <a href={personal.emailHref}>{personal.email}</a>
              <a href={personal.phoneHref}>{personal.phone}</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
