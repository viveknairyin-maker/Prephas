import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "outline-variant": "#cfc4c5",
        "secondary-fixed": "#e4e2e2",
        "tertiary-fixed": "#e2e2e2",
        "on-background": "#1b1b1b",
        "on-surface-variant": "#4c4546",
        "secondary": "#5e5e5e",
        "surface-dim": "#dadada",
        "tertiary-container": "#1b1b1b",
        "on-secondary-fixed": "#1b1c1c",
        "surface-bright": "#f9f9f9",
        "error": "#ba1a1a",
        "surface": "#f9f9f9",
        "on-tertiary-fixed-variant": "#474747",
        "inverse-on-surface": "#f1f1f1",
        "surface-container": "#eeeeee",
        "on-primary": "#ffffff",
        "on-error": "#ffffff",
        "on-tertiary": "#ffffff",
        "surface-container-low": "#f3f3f3",
        "on-secondary-fixed-variant": "#464747",
        "background": "#f9f9f9",
        "surface-container-highest": "#e2e2e2",
        "secondary-container": "#e4e2e2",
        "on-tertiary-container": "#848484",
        "surface-container-lowest": "#ffffff",
        "primary": "#000000",
        "inverse-surface": "#303030",
        "on-secondary": "#ffffff",
        "on-primary-container": "#848484",
        "secondary-fixed-dim": "#c8c6c6",
        "outline": "#7e7576",
        "tertiary-fixed-dim": "#c6c6c6",
        "surface-variant": "#e2e2e2",
        "surface-container-high": "#e8e8e8",
        "on-error-container": "#93000a",
        "primary-container": "#1b1b1b",
        "on-surface": "#1b1b1b",
        "primary-fixed-dim": "#c6c6c6",
        "tertiary": "#000000",
        "on-primary-fixed-variant": "#474747",
        "on-primary-fixed": "#1b1b1b",
        "on-secondary-container": "#646464",
        "primary-fixed": "#e2e2e2",
        "surface-tint": "#5e5e5e",
        "on-tertiary-fixed": "#1b1b1b",
        "inverse-primary": "#c6c6c6",
        "error-container": "#ffdad6"
      },
      borderRadius: {
        "DEFAULT": "0px",
        "lg": "0px",
        "xl": "0px",
        "full": "9999px"
      },
      spacing: {
        "margin-desktop": "64px",
        "gutter": "24px",
        "margin-mobile": "20px",
        "container-max-width": "1280px",
        "unit": "4px"
      },
      fontFamily: {
        "headline-lg": ["Inter"],
        "label-sm": ["Inter"],
        "headline-lg-mobile": ["Inter"],
        "headline-md": ["Inter"],
        "display": ["Inter"],
        "body-lg": ["Inter"],
        "body-md": ["Inter"],
        "serif": ["Lora", "Georgia", "serif"],
        "sans-creative": ["'Plus Jakarta Sans'", "sans-serif"]
      },
      fontSize: {
        "headline-lg": ["32px", {"lineHeight": "1.2", "letterSpacing": "-0.01em", "fontWeight": "600"}],
        "label-sm": ["12px", {"lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "600"}],
        "headline-lg-mobile": ["24px", {"lineHeight": "1.2", "fontWeight": "600"}],
        "headline-md": ["20px", {"lineHeight": "1.4", "fontWeight": "600"}],
        "display": ["48px", {"lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "body-lg": ["16px", {"lineHeight": "1.6", "fontWeight": "400"}],
        "body-md": ["14px", {"lineHeight": "1.5", "fontWeight": "400"}]
      }
    }
  },
  plugins: [
    forms,
    containerQueries
  ],
}
