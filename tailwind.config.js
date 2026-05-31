/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#71816D",
          light: "#8a9b85",
        },
        secondary: {
          DEFAULT: "#C9B79C",
        },
        background: "#F1E0C5",
        accent: {
          DEFAULT: "#E27D60",
        },
        danger: {
          DEFAULT: "#D96C75",
        },
        dark: "#2F2F2F",
        surface: {
          DEFAULT: "#FFFFFF",
          dark: "#2F2F2F",
        },
      },
      fontFamily: {
        headline: ["Public Sans", "sans-serif"],
        display:  ["Public Sans", "sans-serif"],
        body:     ["Inter", "sans-serif"],
        label:    ["Nunito Sans", "sans-serif"],
      },
      boxShadow: {
        memphis:      "4px 4px 0px 0px rgba(47,47,47,1)",
        "memphis-sm": "2px 2px 0px 0px rgba(47,47,47,1)",
        "memphis-lg": "6px 6px 0px 0px rgba(47,47,47,1)",
        "memphis-warm": "4px 4px 0px 0px #C9B79C",
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg:  "1rem",
        xl:  "1.5rem",
        "2xl": "20px",
        full: "9999px",
      },
    },
  },
  plugins: [],
}
