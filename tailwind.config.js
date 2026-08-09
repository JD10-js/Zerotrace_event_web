/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#05070A",
          navy: "#071426",
          dark: "#0B1F3A",
          blue: "#147BFF",
          "blue-hover": "#0062E6",
          "blue-glow": "rgba(20, 123, 255, 0.15)",
          text: "#FFFFFF",
          gray: "#AAB4C3",
          border: "#1E293B",
          card: "#081629"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
