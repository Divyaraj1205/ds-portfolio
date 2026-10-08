const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Keeps Tab / Shift+Tab cycling inside `container` (the contact modal, the
// mobile menu). Every step is moved here in DOM order rather than only
// wrapping at the two ends: Safari's default Tab order skips links and
// buttons, so leaving the in-between steps to the browser let focus walk
// straight out of a dialog made mostly of links.
export function trapTabKey(e: KeyboardEvent, container: HTMLElement) {
  if (e.key !== 'Tab') return;
  const items = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.getClientRects().length > 0,
  );
  if (items.length === 0) return;
  e.preventDefault();

  const active = document.activeElement;
  let index = items.indexOf(active as HTMLElement);
  if (index === -1 && active && container.contains(active)) {
    // Focus is on something outside the Tab order (e.g. a listbox option):
    // continue from its position in the document.
    // Placed so the step below lands on the first item after it (Tab) or
    // the last item before it (Shift+Tab).
    const after = items.findIndex((el) => active.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
    index = (after === -1 ? items.length : after) - (e.shiftKey ? 0 : 1);
  }
  const next = e.shiftKey
    ? index <= 0
      ? items.length - 1
      : index - 1
    : index === -1 || index >= items.length - 1
      ? 0
      : index + 1;
  items[next].focus();
}
