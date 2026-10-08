import { createContext } from 'react';

export interface ContactModalContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const ContactModalCtx = createContext<ContactModalContextValue | null>(null);
