import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent, type RefObject } from 'react';
import { useContactModal } from '../context/useContactModal';
import { contactServiceOptions } from '../data/contactServices';
import {
  buildWhatsAppUrl,
  openWhatsApp,
  sendContactEmail,
  type ContactFormPayload,
} from '../lib/contactSubmission';
import { trapTabKey } from '../lib/focusTrap';
import MagneticButton from './MagneticButton';
import ServicesMultiSelect from './ServicesMultiSelect';

const EASE = [0.16, 1, 0.3, 1] as const;
const PHONE_PATTERN = /^[+]?[\d\s\-().]{7,20}$/;

const formStagger: Variants = {
  closed: {},
  open: { transition: { staggerChildren: 0.07, delayChildren: 0.3 } },
};
const formStaggerItem: Variants = {
  closed: { opacity: 0, y: 14 },
  open: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

type Status = 'idle' | 'sending' | 'sent' | 'failed';

interface FormState {
  name: string;
  phone: string;
  city: string;
  state: string;
  country: string;
  services: string[];
  message: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  phone: '',
  city: '',
  state: '',
  country: '',
  services: [],
  message: '',
};

interface FieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error?: string;
  as?: 'input' | 'textarea';
  inputRef?: RefObject<HTMLInputElement | null>;
  type?: string;
}

function Field({ label, id, value, onChange, placeholder, error, as = 'input', inputRef, type = 'text' }: FieldProps) {
  const fieldClass = `peer mt-3 w-full border-b bg-transparent pb-2 font-sans text-base text-cream placeholder:text-cream/25 outline-none transition-colors duration-300 ${
    error ? 'border-red-400/50' : 'border-cream/20'
  }`;

  return (
    <motion.div variants={formStaggerItem}>
      <label htmlFor={id} className="block text-[11px] uppercase tracking-[0.25em] text-cream/40">
        {label}
      </label>
      <div className="relative">
        {as === 'textarea' ? (
          <textarea
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={4}
            className={`${fieldClass} resize-none`}
            data-cursor="text"
          />
        ) : (
          <input
            ref={inputRef}
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={fieldClass}
            data-cursor="text"
          />
        )}
        {!error && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-cream transition-transform duration-300 ease-premium peer-focus:scale-x-100"
          />
        )}
      </div>
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
    </motion.div>
  );
}

interface SuccessStateProps {
  name: string;
  onClose: () => void;
}

// Checkmark draws itself, a thin ring settles around it, then heading and
// supporting text reveal in sequence -- one calm, cinematic beat rather than
// several competing motions. Reuses the site's existing radial-glow recipe
// (see ExperiencePanel's ambient warmth) so the accent reads as part of the
// same visual language, not a new effect.
function SuccessState({ name, onClose }: SuccessStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="relative flex flex-col items-center py-8 text-center sm:py-12"
    >
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.1, delay: 0.15, ease: EASE }}
        className="pointer-events-none absolute left-1/2 top-2 h-44 w-44 -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(225,224,204,0.16) 0%, transparent 70%)' }}
      />

      <div className="relative flex h-20 w-20 items-center justify-center">
        <motion.span
          aria-hidden="true"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="absolute inset-0 rounded-full border border-cream/30"
        />
        <svg viewBox="0 0 24 24" className="relative h-8 w-8" fill="none" aria-hidden="true">
          <motion.path
            d="M5 12.5L10 17.5L19 7"
            stroke="#E1E0CC"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.35, ease: EASE }}
          />
        </svg>
      </div>

      <motion.span
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55, ease: EASE }}
        className="relative mt-6 text-[11px] uppercase tracking-[0.3em] text-cream/40"
      >
        Message Ready
      </motion.span>

      <div className="relative mt-3 overflow-hidden">
        <motion.h3
          initial={{ y: '100%' }}
          animate={{ y: '0%' }}
          transition={{ duration: 0.6, delay: 0.62, ease: EASE }}
          className="font-display text-3xl font-bold leading-none tracking-tightest text-cream sm:text-4xl"
        >
          Thank you, {name}.
        </motion.h3>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.85, ease: EASE }}
        className="relative mt-6 max-w-sm text-sm leading-relaxed text-cream/60"
      >
        Your inquiry has been prepared successfully. Your message is ready in WhatsApp — just press send.
      </motion.p>

      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 1.0, ease: EASE }}
        onClick={onClose}
        className="relative mt-10 text-xs uppercase tracking-[0.2em] text-cream/40 transition-colors duration-300 hover:text-cream/70"
        data-cursor="link"
      >
        Close
      </motion.button>
    </motion.div>
  );
}

interface ErrorStateProps {
  onRetry: () => void;
}

function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="flex flex-col items-center py-8 text-center sm:py-12"
    >
      <span className="text-[11px] uppercase tracking-[0.3em] text-cream/40">Submission Failed</span>
      <h3 className="mt-4 font-display text-3xl font-bold leading-none tracking-tightest text-cream sm:text-4xl">
        Something went wrong.
      </h3>
      <span aria-hidden="true" className="mt-5 block h-px w-10 bg-cream/25" />
      <p className="mt-6 max-w-sm text-sm leading-relaxed text-cream/60">
        Your message wasn&rsquo;t submitted. Please try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-9 text-xs uppercase tracking-[0.2em] text-cream/40 transition-colors duration-300 hover:text-cream/70"
        data-cursor="link"
      >
        Try Again
      </button>
    </motion.div>
  );
}

// The single reusable "start a project" experience: every Let's Talk / Let's
// Work Together CTA across the site opens this same modal via
// useContactModal(). Kept entirely separate from the on-page Contact
// section, which is left untouched.
export default function ContactModal() {
  const { isOpen, close } = useContactModal();
  const reduce = useReducedMotion();
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  // Synchronous in-flight guard: `status` only updates on the next render,
  // so a fast double-click / Enter+click could otherwise submit twice (two
  // emails, two WhatsApp tabs) before the button visibly disables.
  const submittingRef = useRef(false);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [submittedName, setSubmittedName] = useState('');

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (!isOpen) return;
    // Remember the CTA that opened the modal so keyboard focus goes back to
    // it on close instead of being dropped at the top of the document.
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.documentElement.classList.add('scroll-locked');
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        return;
      }
      // Keep Tab / Shift+Tab cycling inside the dialog while it's open.
      if (dialogRef.current) trapTabKey(e, dialogRef.current);
    };
    window.addEventListener('keydown', onKey);
    const focusTimer = window.setTimeout(() => firstFieldRef.current?.focus(), 350);
    return () => {
      document.documentElement.classList.remove('scroll-locked');
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(focusTimer);
      opener?.focus({ preventScroll: true });
    };
  }, [isOpen, close]);

  useEffect(() => {
    if (isOpen) return;
    const resetTimer = window.setTimeout(() => {
      setForm(EMPTY_FORM);
      setErrors({});
      setStatus('idle');
      setSubmittedName('');
    }, 400);
    return () => window.clearTimeout(resetTimer);
  }, [isOpen]);

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = 'Please enter your name.';
    if (!form.phone.trim()) next.phone = 'Please enter your phone number.';
    else if (!PHONE_PATTERN.test(form.phone.trim())) next.phone = 'Enter a valid phone number.';
    if (!form.city.trim()) next.city = 'Required.';
    if (!form.state.trim()) next.state = 'Required.';
    if (!form.country.trim()) next.country = 'Required.';
    if (form.services.length === 0) next.services = 'Select at least one service.';
    if (!form.message.trim()) next.message = 'Please add a short message.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildPayload = (): ContactFormPayload => ({
    name: form.name.trim(),
    phone: form.phone.trim(),
    city: form.city.trim(),
    state: form.state.trim(),
    country: form.country.trim(),
    services: form.services,
    message: form.message.trim(),
  });

  // idle -> sending -> sent | failed. `submittingRef` is the atomic part:
  // it flips synchronously on the first submit event, so a double-click,
  // Enter + click, or a second Enter can't start a second EmailJS call or a
  // second WhatsApp hand-off before React re-renders the disabled button.
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    if (!validate()) return;
    submittingRef.current = true;
    setStatus('sending');

    const payload = buildPayload();
    // Resolves false on any failure: missing EmailJS config, network error,
    // non-2xx response, or the 15s timeout -- never throws.
    const ok = await sendContactEmail(payload);

    if (ok) {
      // WhatsApp opens only once the email has actually been accepted -- no
      // placeholder tab beforehand, so nothing ever flashes open and shut.
      // wa.me only pre-fills the message; the visitor still presses Send,
      // which is exactly what the success copy says.
      openWhatsApp(buildWhatsAppUrl(payload));
      setSubmittedName(payload.name);
      setStatus('sent');
      setForm(EMPTY_FORM);
      setErrors({});
    } else {
      setStatus('failed');
    }
    submittingRef.current = false;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          <motion.div
            aria-hidden="true"
            onClick={close}
            className="absolute inset-0 bg-black/85"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-heading"
            onClick={(e) => e.stopPropagation()}
            initial={reduce ? undefined : { opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto overscroll-contain border supports-[height:100dvh]:max-h-[90dvh] border-cream/15 bg-black p-6 sm:p-10 md:p-12"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close contact form"
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-cream/20 text-cream/60 transition-colors duration-300 hover:border-cream/50 hover:text-cream sm:right-7 sm:top-7"
              data-cursor="link"
            >
              <X className="h-4 w-4" />
            </button>

            <AnimatePresence mode="wait">
              {status === 'sent' ? (
                <SuccessState key="success" name={submittedName} onClose={close} />
              ) : status === 'failed' ? (
                <ErrorState key="error" onRetry={() => setStatus('idle')} />
              ) : (
                <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  <div className="overflow-hidden pr-10 sm:pr-12">
                    <motion.h2
                      id="contact-modal-heading"
                      initial={reduce ? undefined : { y: '100%' }}
                      animate={{ y: '0%' }}
                      transition={{ duration: 0.6, delay: reduce ? 0 : 0.15, ease: EASE }}
                      className="font-display text-4xl font-bold leading-[0.95] tracking-tightest text-cream sm:text-6xl"
                    >
                      Let&rsquo;s Work
                      <br />
                      Together
                    </motion.h2>
                  </div>
                  <motion.span
                    aria-hidden="true"
                    initial={reduce ? undefined : { scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5, delay: reduce ? 0 : 0.45, ease: EASE }}
                    style={{ transformOrigin: 'left' }}
                    className="mt-5 block h-px w-12 bg-cream/30"
                  />
                  <motion.p
                    initial={reduce ? undefined : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: reduce ? 0 : 0.55, ease: EASE }}
                    className="mt-5 max-w-md text-sm leading-relaxed text-cream/55 sm:text-base"
                  >
                    Have a project in mind? Let&rsquo;s build something meaningful together.
                  </motion.p>

                  <motion.form
                    onSubmit={handleSubmit}
                    initial="closed"
                    animate="open"
                    variants={formStagger}
                    noValidate
                    className="mt-10 flex flex-col gap-7 sm:mt-12"
                  >
                    <Field
                      label="Name"
                      id="contact-name"
                      value={form.name}
                      onChange={(v) => setField('name', v)}
                      placeholder="Your name"
                      error={errors.name}
                      inputRef={firstFieldRef}
                    />
                    <Field
                      label="Number"
                      id="contact-phone"
                      type="tel"
                      value={form.phone}
                      onChange={(v) => setField('phone', v)}
                      placeholder="Your phone number"
                      error={errors.phone}
                    />

                    <motion.div variants={formStaggerItem} className="grid grid-cols-1 gap-7 sm:grid-cols-3 sm:gap-4">
                      <Field
                        label="City"
                        id="contact-city"
                        value={form.city}
                        onChange={(v) => setField('city', v)}
                        placeholder="City"
                        error={errors.city}
                      />
                      <Field
                        label="State"
                        id="contact-state"
                        value={form.state}
                        onChange={(v) => setField('state', v)}
                        placeholder="State"
                        error={errors.state}
                      />
                      <Field
                        label="Country"
                        id="contact-country"
                        value={form.country}
                        onChange={(v) => setField('country', v)}
                        placeholder="Country"
                        error={errors.country}
                      />
                    </motion.div>

                    <motion.div variants={formStaggerItem}>
                      <ServicesMultiSelect
                        id="contact-services"
                        options={contactServiceOptions}
                        value={form.services}
                        onChange={(next) => setField('services', next)}
                        error={errors.services}
                      />
                    </motion.div>

                    <Field
                      label="Message"
                      id="contact-message"
                      as="textarea"
                      value={form.message}
                      onChange={(v) => setField('message', v)}
                      placeholder="Tell me a little about your project..."
                      error={errors.message}
                    />

                    <motion.div variants={formStaggerItem} className="mt-2">
                      <MagneticButton
                        type="submit"
                        variant="primary"
                        disabled={status === 'sending'}
                        cursorText={status === 'sending' ? '' : 'Send'}
                      >
                        {status === 'sending' ? 'Sending…' : 'Send Message'}
                      </MagneticButton>
                    </motion.div>
                  </motion.form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
