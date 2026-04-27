/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary-background': {
          DEFAULT: '#0e121d',
        },
        'custom-gray-verylight': {
          DEFAULT: '#DBD4D3',
        },
        'custom-gray-light': {
          DEFAULT: '#67697C',
        },
        'custom-gray-dark': {
          DEFAULT: '#303030',
        },
        'beige': {
          DEFAULT: '#F9D3A5',
          hover: '#F9D3A5',
          active: '#F9D3A5'
        },
        'green-btn': {
          DEFAULT: '#054A29',
          hover: '#00cca4',
          'border-default': '#054A29',
          'border-hover': '#00cca4',
        },
        'red-btn': {
          DEFAULT: '#D00000',
          hover: '#FF8484',
          'border-default': '#D00000',
          'border-hover': '#FF8484',
        },
        'gold-btn': {
          DEFAULT: '#FFC107',
          hover: '#FFC107',
          active: '#FFC107',
        },
        'neutral-btn': {
          DEFAULT: '#8A1C7C',
          hover: '#8A1C7C',
          active: '#8A1C7C',
        },
        'primary-pink': {
          DEFAULT: '#F72585',
        },
        'info-blue': {
          DEFAULT: '#17a2b8',
        },
        'warning-orange': {
          DEFAULT: '#ffc107',
        },
        // NEW STADIA EMERALD TEMPLATE COLORS
        "surface-dim": "#0b0f0e",
        "on-tertiary-fixed-variant": "#006850",
        "error": "#ff716c",
        "on-tertiary-fixed": "#004937",
        "on-secondary-container": "#a1e1cf",
        "tertiary": "#bbffe3",
        "surface-container": "#161b19",
        "on-error-container": "#ffa8a3",
        "primary-container": "#caf300",
        "on-secondary-fixed": "#00483c",
        "background": "#0b0f0e",
        "on-background": "#fafdfa",
        "surface-container-high": "#1b211f",
        "tertiary-fixed-dim": "#2cefbc",
        "on-primary-fixed": "#374400",
        "on-tertiary-container": "#005d47",
        "surface-tint": "#ddff5c",
        "primary": "#ddff5c",
        "inverse-on-surface": "#525654",
        "on-surface": "#fafdfa",
        "on-primary-fixed-variant": "#516200",
        "on-primary": "#4f6100",
        "surface-bright": "#272d2c",
        "secondary": "#afefdd",
        "surface-container-lowest": "#000000",
        "primary-fixed": "#caf300",
        "inverse-primary": "#546600",
        "inverse-surface": "#f7faf8",
        "on-primary-container": "#485800",
        "secondary-fixed": "#afefdd",
        "outline-variant": "#454947",
        "surface-variant": "#212725",
        "secondary-fixed-dim": "#a1e1cf",
        "surface-container-low": "#101413",
        "on-surface-variant": "#a8acaa",
        "surface-container-highest": "#212725",
        "on-secondary-fixed-variant": "#266658",
        "on-secondary": "#195c4e",
        "surface": "#0b0f0e",
        "on-tertiary": "#00674e",
        "secondary-container": "#0b5345",
        "error-container": "#9f0519",
        "primary-fixed-dim": "#bde300",
        "tertiary-container": "#45fec9",
        "outline": "#727675",
        "tertiary-fixed": "#45fec9",
        "on-error": "#490006"
      },
      fontFamily: {
        "headline": ["Space Grotesk", "sans-serif"],
        "body": ["Satoshi", "sans-serif"],
        "label": ["Satoshi", "sans-serif"],
        "logo": ["Satoshi", "sans-serif"]
      },
      borderRadius: {
        'badge': '12px',
      },
      spacing: {
        'sidebar': '8rem', // more rem means sidebar thicker
      },
      zIndex: {
        'sidebar': 40, // higher number means more on top
      },
    },
  },
  plugins: [],
};
