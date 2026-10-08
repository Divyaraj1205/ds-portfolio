import { useContext } from 'react';
import { ContactModalCtx } from './contactModalStore';

export function useContactModal() {
  const ctx = useContext(ContactModalCtx);
  if (!ctx) throw new Error('useContactModal must be used within a ContactModalProvider');
  return ctx;
}
