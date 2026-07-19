/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FBF9F6",
        paper: "#FFFFFF",
        ink: "#2B2622",
        clay: "#8A7F76",
        blush: "#E7A6B4",
        "blush-deep": "#C97A8C",
        "blush-pale": "#F7E4E8",
        sage: "#8FA688",
        line: "#EDE7E1",
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
