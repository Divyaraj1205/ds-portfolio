import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { ContactModalCtx } from './contactModalStore';

// Shared open/close state for the single reusable contact modal -- every
// "Let's Talk" / "Let's Work Together" CTA across the site (Navbar, Hero,
// Contact) calls the same `open()` (via useContactModal) rather than each
// maintaining its own modal instance.
export function ContactModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);

  return <ContactModalCtx.Provider value={value}>{children}</ContactModalCtx.Provider>;
}
