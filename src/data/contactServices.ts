// Service options for the contact form's multi-select. Mirrors the real
// capabilities/specializations already represented elsewhere on the site
// (see capabilities in content.ts, the What We Do Best groups, and the Graphic Designer
// responsibilities in Experience.tsx) -- kept as its own list rather than
// importing those arrays directly so this form's option set can't shift if
// Skills' own data changes shape later.
export const contactServiceOptions = [
  'Web Development',
  'WordPress Development',
  'Software & CRM Development',
  'Shopify / E-Commerce',
  'UI/UX Design',
  'Graphic Design',
  'Logo & Brand Identity',
  'Social Media Design',
  'Landing Pages',
  'Other',
] as const;
