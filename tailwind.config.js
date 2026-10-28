/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        cream: '#E1E0CC',
        'about-card': '#101010',
        'feature-card': '#212121',
        'text-secondary': '#9CA3AF',
        'text-muted': '#6B7280',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        // Used by the "What Makes Me Different" block (matches its mockup).
        inter: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        // Used by the About section (matches its mockup).
        outfit: ['Outfit', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        albert: ['"Albert Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        sans: [
          'Poppins',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'sans-serif',
        ],
      },
      letterSpacing: {
        tightest: '-0.07em',
      },
      animation: {
        'border-spin': 'spin 10s linear infinite',
      },
      transitionDuration: {
        400: '400ms',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.16,1,0.3,1)',
      },
    },
  },
  plugins: [],
};
