import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { personal } from '../data/content';

interface PreloaderProps {
  onLoaded: () => void;
  onFinished: () => void;
}

// A restrained, expo-style "reveal from darkness" easing — no bounce, no
// overshoot. Used for every transition in this component.
const EASE = [0.16, 1, 0.3, 1] as const;

// Mount the real page almost immediately (while still fully hidden behind
// the black curtain) so it has the whole preloader run to settle — this is
// a preloader-side scheduling choice only, Hero's own code/timing untouched.
const HERO_MOUNT_DELAY = 50;

// One phase script (ms, from mount) drives the entire sequence — every
// element's delay is derived from these numbers, not a separate timer.
// Scene 01 black -> 02 logo -> 03 name -> 03 role -> 04 line -> 05 hold ->
// 06 exit. Total ~3.0s.
const LOGO_DELAY = 250;
const LOGO_DURATION = 700; // settles at 950ms
const NAME_DELAY = 750; // begins while the logo is still finishing, per spec
const NAME_DURATION = 500; // settles at 1250ms
const TAGLINE_DELAY = 1000;
const TAGLINE_DURATION = 450; // settles at 1450ms
const LINE_DELAY = 1250;
const LINE_DURATION = 400; // settles at 1650ms
const EXIT_START = 2150; // end of the quiet hold
const CONTENT_FADE_MS = 250;
const CURTAIN_DELAY_MS = 100; // curtain begins just after content has cleared
const CURTAIN_DURATION_MS = 750; // 2150 + 100 + 750 = 3000ms total
const FONT_WAIT_CAP_MS = 1500; // slow-connection ceiling past EXIT_START

// How far the static #boot-shell logo in index.html (shown while the JS
// downloads) had faded in when this mounted: 0 on a normal load (the shell
// logo is still in its initial dark hold), up to 1 on a slow one.
function readBootShellLogoOpacity(): number {
  const logo = document.getElementById('boot-shell-logo');
  return logo ? Number.parseFloat(getComputedStyle(logo).opacity) || 0 : 0;
}

export default function Preloader({ onLoaded, onFinished }: PreloaderProps) {
  const reduce = Boolean(useReducedMotion());
  // Read once, on the first render, so the logo's own `initial` can pick up
  // exactly where the shell's left off -- one continuous logo entrance, and
  // on a normal load (0) the approved sequence, unchanged.
  const [shellLogo] = useState(readBootShellLogoOpacity);

  // Swap the static shell out before this component's first paint: the
  // curtain below is the same black, and the logo continues from the same
  // spot, so the handoff is invisible.
  useLayoutEffect(() => {
    document.getElementById('boot-shell')?.remove();
  }, []);
  const [contentFading, setContentFading] = useState(false);
  const [curtainLifting, setCurtainLifting] = useState(false);
  const timers = useRef<number[]>([]);

  // Prevent scrolling the page behind the fixed overlay while loading;
  // restored the instant this component unmounts. Uses an inline style
  // (rather than the shared `.scroll-locked` class Navbar/ContactModal
  // toggle) so it can't be clobbered by Navbar's own mount-time effect,
  // which runs moments later and unconditionally sets that class off.
  useEffect(() => {
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => {
      html.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const timerIds = timers.current;
    let cancelled = false;
    timerIds.push(window.setTimeout(onLoaded, HERO_MOUNT_DELAY));

    if (reduce) {
      timerIds.push(
        window.setTimeout(() => {
          setContentFading(true);
          setCurtainLifting(true);
          timerIds.push(window.setTimeout(onFinished, 260));
        }, 450),
      );
    } else {
      let exiting = false;
      const beginExit = () => {
        if (exiting || cancelled) return;
        exiting = true;
        setContentFading(true);
        timerIds.push(
          window.setTimeout(() => {
            setCurtainLifting(true);
            timerIds.push(window.setTimeout(onFinished, CURTAIN_DURATION_MS));
          }, CURTAIN_DELAY_MS),
        );
      };
      timerIds.push(
        window.setTimeout(() => {
          // On a normal connection the web fonts are long loaded by now and
          // this exits on schedule. On a slow one, hold the curtain (up to
          // FONT_WAIT_CAP_MS) so the page isn't revealed mid font-swap.
          document.fonts.ready.then(beginExit, beginExit);
          timerIds.push(window.setTimeout(beginExit, FONT_WAIT_CAP_MS));
        }, EXIT_START),
      );
    }

    return () => {
      cancelled = true;
      timerIds.forEach((t) => clearTimeout(t));
    };
  }, [reduce, onLoaded, onFinished]);

  return (
    <div role="status" aria-live="polite" className="fixed inset-0 z-[999] overflow-hidden">
      <span className="sr-only">Loading {personal.name}&rsquo;s portfolio</span>

      {/* the curtain — a single solid black layer. It simply lifts away at
          the very end; nothing about it is decorative. */}
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{ y: curtainLifting ? '-100%' : '0%' }}
        transition={{ duration: reduce ? 0.22 : CURTAIN_DURATION_MS / 1000, ease: EASE }}
        className="absolute inset-0 bg-black"
      />

      {/* the composition — logo, name, role, editorial line. Fades out as
          one quiet group before the curtain moves. */}
      <motion.div
        aria-hidden="true"
        animate={{ opacity: contentFading ? 0 : 1 }}
        transition={{ duration: reduce ? 0.18 : CONTENT_FADE_MS / 1000, ease: EASE }}
        className="absolute inset-0"
      >
        <div className="flex h-full w-full flex-col items-center justify-center px-6">
          <motion.div
            initial={
              reduce
                ? undefined
                : shellLogo > 0
                  ? { opacity: shellLogo, scale: 0.96 + 0.04 * shellLogo, filter: `blur(${10 * (1 - shellLogo)}px)` }
                  : { opacity: 0, scale: 0.96, filter: 'blur(10px)' }
            }
            animate={reduce ? undefined : { opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={
              shellLogo > 0
                ? { duration: Math.max(0.15, (LOGO_DURATION / 1000) * (1 - shellLogo)), ease: EASE }
                : { duration: LOGO_DURATION / 1000, delay: LOGO_DELAY / 1000, ease: EASE }
            }
            className="h-16 w-16 sm:h-20 sm:w-20 md:h-16 md:w-16 lg:h-20 lg:w-20 xl:h-24 xl:w-24"
          >
            <img
              src="/db-logo-mark.webp"
              alt={`${personal.name} logo`}
              className="h-full w-full object-contain"
              draggable={false}
            />
          </motion.div>

          <motion.p
            initial={reduce ? undefined : { opacity: 0, y: 10 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: NAME_DURATION / 1000, delay: NAME_DELAY / 1000, ease: EASE }}
            className="mt-7 select-none whitespace-nowrap font-display text-xl font-semibold uppercase tracking-[0.08em] text-cream sm:text-2xl"
          >
            {personal.displayLast}
          </motion.p>

          <motion.p
            initial={reduce ? undefined : { opacity: 0 }}
            animate={reduce ? undefined : { opacity: 1 }}
            transition={{ duration: TAGLINE_DURATION / 1000, delay: TAGLINE_DELAY / 1000, ease: EASE }}
            className="mt-3 max-w-[16rem] text-center text-[9px] uppercase leading-relaxed tracking-[0.35em] text-cream/45 sm:max-w-none sm:whitespace-nowrap sm:text-[10px]"
          >
            Web Developer / Software Developer / Graphic Designer
          </motion.p>

          <motion.span
            aria-hidden="true"
            initial={reduce ? undefined : { scaleX: 0 }}
            animate={reduce ? undefined : { scaleX: 1 }}
            transition={{ duration: LINE_DURATION / 1000, delay: LINE_DELAY / 1000, ease: EASE }}
            style={{ transformOrigin: 'center' }}
            className="mt-8 h-px w-14 bg-cream/30 sm:w-16"
          />
        </div>
      </motion.div>
    </div>
  );
}
