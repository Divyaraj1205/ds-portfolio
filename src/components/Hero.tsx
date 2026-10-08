import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useContactModal } from '../context/useContactModal';
import { heroVideoUrl, personal } from '../data/content';
import MagneticButton from './MagneticButton';

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Hero() {
  const reduce = useReducedMotion();
  const [videoError, setVideoError] = useState(false);
  const { open: openContactModal } = useContactModal();
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  // Hero is the first thing a visitor sees, but nothing stops them scrolling
  // straight past it -- once fully offscreen there's no visual reason to
  // keep decoding/compositing a playing video every frame, so playback
  // pauses and resumes with its own visibility rather than the design.
  const heroInView = useInView(sectionRef, { margin: '0px' });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (heroInView) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [heroInView]);

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <section ref={sectionRef} id="home" className="relative h-screen w-full p-2 supports-[height:100svh]:h-svh sm:p-4 md:p-5">
      <div className="relative h-full w-full overflow-hidden rounded-2xl bg-neutral-900 md:rounded-[2rem]">
        {/* Background video — static, no parallax/scale/scroll animation */}
        <div className="absolute inset-0 overflow-hidden">
          {!videoError ? (
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              onError={() => setVideoError(true)}
            >
              <source src={heroVideoUrl} type="video/mp4" />
            </video>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-black to-neutral-900" />
          )}
        </div>

        {/* Overlay + vignette */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/55" />
        <div className="pointer-events-none absolute inset-0 [box-shadow:inset_0_0_18vw_rgba(0,0,0,0.65)]" />
        <div className="bg-noise" aria-hidden="true" />

        {/* Content */}
        <div className="relative flex h-full w-full flex-col justify-between px-5 pb-6 pt-24 sm:px-8 sm:pt-28 md:px-12 md:pb-8 md:pt-32 lg:px-14">
          {/* Eyebrow */}
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 12 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.25em] text-cream/60 sm:text-xs"
          >
            <span>Web Developer</span>
            <span aria-hidden="true">&</span>
            <span>Graphic Designer</span>
          </motion.div>

          {/* Giant name */}
          <div className="-mt-4 sm:mt-0">
            <motion.h1
              initial={reduce ? undefined : { opacity: 0, y: 35, clipPath: 'inset(100% 0 0 0)' }}
              animate={reduce ? undefined : { opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)' }}
              transition={{ duration: 0.65, delay: 0.12, ease: EASE }}
              className="select-none whitespace-nowrap font-display font-bold leading-[0.85] tracking-tightest text-cream text-[5.1vw] sm:text-[5.25vw] md:text-[5.1vw] lg:text-[5.3vw] xl:text-[5.5vw]"
            >
              {personal.displayLast}
            </motion.h1>
          </div>

          {/* Intro row */}
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <motion.p
              initial={reduce ? undefined : { opacity: 0, y: 18 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.62, ease: EASE }}
              className="max-w-xs text-sm leading-relaxed text-cream/70 sm:max-w-sm sm:text-base"
            >
              Creative and detail-oriented Web Developer &amp; Graphic Designer with 1+ year of
              hands-on freelance and client-based experience in developing modern responsive
              websites and creating professional digital designs.
            </motion.p>

            <div className="flex flex-wrap items-center gap-4">
              <motion.div
                initial={reduce ? undefined : { opacity: 0, y: 15 }}
                animate={reduce ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.82, ease: EASE }}
              >
                <MagneticButton onClick={() => scrollTo('#work')} variant="primary" cursorText="View">
                  View My Work
                </MagneticButton>
              </motion.div>
              <motion.div
                initial={reduce ? undefined : { opacity: 0, y: 15 }}
                animate={reduce ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.92, ease: EASE }}
              >
                <MagneticButton onClick={openContactModal} variant="secondary" icon={false}>
                  Let&rsquo;s Work Together
                </MagneticButton>
              </motion.div>
            </div>
          </div>

          {/* Micro details */}
          <div className="mt-8 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-cream/35 sm:text-[11px]">
            <span>Web / Design / AI</span>
            <span>{personal.locationShort}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
