import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, ChevronDown, X } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

const EASE = [0.16, 1, 0.3, 1] as const;

interface ServicesMultiSelectProps {
  id: string;
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
  error?: string;
}

// A custom premium multi-select: no native <select multiple> (which can't be
// styled), supports multiple selections with removable chips, full keyboard
// interaction, and closes on outside click / Escape.
export default function ServicesMultiSelect({ id, options, value, onChange, error }: ServicesMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    // Capture phase + stopPropagation: Escape while the list is open should
    // close only the list. The contact modal listens for Escape on window
    // too (bubble phase), and without this one press closed the whole modal.
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKey, true);
    };
  }, [open]);

  useEffect(() => {
    if (open) optionRefs.current[focusIndex]?.focus();
  }, [open, focusIndex]);

  const toggleOption = (option: string) => {
    onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option]);
  };

  const removeChip = (option: string) => {
    onChange(value.filter((v) => v !== option));
  };

  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(true);
      setFocusIndex(0);
    }
  };

  const handleOptionKeyDown = (e: KeyboardEvent<HTMLDivElement>, option: string) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusIndex((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusIndex((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleOption(option);
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <span id={`${id}-label`} className="block text-[11px] uppercase tracking-[0.25em] text-cream/40">
        Services
      </span>

      {/* The row is a plain container with the trigger as a full-size
          transparent button underneath the chips, rather than one <button>
          wrapping everything: interactive content (each chip's remove
          control) can't be nested inside a button, which made those
          controls unreliable for keyboard and screen-reader users. Same
          box, classes and layout as before. */}
      <div
        className={`relative mt-3 flex w-full items-center justify-between gap-3 border-b bg-transparent pb-2 text-left transition-colors duration-300 ${
          error ? 'border-red-400/50' : 'border-cream/20'
        }`}
      >
        <button
          ref={triggerRef}
          type="button"
          id={id}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby={`${id}-label ${id}-value`}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={handleTriggerKeyDown}
          className="absolute inset-0 h-full w-full"
        />
        <span id={`${id}-value`} className="sr-only">
          {value.length === 0 ? 'None selected' : value.join(', ')}
        </span>
        {!error && (
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute bottom-0 left-0 h-px w-full origin-left bg-cream transition-transform duration-300 ease-premium ${
              open ? 'scale-x-100' : 'scale-x-0'
            }`}
          />
        )}
        {value.length === 0 ? (
          <span aria-hidden="true" className="pointer-events-none text-base text-cream/25">
            Select one or more services
          </span>
        ) : (
          <span className="pointer-events-none flex flex-wrap gap-2 py-0.5">
            {value.map((v) => (
              <span
                key={v}
                className="flex items-center gap-1.5 rounded-full border border-cream/25 py-1 pl-3 pr-2 text-xs text-cream/85"
              >
                <span aria-hidden="true">{v}</span>
                <button
                  type="button"
                  aria-label={`Remove ${v}`}
                  onClick={() => removeChip(v)}
                  className="pointer-events-auto relative z-10 flex h-4 w-4 items-center justify-center rounded-full text-cream/50 transition-colors duration-200 hover:bg-cream/10 hover:text-cream"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
          </span>
        )}
        <ChevronDown
          aria-hidden="true"
          className={`pointer-events-none h-4 w-4 shrink-0 text-cream/40 transition-transform duration-300 ease-premium ${open ? 'rotate-180' : ''}`}
        />
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            aria-multiselectable="true"
            aria-labelledby={`${id}-label`}
            initial={reduce ? undefined : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="absolute left-0 right-0 top-full z-20 mt-2 max-h-64 overflow-y-auto border border-cream/15 bg-black/95 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-sm"
          >
            {options.map((option, index) => {
              const selected = value.includes(option);
              return (
                <div
                  key={option}
                  ref={(el) => {
                    optionRefs.current[index] = el;
                  }}
                  role="option"
                  aria-selected={selected}
                  tabIndex={-1}
                  onClick={() => toggleOption(option)}
                  onKeyDown={(e) => handleOptionKeyDown(e, option)}
                  className="flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm text-cream/75 outline-none transition-colors duration-150 hover:bg-cream/[0.06] focus:bg-cream/[0.08] focus:text-cream"
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${
                      selected ? 'border-cream bg-cream' : 'border-cream/30'
                    }`}
                  >
                    {selected && <Check className="h-2.5 w-2.5 text-black" strokeWidth={3} />}
                  </span>
                  {option}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="mt-1.5 overflow-hidden text-xs text-red-400/90"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
