/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Light values live in src/index.css as :root variables; the dark
        // theme overrides them under [data-theme="dark"].
        cream: "rgb(var(--c-cream) / <alpha-value>)",
        paper: "rgb(var(--c-paper) / <alpha-value>)",
        ink: "rgb(var(--c-ink) / <alpha-value>)",
        clay: "rgb(var(--c-clay) / <alpha-value>)",
        blush: "#E7A6B4",
        "blush-deep": "#C97A8C",
        "blush-pale": "rgb(var(--c-blush-pale) / <alpha-value>)",
        sage: "#8FA688",
        line: "rgb(var(--c-line) / <alpha-value>)",
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "serif"],
        sans: ["'Inter'", "sans-serif"],
      },
      borderRadius: {
        card: "22px",
        phone: "40px",
      },
    },
  },
  plugins: [],
};
