export interface ContactFormPayload {
  name: string;
  phone: string;
  city: string;
  state: string;
  country: string;
  services: string[];
  message: string;
}

const WHATSAPP_NUMBER = '919825911101'; // +91 98259 11101 in wa.me's required digits-only format
const INQUIRY_EMAIL = 'bhattidivyaraj5@gmail.com';
// A request that hangs (dead connection, captive portal) must still end in
// the error state rather than leaving the form on "Sending…" indefinitely.
const SEND_TIMEOUT_MS = 15000;

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

function buildEmailBody(payload: ContactFormPayload): string {
  return [
    `Name: ${payload.name}`,
    `Number: ${payload.phone}`,
    `City: ${payload.city}`,
    `State: ${payload.state}`,
    `Country: ${payload.country}`,
    '',
    'Selected Services:',
    ...payload.services.map((s) => `- ${s}`),
    '',
    'Message:',
    payload.message,
  ].join('\n');
}

// Sends the inquiry via EmailJS's REST API (a client-safe integration built
// specifically for static/frontend-only sites like this one -- its "public
// key" only authorizes the one configured service/template pair and is
// meant to ship in client code, unlike an SMTP password or private API
// secret, so nothing sensitive is exposed here). Delivery to
// bhattidivyaraj5@gmail.com is configured on the EmailJS template itself,
// not in this codebase.
export async function sendContactEmail(payload: ContactFormPayload): Promise<boolean> {
  // No EmailJS service/template/public key in .env (see .env.example): fail
  // gracefully rather than pretend anything was sent.
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) return false;

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);
  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        service_id: SERVICE_ID,
        template_id: TEMPLATE_ID,
        user_id: PUBLIC_KEY,
        // Every field is sent on its own (for a template laid out field by
        // field) and combined in `message` (for a single-block template).
        // The form collects a phone number, not an email address, so the
        // number is plain form data -- never `reply_to`, which EmailJS
        // treats as an email address. `to_email` lets the template's "To"
        // field be {{to_email}} instead of hard-coding the inbox there.
        template_params: {
          subject: `New Portfolio Inquiry — ${payload.name}`,
          message: buildEmailBody(payload),
          from_name: payload.name,
          from_phone: payload.phone,
          from_city: payload.city,
          from_state: payload.state,
          from_country: payload.country,
          services: payload.services.join(', '),
          user_message: payload.message,
          to_email: INQUIRY_EMAIL,
        },
      }),
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeout);
  }
}

// Builds a wa.me deep link with the full inquiry pre-filled as the message
// text. wa.me only opens WhatsApp with that text already typed in -- it
// cannot deliver the message itself, so the user still has to press Send
// once WhatsApp opens. Callers must not treat opening this URL as proof of
// delivery.
export function buildWhatsAppUrl(payload: ContactFormPayload): string {
  const text = [
    'NEW WEBSITE INQUIRY',
    '',
    `Name: ${payload.name}`,
    `Number: ${payload.phone}`,
    `City: ${payload.city}`,
    `State: ${payload.state}`,
    `Country: ${payload.country}`,
    '',
    'Services:',
    ...payload.services.map((s) => `- ${s}`),
    '',
    'Message:',
    payload.message,
  ].join('\n');

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export type WhatsAppHandoff = 'new-tab' | 'same-tab';

// Opens the prepared wa.me link -- no placeholder tab first. Called right
// after the EmailJS response, which is normally well inside the browser's
// user-activation window, so the new tab opens directly. If the browser
// blocks it (window.open returns null -- e.g. Safari, or a slow send that
// outlived the activation window), it falls back to opening WhatsApp in
// this tab instead, and reports which happened so the caller never claims
// a tab opened when it didn't.
export function openWhatsApp(url: string): WhatsAppHandoff {
  const tab = window.open(url, '_blank');
  if (tab) {
    try {
      // Detach it from this page; may throw once it has navigated
      // cross-origin, in which case there is nothing left to detach.
      tab.opener = null;
    } catch {
      /* already cross-origin */
    }
    return 'new-tab';
  }
  window.location.assign(url);
  return 'same-tab';
}
