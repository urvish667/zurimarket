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
        "surface-dim": "#0e1514",
        "on-tertiary-fixed-variant": "#005145",
        "error": "#ffb4ab",
        "on-tertiary-fixed": "#00201a",
        "on-secondary-container": "#516e00",
        "tertiary": "#44ddc1",
        "surface-container": "#1a2120",
        "on-error-container": "#ffdad6",
        "primary-container": "#004d40",
        "on-secondary-fixed": "#141f00",
        "background": "#0e1514",
        "on-background": "#dde4e2",
        "surface-container-high": "#242b2a",
        "tertiary-fixed-dim": "#44ddc1",
        "on-primary-fixed": "#00201a",
        "on-tertiary-container": "#1cc6ac",
        "surface-tint": "#94d3c1",
        "primary": "#94d3c1",
        "inverse-on-surface": "#2b3231",
        "on-surface": "#dde4e2",
        "on-primary-fixed-variant": "#065043",
        "on-primary": "#00382e",
        "surface-bright": "#333b39",
        "secondary": "#ffffff",
        "surface-container-lowest": "#090f0f",
        "primary-fixed": "#afefdd",
        "inverse-primary": "#29695b",
        "inverse-surface": "#dde4e2",
        "on-primary-container": "#7ebdac",
        "secondary-fixed": "#b9f600",
        "outline-variant": "#3f4945",
        "surface-variant": "#2f3635",
        "secondary-fixed-dim": "#a2d800",
        "surface-container-low": "#161d1c",
        "on-surface-variant": "#bfc9c4",
        "surface-container-highest": "#2f3635",
        "on-secondary-fixed-variant": "#384e00",
        "on-secondary": "#263500",
        "surface": "#0e1514",
        "on-tertiary": "#00382f",
        "secondary-container": "#b9f600",
        "error-container": "#93000a",
        "primary-fixed-dim": "#94d3c1",
        "tertiary-container": "#004d41",
        "outline": "#89938f",
        "tertiary-fixed": "#68fadd",
        "on-error": "#690005"
      },
      fontFamily: {
        "headline": ["Space Grotesk", "sans-serif"],
        "body": ["Satoshi", "sans-serif"],
        "label": ["Satoshi", "sans-serif"],
        "logo": ["Inter", "sans-serif"]
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
