export const personal = {
  name: 'Bhatti Divyaraj',
  firstName: 'Bhatti',
  lastName: 'Divyaraj',
  displayLast: 'DIVYARAJ',
  title: 'Web Developer / Software Developer / Graphic Designer',
  experience: '1.5+ Years',
  location: 'Rajkot, Gujarat, India',
  locationShort: 'RAJKOT — INDIA',
  phone: '+91 98259 11101',
  phoneHref: 'tel:+919825911101',
  email: 'bhattidivyaraj5@gmail.com',
  emailHref: 'mailto:bhattidivyaraj5@gmail.com',
} as const;

export interface Capability {
  number: string;
  title: string;
  items: string[];
}

export const capabilities: Capability[] = [
  {
    number: '01',
    title: 'Web Development',
    items: ['HTML', 'CSS', 'Bootstrap', 'JavaScript', 'React'],
  },
  {
    number: '02',
    title: 'WordPress & E-Commerce',
    items: ['WordPress', 'Elementor', 'Shopify'],
  },
  {
    number: '03',
    title: 'UI/UX & Graphic Design',
    items: ['UI/UX Design', 'Graphic Design'],
  },
  {
    number: '04',
    title: 'AI & Digital',
    items: ['SEO Fundamentals', 'Meta Ads', 'AI-Assisted Development', 'Prompt Engineering', 'AI Automation'],
  },
];

export const keyStrengths = [
  'Problem Solving & Creative Thinking',
  'Client Communication & Requirement Understanding',
  'Strong Visual & Design Sense',
  'Attention to Detail',
  'Fast Learning & Adaptability',
  'Business-Oriented Approach',
] as const;

// Software Developer role (Experience): the CRM work and web-based software.
export const softwareResponsibilities = [
  'Developed a custom CRM system to streamline business workflows, manage records and support day-to-day business operations.',
  'Involved in developing web-based software solutions tailored to business needs.',
] as const;

export const experienceResponsibilities = [
  'Designed and developed responsive, user-focused websites using HTML, CSS, JavaScript, React, WordPress and Shopify for freelance and client projects.',
  'Built and customized WordPress websites using Elementor to deliver fast, editable, client-ready builds.',
  'Created e-commerce storefronts on Shopify, focused on usability and conversion-friendly layouts.',
  'Designed UI/UX flows and graphic assets — from wireframes to final visual identity — aligned with client goals.',
  'Applied SEO fundamentals and Meta Ads structuring to support client visibility and reach.',
  'Used AI-assisted development and prompt engineering to accelerate workflows, automate repetitive tasks and improve code quality.',
  'Communicated directly with clients to translate requirements into practical, polished digital experiences.',
  'Designed social media posts, promotional creatives and festival campaign posts for client brands.',
  'Created Instagram stories and digital campaign creatives to support marketing and brand visibility.',
  'Created logos and brand identity systems for consistent, professional visual presence.',
  'Designed posters, banners, flyers and promotional material for marketing campaigns.',
  'Applied typography, composition and image manipulation to craft polished, professional creatives.',
  'Communicated with clients to understand visual requirements and deliver on-brand, professional results.',
];

export interface Project {
  id: string;
  number: string;
  category: string;
  title: string;
  description: string;
  tech: string[];
}

export const projects: Project[] = [
  {
    id: 'corporate-websites',
    number: '01',
    category: 'Corporate Websites',
    title: 'Corporate Websites',
    description:
      'Responsive, brand-led websites for businesses that need a fast, credible, professional presence online — built for clarity and easy content management.',
    tech: ['HTML', 'CSS', 'JavaScript', 'WordPress'],
  },
  {
    id: 'e-commerce',
    number: '02',
    category: 'E-Commerce',
    title: 'E-Commerce',
    description:
      'Shopify storefronts designed around usability and conversion — clean product presentation, streamlined checkout flow, and mobile-first layouts.',
    tech: ['Shopify', 'UI/UX', 'CSS'],
  },
  {
    id: 'graphic-design-branding',
    number: '03',
    category: 'Graphic Design & Branding',
    title: 'Graphic Design & Branding',
    description:
      'Visual identity and digital design assets — from social creatives to brand collateral — crafted to give businesses a polished, consistent look.',
    tech: ['Graphic Design', 'Canva', 'Photoshop'],
  },
  {
    id: 'landing-pages',
    number: '04',
    category: 'Landing Pages',
    title: 'Landing Pages',
    description:
      'High-impact single pages built for campaigns and product launches — fast-loading, focused messaging, and clear calls to action.',
    tech: ['React', 'JavaScript', 'Meta Ads'],
  },
];

// Hero background loop, re-encoded from the original 16MB clip: a 1080p copy
// (1.8MB), a 720p copy for phones (0.6MB) and its first frame as the poster.
export const heroVideo = {
  desktop: '/hero.mp4',
  mobile: '/hero-mobile.mp4',
  poster: '/hero-poster.webp',
};

export const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Work', href: '#work' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
] as const;

export const footerNavLinks = [
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#work' },
  { label: 'Skills', href: '#skills' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
] as const;
